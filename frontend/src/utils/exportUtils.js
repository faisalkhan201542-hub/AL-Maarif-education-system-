import jsPDF from "jspdf";
import "jspdf-autotable";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import dayjs from "dayjs";

/**
 * Helper to fetch settings safely if not provided
 */
const getSettings = (settings) => {
  return {
    schoolName: settings?.schoolName || "Al-Maarif Education",
    address: settings?.address || "512, Near Professor Colony",
    schoolPhone: settings?.schoolPhone || "+923139163732",
    schoolEmail: settings?.schoolEmail || "info@almaarifeducation.edu.pk"
  };
};

/**
 * Export data to PDF using jsPDF and jspdf-autotable
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Array of objects { header: "Header Name", key: "dataKey" }
 * @param {String} title - Title of the document
 * @param {String} filename - Name of the file to save
 * @param {Object} settings - School settings object
 */
export const exportToPDF = (data, columns, title, filename, settings = null) => {
  const doc = new jsPDF("p", "pt", "a4");
  const school = getSettings(settings);
  
  // Header Colors
  const primaryColor = [244, 63, 94]; // Rose 500

  // 1. Add School Header
  doc.setFontSize(22);
  doc.setTextColor(...primaryColor);
  doc.setFont("helvetica", "bold");
  doc.text(school.schoolName, 40, 40);

  // 2. Add School Details
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  doc.text(school.address, 40, 56);
  doc.text(`Phone: ${school.schoolPhone} | Email: ${school.schoolEmail}`, 40, 70);

  // 3. Add Document Title and Date
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.setFont("helvetica", "bold");
  doc.text(title, 40, 100);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.text(`Generated on: ${dayjs().format("DD MMM YYYY, hh:mm A")}`, 40, 115);

  // 4. Prepare Table Data
  const tableData = data.map(item => {
    return columns.map(col => {
      let val = item[col.key];
      // Check if there is a custom render function in the column config (for simple exports)
      if (col.render) {
         val = col.render(item);
      }
      return val !== undefined && val !== null ? String(val) : "";
    });
  });

  const tableHeaders = columns.map(col => col.header);

  // 5. Draw Table
  doc.autoTable({
    startY: 130,
    head: [tableHeaders],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 6,
    },
    headStyles: {
      fillColor: primaryColor,
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250]
    },
    margin: { top: 40, left: 40, right: 40, bottom: 40 },
  });

  // 6. Save
  doc.save(`${filename}_${dayjs().format("YYYYMMDD")}.pdf`);
};

/**
 * Export data to Excel using ExcelJS for professional styling
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Array of objects { header: "Header Name", key: "dataKey" }
 * @param {String} title - Document title
 * @param {String} filename - Name of the file to save
 * @param {Object} settings - School settings object
 */
export const exportToExcel = async (data, columns, title, filename, settings = null) => {
  const school = getSettings(settings);
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Data");

  // Merge columns for header based on total column count
  const lastColLetter = String.fromCharCode(65 + Math.min(columns.length - 1, 25)); // Supports up to Z
  const headerRange = `A1:${lastColLetter}1`;
  const addressRange = `A2:${lastColLetter}2`;
  const contactRange = `A3:${lastColLetter}3`;
  const titleRange = `A5:${lastColLetter}5`;
  const dateRange = `A6:${lastColLetter}6`;

  // 1. Add School Header
  worksheet.mergeCells(headerRange);
  const titleCell = worksheet.getCell('A1');
  titleCell.value = school.schoolName;
  titleCell.font = { name: 'Arial', size: 22, bold: true, color: { argb: 'FFF43F5E' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

  // 2. Add School Details
  worksheet.mergeCells(addressRange);
  const addressCell = worksheet.getCell('A2');
  addressCell.value = school.address;
  addressCell.font = { name: 'Arial', size: 10, color: { argb: 'FF646464' } };
  addressCell.alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet.mergeCells(contactRange);
  const contactCell = worksheet.getCell('A3');
  contactCell.value = `Phone: ${school.schoolPhone} | Email: ${school.schoolEmail}`;
  contactCell.font = { name: 'Arial', size: 10, color: { argb: 'FF646464' } };
  contactCell.alignment = { vertical: 'middle', horizontal: 'center' };

  // 3. Add Document Title
  worksheet.mergeCells(titleRange);
  const docTitleCell = worksheet.getCell('A5');
  docTitleCell.value = title;
  docTitleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FF282828' } };
  docTitleCell.alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet.mergeCells(dateRange);
  const dateCell = worksheet.getCell('A6');
  dateCell.value = `Generated on: ${dayjs().format("DD MMM YYYY, hh:mm A")}`;
  dateCell.font = { name: 'Arial', size: 10, italic: true };
  dateCell.alignment = { vertical: 'middle', horizontal: 'center' };

  // 4. Add Table Headers
  const headerRow = worksheet.getRow(8);
  columns.forEach((col, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = col.header;
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF43F5E' } }; // Rose 500
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
    };
    worksheet.getColumn(idx + 1).width = Math.max(15, col.header.length + 8);
  });
  headerRow.height = 25;

  // 5. Add Table Data
  data.forEach((item, rowIdx) => {
    const row = worksheet.getRow(9 + rowIdx);
    columns.forEach((col, colIdx) => {
      let val = item[col.key];
      if (col.render) val = col.render(item);
      const cell = row.getCell(colIdx + 1);
      cell.value = val !== undefined && val !== null ? String(val) : "";
      
      // Zebra striping
      if (rowIdx % 2 === 0) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
      }
      
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFEEEEEE' } },
        left: { style: 'thin', color: { argb: 'FFEEEEEE' } },
        bottom: { style: 'thin', color: { argb: 'FFEEEEEE' } },
        right: { style: 'thin', color: { argb: 'FFEEEEEE' } }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    });
    row.height = 20;
  });

  // 6. Save File
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer], { type: "application/octet-stream" }), `${filename}_${dayjs().format("YYYYMMDD")}.xlsx`);
};
