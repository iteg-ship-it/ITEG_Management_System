import { useState } from 'react';
import PageNavbar from '../../common-components/navbar/PageNavbar';
import { useGetAllLevelsQuery } from '../../../redux/api/authApi';
import Loader from '../../common-components/loader/Loader';
import { Layers } from 'lucide-react';
import Pagination from '../../common-components/pagination/Pagination';
import { useNavigate } from 'react-router-dom';

const ShowLevels = () => {
  const { data: levelsData, isLoading, refetch } = useGetAllLevelsQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState([]);
  const navigate = useNavigate();

  const allLevels = levelsData?.data || [];

  if (isLoading) return <Loader />;

  return (
    <>
      <PageNavbar
        title="All Levels"
        subtitle="View all levels across departments and subdepartments"
        showBackButton={false}
      />
      <div className="mt-1 border bg-[var(--backgroundColor)] shadow-sm rounded-lg">
        <div className="px-6">
          <div className="flex justify-between items-center flex-wrap gap-4 py-4">
            <Pagination
              rowsPerPage={rowsPerPage}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filtersConfig={[]}
              filteredData={allLevels}
              selectedRows={selectedRows}
              allData={allLevels}
              sectionName="levels"
            />
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {allLevels.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No levels found</p>
              </div>
            ) : (
              allLevels.map((level) => (
                <div
                  key={level._id}
                  className="group relative bg-white rounded-xl overflow-hidden cursor-pointer border border-gray-200 hover:shadow-lg transition-all duration-300"
                  onClick={() => navigate('/subdepartment-details', {
                    state: { 
                      departmentId: level.subDepartmentId?.departmentId?._id,
                      subdepartment: level.subDepartmentId,
                      departmentName: level.subDepartmentId?.departmentId?.name
                    }
                  })}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: level.isActive ? '#10B98120' : '#EF444420' }}>
                        <Layers className="h-6 w-6" style={{ color: level.isActive ? '#10B981' : '#EF4444' }} />
                      </div>
                      <span className={`px-3 py-1 text-xs rounded-full font-semibold ${
                        level.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {level.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">{level.name}</h4>
                    <p className="text-sm text-gray-600 mb-1">{level.subDepartmentId?.name || 'N/A'}</p>
                    <p className="text-xs text-gray-500">{level.subDepartmentId?.departmentId?.name || 'N/A'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ShowLevels;