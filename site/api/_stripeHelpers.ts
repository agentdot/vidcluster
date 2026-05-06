import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import type { Database } from '../src/lib/database.types'; // Assuming types exist

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseServer = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function getUserFromToken(token: string) {
  const supabase = createClient(supabaseUrl, process.env.VITE_SUPABASE_ANON_KEY!);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) throw new Error('Invalid token');
  return user;
}

export async function createOrUpdateSubscription(stripeCustomerId: string, subscriptionData: unknown) {
  // Assuming user_subscriptions table exists
  const { data, error } = await supabaseServer
    .from('user_subscriptions')
    .upsert({
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: subscriptionData.id,
      plan_name: subscriptionData.metadata?.plan,
      status: subscriptionData.status,
      current_period_end: new Date(subscriptionData.current_period_end * 1000),
      user_id: subscriptionData.metadata?.user_id,
    }, {
      onConflict: 'stripe_subscription_id'
    });

  if (error) throw error;
  return data;
}

export async function getCustomerId(userId: string): Promise<string | null> {
  const { data, error } = await supabaseServer
    .from('user_subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 is no rows
  return data?.stripe_customer_id || null;
}

export { stripe };