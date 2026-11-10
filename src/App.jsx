import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import HeaderTopBar from './components/layout/HeaderTopBar';
import FloatingBottomNav from './components/layout/FloatingBottomNav';
import SidebarNav from './components/layout/SidebarNav';
import ToastBanner from './components/common/ToastBanner';
import ErrorBoundary from './components/common/ErrorBoundary';

// Modals & Auth
import SecurityAuthModal from './components/modals/SecurityAuthModal';
import ProfileModal from './components/modals/ProfileModal';
import NewWalletModal from './components/modals/NewWalletModal';
import EditWalletModal from './components/modals/EditWalletModal';
import BudgetEstimationModal from './components/modals/BudgetEstimationModal';
import MarketSyncModal from './components/modals/MarketSyncModal';
import QuickActionSheet from './components/modals/QuickActionSheet';
import EditGoalModal from './components/modals/EditGoalModal';
import NewGoalModal from './components/modals/NewGoalModal';
import TransactionFormModal from './components/modals/TransactionFormModal';
import BuyGoldModal from './components/modals/BuyGoldModal';
import TopUpModal from './components/modals/TopUpModal';

// Pages
import OverviewPage from './pages/OverviewPage';
import WalletsPage from './pages/WalletsPage';
import WalletDetailPage from './pages/WalletDetailPage';
import MutasiPage from './pages/MutasiPage';
import GoalsPage from './pages/GoalsPage';
import SettingsPage from './pages/SettingsPage';
import ParfumPage from './pages/ParfumPage';
import LoginPage from './pages/LoginPage';

// Desktop Side Panel & FinBank View
import DesktopDashboardView from './components/desktop/DesktopDashboardView';
import SavingGoalCard from './components/common/SavingGoalCard';
import { ShieldCheck, LogOut } from 'lucide-react';
import { formatRupiah } from './core/utils/currencyFormatter';

