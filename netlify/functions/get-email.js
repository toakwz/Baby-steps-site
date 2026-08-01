exports.handler = async function (event) {
  const sessionId = event.queryStringParameters && event.queryStringParameters.session_id;

  if (!sessionId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing session_id" }),
    };
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server not configured" }),
    };
  }

  try {
    const response = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
      {
        headers: {
          Authorization: `Bearer ${stripeSecretKey}`,
        },
      }
    );

    if (!response.ok) {
      return {
        statusCode: 502,
        body: JSON.stringify({ error: "Could not retrieve session" }),
      };
    }

    const session = await response.json();
    const email =
      (session.customer_details && session.customer_details.email) ||
      session.customer_email ||
      null;

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Lookup failed" }),
    };
  }
};
