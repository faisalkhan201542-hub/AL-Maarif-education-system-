import FeeChallan from "../models/FeeChallan.js";
import Student from "../models/Student.js";
import SchoolSettings from "../models/SchoolSettings.js";
import { generateChallanNumber, generateReceiptNumber } from "../utils/idGenerators.js";
import { buildWhatsappLink } from "../utils/whatsapp.js";
import { sendMessage } from "../services/whatsappService.js";
import Announcement from "../models/Announcement.js";

// @desc List challans with filters, pagination
// @route GET /api/fees
export const getChallans = async (req, res) => {
  const { search, class: className, status, page = 1, limit = 20 } = req.query;

  const query = {};
  if (className) query.class = className;
  if (status) query.paymentStatus = status;

  let studentFilter = null;
  if (search) {
    const students = await Student.find({
      $or: [
        { name: new RegExp(search, "i") },
        { registrationNumber: new RegExp(search, "i") },
        { fatherWhatsapp: new RegExp(search, "i") },
      ],
    }).select("_id");
    studentFilter = students.map((s) => s._id);
    query.$or = [{ challanNumber: new RegExp(search, "i") }, { student: { $in: studentFilter } }];
  }

  const pageNum = Math.max(parseInt(page, 10), 1);
  const limitNum = Math.min(parseInt(limit, 10) || 20, 500);

  const [challans, total] = await Promise.all([
    FeeChallan.find(query)
      .populate("student", "name registrationNumber class rollNumber fatherWhatsapp photoUrl fatherName")
      .sort({ issueDate: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    FeeChallan.countDocuments(query),
  ]);

  const [totalChallans, paidChallans, unpaidChallans, partialChallans, pendingVerification, collectionAgg, outstandingAgg] =
    await Promise.all([
      FeeChallan.countDocuments(),
      FeeChallan.countDocuments({ paymentStatus: "Paid" }),
      FeeChallan.countDocuments({ paymentStatus: "Unpaid" }),
      FeeChallan.countDocuments({ paymentStatus: "Partial" }),
      FeeChallan.countDocuments({ verificationStatus: "Pending", paidAmount: { $gt: 0 } }),
      FeeChallan.aggregate([{ $group: { _id: null, total: { $sum: "$paidAmount" } } }]),
      FeeChallan.aggregate([{ $group: { _id: null, total: { $sum: "$remainingAmount" } } }]),
    ]);

  res.json({
    challans,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
    stats: {
      totalChallans,
      paidChallans,
      unpaidChallans,
      partialChallans,
      pendingVerification,
      totalCollection: collectionAgg[0]?.total || 0,
      totalOutstanding: outstandingAgg[0]?.total || 0,
    },
  });
};

// @route GET /api/fees/:id
export const getChallanById = async (req, res) => {
  const challan = await FeeChallan.findById(req.params.id).populate("student");
  if (!challan) return res.status(404).json({ message: "Challan not found" });
  res.json(challan);
};

// @route GET /api/fees/student/:studentId
export const getChallansByStudent = async (req, res) => {
  const challans = await FeeChallan.find({ student: req.params.studentId }).sort({ issueDate: -1 });
  res.json(challans);
};

// @desc Generate a new fee challan for a student (Section 44)
// @route POST /api/fees
export const createChallan = async (req, res) => {
  const {
    student: studentId,
    challanType,
    billingMonth,
    dueDate,
    feeAmount,
    admissionFee,
    examinationFee,
    otherCharges,
    discount,
    fine,
    previousBalance,
  } = req.body;

  const student = await Student.findById(studentId);
  if (!student) return res.status(404).json({ message: "Student not found" });

  const settings = await SchoolSettings.getSettings();
  const challanNumber = await generateChallanNumber();

  try {
    const challan = await FeeChallan.create({
      student: student._id,
      challanNumber,
      challanType: challanType || "Monthly Fee",
      class: student.class,
      billingMonth,
      dueDate,
      feeAmount: Number(feeAmount) || 0,
      admissionFee: Number(admissionFee) || 0,
      examinationFee: Number(examinationFee) || 0,
      otherCharges: Number(otherCharges) || 0,
      discount: Number(discount) || 0,
      fine: Number(fine) || 0,
      previousBalance: Number(previousBalance) || 0,
      paymentMethod: "EasyPaisa",
      easypaisaNumber: settings.easypaisaNumber,
    });

    res.status(201).json(challan);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: "A challan of this type has already been generated for this student for the selected month." 
      });
    }
    throw error;
  }
};