function AppContent() {
  const { user, isCloudAuthenticated, isLoadingAuth, logout } = useAuth();
  const [currentTab, setCurrentTab] = useState('overview');
  const [selectedWallet, setSelectedWallet] = useState(null);

  // Profile modal state
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Distinct modal triggers
  const [newWalletModalOpen, setNewWalletModalOpen] = useState(false);
  const [editWalletModal, setEditWalletModal] = useState({ isOpen: false, wallet: null });
  const [estimateModalOpen, setEstimateModalOpen] = useState(false);
  const [marketSyncModal, setMarketSyncModal] = useState({ isOpen: false, wallet: null });

  // Additional support modals
  const [quickActionModal, setQuickActionModal] = useState({ isOpen: false, tab: 'saku' });
  const [editGoalModalOpen, setEditGoalModalOpen] = useState(false);
  const [newGoalModalOpen, setNewGoalModalOpen] = useState(false);
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [buyGoldModalOpen, setBuyGoldModalOpen] = useState(false);
  const [topUpModal, setTopUpModal] = useState({ isOpen: false, wallet: null });

  const { 
    resetToFactoryDefaults, 
    wallets, 
    walletMap,
    transactions,
    primaryGoal, 
    totalNetWorth, 
    totalCapitalGain,
    goldMarketInfo,
    refreshGoldPrice
  } = useFinance();

  const handleResetSeed = async () => {
    if (window.confirm('Reset seluruh saldo dan mutasi ke Rp 0 (Mulai dari Nol)?')) {
      await resetToFactoryDefaults();
    }
  };

  const handleSelectWallet = (wallet) => {
    setSelectedWallet(wallet);
  };

  const handleLogout = async () => {
    if (window.confirm('Apakah Anda yakin ingin keluar dari akun ini?')) {
      await logout();
    }
  };

  const liveSelectedWallet = selectedWallet ? walletMap[selectedWallet.id] || selectedWallet : null;

  let topBarTitle = 'Velto';
  if (liveSelectedWallet) {
    topBarTitle = liveSelectedWallet.name;
  } else if (currentTab === 'wallets') {
    topBarTitle = 'Velto';
  } else if (currentTab === 'parfum') {
    topBarTitle = 'Parfum FIFO';
  } else if (currentTab === 'goals') {
    topBarTitle = 'Goals';
  } else if (currentTab === 'mutasi') {
    topBarTitle = 'Mutasi Velto';
  } else if (currentTab === 'settings') {
    topBarTitle = 'Setelan Velto';
  }

  // Loading state while verifying auth session
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#F0F4FC] flex flex-col items-center justify-center select-none font-sans">
        <div className="w-12 h-12 rounded-2xl bg-[#6633EE] flex items-center justify-center shadow-lg animate-pulse mb-3">
          <span className="text-white font-black text-xl">V</span>
        </div>
        <p className="text-xs font-bold text-[#7E7A9B] animate-pulse">Memuat Velto Finance...</p>
      </div>
    );
  }

  // Show login only if not authenticated
  if (!user && !isCloudAuthenticated) {
    return (
      <>
        <ToastBanner />
        <LoginPage onLoginSuccess={() => {}} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F2FA] text-[#1E1B2E] flex justify-center">
      {/* Toast Notifications */}
      <ToastBanner />

      {/* Main Wrapper */}
      <div className="w-full flex">
        {/* Desktop Sidebar (hidden < 768px) */}
        <SidebarNav 
          currentTab={selectedWallet ? 'wallets' : currentTab} 
          setTab={(tab) => {
            setSelectedWallet(null);
            setCurrentTab(tab);
          }} 
          onResetSeed={handleResetSeed}
          onLogout={handleLogout} 
        />

        {/* Content View Container */}
        <div className="flex-1 min-w-0 max-w-full flex justify-center">
          <div className="w-full max-w-[420px] md:max-w-none md:p-6 lg:p-8">
            <HeaderTopBar 
              title={topBarTitle}
              showBack={Boolean(liveSelectedWallet)}
              onBack={() => setSelectedWallet(null)}
              onOpenProfile={() => setProfileModalOpen(true)}
            />

            {/* Desktop Dashboard Grid (> 768px) */}
            <ErrorBoundary>
            {liveSelectedWallet ? (
              <div className="mt-2">
                <WalletDetailPage
                  wallet={liveSelectedWallet}
                  transactions={transactions}
                  totalNetWorth={totalNetWorth}
                  goldMarketInfo={goldMarketInfo}
                  onBack={() => setSelectedWallet(null)}
                  onEditWallet={(w) => setEditWalletModal({ isOpen: true, wallet: w })}
                  onOpenTopUp={(w) => setTopUpModal({ isOpen: true, wallet: w })}
                  onOpenMarketSync={(w) => setMarketSyncModal({ isOpen: true, wallet: w })}
                  onOpenTransfer={() => setQuickActionModal({ isOpen: true, tab: 'transfer' })}
                  onOpenBuyGold={() => setBuyGoldModalOpen(true)}
                  onOpenParfum={() => {
                    setSelectedWallet(null);
                    setCurrentTab('parfum');
                  }}
                  onRefreshGold={refreshGoldPrice}
                />
              </div>
            ) : currentTab === 'overview' ? (
              <div className="mt-2">
                {/* Desktop View (>= 768px): FinBank Layout */}
                <div className="hidden md:block">
                  <DesktopDashboardView
                    onOpenNewWallet={() => setNewWalletModalOpen(true)}
                    onOpenEstimate={() => setEstimateModalOpen(true)}
                    onOpenOptions={() => setMarketSyncModal({ isOpen: true, wallet: null })}
                    onOpenTransfer={() => setQuickActionModal({ isOpen: true, tab: 'transfer' })}
                    onOpenNewTransaction={() => setTransactionModalOpen(true)}
                    onSelectWallet={handleSelectWallet}
                    onOpenProfile={() => setProfileModalOpen(true)}
                    onOpenEditGoal={() => setEditGoalModalOpen(true)}
                    onTopUpWallet={(w) => setTopUpModal({ isOpen: true, wallet: w })}
                  />
                </div>

                {/* Mobile View (< 768px): EasyPay Lavender Mobile View */}
                <div className="block md:hidden">
                  <OverviewPage
                    onOpenNewWallet={() => setNewWalletModalOpen(true)}
                    onOpenEstimate={() => setEstimateModalOpen(true)}
                    onOpenOptions={() => setMarketSyncModal({ isOpen: true, wallet: null })}
                    onSelectWallet={handleSelectWallet}
                    onTopUpWallet={(w) => setTopUpModal({ isOpen: true, wallet: w })}
                  />
                </div>
              </div>
            ) : (
              <div className="mt-2 max-w-5xl mx-auto">
                {currentTab === 'wallets' && (
                  <WalletsPage
                    onSelectWallet={handleSelectWallet}
                    onOpenNewWallet={() => setNewWalletModalOpen(true)}
                    onEditWallet={(w) => setEditWalletModal({ isOpen: true, wallet: w })}
                    onTopUpWallet={(w) => setTopUpModal({ isOpen: true, wallet: w })}
                  />
                )}
                {currentTab === 'parfum' && (
                  <ParfumPage />
                )}
                {currentTab === 'goals' && (
                  <GoalsPage
                    onOpenEditGoal={() => setEditGoalModalOpen(true)}
                    onOpenNewGoal={() => setNewGoalModalOpen(true)}
                  />
                )}
                {currentTab === 'mutasi' && (
                  <MutasiPage
                    onOpenNewTransaction={() => setTransactionModalOpen(true)}
                  />
                )}
                {currentTab === 'settings' && (
                  <SettingsPage />
                )}
              </div>
            )}
            </ErrorBoundary>
          </div>
        </div>
      </div>

      {/* Mobile Floating Bottom Bar */}
      <FloatingBottomNav 
        currentTab={selectedWallet ? 'wallets' : currentTab} 
        setTab={(tab) => {
          setSelectedWallet(null);
          setCurrentTab(tab);
        }} 
      />

      {/* User Profile Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />

      {/* Modals */}
      <NewWalletModal
        isOpen={newWalletModalOpen}
        onClose={() => setNewWalletModalOpen(false)}
      />

      <EditWalletModal
        isOpen={editWalletModal.isOpen}
        wallet={editWalletModal.wallet}
        onClose={() => setEditWalletModal({ isOpen: false, wallet: null })}
        onDeleteSuccess={(deletedId) => {
          if (selectedWallet && selectedWallet.id === deletedId) {
            setSelectedWallet(null);
          }
        }}
      />

      <BudgetEstimationModal
        isOpen={estimateModalOpen}
        onClose={() => setEstimateModalOpen(false)}
      />

      <MarketSyncModal
        isOpen={marketSyncModal.isOpen}
        onClose={() => setMarketSyncModal({ isOpen: false, wallet: null })}
        targetWallet={marketSyncModal.wallet}
      />

      {/* Additional Modals */}
      <QuickActionSheet
        isOpen={quickActionModal.isOpen}
        onClose={() => setQuickActionModal({ isOpen: false, tab: 'saku' })}
        defaultTab={quickActionModal.tab}
      />

      <EditGoalModal
        isOpen={editGoalModalOpen}
        onClose={() => setEditGoalModalOpen(false)}
      />

      <NewGoalModal
        isOpen={newGoalModalOpen}
        onClose={() => setNewGoalModalOpen(false)}
      />

      <TransactionFormModal
        isOpen={transactionModalOpen}
        onClose={() => setTransactionModalOpen(false)}
      />

      <BuyGoldModal
        isOpen={buyGoldModalOpen}
        onClose={() => setBuyGoldModalOpen(false)}
      />

      <TopUpModal
        isOpen={topUpModal.isOpen}
        targetWallet={topUpModal.wallet}
        onClose={() => setTopUpModal({ isOpen: false, wallet: null })}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <FinanceProvider>
        <AppContent />
      </FinanceProvider>
    </AuthProvider>
  );
}
