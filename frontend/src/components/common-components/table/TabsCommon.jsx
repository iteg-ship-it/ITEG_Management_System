/* eslint-disable react/prop-types */
const TabsCommon = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="flex gap-6 py-4">
      {tabs.map((tab) => (
        <p
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`px-3 cursor-pointer text-md text-[var(--text-color)] pb-2  ${
            activeTab === tab
              ? "border-[#F57A00] text-orange-600 border-b-4 font-semibold"
              : "border-transparent"
          }`}
        >
          {tab}
        </p>
      ))}
    </div>
  );
};

export default TabsCommon;