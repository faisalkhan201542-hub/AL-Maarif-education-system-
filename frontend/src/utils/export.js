export const exportToCSV = (data, filename, columns) => {
  if (!data || !data.length) return;

  // Extract headers
  const headers = columns.map(col => col.header);
  
  // Create rows
  const rows = data.map(row => 
    columns.map(col => {
      let val = row;
      // Handle nested properties if accessor is a dot-separated string
      if (typeof col.accessor === 'string') {
        const keys = col.accessor.split('.');
        for (const key of keys) {
          val = val ? val[key] : "";
        }
      } else if (typeof col.accessor === 'function') {
        val = col.accessor(row);
      }
      
      // Escape quotes and wrap in quotes to handle commas within values
      const escaped = String(val !== null && val !== undefined ? val : "").replace(/"/g, '""');
      return `"${escaped}"`;
    }).join(",")
  );

  const csvContent = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
