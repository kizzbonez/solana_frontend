import stripe from "@/app/lib/stripe";

// Disable Next.js body parsing — Stripe needs the raw body to verify signatures
export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error("[Stripe Webhook] Signature verification failed:", err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const pi = event.data.object;
      console.log("[Stripe Webhook] payment_intent.succeeded:", pi.id, "amount:", pi.amount);
      // Order creation is handled client-side after confirmPayment().
      // The webhook is a server-side safety net — you can add backend order
      // verification here (e.g. cross-check with your backend API).
      break;
    }

    case "payment_intent.payment_failed": {
      const pi = event.data.object;
      const msg = pi.last_payment_error?.message ?? "Unknown error";
      console.warn("[Stripe Webhook] payment_intent.payment_failed:", pi.id, msg);
      break;
    }

    case "charge.refunded": {
      console.log("[Stripe Webhook] charge.refunded:", event.data.object.id);
      break;
    }

    default:
      // Ignore unhandled event types
      break;
  }

  return res.status(200).json({ received: true });
}
