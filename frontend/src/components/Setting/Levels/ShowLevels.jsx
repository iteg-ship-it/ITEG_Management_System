import { useState } from 'react';
import PageNavbar from '../../common-components/navbar/PageNavbar';
import { useGetAllDepartmentsQuery } from '../../../redux/api/authApi';
import Loader from '../../common-components/loader/Loader';
import { MdLayers } from 'react-icons/md';
import Pagination from '../../common-components/pagination/Pagination';
import CommonTable from '../../common-components/table/CommonTable';
import { useNavigate } from 'react-router-dom';

const ShowLevels = () => {
  const { data: departmentsData, isLoading, refetch } = useGetAllDepartmentsQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState([]);
  const navigate = useNavigate();

  const departments = (departmentsData?.data || []).map(dept => ({
    ...dept,
    subdepartments: (dept.subdepartments || []).map(sub => ({
      ...sub,
      levels: sub.levels || []
    }))
  }));

  // Flatten all levels with department and subdepartment info
  const allLevels = departments.flatMap(dept =>
    dept.subdepartments.flatMap(subdept =>
      (subdept.levels || []).map(level => ({
        ...level,
        departmentId: dept._id,
        departmentName: dept.departmentName,
        subdepartmentId: subdept._id,
        subdepartmentName: subdept.subdepartmentName
      }))
    )
  );

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
        <CommonTable
          columns={[
            { key: 'levelName', label: 'Level Name' },
            { key: 'subdepartmentName', label: 'Subdepartment' },
            { key: 'departmentName', label: 'Department' },
            { key: 'description', label: 'Description' },
          ]}
          data={allLevels}
          editable={false}
          pagination={true}
          rowsPerPage={rowsPerPage}
          searchTerm={searchTerm}
          onRowClick={(row) => navigate('/subdepartment-details', {
            state: { 
              departmentId: row.departmentId, 
              subdepartment: departments
                .find(d => d._id === row.departmentId)
                ?.subdepartments.find(s => s._id === row.subdepartmentId),
              departmentName: row.departmentName
            }
          })}
          onSelectionChange={setSelectedRows}
        />
      </div>
    </>
  );
};

export default ShowLevels;