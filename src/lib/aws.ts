import "server-only";

import { S3Client } from "@aws-sdk/client-s3";
import { SESClient } from "@aws-sdk/client-ses";

const region = process.env.APP_AWS_REGION ?? "ap-east-1";

const sesRegion = process.env.APP_SES_REGION ?? "ap-southeast-1";

// S3 client for direct SDK operations (GetObject, ListBuckets, etc.)
export const s3Client = new S3Client({ region });

// S3 client for generating presigned URLs — disables automatic CRC32
// checksums. The SDK adds checksum query params during presigning, but
// browser XHR uploads don't send matching headers, causing S3 403.
export const presignS3Client = new S3Client({
  region,
  requestChecksumCalculation: "WHEN_REQUIRED" as const,
});

export const sesClient = new SESClient({ region: sesRegion });

export const s3PublicBucket = process.env.APP_S3_PUBLIC_BUCKET ?? "";

export const s3PrivateBucket = process.env.APP_S3_PRIVATE_BUCKET ?? "";

export const sesFromAddress =
  process.env.APP_SES_FROM_ADDRESS ?? "";