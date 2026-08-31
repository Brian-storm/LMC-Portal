# LMC Portal — Implementation Plan

## Current State

The frontend demo covers ~80% of Phase 1 UI with hardcoded mock data. All backend, database, auth, and cloud services are pending.

| Component | Status | Notes |
|---|---|---|
| Course catalog (`/[locale]/courses`) | Demo | 2 mock courses, inline data |
| Course detail (`/[locale]/courses/[slug]`) | Demo | Syllabus, instructors, reviews, FAQ, quota badges |
| Enrollment form (`/[locale]/courses/[slug]/enroll`) | Demo | 3-step wizard: info → declaration → payment |
| Checkout confirmation | Demo | Payment slip uploader, no real upload |
| Admin dashboard (`/[locale]/admin`) | Demo | KPI cards, audit table, mock approve/flag |
| Auth (`/[locale]/login`) | Demo | Page exists, no real login |
| Dashboard (`/[locale]/(portal)/dashboard`) | Stub | Skeleton pages, no data |
| API routes (`api/courses`, `api/checkout`) | Dummy | Return `{ message: "OK" }` |
| Database (RDS PostgreSQL) | None | No schema, no connection |
| S3 storage | None | No bucket, no upload route |
| SES email | None | No integration |
| PDF receipt generation | None | No dependency installed |

---

## Phase 1 — Production Launch

### 1. Database Layer

#### 1.1 Prisma Setup
- Install `prisma` and `@prisma/client`
- Run `npx prisma init` to create `prisma/schema.prisma`
- Configure PostgreSQL datasource pointing to AWS RDS `ap-east-1`

#### 1.2 Schema (from proposal Section 7 + todo.md)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  role      Role     @default(STUDENT)
  isMember  Boolean  @default(false)
  memberId  String?  @unique

  nameZh      String
  nameEn      String
  idDocNumber String
  iaLicense   String?
  organization String?
  phone       String
  email       String   @unique

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  registrants Registrant[]
  admin       Admin?
  organization Organization?

  @@map("users")
}

enum Role {
  STUDENT
  ADMIN
  INSTRUCTOR
}

model Organization {
  id              String   @id @default(cuid())
  name            String
  contactPhone    String
  contactEmail    String
  mailingAddress  String
  designatedUserId String  @unique
  designatedUser  User     @relation(fields: [designatedUserId], references: [id])

  @@map("organizations")
}

model Course {
  id          String   @id @default(cuid())
  slug        String   @unique
  nameZh      String
  nameEn      String
  descriptionZh String?
  descriptionEn String?
  category    String

  cpdHours    Int
  price       Decimal
  capacity    Int
  isOpen      Boolean  @default(true)
  registrationStatus RegistrationStatus @default(OPEN)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  instructors   CourseInstructor[]
  syllabusItems SyllabusItem[]
  schedules     Schedule[]
  reviews       Review[]
  faqs          Faq[]
  registrants   Registrant[]

  @@map("courses")
}

enum RegistrationStatus {
  OPEN
  FEW_SEATS
  FULL
  CLOSED
}

model Instructor {
  id        String   @id @default(cuid())
  nameZh    String
  nameEn    String
  titleZh   String?
  titleEn   String?
  bioZh     String?
  bioEn     String?
  avatarUrl String?

  courses   CourseInstructor[]

  @@map("instructors")
}

model CourseInstructor {
  courseId     String
  instructorId String
  course       Course     @relation(fields: [courseId], references: [id], onDelete: Cascade)
  instructor   Instructor @relation(fields: [instructorId], references: [id], onDelete: Cascade)

  @@id([courseId, instructorId])
  @@map("course_instructors")
}

model SyllabusItem {
  id           String @id @default(cuid())
  courseId     String
  moduleNumber Int
  titleZh      String
  titleEn      String
  duration     String
  topicsZh     String[]
  topicsEn     String[]
  sortOrder    Int    @default(0)

  course       Course @relation(fields: [courseId], references: [id], onDelete: Cascade)

  @@map("syllabus_items")
}

