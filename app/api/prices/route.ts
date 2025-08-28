import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  try {
    // Price data endpoints will be implemented after database is complete
    return NextResponse.json({
      success: false,
      error: 'Price database not yet complete',
      metadata: {
        required_records: 50000,
        current_records: 0 // This will be dynamically checked later
      }
    }, { status: 503 });
  } catch (_error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Price data unavailable' 
      },
      { status: 500 }
    );
  }
}