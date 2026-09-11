import Payroll from "../models/Payroll.js";
import Teacher from "../models/Teacher.js";

// @route   GET /api/payroll
// @desc    Get all payrolls for a month combined with all active teachers
export const getPayrolls = async (req, res) => {
  try {
    const { month } = req.query;
    if (!month) return res.status(400).json({ message: "Month is required" });

    // Fetch all active teachers
    const teachers = await Teacher.find({ status: "Active" }).sort({ name: 1 });
    
    // Fetch all existing payrolls for this month
    const payrolls = await Payroll.find({ month }).populate("teacher", "name teacherId assignedClass");
    const payrollMap = {};
    payrolls.forEach(p => { payrollMap[p.teacher._id.toString()] = p; });

    // Combine them
    const combined = teachers.map(teacher => {
      const existing = payrollMap[teacher._id.toString()];
      if (existing) return existing;
      
      // Default structure if not exists yet
      return {
        _id: null,
        teacher: { _id: teacher._id, name: teacher.name, teacherId: teacher.teacherId, assignedClass: teacher.assignedClass },
        month,
        baseSalary: teacher.baseSalary || 0,
        allowances: 0,
        deductions: 0,
        advanceDeduction: 0,
        netSalary: teacher.baseSalary || 0,
        status: "Pending",
        remarks: ""
      };
    });

    res.json(combined);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/payroll
// @desc    Create or update payroll record
export const savePayroll = async (req, res) => {
  try {
    const { teacherId, month, baseSalary, allowances, deductions, advanceDeduction, remarks, status } = req.body;
    
    const netSalary = Number(baseSalary) + Number(allowances) - Number(deductions) - Number(advanceDeduction);
    const updateData = {
      baseSalary, allowances, deductions, advanceDeduction, netSalary, remarks, status
    };

    if (status === "Paid") {
      updateData.paymentDate = new Date();
    }

    const payroll = await Payroll.findOneAndUpdate(
      { teacher: teacherId, month },
      updateData,
      { new: true, upsert: true }
    ).populate("teacher", "name teacherId assignedClass");

    res.json(payroll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