// @desc Bulk generate fee challans for a specific class
// @route POST /api/fees/bulk
export const bulkCreateChallans = async (req, res) => {
  const {
    class: className,
    challanType,
    billingMonth,
    dueDate,
    feeAmount,
    admissionFee,
    examinationFee,
    otherCharges,
    discount,
    fine,
  } = req.body;

  if (!className || !billingMonth || !dueDate) {
    return res.status(400).json({ message: "Class, billing month, and due date are required" });
  }

  // Find all active students in the class
  const students = await Student.find({ class: className, status: "Active" });
  
  if (students.length === 0) {
    return res.status(404).json({ message: "No active students found in this class." });
  }

  const settings = await SchoolSettings.getSettings();
  let createdCount = 0;
  let duplicateCount = 0;

  for (const student of students) {
    // Check if challan already exists to prevent error throwing
    const existing = await FeeChallan.findOne({ 
      student: student._id, 
      billingMonth, 
      challanType: challanType || "Monthly Fee" 
    });

    if (existing) {
      duplicateCount++;
      continue;
    }

    const challanNumber = await generateChallanNumber();
    
    await FeeChallan.create({
      student: student._id,
      challanNumber,
      challanType: challanType || "Monthly Fee",
      class: student.class,
      billingMonth,
      dueDate,
      feeAmount: Number(feeAmount) || 0,
      admissionFee: Number(admissionFee) || 0,
      examinationFee: Number(examinationFee) || 0,
      otherCharges: Number(otherCharges) || 0,
      discount: Number(discount) || 0,
      fine: Number(fine) || 0,
      previousBalance: 0, // usually handled manually or script
      paymentMethod: "EasyPaisa",
      easypaisaNumber: settings.easypaisaNumber,
    });
    createdCount++;
  }

  res.status(201).json({
    message: `Generated ${createdCount} challans. Skipped ${duplicateCount} duplicates.`,
    created: createdCount,
    duplicates: duplicateCount
  });
};

// @route PUT /api/fees/:id
export const updateChallan = async (req, res) => {
  const challan = await FeeChallan.findById(req.params.id);
  if (!challan) return res.status(404).json({ message: "Challan not found" });

  const fields = [
    "challanType",
    "billingMonth",
    "dueDate",
    "feeAmount",
    "admissionFee",
    "examinationFee",
    "otherCharges",
    "discount",
    "fine",
    "previousBalance",
  ];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) challan[f] = req.body[f];
  });

  await challan.save();
  res.json(challan);
};

// @desc Principal records a payment against a challan (manual, EasyPaisa)
// @route PUT /api/fees/:id/record-payment
export const recordPayment = async (req, res) => {
  const { paidAmount, transactionReference, paymentDate } = req.body;
  const challan = await FeeChallan.findById(req.params.id).populate("student");
  if (!challan) return res.status(404).json({ message: "Challan not found" });

  challan.paidAmount = Number(paidAmount) || challan.paidAmount;
  challan.transactionReference = transactionReference || challan.transactionReference;
  challan.paymentDate = paymentDate || new Date();
  challan.verificationStatus = "Pending";

  if (challan.paidAmount >= challan.totalAmount && !challan.receiptNumber) {
    challan.receiptNumber = await generateReceiptNumber();
  }

  await challan.save();

  // Create an announcement automatically
  await Announcement.create({
    title: `Fee Submitted - ${challan.student.name}`,
    description: `Student ${challan.student.name} (${challan.student.registrationNumber}) has submitted Rs. ${challan.paidAmount}. The remaining amount is Rs. ${challan.remainingAmount}.`,
    type: "Fee",
    priority: "Normal"
  });

  res.json(challan);
};

