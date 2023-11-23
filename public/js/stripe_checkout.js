// This is your test publishable API key.
const stripe = Stripe("pk_test_51IwHwvFbB7dBcGLWIQQnLVcwZ1yvNDMU029ReetdkxackPrCxLhC3JC0vOTUI9lWYGkCT3fbvcKegvJuhcVNeXc100JvPxhkyT");

initialize();

// Create a Checkout Session as soon as the page loads
async function initialize() {
  const response = await fetch("/create-checkout-session/" + totalPayment, {
    method: "POST",
  });

  const { clientSecret } = await response.json();

  const checkout = await stripe.initEmbeddedCheckout({
    clientSecret,
  });

  // Mount Checkout
  checkout.mount('#payment-element');
}