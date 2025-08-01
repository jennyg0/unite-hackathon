"use client";

import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { use1inchData } from "@/hooks/use1inchData";
import { WalletBalance } from "@/lib/1inch-api";
import { DEFAULT_CHAIN_ID } from "@/lib/constants";

export function useWallet() {
  const { user, authenticated } = usePrivy();
  const [totalBalance, setTotalBalance] = useState<number>(0);

  const {
    walletBalances,
    prices,
    fetchWalletBalances,
    isLoading,
    error,
  } = use1inchData({ chainId: DEFAULT_CHAIN_ID });

  // Calculate USD value for a balance
  const calculateBalanceUsd = (balance: WalletBalance): number => {
    const tokenBalance = parseFloat(balance.balance) / Math.pow(10, balance.token.decimals);
    
    const priceKey = balance.token.address;
    const priceData = prices[priceKey] || prices[priceKey.toLowerCase()];
    
    if (priceData && priceData.price > 0) {
      return tokenBalance * priceData.price;
    }
    
    return 0;
  };
  
  // Calculate total wallet value
  const calculateTotalValue = (): number => {
    return walletBalances.reduce((total, balance) => {
      return total + calculateBalanceUsd(balance);
    }, 0);
  };

  // Update total balance when data changes
  useEffect(() => {
    if (walletBalances.length > 0) {
      const total = calculateTotalValue();
      setTotalBalance(total);
    }
  }, [walletBalances, prices]);

  // Fetch data when wallet connects
  useEffect(() => {
    if (authenticated && user?.wallet?.address) {
      fetchWalletBalances(user?.wallet?.address);
    }
  }, [authenticated, user?.wallet?.address]);

  return {
    totalBalance,
    walletBalances,
    isLoading,
    error,
    refreshBalance: () => {
      if (user?.wallet?.address) {
        fetchWalletBalances(user.wallet.address);
      }
    }
  };
}