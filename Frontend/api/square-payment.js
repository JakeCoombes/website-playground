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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { sourceId, amount, booking } = await readBody(req);
    const accessToken = process.env.SQUARE_ACCESS_TOKEN;
    const locationId = process.env.SQUARE_LOCATION_ID;
    const squareEnvironment =
      process.env.SQUARE_ENVIRONMENT === "production"
        ? "production"
        : "sandbox";
    const apiUrl =
      squareEnvironment === "production"
        ? "https://connect.squareup.com/v2/payments"
        : "https://connect.squareupsandbox.com/v2/payments";

    if (!accessToken || !locationId) {
      return res.status(500).json({ error: "Square is not configured." });
    }

    if (!sourceId || !amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid payment request." });
    }

    const paymentResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Square-Version": "2026-01-22",
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idempotency_key: crypto.randomUUID(),
        source_id: sourceId,
        location_id: locationId,
        amount_money: {
          amount: Math.round(Number(amount) * 100),
          currency: "USD",
        },
        autocomplete: true,
        note: booking
          ? `${booking.name || "CURATE client"} - ${booking.services?.join(
              ", "
            ) || "Appointment"} - ${booking.date || ""} ${booking.time || ""}`
          : "CURATE appointment",
      }),
    });

    const responseBody = await paymentResponse.json();

    if (!paymentResponse.ok) {
      console.error(responseBody);
      return res.status(400).json({
        error:
          responseBody.errors?.[0]?.detail ||
          responseBody.errors?.[0]?.code ||
          "Square payment failed.",
      });
    }

    return res.status(200).json({
      ok: true,
      paymentId: responseBody.payment?.id,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Payment could not be completed." });
  }
}
