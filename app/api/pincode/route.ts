import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pincode = searchParams.get('pincode');

    if (!pincode || typeof pincode !== 'string') {
      return NextResponse.json(
        { error: 'Pincode is required' },
        { status: 400 }
      );
    }

    const sanitized = pincode.trim();
    // Validate that it is exactly 6 digits
    const isValid = /^[1-9][0-9]{5}$/.test(sanitized);

    if (!isValid) {
      return NextResponse.json({
        deliverable: false,
        message: 'Delivery not available to this pincode'
      });
    }

    const prefix = sanitized[0];

    // Mock unavailable delivery for prefix 9 (remote regions/islands/etc.)
    if (prefix === '9') {
      return NextResponse.json({
        deliverable: false,
        message: 'Delivery not available to this pincode'
      });
    }

    // Determine estimated days based on prefix
    let days = '3-5';
    if (sanitized === '682016' || prefix === '6') {
      // Kerala / South India - matches prompt example
      days = '3-5';
    } else if (prefix === '5') {
      // Karnataka/Telangana/AP/etc.
      days = '2-3';
    } else if (prefix === '3' || prefix === '4') {
      // West / Central (Maharashtra, Gujarat, MP)
      days = '2-4';
    } else if (prefix === '7' || prefix === '8') {
      // East / Northeast
      days = '4-7';
    } else {
      // North India (1, 2)
      days = '3-6';
    }

    return NextResponse.json({
      deliverable: true,
      estimatedDays: days,
      message: `Delivery in ${days} days to ${sanitized}`
    });
  } catch (error: any) {
    console.error('Pincode check error:', error);
    return NextResponse.json(
      { error: 'Internal server error checking pincode' },
      { status: 500 }
    );
  }
}
