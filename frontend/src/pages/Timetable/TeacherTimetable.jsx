import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, UserSearch, Clock, BookOpen, Building } from "lucide-react";
import api from "../../api/axios.js";
import toast from "react-hot-toast";
import PageHeader from "../../components/PageHeader.jsx";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

const getSubjectColor = (subject) => {
  if (!subject) return 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500';
  const s = subject.toLowerCase();
  if (s.includes('urdu') || s.includes('english') || s.includes('language') || s.includes('qaida') || s.includes('rhyming')) 
    return 'bg-[#e8f1f7] text-[#4a789c] border-[#4a789c]/20'; 
  if (s.includes('math')) 
    return 'bg-[#eef5ec] text-[#558b5e] border-[#558b5e]/20'; 
  if (s.includes('islam') || s.includes('nazira') || s.includes('hifz') || s.includes('nisab') || s.includes('quran')) 
    return 'bg-[#f3ebf8] text-[#7c57a5] border-[#7c57a5]/20'; 
  if (s.includes('science') || s.includes('g.k') || s.includes('history') || s.includes('arabic')) 
    return 'bg-[#fdf1e4] text-[#b37747] border-[#b37747]/20'; 
  if (s.includes('draw') || s.includes('art')) 
    return 'bg-[#faeaef] text-[#ab4b6d] border-[#ab4b6d]/20'; 
  if (s.includes('break')) 
    return 'bg-[#fdf6e1] text-[#b28e46] border-[#b28e46]/20'; 
  return 'bg-blue-50 text-blue-700 border-blue-200'; 
};

export default function TeacherTimetable() {
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    if (selectedTeacher) {
      fetchTeacherTimetable(selectedTeacher);
    } else {
      setTimetable([]);
    }
  }, [selectedTeacher]);

  const fetchTeachers = async () => {
    try {
      const { data } = await api.get('/api/teachers');
      setTeachers(data);
    } catch (err) {
      toast.error("Failed to load teachers");
    }
  };

  const fetchTeacherTimetable = async (teacherId) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/timetable?teacher=${teacherId}`);
      setTimetable(data);
    } catch (err) {
      toast.error("Failed to load teacher's timetable");
    } finally {
      setLoading(false);
    }
  };

  // Helper to get period data for a specific day and period number
  const getPeriodData = (day, periodNum) => {
    return timetable.find(t => t.day === day && t.periodNumber === periodNum);
  };

  const teacherDetails = teachers.find(t => t._id === selectedTeacher);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-800 p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary-50 dark:bg-primary-900/30 text-primary-600 rounded-xl">
            <Clock size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Teacher's Timetable</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">View weekly schedule for a specific teacher</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <UserSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 appearance-none outline-none transition-all"
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
            >
              <option value="">-- Select Teacher --</option>
              {teachers.map(t => (
                <option key={t._id} value={t._id}>{t.name} ({t.teacherId})</option>
              ))}
            </select>
          </div>
          <Link 
            to="/timetable" 
            className="btn-outline flex items-center justify-center gap-2 w-full sm:w-auto whitespace-nowrap"
          >
            <ArrowLeft size={16} />
            Class View
          </Link>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {!loading && selectedTeacher && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-primary-600 to-primary-800 p-6 rounded-2xl shadow-md text-white">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center font-bold text-2xl shadow-inner border border-white/30">
                {teacherDetails?.name?.charAt(0) || "T"}
              </div>
              <div>
                <h2 className="text-xl font-bold">{teacherDetails?.name}</h2>
                <p className="text-primary-100 font-medium text-sm flex items-center gap-2 mt-1">
                  <span className="bg-white/20 px-2 py-0.5 rounded text-xs">{teacherDetails?.teacherId}</span>
                  • {timetable.length} Classes / Week
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                    <th className="p-4 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-700 w-32 sticky left-0 bg-slate-50 dark:bg-slate-900 z-10 shadow-[1px_0_0_0_#f1f5f9] dark:shadow-[1px_0_0_0_#334155]">Day / Period</th>
                    {PERIODS.map(num => (
                      <th key={num} className="p-4 font-bold text-slate-700 dark:text-slate-300 text-center border-r border-slate-100 dark:border-slate-700 last:border-0 min-w-[160px]">
                        Period {num}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DAYS.map(day => (
                    <tr key={day} className="border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-4 font-bold text-slate-800 dark:text-slate-200 border-r border-slate-100 dark:border-slate-700 sticky left-0 bg-white dark:bg-slate-800 z-10 shadow-[1px_0_0_0_#f1f5f9] dark:shadow-[1px_0_0_0_#334155]">
                        {day}
                      </td>
                      {PERIODS.map(num => {
                        const period = getPeriodData(day, num);
                        return (
                          <td key={num} className="p-3 border-r border-slate-50 dark:border-slate-700 last:border-0 align-top">
                            {period ? (
                              <div className={`p-3.5 rounded-xl border flex flex-col gap-2 h-full min-h-[90px] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group ${getSubjectColor(period.subject)}`}>
                                <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 dark:bg-black/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                                <div className="flex flex-col gap-1 z-10">
                                  <span className="font-extrabold text-[15px] leading-tight">{period.subject}</span>
                                  <span className="text-[11px] bg-white/60 dark:bg-black/20 px-2 py-0.5 rounded-md font-bold w-max shadow-sm">
                                    {period.startTime.replace(/( AM| PM)/, 'am').replace(' AM', 'am').replace(' PM', 'pm')} - {period.endTime.replace(/( AM| PM)/, 'am').replace(' AM', 'am').replace(' PM', 'pm')}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 mt-auto text-[13px] font-bold z-10">
                                  <Building size={14} className="opacity-80" /> Class {period.class}
                                </div>
                              </div>
                            ) : (
                              <div className="h-full min-h-[90px] rounded-xl border border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 text-xs font-semibold bg-slate-50/50 dark:bg-slate-800/30">
                                Free
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {!loading && !selectedTeacher && (
        <div className="py-20 text-center flex flex-col items-center opacity-60">
          <Clock size={64} className="text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-xl font-bold text-slate-500 dark:text-slate-400">Select a Teacher</h3>
          <p className="text-slate-400 dark:text-slate-500">Choose a teacher from the dropdown above to view their weekly class schedule.</p>
        </div>
      )}
    </div>
  );
}
