import stripe from "@/app/lib/stripe";

export default async function handler(req, res) {
  if (req.method === "POST") {
    return createIntent(req, res);
  }
  if (req.method === "PATCH") {
    return updateIntent(req, res);
  }
  return res.status(405).end("Method Not Allowed");
}

// Create a new PaymentIntent
async function createIntent(req, res) {
  const { amount, currency = "usd", metadata = {} } = req.body;

  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    return res.status(400).json({ error: "A valid amount is required." });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(amount) * 100), // dollars → cents
      currency,
      automatic_payment_methods: { enabled: true },
      metadata,
    });

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    console.error("[Stripe] create PaymentIntent error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}

// Update the amount on an existing PaymentIntent (e.g. after shipping recalc)
async function updateIntent(req, res) {
  const { paymentIntentId, amount } = req.body;

  if (!paymentIntentId || !amount) {
    return res.status(400).json({ error: "paymentIntentId and amount are required." });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.update(paymentIntentId, {
      amount: Math.round(Number(amount) * 100),
    });

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    console.error("[Stripe] update PaymentIntent error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
