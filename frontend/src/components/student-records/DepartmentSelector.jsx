import { useNavigate } from "react-router-dom";
import { useGetAllSubdepartmentsQuery } from "../../redux/api/authApi";
import Header from "../common-components/sidebar/Header";
import Loader from "../common-components/loader/Loader";
import { MdPeople, MdArrowForward } from "react-icons/md";

const DepartmentSelector = () => {
  const navigate = useNavigate();
  const { data: res = {}, isLoading } = useGetAllSubdepartmentsQuery();
  const subDepts = res.data || [];

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader /></div>;

  return (
    <>
      <Header
        title="Student Progress"
        subtitle="Select a department to view students"
        breadcrumbs={[{ label: "Academics" }, { label: "Student Progress" }]}
      />

      <div className="p-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Select Department
        </p>

        {subDepts.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No departments found</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {subDepts.map((dept) => (
              <button
                key={dept._id}
                onClick={() => navigate(`/student-detail-table/${dept._id}`)}
                className="bg-white border-2 border-gray-100 hover:border-orange-300 hover:bg-orange-50 rounded-xl p-5 text-left transition group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-orange-100 text-orange-500 p-3 rounded-lg group-hover:bg-orange-200 transition">
                      <MdPeople size={22} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{dept.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {dept.departmentId?.name || "Department"}
                      </p>
                    </div>
                  </div>
                  <MdArrowForward className="text-gray-300 group-hover:text-orange-400 transition" size={20} />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default DepartmentSelector;
