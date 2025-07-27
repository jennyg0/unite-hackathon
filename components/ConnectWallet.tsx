"use client";

import { usePrivy } from "@privy-io/react-auth";
import { Wallet, LogOut } from "lucide-react";
import { useENS } from "@/hooks/useENS";

export function ConnectWallet() {
  const { login, logout, authenticated, user, ready } = usePrivy();
  const { getDisplayName } = useENS();

  if (!ready) {
    return (
      <div className="btn-primary flex items-center space-x-2 opacity-50">
        <Wallet className="w-4 h-4" />
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
        <Wallet className="w-4 h-4" />
        <span>Connect Wallet</span>
      </button>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-3 rounded-lg">
        <span>{getDisplayName()}</span>
      </div>
      <button
        onClick={logout}
        className="btn-secondary flex items-center space-x-2"
      >
        <LogOut className="w-4 h-4" />
        <span>Disconnect</span>
      </button>
    </div>
  );
}
