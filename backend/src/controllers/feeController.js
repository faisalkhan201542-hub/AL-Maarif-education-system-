import FeeChallan from "../models/FeeChallan.js";
import Student from "../models/Student.js";
import SchoolSettings from "../models/SchoolSettings.js";
import { generateChallanNumber, generateReceiptNumber } from "../utils/idGenerators.js";
import { buildWhatsappLink } from "../utils/whatsapp.js";

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
  const challan = await FeeChallan.findById(req.params.id);
  if (!challan) return res.status(404).json({ message: "Challan not found" });

  challan.paidAmount = Number(paidAmount) || challan.paidAmount;
  challan.transactionReference = transactionReference || challan.transactionReference;
  challan.paymentDate = paymentDate || new Date();
  challan.verificationStatus = "Pending";

  if (challan.paidAmount >= challan.totalAmount && !challan.receiptNumber) {
    challan.receiptNumber = await generateReceiptNumber();
  }

  await challan.save();
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

  const message = `Assalam-o-Alaikum. This is the fee challan for your child at ${settings.schoolName}.

Student: ${challan.student.name}
Registration No: ${challan.student.registrationNumber}
Class: ${challan.class}
Month: ${challan.billingMonth}
Total Fee: Rs. ${challan.totalAmount}
Due Date: ${new Date(challan.dueDate).toDateString()}

EasyPaisa Payment Number:
${settings.easypaisaNumber}

Please send the payment and keep the transaction reference for confirmation.

Thank you.
${settings.schoolName}`;

  const link = buildWhatsappLink(challan.student.fatherWhatsapp, message);
  res.json({ link, message });
};

// @desc WhatsApp fee reminder for pending fee (Section 12)
// @route GET /api/fees/:id/whatsapp-reminder
export const getFeeReminderWhatsappLink = async (req, res) => {
  const challan = await FeeChallan.findById(req.params.id).populate("student");
  if (!challan) return res.status(404).json({ message: "Challan not found" });
  const settings = await SchoolSettings.getSettings();

  const message = `Assalam-o-Alaikum, this is a reminder regarding the pending school fee of your child. Please contact ${settings.schoolName} for further information.`;
  const link = buildWhatsappLink(challan.student.fatherWhatsapp, message);
  res.json({ link, message });
};
