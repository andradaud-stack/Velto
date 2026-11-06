// Clean initial wallets (All start at Rp 0 for owner Andra)
export const INITIAL_WALLETS = [
  {
    id: 'cash',
    name: 'Dompet Cash',
    type: 'liquid',
    balance: 0,
    investedCapital: 0,
    goldGrams: 0,
    userId: 'andra',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'jago',
    name: 'Jago Syariah',
    type: 'bank',
    balance: 0,
    investedCapital: 0,
    goldGrams: 0,
    userId: 'andra',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mandiri',
    name: 'Bank Mandiri',
    type: 'bank',
    balance: 0,
    investedCapital: 0,
    goldGrams: 0,
    userId: 'andra',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'dana',
    name: 'DANA',
    type: 'ewallet',
    balance: 0,
    investedCapital: 0,
    goldGrams: 0,
    userId: 'andra',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'emas',
    name: 'DANA eMAS',
    type: 'investment',
    balance: 0,
    investedCapital: 0,
    goldGrams: 0,
    userId: 'andra',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'bibit',
    name: 'Bibit',
    type: 'investment',
    balance: 0,
    investedCapital: 0,
    goldGrams: 0,
    userId: 'andra',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'parfum',
    name: 'Profit Parfum',
    type: 'business',
    balance: 0,
    investedCapital: 0,
    goldGrams: 0,
    userId: 'andra',
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_GOAL = null;
export const INITIAL_TRANSACTIONS = [];
