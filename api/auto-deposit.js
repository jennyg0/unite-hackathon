// Backend API for Auto Deposit Scheduling
// This can be deployed on Vercel, Railway, or any Node.js hosting

const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory storage for hackathon (use proper DB in production)
const scheduledDeposits = new Map();
const SIMPLE_AUTO_DEPOSIT_ADDRESS = "0x93CCA0c23c52E59a4aDA7694F1D7eaEf2cF89C13"; // Deployed contract address

// POST /schedule-auto-deposit
app.post('/schedule-auto-deposit', async (req, res) => {
    try {
        const { user, token, amount, intervalDays, startTime } = req.body;
        
        // Validation
        if (!user || !token || !amount || !intervalDays) {
            return res.status(400).json({ 
                error: 'Missing required fields: user, token, amount, intervalDays' 
            });
        }
        
        if (!ethers.isAddress(user) || !ethers.isAddress(token)) {
            return res.status(400).json({ 
                error: 'Invalid address format' 
            });
        }
        
        if (amount <= 0 || intervalDays <= 0) {
            return res.status(400).json({ 
                error: 'Amount and intervalDays must be positive' 
            });
        }
        
        // Create schedule
        const scheduleId = `${user}_${Date.now()}`;
        const schedule = {
            id: scheduleId,
            user: user.toLowerCase(),
            token: token.toLowerCase(),
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
        
        res.json({
            success: true,
            scheduleId,
            schedule: {
                ...schedule,
                nextDeposit: schedule.nextDeposit.toISOString()
            }
        });
        
    } catch (error) {
        console.error('❌ Error scheduling deposit:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /scheduled-deposits/:user
app.get('/scheduled-deposits/:user', (req, res) => {
    try {
        const user = req.params.user.toLowerCase();
        const userSchedules = Array.from(scheduledDeposits.values())
            .filter(schedule => schedule.user === user)
            .map(schedule => ({
                ...schedule,
                nextDeposit: schedule.nextDeposit.toISOString(),
                createdAt: schedule.createdAt.toISOString()
            }));
        
        res.json({
            success: true,
            schedules: userSchedules
        });
        
    } catch (error) {
        console.error('❌ Error fetching schedules:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /scheduled-deposits/:scheduleId
app.delete('/scheduled-deposits/:scheduleId', (req, res) => {
    try {
        const scheduleId = req.params.scheduleId;
        const schedule = scheduledDeposits.get(scheduleId);
        
        if (!schedule) {
            return res.status(404).json({ error: 'Schedule not found' });
        }
        
        // Deactivate instead of delete (for history)
        schedule.isActive = false;
        schedule.cancelledAt = new Date();
        
        res.json({
            success: true,
            message: 'Schedule cancelled'
        });
        
    } catch (error) {
        console.error('❌ Error cancelling schedule:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /due-deposits (for cron job to check)
app.get('/due-deposits', (req, res) => {
    try {
        const now = new Date();
        const dueDeposits = Array.from(scheduledDeposits.values())
            .filter(schedule => 
                schedule.isActive && 
                schedule.nextDeposit <= now
            )
            .map(schedule => ({
                ...schedule,
                nextDeposit: schedule.nextDeposit.toISOString(),
                createdAt: schedule.createdAt.toISOString()
            }));
        
        res.json({
            success: true,
            dueDeposits,
            count: dueDeposits.length
        });
        
    } catch (error) {
        console.error('❌ Error fetching due deposits:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /execute-deposit (called by cron job after executing on-chain)
app.post('/execute-deposit', (req, res) => {
    try {
        const { scheduleId, txHash, amount } = req.body;
        const schedule = scheduledDeposits.get(scheduleId);
        
        if (!schedule) {
            return res.status(404).json({ error: 'Schedule not found' });
        }
        
        // Update schedule for next execution
        const nextDeposit = new Date(Date.now() + (schedule.intervalDays * 24 * 60 * 60 * 1000));
        schedule.nextDeposit = nextDeposit;
        schedule.totalDeposited = (BigInt(schedule.totalDeposited) + BigInt(amount)).toString();
        schedule.lastExecution = {
            timestamp: new Date(),
            txHash,
            amount
        };
        
        console.log('✅ Deposit executed and recorded:', {
            scheduleId,
            txHash,
            amount,
            nextDeposit
        });
        
        res.json({
            success: true,
            message: 'Deposit execution recorded',
            nextDeposit: nextDeposit.toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error recording execution:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        scheduledCount: scheduledDeposits.size 
    });
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`🚀 Auto Deposit API running on port ${port}`);
    console.log(`📊 Endpoints available:`);
    console.log(`   POST /schedule-auto-deposit`);
    console.log(`   GET  /scheduled-deposits/:user`);
    console.log(`   DELETE /scheduled-deposits/:scheduleId`);
    console.log(`   GET  /due-deposits`);
    console.log(`   POST /execute-deposit`);
    console.log(`   GET  /health`);
});

module.exports = app;