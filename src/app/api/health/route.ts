import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    ok: true,
    ts: Date.now(),
    db: Boolean(process.env.DATABASE_URL),
    s3: Boolean(
      process.env.AWS_ENDPOINT_URL &&
      process.env.AWS_S3_BUCKET_NAME &&
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY,
    ),
  });
}
