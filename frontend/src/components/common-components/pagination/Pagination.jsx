/* eslint-disable react/prop-types */
import { ChevronDown, Download, Search } from "lucide-react";
import del from "../../../assets/icons/delete-icon.png";
import filtericon from "../../../assets/icons/filter.png";
import { useState } from "react";

const Pagination = ({ entries, setEntries, searchTerm, setSearchTerm }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const entryOptions = [10, 25, 50, 100];
  const [showFilter, setShowFilter] = useState(false);
  const [trackOptions, setTrackOptions] = useState({
    Harda: false,
    Kannod: true,
    Khetesgon: false,
    Nemawar: true,
    Narsullaganj: false,
    Satwas: false,
  });
  const handleSelect = (value) => {
    setEntries(value);
    setShowDropdown(false);
  };
  const toggleTrack = (track) => {
    setTrackOptions((prev) => ({ ...prev, [track]: !prev[track] }));
  };

  return (
    <div className=" p-2 rounded-lg py-6 px-6">
      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="border px-3 py-2 rounded-md h-12 flex items-center gap-1 text-sm"
          >
            Show Entries {entries}
            <ChevronDown className="w-4 h-4" />
          </button>
          {showDropdown && (
            <ul className="absolute mt-1 bg-white border rounded-md shadow z-10 w-full">
              {entryOptions.map((option) => (
                <li
                  key={option}
                  onClick={() => handleSelect(option)}
                  className="px-4 py-2 hover:bg-blue-100 cursor-pointer text-sm"
                >
                  Show Entries {option}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          <Download size={25} />
        </button>
        <button className="bg-red-200 text-white p-3 rounded hover:bg-red-300">
          <img src={del} alt="delete" />
        </button>
        <div className="flex-1"></div>
        <div className="flex items-center gap-2 relative mt-4">
          {/* Filter Button */}
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="border border-gray-300 p-2 rounded hover:bg-gray-100 bg-white"
          >
            <img className="w-6 h-6" src={filtericon} alt="filter-icon" />
          </button>

          {/* Search Bar */}
          <div className="flex border border-gray-300 rounded-md overflow-hidden bg-white">
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

          {/* Filter Dropdown */}
          {showFilter && (
            <div className="absolute left-14 top-12 bg-white border rounded-md shadow-md z-20 p-2 w-48 text-sm">
              {Object.keys(trackOptions).map((track) => (
                <label
                  key={track}
                  className="flex items-center gap-2 py-1 px-2 hover:bg-gray-100 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={trackOptions[track]}
                    onChange={() => toggleTrack(track)}
                    className="accent-green-600"
                  />
                  {track}
                </label>
              ))}
            </div>
          )}
        </div>
        {/* <FilterSearchBar /> */}
      </div>
    </div>
  );
};

export default Pagination;
