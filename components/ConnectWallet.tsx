"use client";

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { User, LogOut, ChevronDown, Settings, DollarSign } from "lucide-react";
import { useENS } from "@/hooks/useENS";

export function ConnectWallet() {
  const { login, logout, authenticated, user, ready } = usePrivy();
  const { getDisplayName } = useENS();
  const [showDropdown, setShowDropdown] = useState(false);

  if (!ready) {
    return (
      <div className="btn-primary flex items-center space-x-2 opacity-50">
        <User className="w-4 h-4" />
        <span>Loading...</span>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <button
        onClick={login}
        className="btn-primary flex items-center space-x-2"
      >
        <User className="w-4 h-4" />
        <span>Sign In</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-3 rounded-lg transition-colors"
      >
        <span>{getDisplayName()}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {showDropdown && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="py-2">
              {/* Account Info Section */}
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="text-sm font-medium text-gray-900 mb-1">Account</div>
                <div className="text-xs text-gray-600">{getDisplayName()}</div>
              </div>

              {/* Account Stats */}
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-green-600">$0</div>
                    <div className="text-xs text-gray-600">Total Deposited</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">$0</div>
                    <div className="text-xs text-gray-600">Total Earned</div>
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div className="px-2 py-1">
                <div className="px-2 py-2 text-sm text-gray-700">
                  <div className="flex justify-between items-center py-2">
                    <span>Auto-compound</span>
                    <span className="text-green-600 text-xs font-medium">Active</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span>Monthly deposit</span>
                    <span className="text-gray-900 text-xs font-medium">$0/month</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-gray-100 px-2 py-1">
                <button className="w-full text-left px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4" />
                    <span>Withdraw Funds</span>
                  </div>
                </button>
                <button 
                  onClick={logout}
                  className="w-full text-left px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
