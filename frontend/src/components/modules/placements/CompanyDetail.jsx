import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetAllCompaniesQuery } from '../../../redux/api/authApi';
import Loader from '../../shared/loader/Loader';
import CommonTable from '../../shared/table/CommonTable';
import Header from '../../shared/sidebar/Header';
import StatsCard from './dashboard/StatsCard';
import { 
  MdBusiness, MdPeople, MdLocationOn, MdEmail, MdPhone, 
  MdSearch, MdArrowForward 
} from 'react-icons/md';

const CompanyDetail = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetAllCompaniesQuery();
  const companies = data?.data || data || [];
  
  const [searchTerm, setSearchTerm] = useState('');

  const handleRowClick = (company) => {
    navigate(`/placement/company/${company._id}`, {
      state: { companyName: company.companyName }
    });
  };

  const filteredCompanies = companies.filter((c) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      c.companyName?.toLowerCase().includes(q) ||
      c.hrEmail?.toLowerCase().includes(q) ||
      c.location?.toLowerCase().includes(q)
    );
  });

  const columns = [
    {
      key: "profile",
      label: "Company Name",
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.companyLogo ? (
            <img src={row.companyLogo} alt={row.companyName} className="w-10 h-10 rounded-xl object-cover border border-gray-100 shadow-xs" />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center text-white font-extrabold text-sm shadow-xs">
              {row.companyName?.charAt(0)?.toUpperCase() || 'C'}
            </div>
          )}
          <div>
            <p className="font-bold text-gray-800 text-sm hover:text-orange-600 transition">{row.companyName}</p>
            <span className="text-[10px] text-gray-400 font-medium">Partner Company</span>
          </div>
        </div>
      ),
    },
    {
      key: "hrEmail",
      label: "HR Email",
      render: (row) => (
        <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md flex items-center gap-1 w-fit">
          <MdEmail className="text-gray-400" /> {row.hrEmail || "—"}
        </span>
      )
    },
    {
      key: "hrContact",
      label: "HR Contact Phone",
      render: (row) => (
        <span className="text-xs font-semibold text-gray-600 flex items-center gap-1">
          <MdPhone className="text-gray-400" /> {row.hrContact || 'N/A'}
        </span>
      ),
    },
    {
      key: "location",
      label: "Location",
      render: (row) => (
        <span className="text-xs font-bold text-gray-700 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-100 flex items-center gap-1 w-fit">
          <MdLocationOn /> {row.location || "N/A"}
        </span>
      )
    },
    {
      key: "createdAt",
      label: "Drive Registered",
      render: (row) => (
        <span className="text-xs text-gray-500 font-medium">
          {new Date(row.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      ),
    },
    {
      key: "action",
      label: "Action",
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRowClick(row);
          }}
          className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition shadow-xs flex items-center gap-1 ml-auto"
        >
          View Placements <MdArrowForward />
        </button>
      )
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-50 min-h-screen p-6">
        <Header title="Company Details" />
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-red-200 text-center shadow-sm mt-12">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-xl mb-3">
            ⚠️
          </div>
          <h3 className="text-base font-bold text-gray-800">Error Loading Companies</h3>
          <p className="text-xs text-red-500 mt-1">{error?.data?.message || 'Something went wrong while fetching companies'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      <Header 
        title="Company Details" 
        breadcrumbs={[{ label: "Placements", path: "/placements/dashboard" }, { label: "Companies" }]}
      />

      <div className="p-6 space-y-6 max-w-[1600px] mx-auto">

        {/* ── Top Summary Stats Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Recruiting Companies"
            value={companies.length}
            icon={<MdBusiness />}
            color="orange"
            trend="Recruiter Network"
            sub="registered campus partners"
          />
          <StatsCard
            title="Active Drive Locations"
            value={new Set(companies.map(c => c.location).filter(Boolean)).size || 1}
            icon={<MdLocationOn />}
            color="blue"
            trend="Pan-India Drives"
            sub="hiring hub locations"
          />
          <StatsCard
            title="Corporate HR Contacts"
            value={companies.filter(c => c.hrEmail).length}
            icon={<MdEmail />}
            color="purple"
            trend="Verified HRs"
            sub="active TPO contacts"
          />
          <StatsCard
            title="Placement Partners"
            value="100%"
            icon={<MdPeople />}
            color="green"
            trend="Active Hiring"
            sub="campus placement drives"
          />
        </div>

        {/* ── Search Toolbar & Table Container ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-gray-800 text-base">Corporate Recruiting Partners</h3>
              <p className="text-xs text-gray-500">List of all companies conducting campus drives</p>
            </div>

            <div className="relative w-full sm:w-72">
              <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="text"
                placeholder="Search company, HR email, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 w-full transition"
              />
            </div>
          </div>
        </div>

        {/* ── Data Table View Only ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <CommonTable
            columns={columns}
            data={filteredCompanies}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onRowClick={handleRowClick}
            pagination
            rowsPerPage={10}
          />
        </div>

      </div>
    </div>
  );
};

export default CompanyDetail;