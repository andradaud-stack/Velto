import React from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  ReceiptText, 
  Target, 
  Settings, 
  ArrowLeftRight,
  TrendingUp,
  Sparkles,
  HelpCircle,
  Package
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

export default function SidebarNav({ currentTab, setTab, onResetSeed }) {
  const { wallets } = useFinance();

  const mainMenuItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'wallets', label: `Kantong Aset (${(wallets || []).length})`, icon: Wallet },
    { id: 'parfum', label: 'Parfum FIFO', icon: Package },
    { id: 'goals', label: 'Saving Goals', icon: Target },
    { id: 'mutasi', label: 'Riwayat Mutasi', icon: ReceiptText },
  ];

  const othersItems = [
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-[#ECE8F6] p-6 flex flex-col justify-between shrink-0 h-screen sticky top-0 hidden md:flex select-none">
      <div>
        {/* Brand Header FinBank style: Icon circle + "Velto" */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#6633EE] text-white flex items-center justify-center font-black text-lg shadow-glow-primary">
            V
          </div>
          <div>
            <h2 className="font-black text-lg text-[#1E1B2E] tracking-tight leading-none">
              Velto
            </h2>
            <span className="text-[10px] font-semibold text-[#7E7A9B] mt-0.5 block">
              Financial Platform
            </span>
          </div>
        </div>

        {/* Section: Main Menu */}
        <div className="mt-8">
          <span className="text-[11px] font-bold text-[#A09CB5] uppercase tracking-wider block px-3 mb-2">
            Main Menu
          </span>
          <nav className="space-y-1">
            {mainMenuItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                    isActive 
                      ? 'bg-[#F3EEFF] text-[#6633EE] shadow-xs' 
                      : 'text-[#6B7280] hover:text-[#1E1B2E] hover:bg-[#F4F2FA]'
                  }`}
                >
                  <Icon className={`w-4 h-4 stroke-[2.2] ${isActive ? 'text-[#6633EE]' : 'text-[#8E8AAB]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Section: Others */}
        <div className="mt-6">
          <span className="text-[11px] font-bold text-[#A09CB5] uppercase tracking-wider block px-3 mb-2">
            Others
          </span>
          <nav className="space-y-1">
            {othersItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                    isActive 
                      ? 'bg-[#F3EEFF] text-[#6633EE] shadow-xs' 
                      : 'text-[#6B7280] hover:text-[#1E1B2E] hover:bg-[#F4F2FA]'
                  }`}
                >
                  <Icon className={`w-4 h-4 stroke-[2.2] ${isActive ? 'text-[#6633EE]' : 'text-[#8E8AAB]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-[#ECE8F6]">
        <div>
          <p className="text-[11px] font-bold text-[#1E1B2E]">© Velto Finance</p>
          <p className="text-[9px] text-[#A09CB5]">Offline-First PWA 2026</p>
        </div>
      </div>
    </aside>
  );
}