// @desc Principal verifies (or rejects) a payment (Section 43 / 50)
// @route PUT /api/fees/:id/verify
export const verifyPayment = async (req, res) => {
  const { verificationStatus, verifiedBy } = req.body; // "Verified" | "Rejected"
  const challan = await FeeChallan.findById(req.params.id);
  if (!challan) return res.status(404).json({ message: "Challan not found" });

  challan.verificationStatus = verificationStatus;
  challan.verifiedBy = verifiedBy || req.principal?.name || "Principal";

  if (verificationStatus === "Rejected") {
    // Roll back paid amount so the fee shows as still outstanding
    challan.paidAmount = 0;
    challan.transactionReference = "";
  } else if (verificationStatus === "Verified" && !challan.receiptNumber) {
    challan.receiptNumber = await generateReceiptNumber();
  }

  await challan.save();
  res.json(challan);
};

// @desc Fast-track manual payment (Handles partial/full & auto-verifies)
// @route PUT /api/fees/:id/receive-payment
export const receivePayment = async (req, res) => {
  const challan = await FeeChallan.findById(req.params.id).populate("student");
  if (!challan) return res.status(404).json({ message: "Challan not found" });

  const amountReceived = Number(req.body.amount);
  if (isNaN(amountReceived) || amountReceived <= 0) {
    return res.status(400).json({ message: "Valid amount is required" });
  }

  challan.paidAmount = (challan.paidAmount || 0) + amountReceived;
  challan.paymentMethod = req.body.paymentMethod || "Cash";
  challan.paymentDate = new Date();
  challan.verificationStatus = "Verified";
  challan.verifiedBy = req.principal?.name || "Principal";

  // If fully paid, generate receipt
  // Note: mongoose pre-validate hook will calculate paymentStatus and remainingAmount automatically
  if ((challan.paidAmount >= challan.totalAmount) && !challan.receiptNumber) {
    challan.receiptNumber = await generateReceiptNumber();
  }

  await challan.save();
  res.json(challan);
};

// @route DELETE /api/fees/:id
export const deleteChallan = async (req, res) => {
  const challan = await FeeChallan.findById(req.params.id);
  if (!challan) return res.status(404).json({ message: "Challan not found" });
  await challan.deleteOne();
  res.json({ message: "Challan deleted successfully" });
};

// @desc Build the WhatsApp challan message + link (Section 45) -- does NOT send anything
// @route GET /api/fees/:id/whatsapp-link
export const getChallanWhatsappLink = async (req, res) => {
  const challan = await FeeChallan.findById(req.params.id).populate("student");
  if (!challan) return res.status(404).json({ message: "Challan not found" });
  const settings = await SchoolSettings.getSettings();

  const paymentLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/pay/${challan._id}`;
  const message = `📄 *Al-Maarif Education (Fee Challan - ${challan.billingMonth})*\n\nAssalam-o-Alaikum!\nMohtaram Walidain, aap ke bache *${challan.student.name}* (Class: ${challan.class}) ki fees due hai.\n\n*Tafseelat:*\n- Mahina: ${challan.billingMonth}\n- Baqaya Jaat (Arrears): Rs. ${challan.previousBalance}\n- Mahana Fees: Rs. ${challan.feeAmount}\n- Total Fees: *Rs. ${challan.totalAmount}*\n- Aakhri Tareeq (Due Date): ${new Date(challan.dueDate).toDateString()}\n\n*Online Adaigi (Card/Stripe):*\n👉 Barraye Meharbani is link par click kar ke online fee jama karwayein: ${paymentLink}\n\n*Adaigi Ka Tareeqa (EasyPaisa):*\nAccount Number: ${settings.easypaisaNumber}\nAccount Name: Murad Ali Khalil\n\nBaraye meharbani aakhri tareeq se pehle fees jama karwayein taa k jurmane se bacha ja sake. Agar aap ne EasyPaisa se pay kiya hai toh uski rasid (screenshot) isi number par bhej dein taa k aap ki fees system mein clear ki ja sake (Online Stripe payment khud-ba-khud verify ho jayegi). Shukriya!`;

  const link = buildWhatsappLink(challan.student.fatherWhatsapp, message);
  res.json({ link, message });
};

// @desc WhatsApp fee reminder for pending fee (Section 12)
// @route GET /api/fees/:id/whatsapp-reminder
export const getFeeReminderWhatsappLink = async (req, res) => {
  const challan = await FeeChallan.findById(req.params.id).populate("student");
  if (!challan) return res.status(404).json({ message: "Challan not found" });
  const settings = await SchoolSettings.getSettings();

  const paymentLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/pay/${challan._id}`;
  const message = `🔔 *Al-Maarif Education (Fee Reminder)*\n\nAssalam-o-Alaikum!\nMohtaram Walidain, aap ke bache *${challan.student.name}* (Class: ${challan.class}) ki fees baqaya hai.\n\n*Tafseelat:*\n- Baqaya Jaat: Rs. ${challan.previousBalance}\n- Mahana Fees: Rs. ${challan.feeAmount}\n- Total Baqaya: *Rs. ${challan.totalAmount}*\n\n*Online Adaigi (Card/Stripe):*\n👉 Barraye Meharbani is link par click kar ke online fee jama karwayein: ${paymentLink}\n\n*Adaigi Ka Tareeqa (EasyPaisa):*\nAccount Number: ${settings.easypaisaNumber}\nAccount Name: Murad Ali Khalil\n\nBaraye meharbani jald az jald fees jama karwayein taa k bache ki parhai mutassir na ho. Agar aap ne EasyPaisa se pay kiya hai toh uski rasid (screenshot) isi number par lazmi bhej dein taa k aap ki fees clear ki ja sake (Online Stripe payment khud-ba-khud verify ho jayegi). Shukriya!`;
  const link = buildWhatsappLink(challan.student.fatherWhatsapp, message);
  res.json({ link, message });
};

