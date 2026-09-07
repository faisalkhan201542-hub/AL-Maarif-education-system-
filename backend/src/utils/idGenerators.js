import Student from "../models/Student.js";
import FeeChallan from "../models/FeeChallan.js";

// AME-2026-0001 style registration numbers
export const generateRegistrationNumber = async (year = new Date().getFullYear()) => {
  const prefix = `AME-${year}-`;
  const last = await Student.findOne({ registrationNumber: new RegExp(`^${prefix}`) })
    .sort({ registrationNumber: -1 })
    .lean();
  let next = 1;
  if (last) {
    const lastNum = parseInt(last.registrationNumber.split("-").pop(), 10);
    next = lastNum + 1;
  }
  return `${prefix}${String(next).padStart(4, "0")}`;
};

export const generateAdmissionNumber = async (year = new Date().getFullYear()) => {
  const prefix = `ADM-${year}-`;
  const count = await Student.countDocuments({ admissionNumber: new RegExp(`^${prefix}`) });
  return `${prefix}${String(count + 1).padStart(4, "0")}`;
};

// AME-FEE-2026-0001 style challan numbers
export const generateChallanNumber = async (year = new Date().getFullYear()) => {
  const prefix = `AME-FEE-${year}-`;
  const last = await FeeChallan.findOne({ challanNumber: new RegExp(`^${prefix}`) })
    .sort({ challanNumber: -1 })
    .lean();
  let next = 1;
  if (last) {
    const lastNum = parseInt(last.challanNumber.split("-").pop(), 10);
    next = lastNum + 1;
  }
  return `${prefix}${String(next).padStart(4, "0")}`;
};

export const generateReceiptNumber = async (year = new Date().getFullYear()) => {
  const prefix = `AME-RCPT-${year}-`;
  const count = await FeeChallan.countDocuments({ receiptNumber: new RegExp(`^${prefix}`) });
  return `${prefix}${String(count + 1).padStart(4, "0")}`;
};
