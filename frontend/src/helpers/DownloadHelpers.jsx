import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const downloadCSV = (data, filename = "data.csv") => {
  if (!data?.length) return;
  const keys = ["firstName", "lastName", "fatherName", "motherName", "studentMobile", "email", "course", "stream", "percentage", "track", "village", "district", "state", "pincode"];
  const headers = ["FIRST NAME", "LAST NAME", "FATHER NAME", "MOTHER NAME", "STUDENT MOBILE", "EMAIL", "COURSE", "STREAM", "PERCENTAGE", "TRACK", "VILLAGE", "DISTRICT", "STATE", "PINCODE"];
  const rows = [
    ["S.NO", ...headers].join(","),
    ...data.map((row, i) => {
      const rowData = [i + 1, ...keys.map(k => `"${(row[k] || "").toString().replace(/"/g, '""')}"`)];
      return rowData.join(",");
    })
  ];
  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const downloadExcel = (data, filename = "data.xlsx") => {
  if (!data?.length) return;
  const keys = ["firstName", "lastName", "fatherName", "motherName", "studentMobile", "email", "course", "stream", "percentage", "track", "village", "district", "state", "pincode"];
  const formattedData = data.map((row, i) => {
    const newRow = { "S.NO": i + 1 };
    const headerNames = ["FIRST NAME", "LAST NAME", "FATHER NAME", "MOTHER NAME", "STUDENT MOBILE", "EMAIL", "COURSE", "STREAM", "PERCENTAGE", "TRACK", "VILLAGE", "DISTRICT", "STATE", "PINCODE"];
    keys.forEach((key, index) => {
      newRow[headerNames[index]] = row[key] || "";
    });
    return newRow;
  });
  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, filename);
};

export const downloadPDF = (data, filename = "data.pdf") => {
  if (!data?.length) return;
  const keys = ["firstName", "lastName", "fatherName", "studentMobile", "course", "stream", "track", "village"];

  const doc = new jsPDF();
  autoTable(doc, {
    head: [["#", "FIRST NAME", "LAST NAME", "FATHER NAME", "MOBILE", "COURSE", "STREAM", "TRACK", "VILLAGE"]],
    body: data.map((row, i) => [
      i + 1,
      ...keys.map((k) => row[k] ?? ""),
    ]),
    styles: {
      fontSize: 8,
      cellPadding: 2
    },
    headStyles: {
      fillColor: [253, 169, 45],
      textColor: 255
    }
  });
  doc.save(filename);
};


// // File: utils/downloadHelpers.js
// import * as XLSX from "xlsx";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";

// export const downloadCSV = (data, filename = "filtered_data.csv") => {
//   if (!data || data.length === 0) return;

//   const headers = Object.keys(data[0]);
//   const csvRows = [
//     headers.join(","),
//     ...data.map(row =>
//       headers.map(header => `"${(row[header] ?? "").toString().replace(/"/g, '""')}"`).join(",")
//     )
//   ];

//   const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
//   const url = URL.createObjectURL(blob);
//   const link = document.createElement("a");
//   link.href = url;
//   link.download = filename;
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
//   URL.revokeObjectURL(url);
// };

// export const downloadExcel = (data, filename = "filtered_data.xlsx") => {
//   if (!data || data.length === 0) return;
//   const worksheet = XLSX.utils.json_to_sheet(data);
//   const workbook = XLSX.utils.book_new();
//   XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered Data");
//   XLSX.writeFile(workbook, filename);
// };

// export const downloadPDF = (data, filename = "filtered_data.pdf") => {
//   if (!data || data.length === 0) return;

//   // fields to include
//   const keys = ["firstName", "fatherName", "studentMobile", "track", "village", "stream"];

//   // helper: capitalize only first character
//   const capitalize = (str) =>
//     str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

//   // helper: capitalize all words
//   const titleCase = (str) =>
//     str
//       ? str
//           .split(" ")
//           .map(
//             word =>
//               word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
//           )
//           .join(" ")
//       : "";

//   const doc = new jsPDF();

//   autoTable(doc, {
//     head: [["S NO", ...keys.map(k => k.replace(/_/g, " ").toUpperCase())]],
//     body: data.map((row, index) => [
//       index + 1,
//       ...keys.map(key => {
//         const value = (row[key] ?? "").toString().replace(/\n/g, " ").replace(/\s+/g, " ").trim();
//         if (key === "fatherName") {
//           return titleCase(value); // all words capitalized
//         }
//         if (["firstName", "track", "village", "stream"].includes(key)) {
//           return capitalize(value); // only first char
//         }
//         return value; // studentMobile as is
//       }),
//     ]),
//     startY: 10,
//     styles: {
//       fontSize: 8,
//       cellPadding: 3,
//       overflow: "ellipsize",
//       cellWidth: "wrap",
//     },
//     headStyles: {
//       fillColor: [63, 81, 181],
//       textColor: 255,
//       halign: "center",
//       fontStyle: "bold",
//     },
//     alternateRowStyles: {
//       fillColor: [245, 245, 245],
//     },
//     margin: { top: 10, left: 10, right: 10 },
//   });

//   doc.save(filename);
// };



export const toggleSelection = (value, setter, selected) => {
  setter(selected.includes(value)
    ? selected.filter(v => v !== value)
    : [...selected, value]
  );
};