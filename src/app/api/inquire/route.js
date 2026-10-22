import { NextResponse } from 'next/server';
import { createClient } from 'next-sanity';

// Server-only Sanity client — token is never exposed to browser clients
const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-03-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});

// Sliding-window IP rate limiter (max 5 submissions per 15 minutes per IP)
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;
const ipRequests = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const timestamps = (ipRequests.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    ipRequests.set(ip, timestamps);
    return true;
  }
  timestamps.push(now);
  ipRequests.set(ip, timestamps);
  return false;
}

function sanitizeText(val, maxLen = 500) {
  if (typeof val !== 'string') return '';
  return val
    .replace(/<[^>]*>/g, '') // Strip HTML/script tags
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '') // Strip control chars
    .trim()
    .slice(0, maxLen);
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request) {
  try {
    const forwardedFor = request.headers.get('x-forwarded-for');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : request.headers.get('x-real-ip') || 'unknown';

    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { error: 'Too many inquiry attempts. Please wait a few minutes and try again.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    // 1. Anti-bot Honeypot check: if a bot filled out the hidden "website" field, silently discard
    if (body.website && String(body.website).trim() !== '') {
      return NextResponse.json({ success: true, id: 'filtered' }, { status: 200 });
    }

    // 2. Sanitize and enforce strict field length limits
    const cleanName = sanitizeText(body.name, 120);
    const cleanEmail = sanitizeText(body.email, 160).toLowerCase();
    const cleanPhone = sanitizeText(body.phone, 40);
    const cleanInterest = sanitizeText(body.interest, 200) || 'General Inquiry';
    const cleanMessage = sanitizeText(body.message, 3000);

    if (!cleanName || !cleanEmail) {
      return NextResponse.json(
        { error: 'Name and email are required.' },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(cleanEmail)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    // 3. Create the sanitized lead document in Sanity Cloud
    const result = await writeClient.create({
      _type: 'lead',
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      interest: cleanInterest,
      message: cleanMessage,
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