model Schedule {
  id              String   @id @default(cuid())
  courseId        String
  dateAndTime     String
  venue           String
  quotaRemaining  Int
  isActive        Boolean  @default(true)

  course          Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)

  @@map("schedules")
}

model Review {
  id          String   @id @default(cuid())
  courseId    String
  authorName  String
  authorRole  String?
  rating      Int
  comment     String
  date        DateTime

  course      Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)

  @@map("reviews")
}

model Faq {
  id        String @id @default(cuid())
  courseId  String
  questionZh String
  questionEn String
  answerZh  String
  answerEn  String
  sortOrder Int    @default(0)

  course    Course @relation(fields: [courseId], references: [id], onDelete: Cascade)

  @@map("faqs")
}

model Registrant {
  id              String   @id @default(cuid())
  courseId        String
  userId          String
  enrollmentType  EnrollmentType
  groupId         String?
  paymentStatus   PaymentStatus @default(PENDING_VERIFICATION)
  paymentMethod   PaymentMethod?
  isThirdPartyPay Boolean  @default(false)
  payerFullName   String?
  paymentProofUrl String?
  receiptNumber   String?
  submittedAt     DateTime @default(now())

  course          Course   @relation(fields: [courseId], references: [id])
  user            User     @relation(fields: [userId], references: [id])

  @@map("registrants")
}

enum EnrollmentType {
  INDIVIDUAL
  ORGANIZATION
}

enum PaymentStatus {
  PENDING_VERIFICATION
  VERIFIED
  REJECTED
  REFUNDED
}

enum PaymentMethod {
  FPS
  ALIPAY
  E_BANKING
  CHEQUE
  CASH
  CORPORATE_INVOICE
}

model Admin {
  id          String   @id @default(cuid())
  userId      String   @unique
  permissions AdminPermission @default(AUDITOR)
  lastLoginAt DateTime?

  user        User     @relation(fields: [userId], references: [id])

  @@map("admins")
}

enum AdminPermission {
  SUPER_ADMIN
  AUDITOR
}
```

#### 1.3 Prisma Client Singleton

Create `src/lib/prisma.ts`:
```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

#### 1.4 Database URL

Add to `.env`:
```
DATABASE_URL=postgresql://user:password@host:5432/lmc_cpd
```

---

### 2. Authentication

#### 2.1 Tech Choice
- **NextAuth.js v5 (Auth.js)** — works with Next.js 16, supports JWT sessions, email/password credentials, and OAuth.
- Store JWT in httpOnly cookie, verify with middleware.

#### 2.2 Install & Configure
```bash
npm install next-auth@beta @auth/prisma-adapter bcryptjs
npm install -D @types/bcryptjs
```

#### 2.3 Auth Configuration

Create `src/auth.ts`:
```ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // lookup user by email, compare bcrypt hash
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.role = user.role; token.userId = user.id; }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      session.user.id = token.userId;
      return session;
    },
  },
  pages: {
    signIn: "/en/login",
    // dynamic locale handled by middleware redirect
  },
});
```

#### 2.4 API Route

Create `src/app/api/auth/[...nextauth]/route.ts`:
```ts
import { handlers } from "@/auth";
export const { GET, POST } = handlers;
```

#### 2.5 Middleware

