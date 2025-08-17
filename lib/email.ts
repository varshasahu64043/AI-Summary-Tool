import nodemailer from "nodemailer"

if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.warn("Email configuration missing. Email sharing will not work.")
}

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number.parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export function generateSummaryEmailHTML(
  summaryTitle: string,
  summaryContent: string,
  senderName: string,
  customMessage?: string,
) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shared Summary: ${summaryTitle}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f9f9f9;
    }
    .container {
      background: white;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .title {
      color: #1f2937;
      font-size: 24px;
      font-weight: 600;
      margin: 0 0 10px 0;
    }
    .subtitle {
      color: #6b7280;
      font-size: 14px;
      margin: 0;
    }
    .custom-message {
      background: #f3f4f6;
      border-left: 4px solid #3b82f6;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .summary-content {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 20px;
      white-space: pre-wrap;
      font-family: 'SF Mono', Monaco, monospace;
      font-size: 14px;
      line-height: 1.5;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 12px;
      text-align: center;
    }
    .powered-by {
      color: #9ca3af;
      font-size: 11px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="title">${summaryTitle}</h1>
      <p class="subtitle">Shared by ${senderName} via AI Summary Tool</p>
    </div>
    
    ${
      customMessage
        ? `
    <div class="custom-message">
      <strong>Message from ${senderName}:</strong><br>
      ${customMessage}
    </div>
    `
        : ""
    }
    
    <div class="summary-content">${summaryContent}</div>
    
    <div class="footer">
      <p class="powered-by">Generated with AI Summary Tool</p>
    </div>
  </div>
</body>
</html>
  `
}

export function generateSummaryEmailText(
  summaryTitle: string,
  summaryContent: string,
  senderName: string,
  customMessage?: string,
) {
  return `
${summaryTitle}
Shared by ${senderName} via AI Summary Tool

${customMessage ? `Message from ${senderName}:\n${customMessage}\n\n` : ""}

Summary Content:
${summaryContent}

---
Generated with AI Summary Tool
  `.trim()
}
