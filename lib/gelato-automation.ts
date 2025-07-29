import { AutomateSDK, TriggerType, TriggerConfig } from "@gelatonetwork/automate-sdk";
import { ethers } from "ethers";

// Contract addresses (will be filled after deployment)
const AUTOMATED_DEPOSITS_CONTRACT = "0x..."; // TODO: Deploy with Foundry
const USDC_ADDRESS = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"; // Polygon USDC

interface CreateAutomationParams {
  userAddress: string;
  amount: number; // USDC amount
  frequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly';
  scheduleId: number;
  signer: ethers.Signer;
}

export class GelatoAutomationService {
  private automate: AutomateSDK;

  constructor(chainId: number, signer: ethers.Signer) {
    this.automate = new AutomateSDK(chainId, signer);
  }

  /**
   * Create automated deposit task via Gelato
   */
  async createDepositAutomation(params: CreateAutomationParams): Promise<string> {
    const { userAddress, amount, frequency, scheduleId, signer } = params;

    // Convert frequency to cron expression
    const cronExpression = this.getCronExpression(frequency);

    // Prepare contract call data
    const contractInterface = new ethers.utils.Interface([
      "function executeDeposit(address user, uint256 scheduleId)"
    ]);

    const execData = contractInterface.encodeFunctionData("executeDeposit", [
      userAddress,
      scheduleId
    ]);

    // Create the automated task
    const { taskId } = await this.automate.createTask({
      name: `Automated Deposit - ${userAddress}`,
      execAddress: AUTOMATED_DEPOSITS_CONTRACT,
      execData,
      trigger: {
        type: TriggerType.TIME,
        cron: cronExpression,
      } as TriggerConfig,
      paymentToken: USDC_ADDRESS, // User pays gas fees in USDC
      dedicatedMsgSender: true,
    });

    console.log(`✅ Created Gelato task: ${taskId}`);
    return taskId;
  }

  /**
   * Cancel automated deposit task
   */
  async cancelDepositAutomation(taskId: string): Promise<void> {
    await this.automate.cancelTask(taskId);
    console.log(`❌ Cancelled Gelato task: ${taskId}`);
  }

  /**
   * Get task status and execution history
   */
  async getTaskStatus(taskId: string) {
    return await this.automate.getTask(taskId);
  }

  /**
   * Convert frequency to cron expression
   */
  private getCronExpression(frequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly'): string {
    switch (frequency) {
      case 'daily':
        return '0 10 * * *'; // Every day at 10 AM UTC (perfect for hackathon!)
      case 'weekly':
        return '0 10 * * 1'; // Every Monday at 10 AM UTC
      case 'bi-weekly':
        return '0 10 * * 1/2'; // Every other Monday at 10 AM UTC
      case 'monthly':
        return '0 10 1 * *'; // First day of month at 10 AM UTC
      default:
        throw new Error(`Unsupported frequency: ${frequency}`);
    }
  }

  /**
   * Estimate gas cost for automation
   */
  async estimateGasCost(userAddress: string, scheduleId: number): Promise<string> {
    // This would call the contract to estimate gas
    // For now, return a reasonable estimate
    return "0.50"; // $0.50 USD per execution
  }
}

/**
 * Create Gelato automation service instance
 */
export function createGelatoAutomation(
  chainId: number,
  signer: ethers.Signer
): GelatoAutomationService {
  return new GelatoAutomationService(chainId, signer);
}