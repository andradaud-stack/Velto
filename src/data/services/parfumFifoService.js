/**
 * Parfum FIFO Service
 * Handles all restock batch and sales operations with FIFO algorithm.
 * Uses IndexedDB (Dexie) tables: parfumBatches, parfumSales
 */

import { db } from '../db/database';

// ─── RESTOCK ──────────────────────────────────────────────────────────────────

/**
 * Add a new restock batch.
 * costPerUnit is auto-calculated from totalModalBelanja / qtyReceived.
 */
export async function addRestock({ brand, variant, batchCode, qtyReceived, totalModalBelanja, dateRestocked, sourceWalletId = null }) {
  const costPerUnit = totalModalBelanja / qtyReceived;

  const id = await db.parfumBatches.add({
    brand,
    variant,
    batchCode,
    qtyReceived,
    qtyRemaining: qtyReceived,
    totalModalBelanja,
    costPerUnit,
    dateRestocked,
    sourceWalletId: sourceWalletId || null,
    createdAt: new Date().toISOString()
  });

  return id;
}

/**
 * Get all batches (optionally filtered by brand+variant), ordered oldest first.
 */
export async function getBatches(brand = null, variant = null) {
  try {
    const all = await db.parfumBatches.toArray();
    all.sort((a, b) => new Date(a.dateRestocked || 0) - new Date(b.dateRestocked || 0));
    if (brand && variant) {
      return all.filter(b => b.brand === brand && b.variant === variant);
    }
    return all;
  } catch (err) {
    console.warn('[FIFO] getBatches error:', err);
    return [];
  }
}

/**
 * Get active (qtyRemaining > 0) batches for a specific brand+variant, oldest first.
 */
export async function getActiveBatches(brand, variant) {
  try {
    const all = await db.parfumBatches.toArray();
    all.sort((a, b) => new Date(a.dateRestocked || 0) - new Date(b.dateRestocked || 0));
    return all.filter(b => b.brand === brand && b.variant === variant && b.qtyRemaining > 0);
  } catch (err) {
    console.warn('[FIFO] getActiveBatches error:', err);
    return [];
  }
}

/**
 * Get total available stock for a brand+variant.
 */
export async function getAvailableStock(brand, variant) {
  const active = await getActiveBatches(brand, variant);
  return active.reduce((sum, b) => sum + b.qtyRemaining, 0);
}

/**
 * Get unique brand+variant combinations from all batches.
 */
export async function getAllVariants() {
  const all = await db.parfumBatches.toArray();
  const seen = new Set();
  const variants = [];
  for (const b of all) {
    const key = `${b.brand}||${b.variant}`;
    if (!seen.has(key)) {
      seen.add(key);
      variants.push({ brand: b.brand, variant: b.variant });
    }
  }
  return variants;
}

// ─── FIFO SALES ──────────────────────────────────────────────────────────────

/**
 * Record a sale using FIFO algorithm.
 * Returns { success, saleId, cogs, omzet, labaBersih } or { success: false, error }
 */
export async function recordSale({ brand, variant, qtySold, hargaJualPerBottle, biayaOperasional, dateSold, destinationWalletId = 'dana' }) {
  // 1. Validate stock
  const activeBatches = await getActiveBatches(brand, variant);
  const totalStock = activeBatches.reduce((sum, b) => sum + b.qtyRemaining, 0);

  if (qtySold > totalStock) {
    return {
      success: false,
      error: `Stok tidak cukup! Tersedia: ${totalStock} botol, diminta: ${qtySold} botol.`
    };
  }

  // 2. FIFO deduction — consume oldest batches first
  let remaining = qtySold;
  let totalCogs = 0;
  const batchDeductions = []; // for rollback

  for (const batch of activeBatches) {
    if (remaining <= 0) break;

    const take = Math.min(remaining, batch.qtyRemaining);
    const cogs = take * batch.costPerUnit;

    batchDeductions.push({
      batchId: batch.id,
      qty: take,
      costPerUnit: batch.costPerUnit
    });

    totalCogs += cogs;
    remaining -= take;

    // Update batch qtyRemaining
    await db.parfumBatches.update(batch.id, {
      qtyRemaining: batch.qtyRemaining - take
    });
  }

  // 3. Calculate financials
  const omzet = qtySold * hargaJualPerBottle;
  const labaBersih = omzet - totalCogs - (biayaOperasional || 0);

  // 4. Persist sale record
  const saleId = await db.parfumSales.add({
    brand,
    variant,
    qtySold,
    hargaJualPerBottle,
    biayaOperasional: biayaOperasional || 0,
    cogs: totalCogs,
    omzet,
    labaBersih,
    batchDeductions: JSON.stringify(batchDeductions),
    destinationWalletId: destinationWalletId || 'dana',
    dateSold,
    createdAt: new Date().toISOString()
  });

  return {
    success: true,
    saleId,
    cogs: totalCogs,
    omzet,
    labaBersih,
    batchDeductions,
    destinationWalletId: destinationWalletId || 'dana'
  };
}

