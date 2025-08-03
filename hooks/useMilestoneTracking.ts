"use client";

import { useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { MilestoneSDK, MilestoneType } from "@/lib/milestone-nft";
import { createWalletClient, custom } from 'viem';
import { polygon } from 'viem/chains';

// Use Polygon chain (137) for milestone NFTs
const MILESTONE_CHAIN_ID = 137;

interface MilestoneTrackingOptions {
  onMilestoneEarned?: (milestone: MilestoneType) => void;
  onError?: (error: Error) => void;
}

// Helper function to create milestone metadata
const createMilestoneMetadata = (type: MilestoneType, userAddress: string) => {
  const milestoneInfo: Record<MilestoneType, { title: string; description: string; value: number }> = {
    [MilestoneType.FIRST_DEPOSIT]: {
      title: "First Steps 💰",
      description: "Made your first deposit and started your DeFi journey!",
      value: 1
    },
    [MilestoneType.SAVINGS_STREAK]: {
      title: "Auto Saver 🔥", 
      description: "Set up automated deposits to build consistent savings habits!",
      value: 1
    },
    [MilestoneType.EDUCATION_COMPLETE]: {
      title: "DeFi Scholar 🎓",
      description: "Completed all education modules and leveled up your knowledge!",
      value: 3
    },
    [MilestoneType.AMOUNT_SAVED]: {
      title: "Savings Champion 💎",
      description: "Reached $1000 in total savings - you're building wealth!",
      value: 1000
    },
    [MilestoneType.FINANCIAL_FREEDOM]: {
      title: "Financial Freedom 🎯",
      description: "Achieved financial freedom target - congratulations!",
      value: 10000
    },
    [MilestoneType.REFERRAL_CHAMPION]: {
      title: "Referral Champion 🤝",
      description: "Referred friends to join the platform!",
      value: 5
    },
    [MilestoneType.EARLY_ADOPTER]: {
      title: "BYOB Pioneer 🚀",
      description: "Early adopter of the BYOB platform - thanks for being an early believer!",
      value: 1
    },
    [MilestoneType.WHALE_SAVER]: {
      title: "Whale Saver 🐋",
      description: "Saved a massive amount - you're a whale!",
      value: 100000
    },
    [MilestoneType.ENS_IDENTITY]: {
      title: "ENS Identity 🌐",
      description: "Set up your ENS identity for Web3!",
      value: 1
    }
  };
  
  return milestoneInfo[type];
};

export function useMilestoneTracking(options: MilestoneTrackingOptions = {}) {
  const { user, authenticated } = usePrivy();
  const milestoneSDK = new MilestoneSDK(MILESTONE_CHAIN_ID);

  // Helper function to mint NFT for earned milestone (hackathon version)
  const mintMilestoneNFT = useCallback(async (milestoneType: MilestoneType, userAddress: string) => {
    try {
      // For hackathon: Check if current user is the contract owner
      const ownerAddress = '0xCDd40F678a08613742bE4c55b77e491ADDA97036';
      const isOwner = user?.wallet?.address?.toLowerCase() === ownerAddress.toLowerCase();
      
      if (!isOwner) {
        console.log('🎯 Milestone earned! NFT would be minted by contract owner:', MilestoneType[milestoneType]);
        console.log('📝 For demo: Connect with owner wallet to mint NFTs');
        return;
      }

      // Owner is connected - proceed with minting
      if (!window.ethereum) {
        console.warn('⚠️ No wallet provider found');
        return;
      }

      // Check if we're on Polygon chain (no switching needed since app is already on Polygon)
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      const polygonChainId = '0x89'; // 137 in hex
      
      if (currentChainId.toLowerCase() !== polygonChainId.toLowerCase()) {
        console.warn('⚠️ Not on Polygon chain, but continuing anyway since app handles this');
      } else {
        console.log('✅ Already on Polygon chain');
      }

      // Create wallet client using the connected wallet
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      const account = accounts[0];
      
      const walletClient = createWalletClient({
        chain: polygon,
        transport: custom(window.ethereum),
        account: account as `0x${string}`,
      });

      milestoneSDK.setWalletClient(walletClient);

      // Debug: Check all contract conditions before minting
      console.log('🔍 Debugging contract state before minting...');
      console.log('📍 User address:', userAddress);
      console.log('🎯 Milestone type:', milestoneType, MilestoneType[milestoneType]);
      console.log('📜 Contract address:', milestoneSDK.contractAddress);
      
      // Check 1: Is milestone type valid? (should be <= 4)
      console.log('✅ Check 1: Milestone type valid?', milestoneType <= 4);
      
      // Check 2: Is address not zero?
      console.log('✅ Check 2: Address not zero?', userAddress !== '0x0000000000000000000000000000000000000000');
      
      // Check 3: Has milestone already been achieved?
      let alreadyMinted;
      try {
        alreadyMinted = await milestoneSDK.hasAchievedMilestone(
          userAddress as `0x${string}`,
          milestoneType
        );
        console.log('✅ Check 3: Already minted?', alreadyMinted);
      } catch (checkError) {
        console.error('❌ Failed to check milestone status:', checkError);
        alreadyMinted = false; // Assume not minted if we can't check
      }
      
      if (alreadyMinted) {
        console.log('⚠️ Milestone already minted for this user:', MilestoneType[milestoneType]);
        return 'already-minted';
      }
      
      // Check 4: Are we the owner?
      try {
        const ownerResult = await milestoneSDK.publicClient.readContract({
          address: milestoneSDK.contractAddress,
          abi: [
            {
              name: 'owner',
              type: 'function',
              stateMutability: 'view',
              inputs: [],
              outputs: [{ name: '', type: 'address' }],
            }
          ],
          functionName: 'owner',
        });
        
        const currentAccount = await window.ethereum.request({ method: 'eth_accounts' });
        const connectedAddress = currentAccount[0];
        
        console.log('✅ Check 4: Contract owner:', ownerResult);
        console.log('✅ Check 4: Connected address:', connectedAddress);
        console.log('✅ Check 4: Is owner?', ownerResult?.toLowerCase() === connectedAddress?.toLowerCase());
        
        // Additional verification
        const walletAddress = await walletClient.getAddresses();
        console.log('✅ Check 4: Wallet client addresses:', walletAddress);
        console.log('✅ Check 4: Wallet matches connected?', walletAddress[0]?.toLowerCase() === connectedAddress?.toLowerCase());
        
        // Final owner verification
        const isOwnerMatch = ownerResult?.toLowerCase() === connectedAddress?.toLowerCase();
        if (!isOwnerMatch) {
          console.error('❌ Owner mismatch detected!');
          console.error('  Contract owner:', ownerResult);
          console.error('  Connected wallet:', connectedAddress);
          console.error('  Expected owner:', '0xCDd40F678a08613742bE4c55b77e491ADDA97036');
          throw new Error(`Not contract owner. Contract owner: ${ownerResult}, Connected: ${connectedAddress}`);
        }
        
      } catch (ownerError) {
        console.error('❌ Failed to check owner:', ownerError);
        throw ownerError; // Re-throw to stop execution if owner check fails
      }

      // Check 5: Can we read basic contract info?
      try {
        const totalMilestones = await milestoneSDK.publicClient.readContract({
          address: milestoneSDK.contractAddress,
          abi: [
            {
              name: 'totalMilestones',
              type: 'function',
              stateMutability: 'view',
              inputs: [],
              outputs: [{ name: '', type: 'uint256' }],
            }
          ],
          functionName: 'totalMilestones',
        });
        
        console.log('✅ Check 5: Contract readable? Total milestones:', totalMilestones);
        
      } catch (readError) {
        console.error('❌ Failed to read contract:', readError);
        console.error('❌ This suggests contract address or RPC issues');
      }

      // Check 6: Test each require condition individually
      console.log('🔍 Testing individual require conditions from contract:');
      
      // require(milestoneType <= 4, "Invalid milestone type");
      const milestoneTypeValid = milestoneType <= 4;
      console.log(`✅ Check 6a: milestoneType <= 4? ${milestoneType} <= 4 = ${milestoneTypeValid}`);
      
      // require(to != address(0), "Cannot mint to zero address");
      const addressValid = userAddress !== '0x0000000000000000000000000000000000000000';
      console.log(`✅ Check 6b: to != address(0)? ${userAddress} != 0x0000... = ${addressValid}`);
      
      // require(!hasAchieved[to][milestoneType], "Milestone already earned");
      // We already checked this above as "alreadyMinted"
      console.log(`✅ Check 6c: !hasAchieved[to][milestoneType]? !${alreadyMinted} = ${!alreadyMinted}`);
      
      // Check if all conditions pass
      const allConditionsPass = milestoneTypeValid && addressValid && !alreadyMinted;
      console.log(`🎯 All require conditions pass? ${allConditionsPass}`);
      
      if (!allConditionsPass) {
        console.error('❌ One or more require conditions would fail:');
        if (!milestoneTypeValid) console.error('  - Invalid milestone type');
        if (!addressValid) console.error('  - Invalid address (zero address)');
        if (alreadyMinted) console.error('  - Milestone already earned');
        throw new Error('Pre-flight checks failed - would violate contract require statements');
      }

      const metadata = createMilestoneMetadata(milestoneType, userAddress);
      
      console.log('🎨 Preparing to mint NFT...');
      console.log('📍 Minting to address:', userAddress);
      console.log('📋 Milestone type (number):', milestoneType);
      console.log('📋 Metadata:', metadata);
      console.log('📋 Metadata title:', metadata.title);
      console.log('📋 Metadata description:', metadata.description);
      console.log('📋 Metadata value:', metadata.value);
      
      // Log the exact parameters that will be sent to the contract
      console.log('📤 Contract call parameters:');
      console.log('  to:', userAddress);
      console.log('  milestoneType:', milestoneType);
      console.log('  value:', BigInt(metadata.value || 0));
      console.log('  title:', metadata.title);
      console.log('  description:', metadata.description);
      console.log('  metadataURI: [will be generated]');
      
      const txHash = await milestoneSDK.mintMilestone(
        userAddress as `0x${string}`,
        milestoneType,
        metadata
      );
      
      console.log('✅ NFT minted! Transaction:', txHash);
      return txHash;
      
    } catch (error) {
      console.error('❌ Failed to mint NFT:', error);
      
      // Log more details about the error
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error name:', error.name);
        if ('cause' in error && error.cause) {
          console.error('Error cause:', error.cause);
        }
      }
      
      // Check if it's the "already earned" error
      if (error instanceof Error && error.message.includes('Milestone already earned')) {
        console.log('💡 This milestone was already minted for this user');
        return 'already-minted';
      }
      
      // Don't throw - just log for demo purposes
      throw error; // Re-throw so the UI can handle it properly
    }
  }, [milestoneSDK, user?.wallet?.address]);

  const trackDeposit = useCallback(async (amountUSD: number) => {
    if (!authenticated || !user?.wallet?.address) return;

    try {
      console.log('🏆 Tracking deposit milestone:', amountUSD);
      
      // For demo purposes, we'll simulate milestone tracking
      // In a real app, this would call the smart contract
      
      // Check if this is the first deposit
      const hasFirstDeposit = await milestoneSDK.hasAchievedMilestone(
        user.wallet.address as `0x${string}`,
        MilestoneType.FIRST_DEPOSIT
      );

      if (!hasFirstDeposit) {
        console.log('🎉 First deposit milestone earned!');
        
        // Store as earned milestone for claiming later
        const earnedMilestones = JSON.parse(localStorage.getItem(`earned-milestones-${user.wallet.address}`) || '[]');
        if (!earnedMilestones.includes(MilestoneType.FIRST_DEPOSIT)) {
          earnedMilestones.push(MilestoneType.FIRST_DEPOSIT);
          localStorage.setItem(`earned-milestones-${user.wallet.address}`, JSON.stringify(earnedMilestones));
        }
        
        options.onMilestoneEarned?.(MilestoneType.FIRST_DEPOSIT);
      }

      // Check for amount milestones
      if (amountUSD >= 1000) {
        const hasAmountMilestone = await milestoneSDK.hasAchievedMilestone(
          user.wallet.address as `0x${string}`,
          MilestoneType.AMOUNT_SAVED
        );

        if (!hasAmountMilestone) {
          console.log('🎉 Amount saved milestone earned!');
          
          // Store as earned milestone for claiming later
          const earnedMilestones = JSON.parse(localStorage.getItem(`earned-milestones-${user.wallet.address}`) || '[]');
          if (!earnedMilestones.includes(MilestoneType.AMOUNT_SAVED)) {
            earnedMilestones.push(MilestoneType.AMOUNT_SAVED);
            localStorage.setItem(`earned-milestones-${user.wallet.address}`, JSON.stringify(earnedMilestones));
          }
          
          options.onMilestoneEarned?.(MilestoneType.AMOUNT_SAVED);
        }
      }

      // Record the deposit (in a real app, this would be called by the smart contract)
      // await milestoneSDK.recordDeposit(user.wallet.address as `0x${string}`, amountUSD);
      
    } catch (error) {
      console.error('Error tracking deposit milestone:', error);
      options.onError?.(error as Error);
    }
  }, [authenticated, user?.wallet?.address, options]);

  const trackEducationProgress = useCallback(async (moduleId: number) => {
    if (!authenticated || !user?.wallet?.address) return;

    try {
      console.log('📚 Tracking education progress:', moduleId);
      
      // Simulate education progress tracking
      // await milestoneSDK.recordEducationProgress(user.wallet.address as `0x${string}`, moduleId);
      
      // Check if all modules are completed (for demo, assume 3 modules total)
      if (moduleId >= 2) { // 0-indexed, so 2 means 3 modules completed
        console.log('🎉 Education complete milestone earned!');
        
        // Store as earned milestone for claiming later
        const earnedMilestones = JSON.parse(localStorage.getItem(`earned-milestones-${user.wallet.address}`) || '[]');
        if (!earnedMilestones.includes(MilestoneType.EDUCATION_COMPLETE)) {
          earnedMilestones.push(MilestoneType.EDUCATION_COMPLETE);
          localStorage.setItem(`earned-milestones-${user.wallet.address}`, JSON.stringify(earnedMilestones));
        }
        
        options.onMilestoneEarned?.(MilestoneType.EDUCATION_COMPLETE);
      }
      
    } catch (error) {
      console.error('Error tracking education milestone:', error);
      options.onError?.(error as Error);
    }
  }, [authenticated, user?.wallet?.address, options]);

  const trackReferral = useCallback(async (referredAddress: string) => {
    if (!authenticated || !user?.wallet?.address) return;

    try {
      console.log('🤝 Tracking referral milestone:', referredAddress);
      
      // Simulate referral tracking
      // This would increment the user's referral count
      console.log('🎉 Referral milestone progress updated!');
      
    } catch (error) {
      console.error('Error tracking referral milestone:', error);
      options.onError?.(error as Error);
    }
  }, [authenticated, user?.wallet?.address, options]);

  const trackAutomatedSavings = useCallback(async () => {
    if (!authenticated || !user?.wallet?.address) return;

    try {
      console.log('🔥 Tracking automated savings milestone setup');
      
      // Check if user already has savings streak milestone
      const hasSavingsStreak = await milestoneSDK.hasAchievedMilestone(
        user.wallet.address as `0x${string}`,
        MilestoneType.SAVINGS_STREAK
      );

      if (!hasSavingsStreak) {
        console.log('🎉 Savings streak milestone earned!');
        
        // Store as earned milestone for claiming later
        const earnedMilestones = JSON.parse(localStorage.getItem(`earned-milestones-${user.wallet.address}`) || '[]');
        if (!earnedMilestones.includes(MilestoneType.SAVINGS_STREAK)) {
          earnedMilestones.push(MilestoneType.SAVINGS_STREAK);
          localStorage.setItem(`earned-milestones-${user.wallet.address}`, JSON.stringify(earnedMilestones));
        }
        
        options.onMilestoneEarned?.(MilestoneType.SAVINGS_STREAK);
      }
      
    } catch (error) {
      console.error('Error tracking automated savings milestone:', error);
      options.onError?.(error as Error);
    }
  }, [authenticated, user?.wallet?.address, options]);

  const setFinancialFreedomTarget = useCallback(async (targetUSD: number) => {
    if (!authenticated || !user?.wallet?.address) return;

    try {
      console.log('🎯 Setting financial freedom target:', targetUSD);
      
      // await milestoneSDK.setFinancialFreedomTarget(user.wallet.address as `0x${string}`, targetUSD);
      
    } catch (error) {
      console.error('Error setting financial freedom target:', error);
      options.onError?.(error as Error);
    }
  }, [authenticated, user?.wallet?.address, options]);

  const checkMilestoneProgress = useCallback(async () => {
    if (!authenticated || !user?.wallet?.address) return null;

    try {
      const userData = await milestoneSDK.getUserData(user.wallet.address as `0x${string}`);
      return userData;
    } catch (error) {
      console.error('Error checking milestone progress:', error);
      options.onError?.(error as Error);
      return null;
    }
  }, [authenticated, user?.wallet?.address, options]);

  // Get earned but unclaimed milestones
  const getEarnedMilestones = useCallback(() => {
    if (!user?.wallet?.address) return [];
    const earnedMilestones = JSON.parse(localStorage.getItem(`earned-milestones-${user.wallet.address}`) || '[]');
    return earnedMilestones;
  }, [user?.wallet?.address]);

  // Clear a specific earned milestone (for debugging)
  const clearEarnedMilestone = useCallback((milestoneType: MilestoneType) => {
    if (!user?.wallet?.address) return;
    const earnedMilestones = JSON.parse(localStorage.getItem(`earned-milestones-${user.wallet.address}`) || '[]');
    const updatedMilestones = earnedMilestones.filter((m: MilestoneType) => m !== milestoneType);
    localStorage.setItem(`earned-milestones-${user.wallet.address}`, JSON.stringify(updatedMilestones));
    console.log('🧹 Cleared milestone from localStorage:', MilestoneType[milestoneType]);
  }, [user?.wallet?.address]);

  // Manually claim/mint a milestone NFT
  const claimMilestone = useCallback(async (milestoneType: MilestoneType) => {
    if (!user?.wallet?.address) return;
    
    try {
      const txHash = await mintMilestoneNFT(milestoneType, user.wallet.address);
      
      if (txHash === 'already-minted') {
        // Milestone was already minted, remove from localStorage
        clearEarnedMilestone(milestoneType);
        return 'already-minted';
      }
      
      if (txHash) {
        // Remove from earned list after successful minting
        clearEarnedMilestone(milestoneType);
      }
      
      return txHash;
    } catch (error) {
      // If minting fails due to already earned, clear from localStorage
      if (error instanceof Error && error.message.includes('Milestone already earned')) {
        clearEarnedMilestone(milestoneType);
        return 'already-minted';
      }
      throw error;
    }
  }, [user?.wallet?.address, mintMilestoneNFT, clearEarnedMilestone]);

  return {
    trackDeposit,
    trackEducationProgress,
    trackReferral,
    trackAutomatedSavings,
    setFinancialFreedomTarget,
    checkMilestoneProgress,
    getEarnedMilestones,
    claimMilestone,
    clearEarnedMilestone, // For debugging
    isReady: authenticated && !!user?.wallet?.address,
  };
}

export default useMilestoneTracking;