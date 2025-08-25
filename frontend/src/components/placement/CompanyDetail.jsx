import { useGetAllCompaniesQuery } from '../../redux/api/authApi';
import Loader from '../common-components/loader/Loader';

const CompanyDetail = () => {
  const { data, isLoading, error } = useGetAllCompaniesQuery();
  const companies = data?.data || data || [];

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
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Company Details</h1>
        <p className="text-gray-600 mt-1">Total Companies: {companies.length}</p>
      </div>
      
      {companies.length === 0 ? (
        <p className="text-center text-gray-500">No companies found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {companies.map((company) => (
            <div key={company._id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:border-blue-300">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                  {company.companyLogo ? (
                    <img src={company.companyLogo} alt={company.companyName} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-white font-bold text-xl">
                      {company.companyName?.charAt(0)?.toUpperCase() || 'C'}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{company.companyName}</h3>
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  ID: {company._id.slice(-8)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompanyDetail