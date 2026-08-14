/* eslint-disable react/prop-types */
import { useState, useRef, useEffect } from "react";
import { BsFillCloudDownloadFill } from "react-icons/bs";
import { ChevronDown, FileText, FileSpreadsheet, File } from "lucide-react";
import {
  downloadCSV,
  downloadExcel,
  downloadPDF,
} from "../../../helpers/DownloadHelpers";

const ExportDropdown = ({
  data = [],
  selectedRows = [],
  sectionName = "data",
  fileName,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (!ref.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  // Agar rows select kiye hai to sirf wahi export honge
  const dataToExport =
    selectedRows.length > 0
      ? data.filter((row) => selectedRows.includes(row._id))
      : data;

  const finalFileName = fileName || `${sectionName}-${Date.now()}`;

  const handleDownload = (type) => {
    if (!dataToExport.length) {
      alert("No data available to export");
      return;
    }

    if (type === "csv")
      downloadCSV(dataToExport, `${finalFileName}.csv`);

    if (type === "excel")
      downloadExcel(dataToExport, `${finalFileName}.xlsx`);

    if (type === "pdf")
      downloadPDF(dataToExport, `${finalFileName}.pdf`);

    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3.5 h-10 text-sm font-medium border border-gray-200 rounded-xl bg-white hover:bg-gray-50 text-gray-700 shadow-xs hover:border-[var(--primary,#FDA92D)] transition-all focus:outline-none cursor-pointer"
      >
        <BsFillCloudDownloadFill size={15} className="text-gray-600" />
        <span className="hidden sm:inline">Export</span>
        <ChevronDown
          size={16}
          className={`text-gray-400 shrink-0 transition-transform duration-200 ${
            open ? "rotate-180 text-[var(--primary,#FDA92D)]" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl shadow-xl border border-gray-100 p-1.5 z-50 animate-fadeIn space-y-0.5">
          <button
            type="button"
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg transition-colors duration-150 hover:bg-[var(--primary,#FDA92D)] hover:text-white group text-left cursor-pointer"
            onClick={() => handleDownload("csv")}
          >
            <FileText size={16} className="text-gray-400 group-hover:text-white shrink-0 transition-colors" />
            <span>Export as CSV</span>
          </button>

          <button
            type="button"
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg transition-colors duration-150 hover:bg-[var(--primary,#FDA92D)] hover:text-white group text-left cursor-pointer"
            onClick={() => handleDownload("excel")}
          >
            <FileSpreadsheet size={16} className="text-gray-400 group-hover:text-white shrink-0 transition-colors" />
            <span>Export as Excel</span>
          </button>

          <button
            type="button"
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg transition-colors duration-150 hover:bg-[var(--primary,#FDA92D)] hover:text-white group text-left cursor-pointer"
            onClick={() => handleDownload("pdf")}
          >
            <File size={16} className="text-gray-400 group-hover:text-white shrink-0 transition-colors" />
            <span>Export as PDF</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ExportDropdown;

