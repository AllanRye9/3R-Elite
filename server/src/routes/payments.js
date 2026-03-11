const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const prisma = require('../lib/prisma');
const { auth } = require('../middleware/auth');

const router = express.Router();

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// POST /api/payments/create-checkout-session
router.post('/create-checkout-session', auth, async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || !items.length) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Validate products exist
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });

    if (products.length !== items.length) {
      return res.status(400).json({ error: 'Some products not found' });
    }

    // Create order in DB
    const totalPrice = items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId);
      return sum + product.price * item.quantity;
    }, 0);

    const order = await prisma.order.create({
      data: {
        buyerId: req.user.id,
        totalPrice,
        status: 'PENDING',
        items: {
          create: items.map((item) => {
            const product = products.find((p) => p.id === item.productId);
            return {
              productId: item.productId,
              quantity: item.quantity,
              price: product.price,
            };
          }),
        },
      },
    });

    // Create Stripe line items
    const lineItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.title,
            images: product.images.length ? [product.images[0]] : [],
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: item.quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${CLIENT_URL}/checkout/success?orderId=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${CLIENT_URL}/checkout`,
      metadata: { orderId: order.id },
    });

    // Update order with stripe session ID
    await prisma.order.update({
      where: { id: order.id },
      data: { stripeId: session.id },
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// POST /api/payments/webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata.orderId;

    try {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'PAID' },
      });
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  }

  res.json({ received: true });
});

// GET /api/payments/success
router.get('/success', auth, async (req, res) => {
  try {
    const { orderId } = req.query;
    if (!orderId) return res.status(400).json({ error: 'orderId required' });

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } },
    });

    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.buyerId !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
