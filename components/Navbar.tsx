import React from 'react';
import { ShoppingBag, ShoppingCart, Settings, Lock, Heart, User } from 'lucide-react';
import { ViewState } from '../types';

interface NavbarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  cartCount: number;
  isAuthenticated: boolean;
  isAdminVisible: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setView, cartCount, isAuthenticated, isAdminVisible }) => {
  const tabs = [
    { id: ViewState.STORE, icon: ShoppingBag, label: 'Store' },
    { id: ViewState.FAVORITES, icon: Heart, label: 'Saved' },
    { id: ViewState.CART, icon: ShoppingCart, label: 'Cart', badge: cartCount },
    { id: ViewState.PROFILE, icon: User, label: 'Profile' },
  ];

  if (isAdminVisible) {
    tabs.push({ 
      id: ViewState.ADMIN, 
      icon: isAuthenticated ? Settings : Lock, 
      label: 'Admin' 
    });
  }

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-auto animate-fade-in-up">
      <nav className="glass-nav rounded-full px-2 py-2 flex items-center justify-center shadow-2xl">
        {tabs.map((tab) => {
          const isActive = currentView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={`
                relative flex items-center justify-center px-5 py-3 rounded-full transition-all duration-300 group
                ${isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}
              `}
            >
              {/* Active Background Pill */}
              {isActive && (
                <span className="absolute inset-0 bg-white/10 rounded-full scale-100 transition-transform duration-300" />
              )}
              
              <div className="relative flex items-center gap-3 z-10">
                {/* Icon Wrapper to hold badge relatively */}
                <div className="relative">
                  <tab.icon 
                    size={20} 
                    strokeWidth={isActive ? 2.5 : 2} 
                    className={`transition-colors duration-300 ${isActive ? 'text-white' : 'text-current'}`} 
                  />
                  
                  {/* Notification Badge - Attached to Icon */}
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-blue-500 text-white text-[9px] font-bold px-1 ring-2 ring-black">
                      {tab.badge}
                    </span>
                  )}
                </div>
                
                {isActive && (
                  <span className="text-sm font-semibold tracking-wide animate-scale-in origin-left">
                    {tab.label}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
};