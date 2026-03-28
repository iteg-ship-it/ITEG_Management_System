import React from 'react';
import { MdBusiness } from 'react-icons/md';

const CommonCard = ({ icon: Icon = MdBusiness, title, description, status, statusLabel, infoItems, onView, onEdit, children }) => {
  return (
    <div className="bg-[#f9fafb] border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden min-h-[380px] flex flex-col">
      <div className="p-6 flex-1">
        {/* Top row */}
        <div className="flex items-start justify-between mb-4">
          {/* Icon circle */}
          <div className="w-14 h-14 rounded-full border border-orange-200 bg-orange-50 flex items-center justify-center">
            <Icon className="text-orange-500" size={26} />
          </div>

          {/* Status pill */}
          {status !== undefined && (
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full tracking-wide ${
                status ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
              }`}
            >
              {statusLabel || (status ? "ACTIVE" : "INACTIVE")}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>

        {/* Description */}
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">
          {description || "No description"}
        </p>

        {/* Divider */}
        <div className="border-t border-gray-200 my-4"></div>

        {/* Info items */}
        <div className="space-y-2 text-sm text-gray-600">
          {infoItems?.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              {item.icon} <span>{item.label}: {item.value}</span>
            </div>
          ))}
        </div>

        {/* Custom children content */}
        {children}
      </div>

      {/* Bottom actions */}
      <div className="flex gap-3 p-4 bg-gray-50">
        {onView && (
          <button
            onClick={onView}
            className="w-1/2 border border-gray-300 rounded-lg py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition"
          >
            VIEW
          </button>
        )}
        {onEdit && (
          <div className={onView ? "w-1/2" : "w-full"}>
            {onEdit}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommonCard;