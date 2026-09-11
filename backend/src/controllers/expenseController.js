import Expense from "../models/Expense.js";

// @desc Get all expenses (with pagination and filters)
// @route GET /api/expenses
export const getExpenses = async (req, res) => {
  const { page = 1, limit = 20, category, search, month } = req.query;
  const query = {};

  if (category) query.category = category;
  
  if (search) {
    query.$or = [
      { title: new RegExp(search, "i") },
      { description: new RegExp(search, "i") }
    ];
  }

  if (month) { // Format: YYYY-MM
    const startDate = new Date(`${month}-01T00:00:00.000Z`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    query.date = { $gte: startDate, $lt: endDate };
  }

  const pageNum = Math.max(parseInt(page, 10), 1);
  const limitNum = Math.min(parseInt(limit, 10) || 20, 500);

  const [expenses, total, sumAgg] = await Promise.all([
    Expense.find(query)
      .sort({ date: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Expense.countDocuments(query),
    Expense.aggregate([
      { $match: query },
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
    ])
  ]);

  res.json({
    expenses,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
    totalAmount: sumAgg[0]?.totalAmount || 0
  });
};

// @desc Create a new expense
// @route POST /api/expenses
export const createExpense = async (req, res) => {
  const { title, amount, date, category, description } = req.body;

  if (!title || !amount || !category) {
    return res.status(400).json({ message: "Please provide title, amount and category." });
  }

  const expense = await Expense.create({
    title,
    amount: Number(amount),
    date: date || Date.now(),
    category,
    description: description || "",
    recordedBy: req.principal?.name || "Admin"
  });

  res.status(201).json(expense);
};

// @desc Delete an expense
// @route DELETE /api/expenses/:id
export const deleteExpense = async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  if (!expense) return res.status(404).json({ message: "Expense not found" });

  await expense.deleteOne();
  res.json({ message: "Expense deleted successfully" });
};
