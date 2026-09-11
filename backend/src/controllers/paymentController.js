import Stripe from "stripe";
import FeeChallan from "../models/FeeChallan.js";
import SchoolSettings from "../models/SchoolSettings.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy");

// @desc Get basic public info about a challan for the payment page
// @route GET /api/public/fees/:id
export const getPublicChallan = async (req, res) => {
  try {
    const challan = await FeeChallan.findById(req.params.id).populate("student", "name class fatherName registrationNumber");
    if (!challan) return res.status(404).json({ message: "Challan not found" });

    // Expose only non-sensitive data
    res.json({
      _id: challan._id,
      challanNumber: challan.challanNumber,
      billingMonth: challan.billingMonth,
      dueDate: challan.dueDate,
      totalAmount: challan.totalAmount,
      remainingAmount: challan.remainingAmount,
      paymentStatus: challan.paymentStatus,
      student: {
        name: challan.student.name,
        fatherName: challan.student.fatherName,
        class: challan.student.class,
        registrationNumber: challan.student.registrationNumber
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Create Stripe Checkout Session for a challan
// @route POST /api/public/fees/:id/create-checkout-session
export const createCheckoutSession = async (req, res) => {
  try {
    const challan = await FeeChallan.findById(req.params.id).populate("student", "name class");
    if (!challan) return res.status(404).json({ message: "Challan not found" });

    if (challan.paymentStatus === "Paid" || challan.remainingAmount <= 0) {
      return res.status(400).json({ message: "Challan is already fully paid." });
    }

    const settings = await SchoolSettings.getSettings();
    const schoolName = settings.schoolName || "Al-Maarif Education";
    const amountInCents = Math.round(challan.remainingAmount * 100); // Stripe expects amounts in cents/paisa

    // Define success and cancel URLs pointing to the frontend
    const domain = process.env.FRONTEND_URL || "http://localhost:5173";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "pkr", // Use 'usd' or 'pkr' depending on your Stripe account setup
            product_data: {
              name: `Fee Challan - ${challan.billingMonth}`,
              description: `Student: ${challan.student.name} (Class: ${challan.student.class})`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${domain}/pay/success?session_id={CHECKOUT_SESSION_ID}&challan_id=${challan._id}`,
      cancel_url: `${domain}/pay/cancel?challan_id=${challan._id}`,
      metadata: {
        challanId: challan._id.toString(),
        studentName: challan.student.name,
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ message: "Stripe error", error: error.message });
  }
};
