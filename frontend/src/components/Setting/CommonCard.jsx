import React from 'react';
import { MdBusiness } from 'react-icons/md';

const CommonCard = ({ icon: Icon = MdBusiness, title, description, status, statusLabel, infoItems, onView, onEdit, children, variant = 'card2' }) => {

  // card1 - Exact screenshot style
  if (variant === 'card1') {
    return (
      <div className={`bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col ${!status ? 'opacity-70' : ''}`}>
        <div className="p-6 flex-1">

          {/* Icon left + Title & Status right */}
          <div className="flex items-start gap-4 mb-5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${status ? 'bg-orange-100' : 'bg-gray-100'}`}>
              <Icon size={28} className={status ? 'text-orange-500' : 'text-gray-400'} />
            </div>
            <div className="flex flex-col justify-center">
              <h3 className={`text-lg font-bold leading-snug ${status ? 'text-gray-900' : 'text-gray-400'}`}>
                {title}
              </h3>
              <span className={`mt-1 self-start text-xs font-semibold px-3 py-0.5 rounded-full ${
                status ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {statusLabel || (status ? 'Active' : 'Inactive')}
              </span>
            </div>
          </div>

          {/* Single line stats row */}
          <div className="flex items-center gap-5 text-sm text-gray-500 flex-wrap">
            {infoItems?.map((item, i) => (
              <span key={i} className="flex items-center gap-1.5 whitespace-nowrap">
                <span className={status ? 'text-orange-400' : 'text-gray-300'}>{item.icon}</span>
                <span>{item.value}{item.label ? ` ${item.label}` : ''}</span>
              </span>
            ))}
          </div>

          {children}
        </div>

        {/* Actions */}
        <div className="flex items-center border-t border-gray-100">
          {onView && (
            <button
              onClick={onView}
              disabled={!status}
              className={`flex-1 py-3.5 text-sm font-semibold transition rounded-bl-2xl ${
                status
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              View Details
            </button>
          )}
          {onEdit && (
            <div className="flex-1 border-l border-gray-100 text-center">{onEdit}</div>
          )}
        </div>
      </div>
    );
  }

  // card2 - Screenshot 2 style: icon circle left + ACTIVE badge right, title, description, divider, info list, VIEW outline + EDIT orange
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col">
      <div className="p-5 flex-1">
        {/* Top row: icon + status badge */}
        <div className="flex items-start justify-between mb-3">
          <div className="w-12 h-12 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center">
            <Icon size={22} className={status ? 'text-orange-500' : 'text-gray-400'} />
          </div>
          {status !== undefined && (
            <span className={`text-xs font-bold px-3 py-1 rounded-full tracking-wide ${status ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
              {statusLabel || (status ? 'ACTIVE' : 'INACTIVE')}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className={`text-base font-bold mb-1 ${status ? 'text-gray-900' : 'text-gray-400'}`}>{title}</h3>

        {/* Description */}
        {description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">{description}</p>
        )}

        {/* Divider */}
        <div className="border-t border-gray-100 my-3" />

        {/* Info items */}
        <div className="space-y-1.5 text-sm text-gray-600">
          {infoItems?.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              {item.icon} <span>{item.label ? `${item.label}: ` : ''}<span className="font-medium">{item.value}</span></span>
            </div>
          ))}
        </div>

        {children}
      </div>

      {/* Actions */}
      <div className="flex gap-2 px-5 pb-5">
        {onView && (
          <button
            onClick={onView}
            className="flex-1 border border-gray-300 rounded-lg py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
          >
            VIEW
          </button>
        )}
        {onEdit && (
          <div className={onView ? 'flex-1' : 'w-full'}>{onEdit}</div>
        )}
      </div>
    </div>
  );
};

export default CommonCard;
