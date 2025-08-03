import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

// Simple in-memory storage for demo (in production, use a proper database)
const scheduledDeposits = new Map();

export async function POST(request: NextRequest) {
  try {
    const { user, token, amount, intervalDays, startTime } = await request.json();
    
    // Validation
    if (!user || !token || !amount || !intervalDays) {
      return NextResponse.json({ 
        error: 'Missing required fields: user, token, amount, intervalDays' 
      }, { status: 400 });
    }
    
    if (!ethers.isAddress(user) || !ethers.isAddress(token)) {
      return NextResponse.json({ 
        error: 'Invalid address format' 
      }, { status: 400 });
    }
    
    if (amount <= 0 || intervalDays <= 0) {
      return NextResponse.json({ 
        error: 'Amount and intervalDays must be positive' 
      }, { status: 400 });
    }
    
    // Create schedule
    const scheduleId = `${user}_${Date.now()}`;
    const schedule = {
      id: scheduleId,
      user: user,
      token: token,
      amount: amount.toString(),
      intervalDays: parseInt(intervalDays),
      nextDeposit: startTime ? new Date(startTime) : new Date(),
      isActive: true,
      createdAt: new Date(),
      totalDeposited: '0'
    };
    
    // Calculate next deposit time
    if (!startTime) {
      schedule.nextDeposit = new Date(Date.now() + (intervalDays * 24 * 60 * 60 * 1000));
    }
    
    scheduledDeposits.set(scheduleId, schedule);
    
    console.log('📅 New auto deposit scheduled:', {
      scheduleId,
      user,
      amount,
      intervalDays,
      nextDeposit: schedule.nextDeposit
    });
    
    return NextResponse.json({
      success: true,
      scheduleId,
      schedule: {
        ...schedule,
        nextDeposit: schedule.nextDeposit.toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Error scheduling deposit:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}