import ExcelJS from "exceljs";
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, HeadingLevel, AlignmentType, WidthType } from "docx";
import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";
import FeeChallan from "../models/FeeChallan.js";
import Attendance from "../models/Attendance.js";
import Result from "../models/Result.js";
import SchoolSettings from "../models/SchoolSettings.js";
import Expense from "../models/Expense.js";
import Payroll from "../models/Payroll.js";

// ---------- Helpers ----------
async function buildWorkbook(title, columns, rows) {
  const settings = await SchoolSettings.getSettings();
  const workbook = new ExcelJS.Workbook();
  workbook.creator = settings.schoolName;
  const sheet = workbook.addWorksheet(title.substring(0, 30));

  sheet.mergeCells("A1", `${String.fromCharCode(64 + columns.length)}1`);
  sheet.getCell("A1").value = settings.schoolName;
  sheet.getCell("A1").font = { size: 16, bold: true };
  sheet.getCell("A1").alignment = { horizontal: "center" };

  sheet.mergeCells("A2", `${String.fromCharCode(64 + columns.length)}2`);
  sheet.getCell("A2").value = settings.address;
  sheet.getCell("A2").alignment = { horizontal: "center" };

  sheet.mergeCells("A3", `${String.fromCharCode(64 + columns.length)}3`);
  sheet.getCell("A3").value = `${title} — Generated on ${new Date().toDateString()}`;
  sheet.getCell("A3").font = { italic: true };
  sheet.getCell("A3").alignment = { horizontal: "center" };

  sheet.addRow([]);
  const headerRow = sheet.addRow(columns.map((c) => c.header));
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F4E78" } };
    cell.alignment = { horizontal: "center" };
  });

  rows.forEach((r) => sheet.addRow(columns.map((c) => r[c.key] ?? "")));

  sheet.columns.forEach((col, i) => {
    col.width = columns[i]?.width || 18;
  });

  return workbook;
}

async function sendWorkbook(res, workbook, filename) {
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  await workbook.xlsx.write(res);
  res.end();
}

function buildDocxHeader(settings, title) {
  return [
    new Paragraph({ text: settings.schoolName, heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }),
    new Paragraph({ text: settings.address, alignment: AlignmentType.CENTER }),
    new Paragraph({
      text: `Principal: ${settings.principalName}`,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({ text: "" }),
    new Paragraph({ text: title, heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }),
    new Paragraph({ text: `Date: ${new Date().toDateString()}`, alignment: AlignmentType.CENTER }),
    new Paragraph({ text: "" }),
  ];
}

function buildDocxTable(columns, rows) {
  const headerRow = new TableRow({
    children: columns.map(
      (c) =>
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: c.header, bold: true })] })],
        })
    ),
  });
  const dataRows = rows.map(
    (r) =>
      new TableRow({
        children: columns.map(
          (c) => new TableCell({ children: [new Paragraph(String(r[c.key] ?? ""))] })
        ),
      })
  );
  return new Table({ rows: [headerRow, ...dataRows], width: { size: 100, type: WidthType.PERCENTAGE } });
}

async function sendDocx(res, doc, filename) {
  const buffer = await Packer.toBuffer(doc);
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(buffer);
}

// ---------- STUDENTS ----------
const studentColumns = [
  { header: "Registration No", key: "registrationNumber", width: 20 },
  { header: "Name", key: "name", width: 22 },
  { header: "Father Name", key: "fatherName", width: 22 },
  { header: "Class", key: "class", width: 10 },
  { header: "Roll No", key: "rollNumber", width: 10 },
  { header: "Father WhatsApp", key: "fatherWhatsapp", width: 18 },
  { header: "Status", key: "status", width: 12 },
];

async function fetchStudentRows(query = {}) {
  const students = await Student.find(query).sort({ class: 1, rollNumber: 1 }).lean();
  return students;
}

export const exportStudentsExcel = async (req, res) => {
  const { class: className } = req.query;
  const rows = await fetchStudentRows(className ? { class: className } : {});
  const workbook = await buildWorkbook("Students Report", studentColumns, rows);
  await sendWorkbook(res, workbook, "Students.xlsx");
};

export const exportStudentsWord = async (req, res) => {
  const { class: className } = req.query;
  const settings = await SchoolSettings.getSettings();
  const rows = await fetchStudentRows(className ? { class: className } : {});
  const doc = new Document({
    sections: [
      {
        children: [...buildDocxHeader(settings, "Students Report"), buildDocxTable(studentColumns, rows)],
      },
    ],
  });
  await sendDocx(res, doc, "Students.docx");
};

// ---------- TEACHERS ----------
const teacherColumns = [
  { header: "Teacher ID", key: "teacherId", width: 15 },
  { header: "Name", key: "name", width: 22 },
  { header: "Subject", key: "subject", width: 18 },
  { header: "Qualification", key: "qualification", width: 20 },
  { header: "Assigned Class", key: "assignedClass", width: 14 },
  { header: "Phone", key: "phone", width: 16 },
  { header: "WhatsApp", key: "whatsapp", width: 16 },
  { header: "Status", key: "status", width: 10 },
];