Update `src/middleware.ts` to protect routes:
```ts
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthed = !!req.auth;
  const isAdmin = req.auth?.user?.role === "ADMIN";

  if (pathname.includes("/admin") && !isAdmin) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (pathname.includes("/dashboard") && !isAuthed) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

#### 2.6 Registration Endpoint

Create `src/app/api/auth/register/route.ts`:
- Accept POST with `nameZh`, `nameEn`, `email`, `password`, `phone`, `idDocNumber`, `iaLicense` (optional), `organization` (optional)
- Hash password with bcrypt (10 rounds)
- Insert into `User` table via Prisma
- Return success (no auto-login — redirect to login page)

#### 2.7 Login Page

The `[locale]/login/page.tsx` exists but needs:
- Login form (email + password) using `signIn("credentials", ...)` from `next-auth/react`
- Client-side redirect on success (to `/dashboard` or previous page)
- Display server-side errors (invalid credentials, unverified)
- Link to registration
- Locale-aware (accept `locale` from params)

#### 2.8 Role Assignment

- First admin user: manually set `role: ADMIN` in database, or seed script
- Admin can promote users via the admin dashboard (future)
- Instructors assigned via `instructors` table + `CourseInstructor` join

---

### 3. API Layer — Migrate from Mock Data to Database

#### 3.1 Courses API (`src/app/api/courses/route.ts`)

Replace dummy handler with:

**GET** — fetch all active courses:
```ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const locale = searchParams.get("locale") || "en";
  const category = searchParams.get("category");

  const courses = await prisma.course.findMany({
    where: {
      isOpen: true,
      ...(category ? { category } : {}),
    },
    include: {
      schedules: { where: { isActive: true }, take: 1 },
      instructors: { include: { instructor: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ courses });
}
```

**POST** — create course (admin only):
```ts
export async function POST(req: NextRequest) {
  // verify admin session
  const body = await req.json();
  const course = await prisma.course.create({ data: { ...body } });
  return NextResponse.json({ course }, { status: 201 });
}
```

#### 3.2 Course Detail API (`src/app/api/courses/[slug]/route.ts`)

**GET** — single course with all relations:
- Include `instructors` (with nested `instructor`), `syllabusItems`, `schedules`, `reviews`, `faqs`
- Return 404 if not found

**PATCH** — update course (admin only)
**DELETE** — soft-delete (`isOpen: false`)

#### 3.3 Enrollment API (`src/app/api/enroll/route.ts`)

**POST** — submit enrollment:
```ts
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { courseId, paymentMethod, isThirdPartyPay, payerFullName, enrollmentType, groupRegistrants } = body;

  // 1. Validate course exists and is open
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || course.registrationStatus === "CLOSED" || course.registrationStatus === "FULL") {
    return NextResponse.json({ error: "Course not available" }, { status: 400 });
  }

  // 2. Check capacity
  const enrolledCount = await prisma.registrant.count({
    where: { courseId, paymentStatus: { not: "REJECTED" } },
  });
  if (enrolledCount >= course.capacity) {
    return NextResponse.json({ error: "Course is full" }, { status: 409 });
  }

  // 3. Create registrant record
  const groupId = enrollmentType === "ORGANIZATION" ? `GRP-${Date.now()}` : undefined;
  const registrant = await prisma.registrant.create({
    data: {
      courseId,
      userId: session.user.id,
      enrollmentType,
      groupId,
      paymentMethod,
      isThirdPartyPay,
      payerFullName,
      paymentStatus: "PENDING_VERIFICATION",
    },
  });

  return NextResponse.json({ registrant }, { status: 201 });
}
```

#### 3.4 Payment Upload API (`src/app/api/upload-slip/route.ts`)

Replace the dummy endpoint referenced in `PaymentSlipUploader.tsx`:

```ts
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("slip") as File;
  const orderId = formData.get("orderId") as string; // this is the registrant ID

  if (!file || !orderId) {
    return NextResponse.json({ error: "Missing file or orderId" }, { status: 400 });
  }

  // Validate file type & size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const key = `payment-proofs/${orderId}/${Date.now()}-${file.name}`;

  await s3.send(new PutObjectCommand({
    Bucket: process.env.AWS_S3_PRIVATE_BUCKET!,
    Key: key,
    Body: buffer,
    ContentType: file.type,
    ServerSideEncryption: "AES256",
  }));

  const url = `s3://${process.env.AWS_S3_PRIVATE_BUCKET}/${key}`;

  await prisma.registrant.update({
    where: { id: orderId },
    data: { paymentProofUrl: url },
  });

  return NextResponse.json({ success: true, key });
}
```

#### 3.5 Admin Enrolments API (`src/app/api/admin/enrolments/route.ts`)

**GET** — list pending enrolments:
```ts
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const enrolments = await prisma.registrant.findMany({
    where: { paymentStatus: "PENDING_VERIFICATION" },
    include: {
      user: { select: { nameEn: true, nameZh: true, email: true, iaLicense: true, organization: true } },
      course: { select: { nameEn: true, nameZh: true, slug: true, cpdHours: true } },
    },
    orderBy: { submittedAt: "desc" },
  });

  return NextResponse.json({ enrolments });
}
```

**PATCH** — update enrolment status:
```ts
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { registrantId, status } = await req.json();
  // status: "VERIFIED" | "REJECTED" | "REFUNDED"

  const registrant = await prisma.registrant.update({
    where: { id: registrantId },
    data: { paymentStatus: status },
    include: { user: true, course: true },
  });

  // If verified, trigger PDF receipt generation + SES email
  if (status === "VERIFIED") {
    // (see Section 5 below)
  }

  return NextResponse.json({ registrant });
}
```

---

### 4. Enrollment Page — Group Registration

The current `[locale]/courses/[slug]/enroll/page.tsx` only handles single-person enrollment. Upgrade it:

#### 4.1 Add Enrollment Type Switch
- Radio toggle at Step 1: "Individual" / "Organization"
- When Organization is selected, reveal a "Add Registrant" card system

#### 4.2 Multi-Registrant Form
- Each registrant gets a collapsible card with the same fields as individual (name, email, phone, IA license, org)
- "Add Another Registrant" button appends a new card
- "Remove" button per card (minimum 1)
- Running total: `HK$ 1,200 x N registrants = HK$ total`

#### 4.3 State Management
```ts
type RegistrantEntry = {
  id: string;       // temp client-side UUID
  fullName: string;
  email: string;
  phone: string;
  company: string;
  iaLicenseNo: string;
};

