import { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromToken, stripe, getCustomerId, supabaseServer } from './_stripeHelpers';

const PRICE_IDS = {
  pro: process.env.STRIPE_PRICE_PRO!,
  advanced: process.env.STRIPE_PRICE_ADVANCED!,
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization token' });
    }

    const token = authHeader.substring(7);
    const user = await getUserFromToken(token);

    const { plan } = req.body;
    if (!plan || !['pro', 'advanced'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    let customerId = await getCustomerId(user.id);

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;

      // Update subscription table with customer_id
      await supabaseServer.from('user_subscriptions').insert({
        user_id: user.id,
        stripe_customer_id: customerId,
        plan_name: plan,
        status: 'incomplete',
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: PRICE_IDS[plan as keyof typeof PRICE_IDS],
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.VITE_SITE_URL}/dashboard?checkout=success`,
      cancel_url: `${process.env.VITE_SITE_URL}/pricing?checkout=cancelled`,
      metadata: {
        user_id: user.id,
        plan,
      },
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Checkout session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}