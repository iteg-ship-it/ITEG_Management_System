/* eslint-disable react/prop-types */
import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import download from "../../../assets/icons/download-icon.png";
import del from "../../../assets/icons/delete-icon.png";
import filtericon from "../../../assets/icons/filter.png";

// Main Pagination Component
const Pagination = ({
  rowsPerPage,
  setRowsPerPage,
  searchTerm,
  setSearchTerm,
  filtersConfig, // Dynamic filters config
  filteredData,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const options = [10, 25, 50, 100];

  const handleSelect = (value) => {
    setRowsPerPage(value);
    setShowDropdown(false);
  };
  const handleDownload = () => {
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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex justify-between items-center w-full flex-wrap gap-4 py-5">
      {/* Entries dropdown + action buttons */}
      <div className="flex items-center">
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
                  className={`px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer ${
                    rowsPerPage === option ? "bg-blue-100 font-semibold" : ""
                  }`}
                >
                  {option}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Action buttons */}
        <button
          onClick={handleDownload}
          className="mx-3 bg-blue-500 p-2 px-2.5 border rounded"
        >
          <img className="h-5" src={download} alt="download" />
        </button>
        <button className="bg-red-300 p-2 px-2.5 border rounded">
          <img className="h-5" src={del} alt="delete" />
        </button>
      </div>

      {/* Search and filters */}
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
      {/* Filter button */}
      <button
        onClick={() => setShowFilter(!showFilter)}
        className="border border-gray-300 p-2 rounded hover:bg-gray-100 bg-white"
      >
        <img className="w-5 h-5" src={filtericon} alt="Filter" />
      </button>

      {/* Search input */}
      <div className="flex border border-gray-300 rounded-md bg-white overflow-hidden">
        <div className="flex items-center px-2">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="outline-none border-none focus:outline-none focus:ring-0 px-2 py-1 w-48 h-10 text-sm bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Filter popover */}
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
