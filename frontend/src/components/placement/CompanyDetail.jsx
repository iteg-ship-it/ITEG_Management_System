import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetAllCompaniesQuery } from '../../redux/api/authApi';
import Loader from '../common-components/loader/Loader';
import PageNavbar from '../common-components/navbar/PageNavbar';
import CommonTable from '../common-components/table/CommonTable';
import Pagination from '../common-components/pagination/Pagination';

const CompanyDetail = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetAllCompaniesQuery();
  const companies = data?.data || data || [];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);

  const handleRowClick = (company) => {
    navigate(`/placement/company/${company._id}`, {
      state: { companyName: company.companyName }
    });
  };

  const columns = [
    {
      key: "profile",
      label: "Company Name",
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.companyLogo ? (
            <img src={row.companyLogo} alt={row.companyName} className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {row.companyName?.charAt(0)?.toUpperCase() || 'C'}
              </span>
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-medium text-gray-800">{row.companyName}</span>
          </div>
        </div>
      ),
    },
    {
      key: "hrEmail",
      label: "HR Email",
    },
    {
      key: "hrContact",
      label: "HR Contact",
      render: (row) => row.hrContact || 'N/A',
    },
    {
      key: "location",
      label: "Location",
    },
    {
      key: "createdAt",
      label: "Created Date",
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
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
      <div className="p-6">
        <p className="text-center text-red-600">Error loading companies: {error?.data?.message || 'Something went wrong'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <PageNavbar
        title="Company Details"
        subtitle="Manage and track company information"
        showBackButton={false}
      />
      <div className="mt-1 border bg-[var(--backgroundColor)] shadow-sm rounded-lg">

        <div className="flex px-6 justify-between items-center flex-wrap gap-4">
          <Pagination
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            allData={companies}
            selectedRows={selectedRows}
            sectionName="companies"
            filtersConfig={[]}
          />
        </div>

        {companies.length === 0 ? (
          <p className="text-center text-gray-500">No companies found.</p>
        ) : (
          <CommonTable
            columns={columns}
            data={companies}
            searchTerm={searchTerm}
            pagination={true}
            rowsPerPage={10}
            onSelectionChange={setSelectedRows}
            onRowClick={handleRowClick}
          />
        )}
      </div>
    </div>
  );
};

export default CompanyDetail