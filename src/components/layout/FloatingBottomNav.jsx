import React from 'react';
import { Home, Wallet, Target, MessageSquare, Settings, Package } from 'lucide-react';

export default function FloatingBottomNav({ currentTab, setTab }) {
  const navTabs = [
    { id: 'overview', icon: Home, label: 'Home' },
    { id: 'wallets', icon: Wallet, label: 'Wallets' },
    { id: 'parfum', icon: Package, label: 'Parfum' },
    { id: 'goals', icon: Target, label: 'Goals' },
    { id: 'mutasi', icon: MessageSquare, label: 'Mutasi' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden flex justify-center pb-safe pointer-events-none">
      <div className="w-full max-w-[420px] bg-white/95 backdrop-blur-md border-t border-[#ECE8F6] px-5 py-2 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] flex items-center justify-between pointer-events-auto">
        {navTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all ${
                isActive 
                  ? 'text-[#6633EE] scale-105' 
                  : 'text-[#9CA3AF] hover:text-[#1E1B2E]'
              }`}
            >
              <Icon className={`w-5 h-5 stroke-[2.2] ${isActive ? 'stroke-[#6633EE]' : ''}`} />
              <span className={`text-[10px] mt-1 font-semibold ${isActive ? 'text-[#6633EE]' : 'text-[#9CA3AF]'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