export const exportTeachersExcel = async (req, res) => {
  const rows = await Teacher.find().sort({ name: 1 }).lean();
  const workbook = await buildWorkbook("Teachers Report", teacherColumns, rows);
  await sendWorkbook(res, workbook, "Teachers.xlsx");
};

export const exportTeachersWord = async (req, res) => {
  const settings = await SchoolSettings.getSettings();
  const rows = await Teacher.find().sort({ name: 1 }).lean();
  const doc = new Document({
    sections: [{ children: [...buildDocxHeader(settings, "Teachers Report"), buildDocxTable(teacherColumns, rows)] }],
  });
  await sendDocx(res, doc, "Teachers.docx");
};

// ---------- ATTENDANCE ----------
const attendanceColumns = [
  { header: "Registration No", key: "registrationNumber", width: 18 },
  { header: "Name", key: "name", width: 20 },
  { header: "Class", key: "class", width: 10 },
  { header: "Date", key: "date", width: 14 },
  { header: "Status", key: "status", width: 12 },
];

async function fetchAttendanceRows(query) {
  const records = await Attendance.find(query).populate("student", "name registrationNumber").lean();
  return records.map((r) => ({
    registrationNumber: r.student?.registrationNumber,
    name: r.student?.name,
    class: r.class,
    date: new Date(r.date).toDateString(),
    status: r.status,
  }));
}

export const exportAttendanceExcel = async (req, res) => {
  const { class: className, from, to } = req.query;
  const query = {};
  if (className) query.class = className;
  if (from || to) query.date = { ...(from && { $gte: new Date(from) }), ...(to && { $lte: new Date(to) }) };
  const rows = await fetchAttendanceRows(query);
  const workbook = await buildWorkbook("Attendance Report", attendanceColumns, rows);
  await sendWorkbook(res, workbook, "Attendance.xlsx");
};

export const exportAttendanceWord = async (req, res) => {
  const { class: className, from, to } = req.query;
  const query = {};
  if (className) query.class = className;
  if (from || to) query.date = { ...(from && { $gte: new Date(from) }), ...(to && { $lte: new Date(to) }) };
  const settings = await SchoolSettings.getSettings();
  const rows = await fetchAttendanceRows(query);
  const doc = new Document({
    sections: [{ children: [...buildDocxHeader(settings, "Attendance Report"), buildDocxTable(attendanceColumns, rows)] }],
  });
  await sendDocx(res, doc, "Attendance.docx");
};

// ---------- FEES ----------
const feeColumns = [
  { header: "Challan No", key: "challanNumber", width: 20 },
  { header: "Student", key: "name", width: 20 },
  { header: "Registration No", key: "registrationNumber", width: 18 },
  { header: "Class", key: "class", width: 10 },
  { header: "Month", key: "billingMonth", width: 16 },
  { header: "Total Amount", key: "totalAmount", width: 14 },
  { header: "Paid", key: "paidAmount", width: 12 },
  { header: "Remaining", key: "remainingAmount", width: 14 },
  { header: "Status", key: "paymentStatus", width: 12 },
];

async function fetchFeeRows(query) {
  const challans = await FeeChallan.find(query).populate("student", "name registrationNumber").lean();
  return challans.map((c) => ({
    challanNumber: c.challanNumber,
    name: c.student?.name,
    registrationNumber: c.student?.registrationNumber,
    class: c.class,
    billingMonth: c.billingMonth,
    totalAmount: c.totalAmount,
    paidAmount: c.paidAmount,
    remainingAmount: c.remainingAmount,
    paymentStatus: c.paymentStatus,
  }));
}

export const exportFeesExcel = async (req, res) => {
  const { class: className, status } = req.query;
  const query = {};
  if (className) query.class = className;
  if (status) query.paymentStatus = status;
  const rows = await fetchFeeRows(query);
  const workbook = await buildWorkbook("Fees Report", feeColumns, rows);
  await sendWorkbook(res, workbook, "Fees.xlsx");
};

export const exportFeesWord = async (req, res) => {
  const { class: className, status } = req.query;
  const query = {};
  if (className) query.class = className;
  if (status) query.paymentStatus = status;
  const settings = await SchoolSettings.getSettings();
  const rows = await fetchFeeRows(query);
  const doc = new Document({
    sections: [{ children: [...buildDocxHeader(settings, "Fees Report"), buildDocxTable(feeColumns, rows)] }],
  });
  await sendDocx(res, doc, "Fees.docx");
};

// ---------- RESULTS ----------
const resultColumns = [
  { header: "Registration No", key: "registrationNumber", width: 18 },
  { header: "Student", key: "name", width: 20 },
  { header: "Class", key: "class", width: 10 },
  { header: "Total Marks", key: "totalMarks", width: 14 },
  { header: "Obtained", key: "obtainedMarks", width: 12 },
  { header: "Percentage", key: "percentage", width: 12 },
  { header: "Grade", key: "grade", width: 10 },
  { header: "Position", key: "position", width: 10 },
  { header: "Status", key: "status", width: 10 },
];

