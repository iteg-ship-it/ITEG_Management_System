/* eslint-disable react/prop-types */
import { useState, useRef, useEffect } from "react";
import { BsFillCloudDownloadFill } from "react-icons/bs";
import {
  downloadCSV,
  downloadExcel,
  downloadPDF,
} from "../../../helpers/DownloadHelpers";

const ExportDropdown = ({
  data = [],
  selectedRows = [],
  sectionName = "data",
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const dataToExport =
    selectedRows.length > 0
      ? data.filter((row) => selectedRows.includes(row._id))
      : data;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-gray-600 hover:text-black"
      >
        <BsFillCloudDownloadFill />
        Export
      </button>

      {open && (
        <div className="absolute top-10 left-0 bg-white border rounded-lg shadow w-40 z-50">
          <button
            className="block w-full px-4 py-2 text-left hover:bg-gray-100"
            onClick={() => downloadCSV(dataToExport, `${sectionName}.csv`)}
          >
            CSV
          </button>

          <button
            className="block w-full px-4 py-2 text-left hover:bg-gray-100"
            onClick={() => downloadExcel(dataToExport, `${sectionName}.xlsx`)}
          >
            Excel
          </button>

          <button
            className="block w-full px-4 py-2 text-left hover:bg-gray-100"
            onClick={() => downloadPDF(dataToExport, `${sectionName}.pdf`)}
          >
            PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default ExportDropdown;
