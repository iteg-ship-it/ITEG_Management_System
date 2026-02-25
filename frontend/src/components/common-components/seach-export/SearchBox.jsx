/* eslint-disable react/prop-types */
import { Search } from "lucide-react";

const SearchBox = ({ searchTerm = "", setSearchTerm = () => {} }) => {
  return (
    <div className="flex border border-gray-300 rounded-lg overflow-hidden w-full max-w-5xl h-11 bg-white focus-within:border-black transition-colors">
      <div className="flex items-center px-3 w-full">
        <Search className="w-4 h-4 text-gray-500 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search..."
          className="outline-none border-none ring-0 focus:ring-0 px-2 w-full text-sm bg-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  );
};

export default SearchBox;