const [enrollmentType, setEnrollmentType] = useState<"INDIVIDUAL" | "ORGANIZATION">("INDIVIDUAL");
const [registrants, setRegistrants] = useState<RegistrantEntry[]>([emptyRegistrant()]);
```

#### 4.4 Submission Flow
```ts
async function handleSubmit() {
  // Step 1: Create enrollment records via POST /api/enroll
  const groupId = `GRP-${Date.now()}`;
  for (const reg of registrants) {
    await fetch("/api/enroll", {
      method: "POST",
      body: JSON.stringify({
        courseId: slug,
        paymentMethod: formData.paymentMethod,
        enrollmentType,
        groupId: enrollmentType === "ORGANIZATION" ? groupId : undefined,
        // ... reg fields
      }),
    });
  }

  // Step 2: Redirect to confirmation/payment upload
  router.push(`/${locale}/checkout/confirmation?groupId=${groupId}`);
}
```

---

### 5. PDF Receipt Engine

#### 5.1 Install Dependency
```bash
npm install @react-pdf/renderer
```

#### 5.2 Receipt Template

Create `src/lib/pdf/receipt-template.tsx`:
```tsx
import { Document, Page, Text, View, StyleSheet, Image, Font } from "@react-pdf/renderer";

Font.register({
  family: "NotoSansHK",
  fonts: [
    { src: "/fonts/NotoSansHK-Regular.ttf" },
    { src: "/fonts/NotoSansHK-Bold.ttf", fontWeight: "bold" },
  ],
});

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "NotoSansHK", fontSize: 10 },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  title: { fontSize: 18, fontWeight: "bold", color: "#1b4332" },
  section: { marginBottom: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  divider: { borderBottom: "1px solid #ccc", marginVertical: 8 },
  seal: { position: "absolute", right: 30, top: 200, opacity: 0.15, width: 150 },
});

