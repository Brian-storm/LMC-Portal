import "server-only";

import { S3Client } from "@aws-sdk/client-s3";
import { SESClient } from "@aws-sdk/client-ses";

/**
 * AWS SDK client configuration for S3 and SES.
 *
 * Authentication relies on the IAM service role attached to the Amplify
 * app (Amplify Console > App Settings > IAM roles). No hardcoded
 * access keys are needed — the SDK resolves credentials automatically
 * from the environment (IMDS / ECS / env vars) at runtime.
 */

// Primary region for S3 and general AWS operations (ap-east-1)
const region = process.env.APP_AWS_REGION ?? "ap-east-1";

// SES region (ap-southeast-1 — Singapore, since Hong Kong has no SES)
const sesRegion = process.env.APP_SES_REGION ?? "ap-southeast-1";

export const s3Client = new S3Client({ region });

export const sesClient = new SESClient({ region: sesRegion });

export const s3PublicBucket = process.env.APP_S3_PUBLIC_BUCKET ?? "";

export const s3PrivateBucket = process.env.APP_S3_PRIVATE_BUCKET ?? "";

export const sesFromAddress =
  process.env.APP_SES_FROM_ADDRESS ?? "";