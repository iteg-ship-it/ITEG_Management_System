const STATUSES = [
  { key: "notReady",         label: "Not Ready",          color: "bg-gray-100 text-gray-500" },
  { key: "inProgress",       label: "In Progress",        color: "bg-yellow-100 text-yellow-600" },
  { key: "ready",            label: "Ready",              color: "bg-blue-100 text-blue-600" },
  { key: "readyForInterview",label: "Ready for Interview",color: "bg-indigo-100 text-indigo-600" },
  { key: "interview",        label: "Interview",          color: "bg-orange-100 text-orange-600" },
  { key: "selected",         label: "Selected",           color: "bg-purple-100 text-purple-600" },
  { key: "placed",           label: "Placed",             color: "bg-green-100 text-green-600" },
];

const StatusBreakdown = ({ data = {}, loading }) => {
  if (loading) return (
    <div className="bg-white rounded-xl border shadow-sm p-5">
      <div className="h-4 bg-gray-100 rounded w-36 mb-4 animate-pulse" />
      <div className="grid grid-cols-4 gap-3">
        {[...Array(7)].map((_, i) => <div key={i} className="h-16 bg-gray-50 rounded-lg animate-pulse" />)}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl border shadow-sm p-5">
      <h3 className="font-semibold text-gray-700 text-sm mb-4">Status Breakdown</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3">
        {STATUSES.map((s) => (
          <div key={s.key} className={`rounded-lg p-3 text-center ${s.color}`}>
            <p className="text-2xl font-bold">{data[s.key] ?? 0}</p>
            <p className="text-xs font-medium mt-1 leading-tight">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusBreakdown;