export function ReceiptDocument({ data }: { data: ReceiptData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>LMC Management Consultancy Ltd.</Text>
            <Text>Official Payment Receipt</Text>
          </View>
          <View>
            <Text>Receipt No: {data.receiptNumber}</Text>
            <Text>Date: {data.issueDate}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={{ fontWeight: "bold", marginBottom: 6 }}>Student Details</Text>
          <View style={styles.row}>
            <Text>Name (EN):</Text><Text>{data.studentNameEn}</Text>
          </View>
          <View style={styles.row}>
            <Text>Name (ZH):</Text><Text>{data.studentNameZh}</Text>
          </View>
          <View style={styles.row}>
            <Text>Email:</Text><Text>{data.studentEmail}</Text>
          </View>
          <View style={styles.row}>
            <Text>IA License:</Text><Text>{data.iaLicense || "—"}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={{ fontWeight: "bold", marginBottom: 6 }}>Course Details</Text>
          <View style={styles.row}>
            <Text>Course:</Text><Text>{data.courseName}</Text>
          </View>
          <View style={styles.row}>
            <Text>Reference:</Text><Text>{data.iaRefNumber}</Text>
          </View>
          <View style={styles.row}>
            <Text>CPD Hours:</Text><Text>{data.cpdHours} Hours</Text>
          </View>
          <View style={styles.row}>
            <Text>Schedule:</Text><Text>{data.scheduleDate}</Text>
          </View>
          <View style={styles.row}>
            <Text>Venue:</Text><Text>{data.venue}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={[styles.row, { fontWeight: "bold", fontSize: 12 }]}>
          <Text>Total Amount Paid:</Text>
          <Text>HKD {data.amount.toLocaleString()}</Text>
        </View>

        {/* Anti-tamper seal watermark */}
        <Image src="/seal/stamp.png" style={styles.seal} />

        <View style={{ marginTop: 40, fontSize: 8, color: "#666" }}>
          <Text>This is a computer-generated receipt and does not require a physical signature.</Text>
          <Text>LMC Management Consultancy Ltd. | Unit 1011, Tower B, New Mandarin Plaza, Tsim Sha Tsui</Text>
        </View>
      </Page>
    </Document>
  );
}
```

#### 5.3 Receipt Generation Service

Create `src/lib/pdf/generate-receipt.ts`:
```ts
import { renderToBuffer } from "@react-pdf/renderer";
import { ReceiptDocument } from "./receipt-template";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export async function generateAndStoreReceipt(registrantId: string) {
  const registrant = await prisma.registrant.findUnique({
    where: { id: registrantId },
    include: { user: true, course: { include: { schedules: { take: 1 } } } },
  });
  if (!registrant) throw new Error("Registrant not found");

  const receiptNumber = `LMC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`;
  const data = {
    receiptNumber,
    issueDate: new Date().toISOString().split("T")[0],
    studentNameEn: registrant.user.nameEn,
    studentNameZh: registrant.user.nameZh,
    studentEmail: registrant.user.email,
    iaLicense: registrant.user.iaLicense,
    courseName: registrant.course.nameEn,
    iaRefNumber: "REF-cpd-101", // should come from course model
    cpdHours: registrant.course.cpdHours,
    scheduleDate: registrant.course.schedules[0]?.dateAndTime || "TBC",
    venue: registrant.course.schedules[0]?.venue || "TBC",
    amount: Number(registrant.course.price),
  };

  const pdfBuffer = await renderToBuffer(ReceiptDocument({ data }));

  const key = `receipts/${receiptNumber}.pdf`;
  const s3 = new S3Client({ /* config */ });
  await s3.send(new PutObjectCommand({
    Bucket: process.env.AWS_S3_PRIVATE_BUCKET!,
    Key: key,
    Body: pdfBuffer,
    ContentType: "application/pdf",
    ServerSideEncryption: "AES256",
  }));

  // Update registrant with receipt number
  await prisma.registrant.update({
    where: { id: registrantId },
    data: { receiptNumber },
  });

  return { receiptNumber, s3Key: key, pdfBuffer };
}
```

#### 5.4 Password-Protect PDF (Anti-Tamper)

Use `qpdf` or `pdf-lib` to add owner password restrictions:
```bash
npm install pdf-lib
```
```ts
import { PDFDocument } from "pdf-lib";

async function lockPdf(pdfBuffer: Buffer, password: string): Promise<Buffer> {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  pdfDoc.setTitle("LMC Official Receipt");
  pdfDoc.setAuthor("LMC Management Consultancy Ltd.");
  // Restrict permissions
  const encryptedBytes = await pdfDoc.save({
    ownerPassword: password,
    permissions: {
      printing: "lowResolution",
      modifying: false,
      copying: false,
      annotating: false,
      fillingForms: false,
      contentAccessibility: true,
      documentAssembly: false,
    },
  });
  return Buffer.from(encryptedBytes);
}
```

---

### 6. Email Integration — Amazon SES

#### 6.1 Install AWS SDK
```bash
npm install @aws-sdk/client-ses
```

#### 6.2 Email Service

Create `src/lib/email/send-receipt.ts`:
```ts
import { SESClient, SendRawEmailCommand } from "@aws-sdk/client-ses";
import nodemailer from "nodemailer";
// SES via nodemailer for HTML + attachment support

