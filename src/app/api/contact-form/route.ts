import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    const {
      fullName,
      businessName,
      email,
      businessType,
      monthlyRevenue,
      fundingSought,
      businessDescription
    } = body;

    if (!fullName || !businessName || !email || !businessType ||
        !monthlyRevenue || !fundingSought || !businessDescription) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('nexa');
    const collection = db.collection('contact_forms');

    // Prepare the document to insert
    const formData = {
      ...body,
      submittedAt: new Date(),
    };

    // Insert the form data
    const result = await collection.insertOne(formData);

    return NextResponse.json(
      {
        success: true,
        message: 'Form submitted successfully',
        id: result.insertedId
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error submitting form:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}