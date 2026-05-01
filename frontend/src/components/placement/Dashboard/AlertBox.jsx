import { MdWarningAmber, MdTrendingDown } from "react-icons/md";


const AlertBox = ({ data = {}, loading }) => {
  if (loading) return (
    <div className="bg-white rounded-xl border shadow-sm p-5">
      <div className="h-4 bg-gray-100 rounded w-24 mb-4 animate-pulse" />
      <div className="h-14 bg-gray-50 rounded mb-2 animate-pulse" />
      <div className="h-14 bg-gray-50 rounded animate-pulse" />
    </div>
  );


  const { studentsReadyButNoInterview, lowestPerformingDepartment } = data;


  return (
    <div className="bg-white rounded-xl border shadow-sm p-5">
      <h3 className="font-semibold text-gray-700 text-sm mb-4">Alerts & Insights</h3>
      <div className="space-y-3">
        <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-100 rounded-lg">
          <MdWarningAmber className="text-orange-500 text-xl mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-700">Ready but no interview scheduled</p>
            <p className="text-2xl font-bold text-orange-500 mt-0.5">
              {studentsReadyButNoInterview ?? "—"}
              <span className="text-xs font-normal text-gray-400 ml-1">students</span>
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-lg">
          <MdTrendingDown className="text-red-500 text-xl mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-700">Lowest performing department</p>
            <p className="text-base font-semibold text-red-500 mt-0.5">
              {lowestPerformingDepartment?.name || "—"}
              <span className="text-xs font-normal text-gray-400 ml-2">
                {lowestPerformingDepartment?.placementPercentage ?? "—"}% placed
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


export default AlertBox;