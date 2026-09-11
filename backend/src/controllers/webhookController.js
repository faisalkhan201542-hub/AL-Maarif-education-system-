import Stripe from "stripe";
import FeeChallan from "../models/FeeChallan.js";
import Announcement from "../models/Announcement.js";
import { generateReceiptNumber } from "../utils/idGenerators.js";

// Make sure to set STRIPE_WEBHOOK_SECRET in your .env
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy");
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// @desc Handle Stripe Webhook Events
// @route POST /api/webhooks/stripe
// Note: This endpoint MUST receive the raw body. Express.json() should not intercept it.
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    // req.body here must be the raw Buffer, not parsed JSON
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;
      
      const challanId = session.metadata.challanId;
      const amountPaid = session.amount_total / 100; // Convert cents to whole amount

      if (challanId) {
        try {
          const challan = await FeeChallan.findById(challanId).populate("student");
          if (challan) {
            // Update the challan automatically
            challan.paidAmount += amountPaid;
            
            // Generate receipt number if not exists
            if (!challan.receiptNumber) {
              challan.receiptNumber = await generateReceiptNumber();
            }

            challan.paymentMethod = "Online/Stripe";
            challan.transactionReference = session.payment_intent;
            challan.paymentDate = new Date();
            
            // Determine status
            challan.remainingAmount = challan.totalAmount - challan.paidAmount;
            if (challan.remainingAmount <= 0) {
              challan.paymentStatus = "Paid";
              challan.verificationStatus = "Verified";
            } else {
              challan.paymentStatus = "Partial";
              challan.verificationStatus = "Verified"; // Verified the partial payment at least
            }
            
            challan.verifiedBy = "System Auto (Stripe)";
            await challan.save();

            // Auto-announcement for transparency
            await Announcement.create({
              title: `Online Fee Received - ${challan.student.name}`,
              description: `A fee of Rs. ${amountPaid} was automatically received and verified via Stripe for ${challan.student.name} (${challan.student.class}).`,
              type: "Fee",
              priority: "Normal"
            });
            console.log(`Challan ${challanId} automatically marked as verified and paid via Stripe.`);
          }
        } catch (dbError) {
          console.error("Error updating challan from webhook:", dbError);
        }
      }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.send();
};
