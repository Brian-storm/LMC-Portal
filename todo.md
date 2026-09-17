# TODO

## Features
- [ ] Continuous Updates on courses
- [ ] Payment flow - AWS Lambda function 
- [ ] Auto receipt generation
- [ ] Chatbot — deterministic FAQ QnA first, AI (Microsoft) later
- [ ] Email notifications
- [ ] Student portal — simple membership record in DB for now (full portal next version)

## Frontend

### Theme & Branding

### Pages
- [ ] **About**: clean, concise intro (我們是誰、我們的服務、我們的課程；傳承、健康、保險 / 家族辦公室)

### Enrollment Flow
- [ ] Payment — Automatic Payment Flow -> Wait for Confirmation -> Generate Receipt -> Confirmation Email + Receipt
- [ ] Human Approval is very important
- [ ] Ask about how would they want the payment

## Backend

### Stack
- AWS S3: 1 public bucket (logos/posters), 1 private bucket (receipts/payment proofs)
- SES email templates (HTML receipt/certificate emails)
- Docker containerization
- Cloudflare DNS + SSL (I want to know why and how)

### Functions
- [ ] Auth — cookie/session, login redirect to `[locale]/login`
- [ ] Enroll — frontend input validation, backend validation, DB checks
- [ ] Dashboard — fetch user data by session

## Database Design

| Table | Key Fields |
|---|---|
| **User** | userId, role, isMember, memberId, name(zh/en), idNumber, iaLicense, org, phone, email, timestamps |
| **Organization** | organizationId, name, contact info, mailing address, FK userId |
| **Course** | courseId, slug, name(zh/en), description(zh/en), cpdHours, price, capacity, instructor, syllabus, registrationStatus, schedule, venue |
| **Registrant** | registrantId, FK courseId/userId, enrollmentType, groupId, paymentStatus, isThirdPartyPay, payerName, paymentProofUrl, receiptNumber, submittedAt |
| **Instructor** | instructorId, name(zh/en), bio(zh/en), avatarUrl |
| **Admin** | adminId, FK userId, permissions (SUPER_ADMIN/AUDITOR), lastLoginAt |

## Content Needed

### Resources
- Registration form: https://docs.google.com/forms/d/e/1FAIpQLSdIjWIgyBAGRa5gOPfpkMstcW3RhM8QQeB8vtaIOQiTNkReVg/formResponse

### Assets
- Payment QR codes (FPS / bank transfer)
- Company seal/signature (transparent PNG for PDF receipts)

### Text (ZH + EN)
- Store all content in all three locales (en, zh-hk, zh-cn)
- Privacy policy (符合 PCPO)
- FAQ (CPD hours, payment verification, group enrollment)
- About us (我們是誰、我們的服務、我們的課程)
- Course details (description, CPD hours, syllabus, schedule, venue, price)
- Instructor bios