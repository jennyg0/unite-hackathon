"use client";

import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { use1inchData } from "@/hooks/use1inchData";
import { WalletBalance } from "@/lib/1inch-api";
import { DEFAULT_CHAIN_ID } from "@/lib/constants";
import { AaveService } from "@/lib/aave-service";

export function useWallet() {
  const { user, authenticated } = usePrivy();
  const [aaveInvestments, setAaveInvestments] = useState(0);

  const {
    walletBalances,
    totalWalletValue,
    fetchWalletBalances,
    isLoading,
    error,
  } = use1inchData({ chainId: DEFAULT_CHAIN_ID });

  // Fetch Aave investments
  const fetchAaveInvestments = async () => {
    if (!user?.wallet?.address) return;
    
    try {
      const aaveService = new AaveService(DEFAULT_CHAIN_ID);
      const positions = await aaveService.getUserAavePositions(user.wallet.address);
      const totalInvested = positions.reduce((sum, pos) => sum + pos.balanceUsd, 0);
      setAaveInvestments(totalInvested);
      console.log('🏦 Total Aave investments:', totalInvested);
    } catch (error) {
      console.error('Failed to fetch Aave investments for useWallet:', error);
      setAaveInvestments(0);
    }
  };

  // Debug logging to track balance issues
  useEffect(() => {
    console.log("🔍 useWallet Debug:", {
      authenticated,
      userAddress: user?.wallet?.address,
      walletBalances: walletBalances.length,
      totalWalletValue,
      isLoading,
      error: Object.keys(error || {}).length > 0 ? error : null
    });
  }, [authenticated, user?.wallet?.address, walletBalances, totalWalletValue, isLoading, error]);

  // Fetch data when wallet connects
  useEffect(() => {
    if (authenticated && user?.wallet?.address) {
      console.log("🔄 Fetching wallet balances for:", user.wallet.address);
      fetchWalletBalances(user?.wallet?.address);
      fetchAaveInvestments();
    }
  }, [authenticated, user?.wallet?.address]);

  // Calculate balance properly from actual wallet data
  const calculateActualBalance = () => {
    console.log("🔍 Balance calculation debug:", {
      totalWalletValue,
      walletBalancesCount: walletBalances.length,
      walletBalances: walletBalances.map(b => ({
        symbol: b.token.symbol,
        address: b.token.address,
        balance: b.balance,
        balanceUsd: b.balanceUsd,
        decimals: b.token.decimals
      }))
    });

    // If 1inch API has data, use it
    if (totalWalletValue > 0) {
      console.log("✅ Using 1inch API balance:", totalWalletValue);
      return totalWalletValue;
    }

    // If 1inch fails, calculate manually from token balances  
    if (walletBalances.length > 0) {
      const manualTotal = walletBalances.reduce((total, balance) => {
        // USE THE ACTUAL USD VALUE FROM THE API - NOT TOKEN AMOUNT
        const usdValue = balance.balanceUsd || 0;
        console.log(`💰 ${balance.token.symbol}: $${usdValue.toFixed(2)} USD`);
        return total + usdValue;
      }, 0);
      console.log("✅ Manual balance calculation:", manualTotal.toFixed(2));
      return manualTotal;
    }

    console.log("❌ No balance data available");
    return 0;
  };

  return {
    totalBalance: calculateActualBalance(),
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