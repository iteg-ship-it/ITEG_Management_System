// File: utils/downloadHelpers.js
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const downloadCSV = (data, filename = "filtered_data.csv") => {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(","),
    ...data.map(row =>
      headers.map(header => `"${(row[header] ?? "").toString().replace(/"/g, '""')}"`).join(",")
    )
  ];

  const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const downloadExcel = (data, filename = "filtered_data.xlsx") => {
  if (!data || data.length === 0) return;
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered Data");
  XLSX.writeFile(workbook, filename);
};

export const downloadPDF = (data, filename = "filtered_data.pdf") => {
  if (!data || data.length === 0) return;

  // fields to include
  const keys = ["firstName", "fatherName", "studentMobile", "track", "village", "stream"];

  // helper: capitalize only first character
  const capitalize = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

  // helper: capitalize all words
  const titleCase = (str) =>
    str
      ? str
          .split(" ")
          .map(
            word =>
              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join(" ")
      : "";

  const doc = new jsPDF();

  autoTable(doc, {
    head: [["S NO", ...keys.map(k => k.replace(/_/g, " ").toUpperCase())]],
    body: data.map((row, index) => [
      index + 1,
      ...keys.map(key => {
        const value = (row[key] ?? "").toString().replace(/\n/g, " ").replace(/\s+/g, " ").trim();
        if (key === "fatherName") {
          return titleCase(value); // all words capitalized
        }
        if (["firstName", "track", "village", "stream"].includes(key)) {
          return capitalize(value); // only first char
        }
        return value; // studentMobile as is
      }),
    ]),
    startY: 10,
    styles: {
      fontSize: 8,
      cellPadding: 3,
      overflow: "ellipsize",
      cellWidth: "wrap",
    },
    headStyles: {
      fillColor: [63, 81, 181],
      textColor: 255,
      halign: "center",
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { top: 10, left: 10, right: 10 },
  });

  doc.save(filename);
};



export const toggleSelection = (value, setter, selected) => {
  setter(selected.includes(value)
    ? selected.filter(v => v !== value)
    : [...selected, value]
  );
};