const requiredFields = [
  "ownerName",
  "ownerEmail",
  "ownerPhone",
  "petName",
  "petType",
  "startDate",
  "endDate",
  "depositAmount",
  "paymentMethod",
];

const allowedStatuses = [
  "Pending Deposit",
  "Deposit Received",
  "Confirmed",
  "Completed",
  "Cancelled",
];

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

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDateRange(booking) {
  return `${booking.startDate || "TBD"} to ${booking.endDate || "TBD"}`;
}

function getPaymentInstructions(booking) {
  const businessName = process.env.PET_BOARDING_PAYMENT_NAME || "Maison Paw";
  const zelle = process.env.PET_BOARDING_ZELLE || "zelle@example.com";
  const venmo = process.env.PET_BOARDING_VENMO || "@maisonpaw";
  const cashApp = process.env.PET_BOARDING_CASH_APP || "$maisonpaw";
  const applePay =
    process.env.PET_BOARDING_APPLE_PAY || "(323) 555-0147";

  return [
    `Deposit due: $${booking.depositAmount}`,
    `Preferred method: ${booking.paymentMethod}`,
    `Zelle: ${zelle}`,
    `Venmo: ${venmo}`,
    `Cash App: ${cashApp}`,
    `Apple Pay: ${applePay}`,
    `Memo: ${booking.petName} - ${formatDateRange(booking)}`,
    `Payee: ${businessName}`,
  ];
}

function lineItemsHtml(lines) {
  return lines
    .map(
      (line) =>
        `<p style="margin: 0 0 8px 0;">${escapeHtml(line)}</p>`
    )
    .join("");
}

function buildClientEmailHtml(booking) {
  return `
    <div style="font-family: Inter, Arial, sans-serif; color: #2d2923; line-height: 1.6;">
      <h1 style="font-family: Georgia, serif; font-size: 28px; margin-bottom: 8px;">Maison Paw booking request received</h1>
      <p>Hi ${escapeHtml(booking.ownerName)},</p>
      <p>We received your boarding request for ${escapeHtml(
        booking.petName
      )}. Your booking status is <strong>Pending Deposit</strong>.</p>
      <div style="background: #f7f1e8; border-radius: 18px; padding: 18px; margin: 20px 0;">
        ${lineItemsHtml([
          `Dates: ${formatDateRange(booking)}`,
          `Services: ${(booking.services || []).join(", ") || "Not provided"}`,
          `Estimated total: $${booking.subtotal}`,
          `Required deposit: $${booking.depositAmount}`,
          `Status: Pending Deposit`,
        ])}
      </div>
      <h2 style="font-size: 18px;">Manual deposit instructions</h2>
      <div style="background: #2d2923; color: #ffffff; border-radius: 18px; padding: 18px;">
        ${lineItemsHtml(getPaymentInstructions(booking))}
      </div>
      <p>Once your deposit is received, our team will manually update your booking to Deposit Received or Confirmed.</p>
    </div>
  `;
}

function buildAdminEmailHtml(booking, bookingId) {
  return `
    <div style="font-family: Inter, Arial, sans-serif; color: #2d2923; line-height: 1.6;">
      <h1 style="font-family: Georgia, serif; font-size: 28px;">New pet boarding request</h1>
      <p><strong>Status:</strong> Pending Deposit</p>
      <p><strong>Booking ID:</strong> ${escapeHtml(bookingId || "Not available")}</p>
      <div style="background: #f7f1e8; border-radius: 18px; padding: 18px;">
        ${lineItemsHtml([
          `Owner: ${booking.ownerName}`,
          `Email: ${booking.ownerEmail}`,
          `Phone: ${booking.ownerPhone}`,
          `Pet: ${booking.petName} (${booking.petType})`,
          `Additional pets: ${
            (booking.extraPets || [])
              .map(
                (pet) =>
                  `${pet.name || "Unnamed"} (${pet.animalType || "Pet"}${
                    pet.breed ? `, ${pet.breed}` : ""
                  })`
              )
              .join("; ") || "None"
          }`,
          `Breed: ${booking.petBreed || "Not provided"}`,
          `Age: ${booking.petAge || "Not provided"}`,
          `Weight: ${booking.petWeight || "Not provided"}`,
          `Temperament: ${booking.petTemperament || "Not provided"}`,
          `Dates: ${formatDateRange(booking)}`,
          `Services: ${(booking.services || []).join(", ") || "Not provided"}`,
          `Vaccination upload: ${booking.vaccinationFile || "Pending"}`,
          `Care notes: ${booking.careNotes || "Not provided"}`,
          `Emergency contact: ${booking.emergencyName || "Not provided"} ${
            booking.emergencyPhone || ""
          }`,
          `Subtotal: $${booking.subtotal}`,
          `Deposit: $${booking.depositAmount}`,
          `Payment method: ${booking.paymentMethod}`,
        ])}
      </div>
    </div>
  `;
}

async function sendEmail({ to, subject, html, replyTo }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.PET_BOARDING_EMAIL_FROM;

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

async function createSupabaseBooking(booking) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase server configuration");
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/pet_boarding_bookings`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      owner_name: booking.ownerName,
      owner_email: booking.ownerEmail,
      owner_phone: booking.ownerPhone,
      pet_name: booking.petName,
      pet_type: booking.petType,
      pet_breed: booking.petBreed || null,
      pet_age: booking.petAge || null,
      pet_weight: booking.petWeight || null,
      pet_temperament: booking.petTemperament || null,
      extra_pets: booking.extraPets || [],
      services: booking.services || [],
      start_date: booking.startDate,
      end_date: booking.endDate,
      vaccination_file_name: booking.vaccinationFile || null,
      care_notes: booking.careNotes || null,
      emergency_name: booking.emergencyName || null,
      emergency_phone: booking.emergencyPhone || null,
      subtotal: Number(booking.subtotal || 0),
      deposit_amount: Number(booking.depositAmount || 0),
      payment_method: booking.paymentMethod,
      status: "Pending Deposit",
      requested_at: booking.requestedAt || new Date().toISOString(),
    }),
  });

  const responseBody = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      responseBody?.message || "Supabase booking insert failed"
    );
  }

  return Array.isArray(responseBody) ? responseBody[0] : responseBody;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const booking = await readBody(req);
    const missingField = requiredFields.find(
      (field) => !String(booking[field] || "").trim()
    );

    if (missingField) {
      return res.status(400).json({ error: `${missingField} is required` });
    }

    if (!allowedStatuses.includes(booking.status || "Pending Deposit")) {
      return res.status(400).json({ error: "Invalid booking status" });
    }

    const createdBooking = await createSupabaseBooking(booking);
    const bookingId =
      createdBooking?.id ||
      createdBooking?.booking_reference ||
      `MP-${Date.now()}`;
    const adminEmail = process.env.PET_BOARDING_ADMIN_EMAIL;

    if (!adminEmail) {
      throw new Error("Missing pet boarding admin email");
    }

    await Promise.all([
      sendEmail({
        to: booking.ownerEmail,
        subject: "Maison Paw booking request and deposit instructions",
        html: buildClientEmailHtml(booking),
        replyTo: adminEmail,
      }),
      sendEmail({
        to: adminEmail,
        subject: `New pet boarding request: ${booking.petName}`,
        html: buildAdminEmailHtml(booking, bookingId),
        replyTo: booking.ownerEmail,
      }),
    ]);

    return res.status(200).json({
      ok: true,
      bookingId,
      status: "Pending Deposit",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Booking request could not be sent" });
  }
}
