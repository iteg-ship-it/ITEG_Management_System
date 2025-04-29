/* eslint-disable react/prop-types */
import { useState, useRef, useEffect } from "react";
import { ChevronRight, ChevronDown, Search } from "lucide-react";
import filtericon from "../../../assets/icons/filter.png";

const Pagination = ({ rowsPerPage, setRowsPerPage }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const options = [5, 10, 15, 25, 50, 100];

  const handleSelect = (value) => {
    setRowsPerPage(value);
    setShowDropdown(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <div className="flex justify-between items-center w-full flex-wrap gap-4 py-5">
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
                    rowsPerPage === option ? "bg-gray-100 font-semibold" : ""
                  }`}
                >
                  {option}
                </li>
              ))}
            </ul>
          )}
        </div>

        <FilterSection />
      </div>
    </>
  );
};

export default Pagination;

function FilterSection() {
  const [showFilter, setShowFilter] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [expandedSection, setExpandedSection] = useState(null);
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [selectedPercentages, setSelectedPercentages] = useState([]);

  const filterRef = useRef(null);

  const trackOptions = [
    "Web Development",
    "App Development",
    "AIML",
    "Data Science",
  ];
  const yearOptions = ["2021", "2022", "2023", "2024"];
  const percentageOptions = ["50-60%", "60-70%", "70-80%", "80-90%", "90-100%"];

  // Toggle checkbox values
  const toggleSelection = (value, listSetter, list) => {
    if (list.includes(value)) {
      listSetter(list.filter((v) => v !== value));
    } else {
      listSetter([...list, value]);
    }
  };

  // // Reset all
  // const handleResetFilters = () => {
  //   setSelectedTracks([]);
  //   setSelectedYears([]);
  //   setSelectedPercentages([]);
  //   setExpandedSection(null);
  // };

  // // Apply filters
  // const handleApplyFilters = () => {
  //   console.log("Search:", searchTerm);
  //   console.log("Tracks:", selectedTracks);
  //   console.log("Years:", selectedYears);
  //   console.log("Percentages:", selectedPercentages);
  // };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilter(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative flex items-center gap-2 mt-4">
      {/* Filter Icon Button */}
      <button
        onClick={() => setShowFilter(!showFilter)}
        className="border border-gray-300 p-2 rounded hover:bg-gray-100 bg-white"
      >
        <img className="w-5 h-5" src={filtericon} alt="Filter" />
      </button>

      {/* Search Box */}
      <div className="flex border border-gray-300 rounded-md bg-white overflow-hidden">
        <div className="flex items-center px-2">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="outline-none px-2 py-1 w-48 h-10 text-sm bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Dropdown Accordion */}
      {showFilter && (
        <div
          ref={filterRef}
          className="absolute top-12 right-full mr-2 w-40 bg-white border rounded-md shadow-md z-20 p-2 text-sm"
        >
          {[
            {
              title: "Track",
              options: trackOptions,
              selected: selectedTracks,
              setter: setSelectedTracks,
            },
            {
              title: "Percentage",
              options: percentageOptions,
              selected: selectedPercentages,
              setter: setSelectedPercentages,
            },
            {
              title: "Year",
              options: yearOptions,
              selected: selectedYears,
              setter: setSelectedYears,
            },
          ].map(({ title, options, selected, setter }) => (
            <div key={title} className="relative group">
              {/* Main filter item */}
              <div
                onClick={() =>
                  setExpandedSection(expandedSection === title ? null : title)
                }
                className="flex justify-between items-center cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
              >
                <span>{title}</span>
                <ChevronRight size={14} />
              </div>

              {/* Side panel with options */}
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
}
