import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory storage for demo (in production, use a proper database)
// Note: In serverless functions, this will not persist between requests
// You would need to use a proper database like Vercel KV, PostgreSQL, etc.
const scheduledDeposits = new Map();

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: scheduleId } = await params;
    const schedule = scheduledDeposits.get(scheduleId);
    
    if (!schedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }
    
    // Deactivate instead of delete (for history)
    schedule.isActive = false;
    schedule.cancelledAt = new Date();
    
    return NextResponse.json({
      success: true,
      message: 'Schedule cancelled'
    });
    
  } catch (error) {
    console.error('❌ Error cancelling schedule:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: user } = await params;
    const userSchedules = Array.from(scheduledDeposits.values())
      .filter((schedule: any) => schedule.user.toLowerCase() === user.toLowerCase())
      .map((schedule: any) => ({
        ...schedule,
        nextDeposit: schedule.nextDeposit.toISOString(),
        createdAt: schedule.createdAt.toISOString()
      }));
    
    return NextResponse.json({
      success: true,
      schedules: userSchedules
    });
    
  } catch (error) {
    console.error('❌ Error fetching schedules:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}