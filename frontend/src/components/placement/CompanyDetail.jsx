import { useGetAllCompaniesQuery } from '../../redux/api/authApi';
import Loader from '../common-components/loader/Loader';
import PageNavbar from '../common-components/navbar/PageNavbar';
import CommonTable from '../common-components/table/CommonTable';

const CompanyDetail = () => {
  const { data, isLoading, error } = useGetAllCompaniesQuery();
  const companies = data?.data || data || [];

  const columns = [
    {
      key: "profile",
      label: "Company Name",
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.companyLogo ? (
            <img src={row.companyLogo} alt={row.companyName} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {row.companyName?.charAt(0)?.toUpperCase() || 'C'}
              </span>
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-medium text-gray-800">{`${row.companyName}`}</span>
          </div>
        </div>
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

            <div className="flex justify-between items-center flex-wrap gap-4">

        {companies.length === 0 ? (
        <p className="text-center text-gray-500">No companies found.</p>
      ) : (
        <CommonTable
          columns={columns}
          data={companies}
          pagination={true}
          rowsPerPage={10}
        />
      )}
</div>
    </div>
  );
};

export default CompanyDetail