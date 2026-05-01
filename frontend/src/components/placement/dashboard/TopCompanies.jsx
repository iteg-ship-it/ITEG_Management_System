const TopCompanies = ({ data = [], loading }) => {
  if (loading) return (
    <div className="bg-white rounded-xl border shadow-sm p-5">
      <div className="h-4 bg-gray-100 rounded w-32 mb-4 animate-pulse" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-8 bg-gray-50 rounded mb-2 animate-pulse" />
      ))}
    </div>
  );

  return (
    <div className="bg-white rounded-xl border shadow-sm p-5">
      <h3 className="font-semibold text-gray-700 text-sm mb-4">Top Hiring Companies</h3>
      {data.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-4">No placement data yet</p>
      ) : (
        <div className="space-y-3">
          {data.map((company, i) => {
            const maxHires = data[0]?.totalHires || 1;
            const pct = Math.round((company.totalHires / maxHires) * 100);
            return (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700 truncate max-w-[70%]">{company.companyName}</span>
                  <span className="text-gray-500 text-xs">{company.totalHires} hires</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-orange-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TopCompanies;
