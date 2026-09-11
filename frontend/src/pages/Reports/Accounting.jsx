import { useEffect, useState } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Wallet,
  Calendar
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";

const COLORS = ['#0ea5e9', '#f43f5e', '#8b5cf6', '#f59e0b', '#10b981', '#64748b'];

export default function Accounting() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchStats = async () => {
    try {
      setLoading(true);
      let query = "";
      if (startDate && endDate) {
        query = `?startDate=${startDate}&endDate=${endDate}`;
      }
      const res = await api.get(`/api/reports/accounting/stats${query}`);
      setData(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchStats();
  };

  if (loading && !data) return <Loader />;

  const { monthlyData, summary, expenseBreakdown } = data;

  const formatCurrency = (val) => `Rs ${val.toLocaleString()}`;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Accounting & Khata</h1>
          <p className="text-sm text-slate-500">Track your school's income, expenses, and profit.</p>
        </div>

        <form onSubmit={handleFilter} className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <span className="text-slate-400">to</span>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Filter
          </button>
        </form>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl relative z-10">
            <TrendingUp size={24} strokeWidth={2.5} />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-medium text-slate-500 mb-1">Total Income (Fees)</p>
            <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(summary.totalIncome)}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-rose-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
          <div className="p-3 bg-rose-100 text-rose-600 rounded-xl relative z-10">
            <TrendingDown size={24} strokeWidth={2.5} />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-medium text-slate-500 mb-1">Total Expenses</p>
            <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(summary.totalExpense)}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
          <div className="p-3 bg-primary-100 text-primary-600 rounded-xl relative z-10">
            <Wallet size={24} strokeWidth={2.5} />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-medium text-slate-500 mb-1">Net Profit</p>
            <h3 className={`text-2xl font-bold ${summary.netProfit >= 0 ? 'text-primary-700' : 'text-rose-600'}`}>
              {formatCurrency(summary.netProfit)}
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
          <div className="p-3 bg-amber-100 text-amber-600 rounded-xl relative z-10">
            <DollarSign size={24} strokeWidth={2.5} />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-medium text-slate-500 mb-1">Profit Margin</p>
            <h3 className="text-2xl font-bold text-slate-800">{summary.profitMargin}%</h3>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Bar Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Income vs Expenses (Monthly)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => `Rs ${val/1000}k`} />
                <RechartsTooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'}}
                  formatter={(value) => formatCurrency(value)}
                />
                <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="totalExpense" name="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Breakdown Pie Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Expense Breakdown</h3>
          <p className="text-xs text-slate-500 mb-6">Where is the money going?</p>
          
          {expenseBreakdown.length > 0 ? (
            <div className="flex-1 flex flex-col">
              <div className="h-48 w-full mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {expenseBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Custom Legend */}
              <div className="space-y-3 mt-auto">
                {expenseBreakdown.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span className="text-sm font-medium text-slate-700">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
              No expenses recorded in this period.
            </div>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-800">Monthly Statement</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Month</th>
                <th className="px-6 py-4 font-semibold">Income (Fees)</th>
                <th className="px-6 py-4 font-semibold">Salaries Paid</th>
                <th className="px-6 py-4 font-semibold">Misc Expenses</th>
                <th className="px-6 py-4 font-semibold text-right">Net Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {monthlyData.slice().reverse().map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{m.name}</td>
                  <td className="px-6 py-4 text-emerald-600 font-medium">{formatCurrency(m.income)}</td>
                  <td className="px-6 py-4 text-rose-500 font-medium">{formatCurrency(m.payroll)}</td>
                  <td className="px-6 py-4 text-rose-500 font-medium">{formatCurrency(m.expense)}</td>
                  <td className={`px-6 py-4 font-bold text-right ${m.profit >= 0 ? 'text-primary-600' : 'text-rose-600'}`}>
                    {formatCurrency(m.profit)}
                  </td>
                </tr>
              ))}
              {monthlyData.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                    No data available for the selected period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