// @desc Blast WhatsApp Fee Reminders for unpaid/partial challans
// @route POST /api/fees/blast-reminders
export const blastReminders = async (req, res) => {
  const { class: className, billingMonth } = req.body;
  if (!billingMonth) {
    return res.status(400).json({ message: "Billing month is required" });
  }

  const query = { 
    billingMonth, 
    paymentStatus: { $in: ["Unpaid", "Partial"] } 
  };
  if (className) query.class = className;

  const challans = await FeeChallan.find(query).populate("student");
  const settings = await SchoolSettings.getSettings();

  let sentCount = 0;
  for (const challan of challans) {
    if (challan.student && challan.student.fatherWhatsapp) {
      const paymentLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/pay/${challan._id}`;
      const msg = `📄 *Al-Maarif Education (Fee Challan - ${challan.billingMonth})*\n\nAssalam-o-Alaikum!\nMohtaram Walidain, aap ke bache *${challan.student.name}* (Class: ${challan.class}) ki fees due hai.\n\n*Tafseelat:*\n- Mahina: ${challan.billingMonth}\n- Baqaya Jaat (Arrears): Rs. ${challan.previousBalance}\n- Mahana Fees: Rs. ${challan.feeAmount}\n- Total Fees: *Rs. ${challan.totalAmount}*\n- Aakhri Tareeq (Due Date): ${new Date(challan.dueDate).toDateString()}\n\n*Online Adaigi (Card/Stripe):*\n👉 Barraye Meharbani is link par click kar ke online fee jama karwayein: ${paymentLink}\n\n*Adaigi Ka Tareeqa (EasyPaisa):*\nAccount Number: ${settings.easypaisaNumber}\nAccount Name: Murad Ali Khalil\n\nBaraye meharbani aakhri tareeq se pehle fees jama karwayein taa k jurmane se bacha ja sake. Agar aap ne EasyPaisa se pay kiya hai toh uski rasid (screenshot) isi number par bhej dein taa k aap ki fees system mein clear ki ja sake (Online Stripe payment khud-ba-khud verify ho jayegi). Shukriya!`;
      sendMessage(challan.student.fatherWhatsapp, msg).catch(err => console.error("Failed to send fee reminder to", challan.student.name, err.message));
      sentCount++;
    }
  }

  res.json({ message: `Reminders sent to ${sentCount} students.` });
};