const ses = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const transporter = nodemailer.createTransport({
  SES: { ses, aws: { SendRawEmailCommand } },
});

interface ReceiptEmailParams {
  to: string;
  studentName: string;
  courseName: string;
  receiptNumber: string;
  pdfBuffer: Buffer;
  locale: "en" | "zh-hk" | "zh-cn";
}

export async function sendReceiptEmail(params: ReceiptEmailParams) {
  const subject = params.locale === "zh-hk"
    ? `LMC 官方電子收據 — ${params.receiptNumber}`
    : `LMC Official Receipt — ${params.receiptNumber}`;

  await transporter.sendMail({
    from: process.env.AWS_SES_FROM_ADDRESS,
    to: params.to,
    subject,
    html: receiptEmailTemplate(params),
    attachments: [{
      filename: `Receipt-${params.receiptNumber}.pdf`,
      content: params.pdfBuffer,
      contentType: "application/pdf",
    }],
  });
}
```

#### 6.3 Email Templates

Create `src/lib/email/templates/receipt-email.ts` with bilingual (ZH + EN) HTML template including:
- LMC logo header
- Student name, course name, receipt number
- "Your payment has been verified" message
- PDF receipt attached
- Footer with contact info (phone, email, address)
- Locale parameter to switch zh/en content

#### 6.4 Integration Point

Wire into the admin `PATCH /api/admin/enrolments` route:
```ts
if (status === "VERIFIED") {
  const { receiptNumber, pdfBuffer } = await generateAndStoreReceipt(registrantId);
  await sendReceiptEmail({
    to: registrant.user.email,
    studentName: registrant.user.nameEn,
    courseName: registrant.course.nameEn,
    receiptNumber,
    pdfBuffer,
    locale: "en", // or from user preference
  });
}
```

---

### 7. Admin Dashboard — Connect to Real Data

#### 7.1 Replace Mock Metrics
```ts
async function getAdminMetrics() {
  const [totalEnrolments, pendingCount, activeCourses] = await Promise.all([
    prisma.registrant.count({
      where: { submittedAt: { gte: startOfMonth } },
    }),
    prisma.registrant.count({
      where: { paymentStatus: "PENDING_VERIFICATION" },
    }),
    prisma.course.count({ where: { isOpen: true } }),
  ]);
  return { totalEnrolments, pendingCount, activeCourses };
}
```

#### 7.2 Replace Mock Enrolment List
```ts
const enrolments = await prisma.registrant.findMany({
  where: { paymentStatus: { not: "VERIFIED" } },
  include: {
    user: { select: { nameEn: true, nameZh: true, iaLicense: true, organization: true } },
    course: { select: { nameEn: true, nameZh: true, cpdHours: true, id: true } },
  },
  orderBy: { submittedAt: "desc" },
});
```

#### 7.3 Payment Proof Preview
- Click on a pending enrolment row → open modal showing the uploaded payment proof image
- Fetch via presigned URL from S3 (generate on-demand, expires in 5 min)
- Approve / Reject buttons in modal

#### 7.4 Admin Course Management

Create `src/app/[locale]/admin/courses/page.tsx`:
- Table of all courses with status toggles
- "New Course" button → form modal or separate page
- Course editor with all fields (name Zh/En, description, CPD hours, price, capacity, schedules, instructors, syllabus items, FAQs)
- Delete (soft-delete, set `isOpen: false`)

---

### 8. Content Fill

#### 8.1 Course Data
Populate real courses based on the Google Form (`https://docs.google.com/forms/d/e/1FAIpQLSdIjWIgyBAGRa5gOPfpkMstcW3RhM8QQeB8vtaIOQiTNkReVg/formResponse`). Extract from that form:
- Course titles (ZH + EN)
- Descriptions
- CPD hour allocations
- IA reference codes
- Prices (individual / group)
- Instructor names and bios

