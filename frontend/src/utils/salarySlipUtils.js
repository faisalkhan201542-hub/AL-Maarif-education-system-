import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateSalarySlipPDF = async (payroll, settings) => {
  const doc = new jsPDF();
  const schoolName = settings?.schoolName || "Al-Maarif Education";
  const address = settings?.address || "School Address";
  const phone = settings?.phone || "Phone";
  const logoUrl = settings?.logoUrl || "";

  // Helper to add centered text
  const addCenteredText = (text, y, fontSize, fontStyle = "normal", color = [0, 0, 0]) => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", fontStyle);
    doc.setTextColor(color[0], color[1], color[2]);
    const w = doc.getStringUnitWidth(text) * fontSize / doc.internal.scaleFactor;
    const x = (doc.internal.pageSize.width - w) / 2;
    doc.text(text, x, y);
  };

  let y = 15;

  // Header / Logo
  try {
    if (logoUrl) {
      const img = new Image();
      img.src = logoUrl.startsWith("data:") 
        ? logoUrl 
        : (logoUrl.startsWith("http") ? logoUrl : (import.meta.env.VITE_API_URL || "http://localhost:5000") + logoUrl);
      await new Promise((resolve) => {
        img.onload = () => {
          doc.addImage(img, "PNG", 15, y, 20, 20);
          resolve();
        };
        img.onerror = resolve; // Continue if logo fails
      });
    }
  } catch (e) {
    console.error("Logo load error", e);
  }

  // School Name
  addCenteredText(schoolName, y + 8, 22, "bold", [244, 63, 94]); // Rose 500
  addCenteredText(address, y + 14, 10, "normal", [100, 116, 139]);
  addCenteredText(`Phone: ${phone}`, y + 19, 10, "normal", [100, 116, 139]);
  
  y += 28;
  
  // Title
  addCenteredText("SALARY SLIP", y, 16, "bold", [30, 41, 59]);
  addCenteredText(`For the Month of ${payroll.month}`, y + 6, 12, "normal", [100, 116, 139]);

  y += 15;

  // Employee Details
  autoTable(doc, {
    startY: y,
    theme: "plain",
    styles: { fontSize: 11, cellPadding: 2, textColor: [30, 41, 59] },
    body: [
      [{ content: "Employee Details", colSpan: 2, styles: { fontStyle: "bold", fontSize: 12, textColor: [244, 63, 94] } }],
      ["Employee Name:", payroll.teacher?.name || "N/A"],
      ["Employee ID:", payroll.teacher?.teacherId || "N/A"],
      ["Designation:", payroll.teacher?.assignedClass ? `Teacher (Class ${payroll.teacher.assignedClass})` : "Teacher"],
      ["Payment Status:", payroll.status],
      ["Payment Date:", payroll.paymentDate ? new Date(payroll.paymentDate).toLocaleDateString() : "-"],
    ],
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 40 },
      1: { cellWidth: "auto" }
    },
    margin: { left: 15 }
  });

  y = doc.lastAutoTable.finalY + 10;

  // Earnings & Deductions
  autoTable(doc, {
    startY: y,
    theme: "grid",
    headStyles: { fillColor: [244, 63, 94], textColor: 255, fontStyle: "bold", halign: "center" },
    bodyStyles: { textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    head: [["Earnings", "Amount (Rs)", "Deductions", "Amount (Rs)"]],
    body: [
      ["Basic Salary", payroll.baseSalary.toLocaleString(), "Leaves/Other Deductions", payroll.deductions.toLocaleString()],
      ["Allowances", payroll.allowances.toLocaleString(), "Advance Deduction", payroll.advanceDeduction.toLocaleString()],
      ["", "", "", ""],
      [
        { content: "Total Earnings", styles: { fontStyle: "bold" } }, 
        { content: (payroll.baseSalary + payroll.allowances).toLocaleString(), styles: { fontStyle: "bold" } }, 
        { content: "Total Deductions", styles: { fontStyle: "bold" } }, 
        { content: (payroll.deductions + payroll.advanceDeduction).toLocaleString(), styles: { fontStyle: "bold" } }
      ]
    ],
    margin: { left: 15, right: 15 }
  });

  y = doc.lastAutoTable.finalY + 10;

  // Net Pay
  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(15, y, doc.internal.pageSize.width - 30, 12, "F");
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("NET PAY:", 20, y + 8);
  
  doc.setTextColor(244, 63, 94); // Rose 500
  doc.text(`Rs ${payroll.netSalary.toLocaleString()}/-`, doc.internal.pageSize.width - 20, y + 8, { align: "right" });

  if (payroll.remarks) {
    y += 20;
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 116, 139);
    doc.text(`Remarks: ${payroll.remarks}`, 15, y);
  }

  // Signatures
  y = doc.internal.pageSize.height - 40;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 41, 59);

  doc.setDrawColor(203, 213, 225); // slate-300
  
  // Employee Signature
  doc.line(20, y, 70, y);
  doc.text("Employee Signature", 30, y + 5);

  // Admin Signature
  doc.line(doc.internal.pageSize.width - 70, y, doc.internal.pageSize.width - 20, y);
  doc.text("Authorized Signature", doc.internal.pageSize.width - 60, y + 5);

  doc.save(`Salary_Slip_${payroll.teacher?.name.replace(/ /g, "_")}_${payroll.month}.pdf`);
};
