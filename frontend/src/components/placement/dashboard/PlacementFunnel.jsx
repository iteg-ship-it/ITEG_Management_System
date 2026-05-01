const STEPS = [
  { key: "ready",     label: "Ready",     color: "bg-blue-100 text-blue-600 border-blue-200" },
  { key: "interview", label: "Interview", color: "bg-orange-100 text-orange-600 border-orange-200" },
  { key: "selected",  label: "Selected",  color: "bg-purple-100 text-purple-600 border-purple-200" },
  { key: "placed",    label: "Placed",    color: "bg-green-100 text-green-600 border-green-200" },
];

const PlacementFunnel = ({ data = {}, loading }) => {
  if (loading) return (
    <div className="bg-white rounded-xl border shadow-sm p-5">
      <div className="h-4 bg-gray-100 rounded w-32 mb-4 animate-pulse" />
      <div className="flex gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex-1 h-20 bg-gray-50 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl border shadow-sm p-5">
      <h3 className="font-semibold text-gray-700 text-sm mb-4">Placement Funnel</h3>
      <div className="flex items-center gap-2">
        {STEPS.map((step, i) => (
          <div key={step.key} className="flex items-center flex-1">
            <div className={`flex-1 rounded-lg border p-4 text-center ${step.color}`}>
              <p className="text-2xl font-bold">{data[step.key] ?? "—"}</p>
              <p className="text-xs font-medium mt-1">{step.label}</p>
            </div>
            {i < STEPS.length - 1 && (
              <span className="text-gray-300 text-xl mx-1">›</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlacementFunnel;
