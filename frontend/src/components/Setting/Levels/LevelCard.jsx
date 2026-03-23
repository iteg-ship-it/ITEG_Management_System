/* eslint-disable react/prop-types */
import { MdCalendarToday, MdLayers } from "react-icons/md";

const LevelCard = ({ level, name, year, subLevels, status, onView, onEdit }) => {
  const isActive = status === "active";

  return (
    <div
      className={`bg-[#f9fafb] border-t-4 border-orange-400 border-x border-b border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col ${
        !isActive ? "opacity-50" : ""
      }`}
    >
      <div className="p-4 flex-1">
        {/* Top row: icon + status badge */}
        <div className="flex items-start justify-between mb-3">
          <div className="w-9 h-9 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center">
            <MdLayers className="text-orange-500" size={18} />
          </div>
          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full tracking-wide ${
              isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"
            }`}
          >
            {isActive ? "ACTIVE" : "INACTIVE"}
          </span>
        </div>

        {/* Level label */}
        <p className="text-xs font-semibold text-orange-500 uppercase tracking-wider mb-0.5">{level}</p>

        {/* Name */}
        <h3 className="text-base font-bold text-gray-900 mb-3">{name}</h3>

        <div className="border-t border-gray-200 my-2" />

        {/* Info rows */}
        <div className="space-y-1.5 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <MdCalendarToday className="text-orange-400" size={14} />
            <span>{year}</span>
          </div>
          <div className="flex items-center gap-2">
            <MdLayers className="text-orange-400" size={14} />
            <span>Sub-levels: {subLevels}</span>
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex gap-2 p-3 bg-gray-50">
        <button
          onClick={onView}
          disabled={!isActive}
          className="w-1/2 bg-orange-500 text-white rounded-lg py-1.5 text-xs font-semibold hover:bg-orange-600 transition disabled:cursor-not-allowed disabled:bg-orange-300"
        >
          VIEW
        </button>
        <button
          onClick={onEdit}
          disabled={!isActive}
          className="w-1/2 border border-orange-400 text-orange-500 rounded-lg py-1.5 text-xs font-semibold hover:bg-orange-50 transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          EDIT
        </button>
      </div>
    </div>
  );
};

export default LevelCard;
