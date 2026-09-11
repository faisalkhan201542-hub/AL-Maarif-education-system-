import { useState, useEffect } from "react";
import { Plus, Search, Trash2, ReceiptText, Filter } from "lucide-react";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import ExportButtons from "../../components/ExportButtons.jsx";
import { toast } from "react-hot-toast";
import { fmtDate, fmtMoney } from "../../utils/format.js";

const CATEGORIES = ["Salary", "Electricity", "Maintenance", "Office Supplies", "Rent", "Other"];

export default function ExpenseList() {
  const [expenses, setExpenses] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  
  // Date filtering by month. Default to current month YYYY-MM
  const d = new Date();
  const currentMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  const [month, setMonth] = useState(currentMonth);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    category: "Other",
    description: "",
  });

  const loadExpenses = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (category) params.append("category", category);
    if (month) params.append("month", month);

    api.get(`/api/expenses?${params.toString()}`)
      .then((res) => {
        setExpenses(res.data.expenses);
        setTotalAmount(res.data.totalAmount);
      })
      .catch((err) => toast.error(err.response?.data?.message || "Failed to load expenses"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadExpenses(); }, [search, category, month]);

  const exportColumns = [
    { header: "Date", key: "date", render: (r) => fmtDate(r.date) },
    { header: "Title", key: "title" },
    { header: "Category", key: "category" },
    { header: "Amount (Rs)", key: "amount" },
    { header: "Added By", key: "addedBy", render: (r) => r.addedBy?.name || "System" }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/expenses", formData);
      toast.success("Expense added successfully");
      setShowModal(false);
      loadExpenses();
      setFormData({
        title: "", amount: "", date: new Date().toISOString().split("T")[0], category: "Other", description: ""
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add expense");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    try {
      await api.delete(`/api/expenses/${id}`);
      toast.success("Expense deleted");
      loadExpenses();
    } catch (err) {
      toast.error("Failed to delete expense");
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader 
        title="Expense Tracking"
        subtitle="Manage and track school expenses"
        className="from-rose-600 via-red-600 to-orange-600"
        rightElement={
          <div className="flex items-center gap-2">
            <ExportButtons 
              data={expenses} 
              columns={exportColumns} 
              title={`Expenses (${month || 'All Time'})`} 
              filename={`Expenses_${month || "All"}`} 
            />
            <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-white text-rose-600 hover:bg-rose-50 rounded-lg shadow-sm font-bold flex items-center gap-2 transition-colors w-full md:w-auto">
              <Plus size={18} /> Add Expense
            </button>
          </div>
        }
      />

      <div className="card grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border-l-4 border-l-red-500 bg-red-50/50">
        <div className="md:col-span-1 border-r border-red-200">
          <p className="text-sm font-medium text-red-800">Total Expenses ({month || 'All Time'})</p>
          <h2 className="text-3xl font-bold text-red-600 mt-1">{fmtMoney(totalAmount)}</h2>
        </div>
        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Search expenses..."
              className="input pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-2.5 text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500" size={18} />
            <select
              className="input pl-10"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <input
            type="month"
            className="input"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400 dark:text-slate-500">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 uppercase">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center"><Loader /></td></tr>
              ) : expenses.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400 dark:text-slate-500">No expenses found</td></tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense._id} className="hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-4">{fmtDate(expense.date)}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{expense.title}</div>
                      {expense.description && <div className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">{expense.description}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 rounded text-xs font-medium border border-slate-200 dark:border-slate-700">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-red-600">
                      {fmtMoney(expense.amount)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDelete(expense._id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md animate-scale-up overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Add New Expense</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:text-slate-500 text-2xl leading-none">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title *</label>
                <input required type="text" className="input" placeholder="e.g. Electric Bill for June" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount (Rs) *</label>
                  <input required type="number" min="0" className="input" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date *</label>
                  <input required type="date" className="input" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category *</label>
                <select required className="input" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description (Optional)</label>
                <textarea className="input text-sm" rows="2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>
              
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
