/* eslint-disable react/prop-types */
import { Search } from "lucide-react";

const SearchBox = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="flex border border-gray-300 rounded-lg overflow-hidden w-full max-w-3xl h-11 bg-white focus-within:border-black">
      <div className="flex items-center px-3 w-full">
        <Search className="w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search..."
          className="outline-none px-2 w-full text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  );
};

export default SearchBox;
