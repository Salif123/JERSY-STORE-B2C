import Razorpay from 'razorpay';
import crypto from 'crypto';

const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder';
const keySecret = process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret';

// Razorpay SDK instance (server-only)
export const razorpayInstance = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

/**
 * Verifies the payment signature returned by the Razorpay checkout.
 * SHA256(order_id + "|" + payment_id, secret) should match the signature.
 */
export function verifyRazorpaySignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  signature: string
): boolean {
  if (!keySecret) {
    throw new Error('RAZORPAY_KEY_SECRET environment variable is missing.');
  }

  const hmac = crypto.createHmac('sha256', keySecret);
  hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
  const generatedSignature = hmac.digest('hex');

  return generatedSignature === signature;
}