Seed via a `prisma/seed.ts` script:
```ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Instructors
  const cyrus = await prisma.instructor.create({ data: { ... } });
  const wilson = await prisma.instructor.create({ data: { ... } });

  // Courses with nested creates
  await prisma.course.create({
    data: {
      slug: "cpd-101",
      nameZh: "傳承規劃證書課程",
      nameEn: "Certificate in Legacy Planning",
      // ...
      instructors: { create: { instructorId: cyrus.id } },
      syllabusItems: { create: [ ... ] },
      schedules: { create: [ ... ] },
      faqs: { create: [ ... ] },
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
```

Run: `npx prisma db seed`

#### 8.2 Static Pages
- `terms/page.tsx` — legal text in all three locales (registration terms, refund, cancellation policy)
- `privacy/page.tsx` — privacy policy compliant with HK PCPO
- `about/page.tsx` — company intro (我們是誰、我們的服務、我們的課程)
- All using `dict` pattern for locale content

#### 8.3 Contact Page
Create `src/app/[locale]/contact/page.tsx`:
- Map embed (Google Maps iframe for Tsim Sha Tsui office)
- Phone hotline
- Email addresses (general + admin)
- WhatsApp link

---

### 9. AWS Infrastructure

#### 9.1 S3 Buckets
```
lmc-cpd-public-ap-east-1   — logos, posters, course images (public read)
lmc-cpd-private-ap-east-1  — payment proofs, receipts, certificates (private)
```

CORS config for public bucket:
```json
{
  "CORSRules": [{
    "AllowedOrigins": ["https://lmc-cpd.example.com"],
    "AllowedMethods": ["GET"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }]
}
```

#### 9.2 RDS PostgreSQL
- Instance: `db.t4g.micro` (Free Tier eligible, ~HK$150/mo)
- Subnet group in `ap-east-1` with VPC security group allowing inbound from Amplify IP range
- Automated daily backups with 7-day retention
- Parameter group: set `timezone` to `Asia/Hong_Kong`

#### 9.3 SES
- Verify domain (`lmc-cpd.example.com`) in SES
- Verify sending email address
- Move out of sandbox (request production access)
- DKIM + SPF records in DNS

#### 9.4 Amplify Hosting
- Connect GitHub repo
- Build settings: `npm run build`, output: `.next`
- Environment variables set in Amplify console (DATABASE_URL, AWS keys, SES from address)
- Custom domain + SSL via Amplify (or CloudFront + Route 53)

#### 9.5 Environment Variables Summary

| Variable | Purpose | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/lmc_cpd` |
| `AUTH_SECRET` | NextAuth.js JWT encryption key | `openssl rand -base64 32` |
| `AWS_ACCESS_KEY_ID` | S3 & SES access | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | S3 & SES secret | — |
| `AWS_REGION` | AWS region | `ap-east-1` |
| `AWS_S3_PUBLIC_BUCKET` | Public assets bucket name | `lmc-cpd-public-ap-east-1` |
| `AWS_S3_PRIVATE_BUCKET` | Private data bucket name | `lmc-cpd-private-ap-east-1` |
| `AWS_SES_FROM_ADDRESS` | Sender email | `noreply@lmc-cpd.example.com` |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL | `https://lmc-cpd.example.com` |

---

### 10. Post-Launch Quality

#### 10.1 Validation
- Zod schemas for all API input validation (`api/enroll`, `api/auth/register`, `api/admin/enrolments`)
- Server-side validation matches Prisma constraints
- Rate limiting on login (3 attempts per email per 15 min) — use `upstash/ratelimit` or in-memory

#### 10.2 Error Handling
- Global error boundary (`src/app/error.tsx` already exists)
- API error responses always return `{ error: string }` with correct HTTP status codes
- Client-side toast/alert for failed submissions

#### 10.3 Security
- CSP headers via `next.config.ts`
- All S3 objects encrypted at rest (AES256)
- PDF receipts password-protected
- PII fields in DB logged via Prisma middleware (mask in dev logs)
- CSRF protection via NextAuth.js built-in

