import type { EmailRecipient, EmailCourseInfo, EmailReceiptInfo } from "./types";

// ── Build bilingual email content ───────────────────────────────────────────

/**
 * Builds the email subject and HTML body in bilingual (ZH + EN) format.
 * The recipient's name is shown in both Chinese and English.
 */
export function buildEmailContent(
  recipient: EmailRecipient,
  course: EmailCourseInfo,
  receipt: EmailReceiptInfo,
): { subject: string; html: string } {
  const subject = `Payment Receipt / 付款收据 – LMC Management Consultancy / 德智管理顾问有限公司 (${receipt.receiptNumber})`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, Helvetica, sans-serif; color: #333; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 24px; }
    .header { border-bottom: 2px solid #1b4332; padding-bottom: 12px; margin-bottom: 20px; }
    .header h1 { color: #1b4332; font-size: 18px; margin: 0; }
    .header p { color: #666; font-size: 12px; margin: 4px 0 0; }
    .greeting { font-size: 14px; margin-bottom: 16px; }
    .body-text { font-size: 13px; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    th { background: #1b4332; color: #fff; padding: 8px 12px; text-align: left; font-size: 12px; }
    td { padding: 8px 12px; border-bottom: 1px solid #eee; font-size: 13px; }
    .total { font-weight: 700; font-size: 14px; text-align: right; margin-top: 8px; }
    .footer { border-top: 1px solid #ccc; padding-top: 12px; margin-top: 24px; font-size: 11px; color: #999; }
    .zh { font-size: 12px; color: #555; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>LMC Management Consultancy Ltd.</h1>
      <p>Payment Receipt / 付款收据</p>
    </div>

    <p class="greeting"><strong>Dear / 尊敬的 ${recipient.nameEn} (${recipient.nameZh}),</strong></p>

    <p class="body-text">
      Thank you for your payment. Please find attached your official receipt for the following course:
    </p>
    <p class="body-text zh">
      感谢您的付款。现附上以下课程的正式收据：
    </p>

    <table>
      <tr>
        <th>Item / 项目</th>
        <th>Detail / 详情</th>
      </tr>
      <tr>
        <td>Course / 课程</td>
        <td>${course.nameEn}<br><span class="zh">${course.nameZh}</span></td>
      </tr>
      <tr>
        <td>Receipt No. / 收据编号</td>
        <td><strong>${receipt.receiptNumber}</strong></td>
      </tr>
      <tr>
        <td>Amount Paid / 缴费金额</td>
        <td><strong>HKD ${receipt.fee}</strong></td>
      </tr>
    </table>

    <p class="body-text">
      Should you have any questions, please contact our administrative team.
    </p>
    <p class="body-text zh">
      如有任何疑问，请联系我们的行政团队。
    </p>

    <p class="body-text">
      Best regards,<br>
      <strong>LMC Management Consultancy Ltd.</strong><br>
      德智管理顾问有限公司
    </p>

    <div class="footer">
      <p>This is a computer-generated email. No signature required.</p>
      <p>LMC Management Consultancy Ltd. | Unit 1011-15, 10/F., Tower B, New Mandarin Plaza, Tsim Sha Tsui East, Kowloon, Hong Kong</p>
    </div>
  </div>
</body>
</html>`;

  return { subject, html };
}