async function fetchResultRows(query) {
  const results = await Result.find(query).populate("student", "name registrationNumber").sort({ position: 1 }).lean();
  return results.map((r) => ({
    registrationNumber: r.student?.registrationNumber,
    name: r.student?.name,
    class: r.class,
    totalMarks: r.totalMarks,
    obtainedMarks: r.obtainedMarks,
    percentage: r.percentage,
    grade: r.grade,
    position: r.position,
    status: r.status,
  }));
}

export const exportResultsExcel = async (req, res) => {
  const { exam, class: className } = req.query;
  const query = {};
  if (exam) query.exam = exam;
  if (className) query.class = className;
  const rows = await fetchResultRows(query);
  const workbook = await buildWorkbook("Results Report", resultColumns, rows);
  await sendWorkbook(res, workbook, "Results.xlsx");
};

export const exportResultsWord = async (req, res) => {
  const { exam, class: className } = req.query;
  const query = {};
  if (exam) query.exam = exam;
  if (className) query.class = className;
  const settings = await SchoolSettings.getSettings();
  const rows = await fetchResultRows(query);
  const doc = new Document({
    sections: [{ children: [...buildDocxHeader(settings, "Results Report"), buildDocxTable(resultColumns, rows)] }],
  });
  await sendDocx(res, doc, "Results.docx");
};

// ---------- ACCOUNTING / PROFIT & LOSS ----------
export const getAccountingStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Default to last 12 months if no dates provided
    let start = new Date();
    start.setMonth(start.getMonth() - 11);
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    
    let end = new Date();
    end.setHours(23, 59, 59, 999);

    if (startDate) start = new Date(startDate);
    if (endDate) end = new Date(endDate);

    // 1. Fetch Income (Fees collected)
    const fees = await FeeChallan.find({ 
      paymentDate: { $gte: start, $lte: end },
      paidAmount: { $gt: 0 }
    });

    // 2. Fetch Expenses (Misc)
    const expenses = await Expense.find({
      date: { $gte: start, $lte: end }
    });

    // 3. Fetch Payroll (Paid Salaries)
    // Payroll uses 'paymentDate' when paid
    const payrolls = await Payroll.find({
      paymentDate: { $gte: start, $lte: end },
      status: "Paid"
    });

    // Aggregate monthly data
    const monthlyMap = {};

    // Initialize months in range to ensure 0 values for empty months
    let curr = new Date(start);
    curr.setDate(1); // Set to 1st of month to avoid skipping months
    const endBound = new Date(end);
    
    while (curr <= endBound) {
      const monthKey = curr.toISOString().substring(0, 7); // YYYY-MM
      const monthName = curr.toLocaleString("default", { month: "short", year: "numeric" });
      monthlyMap[monthKey] = {
        name: monthName,
        sortKey: monthKey,
        income: 0,
        expense: 0,
        payroll: 0,
        profit: 0
      };
      curr.setMonth(curr.getMonth() + 1);
    }

    // Process Fees
    fees.forEach(f => {
      if (!f.paymentDate) return;
      const key = f.paymentDate.toISOString().substring(0, 7);
      if (monthlyMap[key]) monthlyMap[key].income += f.paidAmount;
    });

    // Process Expenses
    expenses.forEach(e => {
      if (!e.date) return;
      const key = e.date.toISOString().substring(0, 7);
      if (monthlyMap[key]) monthlyMap[key].expense += e.amount;
    });

    // Process Payroll
    payrolls.forEach(p => {
      if (!p.paymentDate) return;
      const key = p.paymentDate.toISOString().substring(0, 7);
      if (monthlyMap[key]) monthlyMap[key].payroll += p.netSalary;
    });

    // Calculate profit and format array
    const monthlyData = Object.values(monthlyMap)
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .map(m => {
        m.totalExpense = m.expense + m.payroll;
        m.profit = m.income - m.totalExpense;
        return m;
      });

    // Aggregate overall stats
    const totalIncome = monthlyData.reduce((sum, m) => sum + m.income, 0);
    const totalMiscExpense = monthlyData.reduce((sum, m) => sum + m.expense, 0);
    const totalPayroll = monthlyData.reduce((sum, m) => sum + m.payroll, 0);
    const totalExpense = totalMiscExpense + totalPayroll;
    const netProfit = totalIncome - totalExpense;
    const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : 0;

    // Aggregate expense breakdown by category for Pie Chart
    const categoryMap = {};
    expenses.forEach(e => {
      categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
    });
    // Add payroll as a category
    if (totalPayroll > 0) {
      categoryMap["Teacher Salaries"] = totalPayroll;
    }

    const expenseBreakdown = Object.keys(categoryMap).map(key => ({
      name: key,
      value: categoryMap[key]
    })).sort((a, b) => b.value - a.value);

    res.json({
      monthlyData,
      summary: {
        totalIncome,
        totalMiscExpense,
        totalPayroll,
        totalExpense,
        netProfit,
        profitMargin
      },
      expenseBreakdown
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error generating accounting stats" });
  }
};
