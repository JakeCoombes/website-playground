const requiredFields = ["name", "email"];

function readBody(req) {
  if (req.body && typeof req.body === "object") {
    return Promise.resolve(req.body);
  }

  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });

    req.on("error", reject);
  });
}

function formatInquiryText(inquiry) {
  return [
    `New Le Clos Marie-Louise inquiry from ${inquiry.name}`,
    `Email: ${inquiry.email}`,
    `Phone: ${inquiry.phone || "Not provided"}`,
    `Role: ${inquiry.role || "Not provided"}`,
    `Company: ${inquiry.company || "Not provided"}`,
    `Location: ${inquiry.location || "Not provided"}`,
    `Event: ${inquiry.eventType || "Not provided"}`,
    `Guests: ${inquiry.guestCount || "Not provided"}`,
    `Preferred date: ${inquiry.preferredDate || "Not provided"}`,
    `Message: ${inquiry.message || "Not provided"}`,
  ].join("\n");
}

async function sendEmail({ to, subject, html, replyTo }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.LILY_EMAIL_FROM;

  if (!apiKey || !from) {
    throw new Error("Missing Resend configuration");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      html,
      reply_to: replyTo,
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Resend failed: ${message}`);
  }
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatLinesHtml(lines) {
  return lines.map((line) => `<p>${escapeHtml(line)}</p>`).join("");
}

function buildLilyEmailHtml(inquiry) {
  return `
    <div style="font-family: Georgia, serif; color: #2F2D28; line-height: 1.6;">
      <h1 style="font-size: 24px;">New Le Clos Marie-Louise Inquiry</h1>
      ${formatLinesHtml([
        `Name: ${inquiry.name}`,
        `Email: ${inquiry.email}`,
        `Phone: ${inquiry.phone || "Not provided"}`,
        `Role: ${inquiry.role || "Not provided"}`,
        `Company: ${inquiry.company || "Not provided"}`,
        `Location: ${inquiry.location || "Not provided"}`,
        `Event type: ${inquiry.eventType || "Not provided"}`,
        `Guest count: ${inquiry.guestCount || "Not provided"}`,
        `Preferred date: ${inquiry.preferredDate || "Not provided"}`,
      ])}
      <h2 style="font-size: 18px;">Message</h2>
      <p>${escapeHtml(inquiry.message || "Not provided")}</p>
    </div>
  `;
}

function buildConfirmationEmailHtml(inquiry) {
  const greeting = inquiry.language === "fr" ? "Bonjour" : "Hi";
  const thanks =
    inquiry.language === "fr"
      ? "Merci pour votre demande. Lily a bien recu les details et reviendra vers vous avec les prochaines etapes."
      : "Thank you for your inquiry. Lily has received the details and will follow up with next steps.";

  return `
    <div style="font-family: Georgia, serif; color: #2F2D28; line-height: 1.6;">
      <h1 style="font-size: 24px;">Le Clos Marie-Louise</h1>
      <p>${greeting} ${escapeHtml(inquiry.name)},</p>
      <p>${thanks}</p>
      ${formatLinesHtml([
        `Event type: ${inquiry.eventType || "Not provided"}`,
        `Guest count: ${inquiry.guestCount || "Not provided"}`,
        `Preferred date: ${inquiry.preferredDate || "Not provided"}`,
      ])}
      <p style="margin-top: 24px;">Lily Dupuis</p>
    </div>
  `;
}

async function sendText(message) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  const to = process.env.LILY_SMS_TO;

  if (!accountSid || !authToken || !from || !to) {
    return;
  }

  const body = new URLSearchParams({
    From: from,
    To: to,
    Body: message,
  });

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${accountSid}:${authToken}`
        ).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    }
  );

  if (!response.ok) {
    const responseBody = await response.text();
    throw new Error(`Twilio failed: ${responseBody}`);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const inquiry = await readBody(req);
    const missingField = requiredFields.find(
      (field) => !String(inquiry[field] || "").trim()
    );

    if (missingField) {
      return res.status(400).json({ error: `${missingField} is required` });
    }

    const inquiryText = formatInquiryText(inquiry);
    const lilyEmail = process.env.LILY_EMAIL_TO;

    if (!lilyEmail) {
      throw new Error("Missing Lily email recipient");
    }

    await sendEmail({
      to: lilyEmail,
      subject: `New inquiry from ${inquiry.name}`,
      html: buildLilyEmailHtml(inquiry),
      replyTo: inquiry.email,
    });

    const followUpResults = await Promise.allSettled([
      sendEmail({
        to: inquiry.email,
        subject: "We received your Le Clos Marie-Louise inquiry",
        html: buildConfirmationEmailHtml(inquiry),
        replyTo: lilyEmail,
      }),
      sendText(inquiryText),
    ]);

    followUpResults.forEach((result) => {
      if (result.status === "rejected") {
        console.error(result.reason);
      }
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Inquiry could not be sent" });
  }
}
