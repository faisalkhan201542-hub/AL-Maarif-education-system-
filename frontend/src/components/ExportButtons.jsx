import React, { useState, useEffect } from "react";
import { Download, FileText, Sheet } from "lucide-react";
import { exportToPDF, exportToExcel } from "../utils/exportUtils";
import api from "../api/axios";

export default function ExportButtons({ data, columns, title, filename, fetchData }) {
  const [settings, setSettings] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get("/api/settings");
        setSettings(res.data);
      } catch (err) {
        console.error("Failed to fetch settings for export:", err);
      }
    };
    fetchSettings();
  }, []);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const exportData = fetchData ? await fetchData() : data;
      exportToPDF(exportData, columns, title, filename, settings);
    } catch (err) {
      console.error("PDF Export Error:", err);
    }
    setIsExporting(false);
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const exportData = fetchData ? await fetchData() : data;
      await exportToExcel(exportData, columns, title, filename, settings);
    } catch (err) {
      console.error("Excel Export Error:", err);
    }
    setIsExporting(false);
  };

  const disabled = isExporting || (!fetchData && (!data || data.length === 0));

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleExportPDF}
        disabled={disabled}
        className="px-3 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg shadow-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 text-sm"
        title="Export to PDF"
      >
        <FileText size={16} />
        <span className="hidden sm:inline">PDF</span>
      </button>
      <button
        onClick={handleExportExcel}
        disabled={disabled}
        className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg shadow-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 text-sm"
        title="Export to Excel"
      >
        <Sheet size={16} />
        <span className="hidden sm:inline">Excel</span>
      </button>
    </div>
  );
}
