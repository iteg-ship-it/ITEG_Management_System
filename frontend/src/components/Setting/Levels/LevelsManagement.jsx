import { MdAdd } from "react-icons/md";
import PageNavbar from "../../common-components/navbar/PageNavbar";
import Header from "../../common-components/sidebar/Header";
import LevelCard from "./LevelCard";

const DUMMY_LEVELS = [
  { id: 1, level: "Level 1", name: "Foundations of AI", year: "AY 2023-24", subLevels: 3, status: "active" },
  { id: 2, level: "Level 2", name: "Neural Networks", year: "AY 2023-24", subLevels: 4, status: "active" },
  { id: 3, level: "Level 3", name: "Advanced Robotics", year: "AY 2022-23", subLevels: 2, status: "inactive" },
];

const LevelsManagement = () => {
  return (
    <>
      <Header sidebarOpen={true} title="Levels Management" />
      <div className="px-5">
        <div className="flex justify-between items-center py-4">
          <PageNavbar
            title="AI & Machine Learning"
            subtitle="Manage academic levels and sub-levels for the current department. Track progression and enrollment configurations."
            showBackButton={false}
            breadcrumbs={[
              { label: "Departments", path: "/department-management" },
              { label: "AI & Machine Learning" },
              { label: "Levels" },
            ]}
          />
          <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition">
            <MdAdd size={18} />
            New Level
          </button>
        </div>

        {DUMMY_LEVELS.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <MdAdd size={48} className="mb-3 opacity-30" />
            <p className="text-sm">No levels added yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
            {DUMMY_LEVELS.map((item) => (
              <LevelCard
                key={item.id}
                level={item.level}
                name={item.name}
                year={item.year}
                subLevels={item.subLevels}
                status={item.status}
                onView={() => {}}
                onEdit={() => {}}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default LevelsManagement;
