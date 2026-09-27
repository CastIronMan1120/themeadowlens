import { NextResponse } from 'next/server';
import { createClient } from 'next-sanity';

// We create a dedicated client for this server-side action
// It needs a write token which should NOT be exposed to the browser
const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2023-05-03',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN, // Requires this secret in .env.local
});

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Basic validation
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: 'Name and email are required.' },
        { status: 400 }
      );
    }

    // Create the document in Sanity
    const result = await writeClient.create({
      _type: 'lead',
      name: body.name,
      email: body.email,
      phone: body.phone || '',
      interest: body.interest || 'General Inquiry',
      message: body.message || '',
      submittedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, id: result._id }, { status: 200 });
  } catch (error) {
    console.error('Failed to submit inquiry:', error);
    return NextResponse.json(
      { error: 'Internal server error while submitting inquiry.' },
      { status: 500 }
    );
  }
}
