// File: components/Pagination.jsx
/* eslint-disable react/prop-types */
import { useState, useRef, useEffect } from "react";
import { Search, ChevronRight } from "lucide-react";
import { FaFilter } from "react-icons/fa";
import { BsFillCloudDownloadFill } from "react-icons/bs";

import {
  downloadCSV,
  downloadExcel,
  downloadPDF,
  toggleSelection,
} from "../../../helpers/DownloadHelpers";

const Pagination = ({
  searchTerm,
  setSearchTerm,
  filtersConfig,
  filteredData,
  selectedRows = [],
  allData = [],
}) => {
  const [showFilter, setShowFilter] = useState(false);
  const [downloadDropdown, setDownloadDropdown] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);

  const filterRef = useRef(null);
  const downloadRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!filterRef.current?.contains(e.target)) setShowFilter(false);
      if (!downloadRef.current?.contains(e.target)) setDownloadDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex  items-center w-full py-5 flex-wrap gap-4 relative">
      {/* Search Box */}
      <div className="flex border border-gray-300 rounded-md overflow-hidden w-full max-w-3xl h-12 bg-[var(--backgroundColor)] relative">
        <div className="flex items-center px-3 w-full">
          <Search className="w-4 h-4 text-gray-600 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search..."
            className="outline-none border-none ring-0 focus:ring-0 px-2 py-2 w-full h-9 text-sm text-gray-600 bg-[var(--backgroundColor)]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {/* This invisible overlay makes the entire area clickable */}
        <div
          className="absolute inset-0 cursor-text"
          onClick={() => document.querySelector('input[type="text"]').focus()}
        ></div>
      </div>

      {/* Filters & Export Buttons */}
      <div className="flex items-center gap-10">
        {/* Filters */}
        <button
          onClick={() => setShowFilter(!showFilter)}
          className="flex items-center text-md gap-1 text-gray-700 hover:text-black"
        >
          <FaFilter />
          Filters
        </button>

        {/* Export */}
        <div className="relative" ref={downloadRef}>
          <button
            onClick={() => setDownloadDropdown(!downloadDropdown)}
            className="flex items-center gap-1 text-md text-gray-700 hover:text-black"
          >
            <BsFillCloudDownloadFill className="text-md" />

            Export
          </button>
          {downloadDropdown && (
            <div
              className="absolute top-10 left-0 border rounded-xl shadow-lg w-40 z-20"
              style={{
                background: `
                  linear-gradient(to bottom left, rgba(173, 216, 230, 0.4) 0%, transparent 40%),
                  linear-gradient(to top right, rgba(255, 182, 193, 0.4) 0%, transparent 40%),
                  white
                `
              }}
            >
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm" onClick={() => { 
                const dataToExport = selectedRows.length > 0 
                  ? allData.filter(row => selectedRows.includes(row._id))
                  : filteredData;
                downloadCSV(dataToExport); 
                setDownloadDropdown(false); 
              }}>Download CSV</button>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm" onClick={() => { 
                const dataToExport = selectedRows.length > 0 
                  ? allData.filter(row => selectedRows.includes(row._id))
                  : filteredData;
                downloadExcel(dataToExport); 
                setDownloadDropdown(false); 
              }}>Download Excel</button>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm" onClick={() => { 
                const dataToExport = selectedRows.length > 0 
                  ? allData.filter(row => selectedRows.includes(row._id))
                  : filteredData;
                downloadPDF(dataToExport); 
                setDownloadDropdown(false); 
              }}>Download PDF</button>
            </div>
          )}
        </div>

      </div>

      {/* Filter Dropdown */}
      {showFilter && (
        <div
          ref={filterRef}
          className="absolute top-16 left-[40vw] border   rounded-xl shadow-lg w-48 z-20 p-2 text-sm"
          style={{
            background: `
              linear-gradient(to bottom left, rgba(173, 216, 230, 0.4) 0%, transparent 20%),
              linear-gradient(to top right, rgba(255, 182, 193, 0.4) 0%, transparent 20%),
              white
            `
          }}
        >
          {filtersConfig.map(({ title, options, selected, setter }) => (
            <div key={title} className="relative">
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
                <div
                  className="absolute top-0 left-full ml-2 w-44 border   rounded-xl shadow-lg p-2 space-y-1 z-30"
                  style={{
                    background: `
                      linear-gradient(to bottom left, rgba(173, 216, 230, 0.4) 0%, transparent 40%),
                      linear-gradient(to top right, rgba(255, 182, 193, 0.4) 0%, transparent 40%),
                      white
                    `
                  }}
                >
                  {options.map((opt) => {
                    const value = typeof opt === "object" ? opt.value : opt;
                    const label = typeof opt === "object" ? opt.label : opt;

                    return (
                      <label key={value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selected.includes(value)}
                          onChange={() => toggleSelection(value, setter, selected)}
                          className="accent-black"
                        />
                        {label}
                      </label>
                    );
                  })}

                </div>
              )}
            </div>
          ))}
        </div>
      )}


    </div>
  );
};

export default Pagination;