/**
 * Delete a sale and rollback (restore) stock to source batches.
 */
export async function deleteSale(saleId) {
  const sale = await db.parfumSales.get(saleId);
  if (!sale) return { success: false, error: 'Transaksi tidak ditemukan.' };

  const deductions = JSON.parse(sale.batchDeductions || '[]');

  // Restore each batch's qtyRemaining
  for (const d of deductions) {
    const batch = await db.parfumBatches.get(d.batchId);
    if (batch) {
      await db.parfumBatches.update(d.batchId, {
        qtyRemaining: batch.qtyRemaining + d.qty
      });
    }
  }

  await db.parfumSales.delete(saleId);
  return { 
    success: true, 
    labaBersih: sale.labaBersih,
    omzet: sale.omzet,
    destinationWalletId: sale.destinationWalletId || 'dana'
  };
}

// ─── DASHBOARD STATS ─────────────────────────────────────────────────────────

/**
 * Calculate dashboard aggregates.
 */
export async function getDashboardStats() {
  try {
    const [batches, sales] = await Promise.all([
      db.parfumBatches ? db.parfumBatches.toArray() : [],
      db.parfumSales ? db.parfumSales.toArray() : []
    ]);

    const totalOmzet = (sales || []).reduce((s, x) => s + (x.omzet || 0), 0);
    const totalCogs = (sales || []).reduce((s, x) => s + (x.cogs || 0), 0);
    const totalBiayaOps = (sales || []).reduce((s, x) => s + (x.biayaOperasional || 0), 0);
    const totalLabaBersih = (sales || []).reduce((s, x) => s + (x.labaBersih || 0), 0);

    // Nilai aset stok = sum(qtyRemaining * costPerUnit) for all active batches
    const nilaiStok = (batches || []).reduce((s, b) => s + ((b.qtyRemaining || 0) * (b.costPerUnit || 0)), 0);

    // Best seller by variant (most qtySold)
    const variantSales = {};
    for (const sale of (sales || [])) {
      const key = `${sale.brand || 'Parfum'} - ${sale.variant || 'Variant'}`;
      variantSales[key] = (variantSales[key] || 0) + (sale.qtySold || 0);
    }
    const bestSeller = Object.entries(variantSales)
      .sort(([, a], [, b]) => b - a)
      .map(([name, qty]) => ({ name, qty }));

    // Stock per variant (all variants with any batch)
    const stockMap = {};
    for (const b of (batches || [])) {
      const key = `${b.brand || 'Parfum'}||${b.variant || 'Variant'}`;
      if (!stockMap[key]) stockMap[key] = { brand: b.brand || 'Parfum', variant: b.variant || 'Variant', qty: 0 };
      stockMap[key].qty += (b.qtyRemaining || 0);
    }
    const stockPerVariant = Object.values(stockMap).sort((a, b) => (a.variant || '').localeCompare(b.variant || ''));

    return {
      totalOmzet,
      totalCogs,
      totalBiayaOps,
      totalLabaBersih,
      nilaiStok,
      bestSeller,
      stockPerVariant,
      totalBatches: (batches || []).length,
      totalSalesCount: (sales || []).length
    };
  } catch (err) {
    console.warn('[FIFO] getDashboardStats error:', err);
    return {
      totalOmzet: 0,
      totalCogs: 0,
      totalBiayaOps: 0,
      totalLabaBersih: 0,
      nilaiStok: 0,
      bestSeller: [],
      stockPerVariant: [],
      totalBatches: 0,
      totalSalesCount: 0
    };
  }
}

/**
 * Get all sales records (for listing), newest first.
 */
export async function getAllSales() {
  try {
    const list = await db.parfumSales.toArray();
    return list.sort((a, b) => new Date(b.dateSold || b.createdAt || 0) - new Date(a.dateSold || a.createdAt || 0));
  } catch (err) {
    console.warn('[FIFO] getAllSales error:', err);
    return [];
  }
}
