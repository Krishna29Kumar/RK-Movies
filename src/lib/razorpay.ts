import Razorpay from "razorpay";

let instance: Razorpay | null = null;

// Lazily created so the app doesn't crash on import if the keys aren't
// set yet — the error only surfaces when a payment is actually attempted.
export function getRazorpay() {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        throw new Error(
            "RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not set. Add them to .env.local."
        );
    }

    if (!instance) {
        instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    }

    return instance;
}