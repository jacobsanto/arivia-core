
// Netlify function for handling Stripe webhook events
const stripe = require('stripe');

exports.handler = async (event, context) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!stripeSecretKey || !endpointSecret) {
    console.error('Missing Stripe environment variables');
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: 'Server configuration error' })
    };
  }
  
  const stripeClient = stripe(stripeSecretKey);

  try {
    // Get the signature from the headers
    const signature = event.headers['stripe-signature'];

    if (!signature) {
      console.error('No Stripe signature found in request');
      return { statusCode: 400, body: JSON.stringify({ error: 'No signature provided' }) };
    }
    
    // Verify and construct the event
    let stripeEvent;
    
    try {
      stripeEvent = stripeClient.webhooks.constructEvent(
        event.body,
        signature,
        endpointSecret
      );
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return { statusCode: 400, body: JSON.stringify({ error: err.message }) };
    }
    
    console.log(`Received Stripe event: ${stripeEvent.type}`);
    
    // Handle specific event types
    switch (stripeEvent.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = stripeEvent.data.object;
        console.log(`Payment succeeded: ${paymentIntent.id}`);
        // Process the successful payment
        break;
        
      case 'checkout.session.completed':
        const session = stripeEvent.data.object;
        console.log(`Checkout completed: ${session.id}`);
        // Handle successful checkout
        break;
        
      case 'invoice.paid':
        const invoice = stripeEvent.data.object;
        console.log(`Invoice paid: ${invoice.id}`);
        // Handle successful subscription payment
        break;
        
      case 'invoice.payment_failed':
        const failedInvoice = stripeEvent.data.object;
        console.log(`Invoice payment failed: ${failedInvoice.id}`);
        // Handle failed subscription payment
        break;
        
      default:
        // Unexpected event type
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }
    
    // Return a 200 response to acknowledge receipt of the event
    return { 
      statusCode: 200, 
      body: JSON.stringify({ received: true }) 
    };
  } catch (err) {
    console.error(`Error processing webhook: ${err.message}`);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: 'Webhook processing failed' }) 
    };
  }
};
