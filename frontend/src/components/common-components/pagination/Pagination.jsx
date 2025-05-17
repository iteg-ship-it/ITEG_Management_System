

/* eslint-disable react/prop-types */
import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import download from "../../../assets/icons/download-icon.png";
import del from "../../../assets/icons/delete-icon.png";
import filtericon from "../../../assets/icons/filter.png";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // ✅ This is necessary

const Pagination = ({
  rowsPerPage,
  setRowsPerPage,
  searchTerm,
  setSearchTerm,
  filtersConfig,
  filteredData,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [downloadDropdown, setDownloadDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const downloadRef = useRef(null);
  const options = [10, 25, 50, 100];

  const handleSelect = (value) => {
    setRowsPerPage(value);
    setShowDropdown(false);
  };


  const handleDownloadCSV = () => {
    if (!filteredData || filteredData.length === 0) return;

    const csvRows = [];
    const headers = Object.keys(filteredData[0]);
    csvRows.push(headers.join(","));

    filteredData.forEach((row) => {
      const values = headers.map(
        (header) => `"${(row[header] ?? "").toString().replace(/"/g, '""')}"`
      );
      csvRows.push(values.join(","));
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "filtered_data.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadExcel = () => {
    if (!filteredData || filteredData.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered Data");
    XLSX.writeFile(workbook, "filtered_data.xlsx");
  };

  const handleDownloadPDF = () => {
    if (!filteredData || filteredData.length === 0) return;

    const doc = new jsPDF();

    const keys = Object.keys(filteredData[0]);

    const headers = keys.map((key) => ({
      content: key.toUpperCase(),
      styles: { fillColor: [220, 220, 220], halign: "center" },
    }));

    const rows = filteredData.map((row) =>
      keys.map((key) =>
        (row[key] ?? "")
          .toString()
          .replace(/\n/g, " ")
          .replace(/\s+/g, " ")
          .trim()
      )
    );

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 10,
      styles: {
        fontSize: 8,
        cellPadding: 3,
        overflow: "ellipsize",
        cellWidth: 'wrap',
      },
      headStyles: {
        fillColor: [63, 81, 181],
        textColor: 255,
        halign: "center",
        fontStyle: "bold",
      },
      bodyStyles: {
        halign: "left",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      columnStyles: keys.reduce((acc, key) => {
        acc[key] = { cellWidth: 'wrap' };
        return acc;
      }, {}),
      margin: { top: 10, left: 10, right: 10 },
    });

    doc.save("filtered_data.pdf");
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
      if (downloadRef.current && !downloadRef.current.contains(e.target)) {
        setDownloadDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex justify-between items-center w-full flex-wrap gap-4 py-5">
      {/* Entries Dropdown + Download Buttons */}
      <div className="flex items-center">
        {/* Entries Dropdown */}
        <div className="relative w-fit" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown((prev) => !prev)}
            className="border h-10 rounded-md px-3 py-1 text-sm flex items-center gap-2 bg-white shadow-sm hover:bg-gray-100"
          >
            Show Entries: {rowsPerPage}
            <ChevronDown size={16} />
          </button>
          {showDropdown && (
            <ul className="absolute left-0 mt-1 w-full bg-white border rounded-md shadow-lg z-10">
              {options.map((option) => (
                <li
                  key={option}
                  onClick={() => handleSelect(option)}
                  className={`px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer ${rowsPerPage === option ? "bg-blue-100 font-semibold" : ""
                    }`}
                >
                  {option}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Download Dropdown */}
        <div className="relative" ref={downloadRef}>
          <button
            onClick={() => setDownloadDropdown(!downloadDropdown)}
            className="mx-3 bg-blue-500 p-2 px-2.5 border rounded"
          >
            <img className="h-5" src={download} alt="download" />
          </button>
          {downloadDropdown && (
            <div className="absolute top-10 left-0 bg-white border rounded-md shadow-md w-40 z-20">
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                onClick={() => {
                  handleDownloadCSV();
                  setDownloadDropdown(false);
                }}
              >
                Download CSV
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                onClick={() => {
                  handleDownloadExcel();
                  setDownloadDropdown(false);
                }}
              >
                Download Excel
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                onClick={() => {
                  handleDownloadPDF();
                  setDownloadDropdown(false);
                }}
              >
                Download PDF
              </button>
            </div>
          )}
        </div>

        {/* Delete Button */}
        <button className="bg-red-200 p-2 px-2.5 border rounded">
          <img className="h-5" src={del} alt="delete" />
        </button>
      </div>

      {/* Search and Filter Section */}
      <FilterSection
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filtersConfig={filtersConfig}
      />
    </div>
  );
};

export default Pagination;

// Filter Section Component
const FilterSection = ({ searchTerm, setSearchTerm, filtersConfig }) => {
  const [showFilter, setShowFilter] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const filterRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilter(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSelection = (value, setter, selected) => {
    if (selected.includes(value)) {
      setter(selected.filter((v) => v !== value));
    } else {
      setter([...selected, value]);
    }
  };

  return (
    <div className="relative flex items-center gap-2 my-1">
      <button
        onClick={() => setShowFilter(!showFilter)}
        className="border border-gray-300 p-2 rounded hover:bg-gray-100 bg-white"
      >
        <img className="w-5 h-5" src={filtericon} alt="Filter" />
      </button>

      <div className="flex border border-gray-300 rounded-md bg-white overflow-hidden">
        <div className="flex items-center px-2">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="outline-none border-none ring-0 focus:ring-0 focus:outline-none px-2 py-1 w-48 h-10 text-sm bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

        </div>
      </div>

      {showFilter && (
        <div
          ref={filterRef}
          className="absolute top-12 right-full mr-2 w-40 bg-white border rounded-md shadow-md z-20 p-2 text-sm"
        >
          {filtersConfig.map(({ title, options, selected, setter }) => (
            <div key={title} className="relative group">
              <div
                onClick={() =>
                  setExpandedSection(expandedSection === title ? null : title)
                }
                className="flex justify-between items-center cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
              >
                <span>{title}</span>
                <ChevronRight
                  size={14}
                  className={expandedSection === title ? "rotate-90" : ""}
                />
              </div>

              {expandedSection === title && (
                <div className="absolute top-0 left-full ml-5 w-44 bg-white border rounded-md shadow-md p-2 space-y-1 z-30">
                  {options.map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selected.includes(opt)}
                        onChange={() => toggleSelection(opt, setter, selected)}
                        className="accent-green-500"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
