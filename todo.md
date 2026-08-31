# TODO

## Features

- [ ] Payment flow — bank transfer with example payment slip, manual verification, auto receipt generation
- [ ] Chatbot — deterministic FAQ QnA first, AI (Microsoft) later
- [ ] Student portal — simple membership record in DB for now (full portal next version)
- [ ] Course enrollment — individual vs organization registration switch
- [ ] Email notifications (blocked by backend)
- [ ] Cookie consent persistence
- [ ] Contact page (map, phone, email, WhatsApp)
- [ ] Newsletter subscriptions
- [ ] Default interface in Chinese

## Frontend

### Theme & Branding
- [ ] Lighter theme with more colors
- [ ] Replace logo-text-white with logo-text-black, remove logo background
- [ ] New logo asset
- [ ] Professional carousel images (replace dark/modern ones)
- [ ] Affected pages: terms, privacy, courses

### Pages
- [ ] **About**: clean, concise intro (我們是誰、我們的服務、我們的課程；傳承、健康、保險 / 家族辦公室)
- [ ] **Contact**: map, phone, email, WhatsApp
- [ ] **Courses**: larger text, add images, fix theme
- [ ] **Course/[slug]**: remove review section, add syllabus/poster download
- [ ] **Course/[slug]/enroll**: individual/org switch, terms link, account creation prompt

### Enrollment Flow
1. Individual — link to terms, suggest account creation
2. Organization — individual card per registrant
3. Payment — bank transfer with example screenshot
4. Admin review — confirm payment, generate locked PDF receipt, auto-send

## Backend

### Stack
- AWS S3: 1 public bucket (logos/posters), 1 private bucket (receipts/payment proofs)
- SES email templates (HTML receipt/certificate emails)
- Python backend
- Docker containerization
- Cloudflare DNS + SSL

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
- New logo (transparent PNG/SVG)
- Instructor photos (1:1 square)
- Course posters/banners (16:9)
- Payment QR codes (FPS / bank transfer)
- Company seal/signature (transparent PNG for PDF receipts)

### Text (ZH + EN)
- Store all content in all three locales (en, zh-hk, zh-cn)
- Terms and conditions (報名須知、退款及改期條款)
- Privacy policy (符合 PCPO)
- FAQ (CPD hours, payment verification, group enrollment)
- About us (我們是誰、我們的服務、我們的課程)
- Course details (description, CPD hours, syllabus, schedule, venue, price)
- Instructor bios