/* eslint-disable react/prop-types */
const TabsCommon = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="w-full">
      <div className="flex gap-6 px-6 bg-white">
        {tabs.map((tab) => (
          <p
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-3 py-4 cursor-pointer text-md text-[var(--text-color)] ${
              activeTab === tab
                ? "border-[#F57A00] text-orange-600 border-b-4 font-semibold"
                : "border-transparent"
            }`}
          >
            {tab}
          </p>
        ))}
      </div>
    </div>
  );
};

export default TabsCommon;