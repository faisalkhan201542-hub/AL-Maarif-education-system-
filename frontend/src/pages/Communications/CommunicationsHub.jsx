import { useState, useEffect } from "react";
import api from "../../api/axios.js";
import WhatsAppDispatchQueue from "../../components/WhatsAppDispatchQueue.jsx";
import PageHeader from "../../components/PageHeader.jsx";

const CommunicationsHub = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [messageTemplate, setMessageTemplate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [queueOpen, setQueueOpen] = useState(false);
  const [dispatchItems, setDispatchItems] = useState([]);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const { data } = await api.get("/api/classes");
      if (data && Array.isArray(data)) {
        setClasses(data.map(c => c.name));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartSending = async () => {
    if (!selectedClass || !messageTemplate) {
      setError("Please select a class and enter a message.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/api/communications/class-contacts?class=${selectedClass}`);
      
      if (data.length === 0) {
        setError(`No active students found in class ${selectedClass}.`);
        setLoading(false);
        return;
      }

      // Generate personalized messages for the queue
      const items = data.map(student => {
        // Simple template replacement
        let personalizedMsg = messageTemplate
          .replace(/{{name}}/g, student.name)
          .replace(/{{fatherName}}/g, student.fatherName)
          .replace(/{{regNo}}/g, student.registrationNumber || "");

        return {
          name: student.name,
          phone: student.fatherWhatsapp,
          message: personalizedMsg
        };
      });

      setDispatchItems(items);
      setQueueOpen(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load class contacts");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4">
      <PageHeader 
        title="Communications Hub"
        subtitle="Send bulk announcements and alerts to parents via WhatsApp."
        className="from-blue-500 via-cyan-500 to-teal-500 mb-8"
      />

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
        <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100 border-b pb-2">Class Announcement</h2>
        
        {error && (
          <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Target Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="input md:w-1/2"
            >
              <option value="">Select a Class</option>
              {classes.map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Message Template
            </label>
            <textarea
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e.target.value)}
              rows="6"
              className="input resize-none"
              placeholder="Dear Parent, this is an important announcement regarding..."
            ></textarea>
            <div className="mt-2 text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">
              <span className="font-medium text-slate-700 dark:text-slate-300">Available variables: </span>
              <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-primary-600">{"{{name}}"}</code>, 
              <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-primary-600 ml-1">{"{{fatherName}}"}</code>, 
              <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-primary-600 ml-1">{"{{regNo}}"}</code>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleStartSending}
              disabled={loading}
              className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 shadow-md shadow-primary-500/20"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
              )}
              Start Bulk Dispatch
            </button>
            <p className="text-xs text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-3 max-w-lg">
              Note: This will open a queue where you can safely send messages one-by-one via WhatsApp Web to avoid being blocked for spam.
            </p>
          </div>
        </div>
      </div>

      <WhatsAppDispatchQueue 
        open={queueOpen}
        onClose={() => setQueueOpen(false)}
        items={dispatchItems}
        title={`Class ${selectedClass} Announcement`}
      />
    </div>
  );
};

export default CommunicationsHub;
