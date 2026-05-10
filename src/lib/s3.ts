import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const endpoint = process.env.AWS_ENDPOINT_URL;
const region = process.env.AWS_DEFAULT_REGION || 'auto';
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const bucket = process.env.AWS_S3_BUCKET_NAME;

export const isS3Configured = Boolean(endpoint && accessKeyId && secretAccessKey && bucket);

export const s3Bucket = bucket ?? '';

let _client: S3Client | null = null;
export function s3(): S3Client {
  if (!isS3Configured) {
    throw new Error(
      'S3 is not configured. Set AWS_ENDPOINT_URL, AWS_S3_BUCKET_NAME, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY.',
    );
  }
  if (_client) return _client;
  _client = new S3Client({
    endpoint,
    region,
    forcePathStyle: true,
    credentials: { accessKeyId: accessKeyId!, secretAccessKey: secretAccessKey! },
  });
  return _client;
}

/**
 * Direct public URL for an object — only returned when the operator has
 * explicitly opted in via S3_PUBLIC_BASE_URL. Many S3-compatible providers
 * (Tigris, R2, S3 with Block Public Access) ignore object-level ACLs, so
 * "construct {endpoint}/{bucket}/{key} and hope" produces broken images.
 * When this returns null, callers should serve the asset through the
 * /i/[...key] proxy instead.
 */
export function publicUrlForKey(key: string): string | null {
  const base = process.env.S3_PUBLIC_BASE_URL?.replace(/\/$/, '');
  if (!base) return null;
  return `${base}/${key}`;
}

export async function uploadObject(params: {
  key: string;
  body: Buffer | Uint8Array;
  contentType: string;
  cacheControl?: string;
}): Promise<void> {
  await s3().send(
    new PutObjectCommand({
      Bucket: s3Bucket,
      Key: params.key,
      Body: params.body,
      ContentType: params.contentType,
      CacheControl: params.cacheControl ?? 'public, max-age=31536000, immutable',
    }),
  );
}

export type FetchedObject = {
  body: Uint8Array;
  contentType?: string;
  contentLength: number;
  etag?: string;
};

export async function getObject(key: string): Promise<FetchedObject | null> {
  const res = await s3().send(new GetObjectCommand({ Bucket: s3Bucket, Key: key }));
  if (!res.Body) return null;
  const body = await res.Body.transformToByteArray();
  return {
    body,
    contentType: res.ContentType,
    contentLength: body.byteLength,
    etag: res.ETag ?? undefined,
  };
}

export async function deleteObject(key: string): Promise<void> {
  await s3().send(new DeleteObjectCommand({ Bucket: s3Bucket, Key: key }));
}
