import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useGetPlacedStudentsByCompanyQuery } from '../../redux/api/authApi';
import Loader from '../common-components/loader/Loader';
import PageNavbar from '../common-components/navbar/PageNavbar';
import CommonTable from '../common-components/table/CommonTable';
import Pagination from '../common-components/pagination/Pagination';

const PlacedStudents = () => {
  const { companyId } = useParams();
  const location = useLocation();
  const companyName = location.state?.companyName || 'Company';

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data, isLoading, error } = useGetPlacedStudentsByCompanyQuery(companyId);
  const students = data?.students || [];
  const apiCompanyName = data?.company || companyName;
  const totalPlaced = data?.totalPlaced || students.length;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);

  const columns = [
    {
      key: "profile",
      label: "Student Name",
      render: (row) => (
        <div className="flex items-center gap-3">
      
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900">{`${row.firstName} ${row.lastName}`}</span>
            <span className="text-xs text-gray-500">{row.course} - {row.stream}</span>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (row) => (
        <span className="text-blue-600 hover:text-blue-800">{row.email}</span>
      ),
    },
    {
      key: "studentMobile",
      label: "Phone",
      render: (row) => row.studentMobile || 'N/A',
    },
    {
      key: "jobProfile",
      label: "Job Profile",
      render: (row) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          {row.placedInfo?.jobProfile || 'N/A'}
        </span>
      ),
    },
    {
      key: "jobType",
      label: "Job Type",
      render: (row) => (
        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
          {row.placedInfo?.jobType || 'N/A'}
        </span>
      ),
    },
    {
      key: "placedDate",
      label: "Placement Date",
      render: (row) => (
        <span className="text-gray-700">
          {row.placedInfo?.placedDate ? new Date(row.placedInfo.placedDate).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
    {
      key: "salary",
      label: "Package",
      render: (row) => (
        <span className="font-semibold text-green-600">
          {row.placedInfo?.salary ? `₹${(row.placedInfo.salary / 100000).toFixed(1)} LPA` : 'N/A'}
        </span>
      ),
    },
    {
      key: "location",
      label: "Location",
      render: (row) => (
        <span className="text-gray-700">
          {row.placedInfo?.location || 'N/A'}
        </span>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className=" rounded-xl shadow-sm border border-red-200 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Students</h3>
            <p className="text-red-600 mb-4">{error?.data?.message || 'Something went wrong'}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PageNavbar
        title={`Placed Students`}
        subtitle={`Students placed in ${companyName}`}
        showBackButton={true}
      />

      
        <div className=" rounded-xl shadow-sm border border-gray-200">
          {/* Header Stats */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{apiCompanyName}</h2>
                {/* <p className="text-gray-600 mt-1">
                  {totalPlaced} student{totalPlaced !== 1 ? 's' : ''} placed
                </p> */}
              </div>
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-semibold">
                Total Placements: {totalPlaced}
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="px-6">
            <Pagination
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              allData={students}
              selectedRows={selectedRows}
              sectionName="placed-students"
              filtersConfig={[]}
            />
          </div>

          {/* Table */}
          {students.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Placed</h3>
              <p className="text-gray-500">No students have been placed in this company yet.</p>
            </div>
          ) : (
            <CommonTable
              columns={columns}
              data={students}
              searchTerm={searchTerm}
              pagination={true}
              rowsPerPage={10}
              onSelectionChange={setSelectedRows}
            />
          )}
        </div>
      </div>
  );
};

export default PlacedStudents;