#### 10.4 Monitoring
- Vercel Analytics (`@vercel/analytics`) already installed
- Vercel Speed Insights (`@vercel/speed-insights`) already installed
- Optional: Sentry for error tracking

---

### 11. Phase 2 — Post-Launch Features (Future)

| Feature | Description | Dependencies |
|---|---|---|
| **Student dashboard** | Enrolment history, receipt download, certificate access | Auth + DB |
| **Instructor dashboard** | Class roster, upload materials | Auth + DB |
| **Online payment** | Stripe / PayPal integration for credit card, Alipay | Phase 1 complete |
| **Recorded video** | CloudFront signed URLs for course replays | S3 + CloudFront |
| **Auto certificates** | PDF certificate with anti-forgery ID on course completion | PDF engine + SES |
| **Chatbot** | Deterministic FAQ first, then AI (Microsoft Foundry) | Dedicated service |
| **Email digests** | Newsletter, course announcements, renewal reminders | SES |
| **Promo codes** | Discount code system with usage tracking | DB + checkout |

---

### 12. Implementation Order (Recommended)

```
Week 1: Database
  ├── Prisma setup + schema → RDS connection
  ├── Seed script with real course data
  └── Prisma client singleton in lib/

Week 2: Auth
  ├── NextAuth.js configuration
  ├── Login page → real auth
  ├── Registration endpoint
  ├── Middleware route protection
  └── Role seeding (admin user)

Week 3: Core APIs
  ├── Courses API (read from DB)
  ├── Course detail API (with relations)
  ├── Enrollment API (create registrant)
  ├── Course page → fetch from API instead of hardcoded
  └── Course detail page → fetch from API

Week 4: Payment & Admin
  ├── S3 file upload route
  ├── Payment slip uploader → real S3
  ├── Admin dashboard → real DB queries
  ├── Admin approve/reject → DB update
  ├── PDF receipt generation
  └── SES email delivery

Week 5: Polish & Content
  ├── Group enrollment (multi-registrant form)
  ├── Terms, privacy, about pages content
  ├── Contact page
  ├── All locale dictionary entries
  ├── Zod validation on all inputs
  ├── Error handling pass
  └── Security review + CSP headers
```

---

### 13. File Manifest (New Files to Create)

```
src/
  auth.ts                              # NextAuth.js config
  lib/
    prisma.ts                          # Prisma client singleton
    pdf/
      receipt-template.tsx             # @react-pdf/renderer template
      generate-receipt.ts              # PDF generation + S3 storage
    email/
      send-receipt.ts                  # SES + nodemailer transport
      templates/
        receipt-email.ts               # Bilingual HTML email template
    validation/
      enroll.ts                        # Zod schema for enrollment
      register.ts                      # Zod schema for registration
      admin.ts                         # Zod schema for admin actions
  app/
    api/
      auth/
        [...nextauth]/
          route.ts                     # NextAuth API handler
        register/
          route.ts                     # Registration endpoint
      courses/
        [slug]/
          route.ts                     # Single course CRUD
      enroll/
        route.ts                       # Enrollment submission
      upload-slip/
        route.ts                       # S3 payment proof upload
      admin/
        enrolments/
          route.ts                     # Admin enrolments GET + PATCH
    [locale]/
      contact/
        page.tsx                       # Contact page
      admin/
        courses/
          new/
            page.tsx                   # Create course form
          [courseId]/
            edit/
              page.tsx                 # Edit course form
prisma/
  schema.prisma                        # Database schema
  seed.ts                              # Seed script
  migrations/                          # Auto-generated
```

---

### 14. Key Dependencies to Install

```bash
# Auth
npm install next-auth@beta @auth/prisma-adapter bcryptjs
npm install -D @types/bcryptjs

# Database
npm install prisma @prisma/client

# AWS SDK
npm install @aws-sdk/client-s3 @aws-sdk/client-ses

# PDF
npm install @react-pdf/renderer pdf-lib

# Email
npm install nodemailer

# Validation
npm install zod
```