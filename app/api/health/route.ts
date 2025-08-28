import { NextResponse } from 'next/server';
import { database } from '@/lib/database';

export async function GET() {
  try {
    // Check database connection
    const isDatabaseHealthy = await database.isHealthy();
    
    // Get price database status
    const priceRecordCount = await database.getPriceRecordCount();
    const isPriceDatabaseComplete = await database.isPriceDatabaseComplete();
    
    const healthStatus = {
      status: isDatabaseHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: {
        connected: isDatabaseHealthy,
        priceRecords: priceRecordCount,
        priceDatabaseComplete: isPriceDatabaseComplete,
        requiredRecords: 50000
      },
      features: {
        phase1Complete: isPriceDatabaseComplete, // Price database ready
        dealDetection: isPriceDatabaseComplete,
        notifications: isDatabaseHealthy,
        userManagement: isDatabaseHealthy
      }
    };

    return NextResponse.json({
      success: isDatabaseHealthy,
      data: healthStatus,
      metadata: {
        phase: isPriceDatabaseComplete ? 'Phase 2+' : 'Phase 0-1',
        message: isPriceDatabaseComplete 
          ? 'All systems operational' 
          : 'Price database incomplete - some features disabled'
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Health check failed',
        data: {
          status: 'error',
          timestamp: new Date().toISOString(),
          database: {
            connected: false
          }
        }
      },
      { status: 500 }
    );
  }
}