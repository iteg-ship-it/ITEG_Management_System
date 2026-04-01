
import { MdBusiness } from 'react-icons/md';


const ActionButtons = ({ onView, onEdit, inactive }) => (
  <div className="flex gap-2 px-4 pb-4">
    {onView && (
      <button
        onClick={inactive ? undefined : onView}
        disabled={inactive}
        className={`flex-1 border rounded-lg py-2 text-sm font-semibold transition ${
          inactive
            ? 'border-gray-200 text-gray-300 cursor-not-allowed'
            : 'border-gray-300 text-gray-600 hover:bg-gray-50 cursor-pointer'
        }`}
      >
        VIEW
      </button>
    )}
    {onEdit && (
      <div className={`${onView ? 'flex-1' : 'w-full'} ${inactive ? '[&_button]:!bg-gray-400 [&_button]:!text-white [&_button]:!border-0' : ''}`}>{onEdit}</div>
    )}
  </div>
);

const CommonCard = ({
  icon: Icon = MdBusiness,
  title,
  description,
  status,
  statusLabel,
  infoItems,
  onView,
  onEdit,
  children,
  variant = 'card2',
}) => {
  const inactive = status === false;

  // card1 — icon + title side by side, status badge below title, single-row info, VIEW + EDIT buttons
  if (variant === 'card1') {
    return (
      <div className={`bg-white border rounded-2xl shadow-sm transition-all duration-300 overflow-hidden flex flex-col ${
        inactive ? 'border-gray-200' : 'border-gray-200 hover:shadow-md'
      }`}>
        <div className="p-4 flex-1">

          {/* Icon + Title + Status */}
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
              inactive ? 'bg-gray-200' : 'bg-orange-50 border border-orange-100'
            }`}>
              <Icon size={22} className={inactive ? 'text-gray-400' : 'text-orange-500'} />
            </div>
            <div className="min-w-0">
              <h3 className={`text-sm font-bold leading-tight truncate ${inactive ? 'text-gray-400' : 'text-gray-900'}`}>
                {title}
              </h3>
              <span className={`mt-1 inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                inactive ? 'bg-gray-200 text-gray-400' : 'bg-green-100 text-green-600'
              }`}>
                {statusLabel || (inactive ? 'Inactive' : 'Active')}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className={`border-t mb-3 ${inactive ? 'border-gray-200' : 'border-gray-100'}`} />

          {/* Info — single row */}
          <div className="flex items-center gap-4 flex-wrap text-xs text-gray-500">
            {infoItems?.map((item, i) => (
              <span key={i} className="flex items-center gap-1.5 whitespace-nowrap">
                {item.icon}
                <span className={`font-semibold ${inactive ? 'text-gray-400' : 'text-gray-700'}`}>{item.value}</span>
                {item.label && <span>{item.label}</span>}
              </span>
            ))}
          </div>

          {children}
        </div>

        <ActionButtons onView={onView} onEdit={onEdit} inactive={inactive} />
      </div>
    );
  }

  // card2 — icon + status badge top row, title with more space, description, divider, info list, VIEW + EDIT
  return (
    <div className={`bg-white border rounded-2xl shadow-sm transition-all duration-300 overflow-hidden flex flex-col ${
      inactive ? 'border-gray-200' : 'border-gray-200 hover:shadow-md'
    }`}>
      <div className="p-4 flex-1">

        {/* Top row: icon + status badge */}
        <div className="flex items-start justify-between mb-3">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 ${
            inactive ? 'bg-gray-200' : 'bg-orange-50 border border-orange-100'
          }`}>
            <Icon size={20} className={inactive ? 'text-gray-400' : 'text-orange-500'} />
          </div>
          {status !== undefined && (
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full tracking-wide ${
              inactive ? 'bg-gray-200 text-gray-500' : 'bg-green-100 text-green-600'
            }`}>
              {statusLabel || (inactive ? 'INACTIVE' : 'ACTIVE')}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className={`text-xl font-bold mb-1 min-h-[2.5rem] leading-snug ${inactive ? 'text-gray-400' : 'text-gray-900'}`}>
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className={`text-md min-h-[4.5rem] line-clamp-2 mb-3 ${inactive ? 'text-gray-400' : 'text-gray-500'}`}>{description}</p>
        )}

        {/* Divider */}
        <div className={`border-t my-3 ${inactive ? 'border-gray-200' : 'border-gray-100'}`} />

        {/* Info items */}
        <div className="space-y-1.5 h-20">
          {infoItems?.map((item, i) => (
            <div key={i} className={`flex items-center gap-2 text-md ${inactive ? 'text-gray-400' : 'text-gray-500'}`}>
              <span>{item.icon}</span>
              <span>{item.label ? `${item.label}: ` : ''}<span className={`font-semibold ${inactive ? 'text-gray-400' : 'text-gray-700'}`}>{item.value}</span></span>
            </div>
          ))}
        </div>

        {children}
      </div>

      <ActionButtons onView={onView} onEdit={onEdit} inactive={inactive} />
    </div>
  );
};

export default CommonCard;
