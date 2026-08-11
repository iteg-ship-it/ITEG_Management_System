import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getAllPlacementDrives,
  createPlacementDrive,
  shortlistStudentsForDrive,
  shareResumesForDrive
} from "../../../services/placementDriveService";
import { useGetNewReadyStudentsQuery, useGetAllCompaniesQuery } from "../../../redux/api/authApi";
import AddCompanyModal from "./AddCompanyModal";
import Header from "../../shared/sidebar/Header";
import Loader from "../../shared/loader/Loader";
import CommonTable from "../../shared/table/CommonTable";
import {
  MdAdd, MdSearch, MdBusiness, MdWork, MdLocationOn,
  MdCalendarToday, MdFileUpload, MdBadge, MdCheckCircle,
  MdShare, MdPeople, MdFolderSpecial, MdClose
} from "react-icons/md";

const PlacementDriveManagement = () => {
  const navigate = useNavigate();
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isAddCompanyModalOpen, setAddCompanyModalOpen] = useState(false);

  // Fetch Active Master Companies for Drive Dropdown
  const { data: companiesRes, refetch: refetchCompanies } = useGetAllCompaniesQuery({ status: "Active" });
  const activeCompanies = companiesRes?.data || companiesRes || [];
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [isShortlistModalOpen, setShortlistModalOpen] = useState(false);

  // Form State for New Drive
  const [form, setForm] = useState({
    companyName: "",
    jobRole: "",
    technology: "",
    packageCTC: "",
    jobLocation: "",
    workMode: "WFO",
    driveDate: "",
    applicationDeadline: "",
    jobDescription: "",
    vacancies: 1,
    requiredSkills: "",
    minimumCriteria: ""
  });
  const [submitting, setSubmitting] = useState(false);

  // Candidates for shortlisting
  const { data: readyRes = {} } = useGetNewReadyStudentsQuery();
  const readyStudents = readyRes.data || [];

  const fetchDrives = async () => {
    setLoading(true);
    try {
      const res = await getAllPlacementDrives();
      if (res.data?.success) {
        setDrives(res.data.data || []);
      }
    } catch (err) {
      toast.error("Failed to load placement drives");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrives();
  }, []);

  const handleCreateDrive = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createPlacementDrive(form);
      toast.success("Placement drive created successfully!");
      setCreateModalOpen(false);
      setForm({
        companyName: "",
        jobRole: "",
        technology: "",
        packageCTC: "",
        jobLocation: "",
        workMode: "WFO",
        driveDate: "",
        applicationDeadline: "",
        jobDescription: "",
        vacancies: 1,
        requiredSkills: "",
        minimumCriteria: ""
      });
      fetchDrives();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create placement drive");
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered drives
  const filteredDrives = drives.filter(d =>
    d.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.jobRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.packageCTC.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="Placement Drives"
        showBack={true}
        breadcrumbs={[
          { label: "Placements", path: "/placements/dashboard" },
          { label: "Drives & Company Management" }
        ]}
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="relative w-full sm:w-80">
            <MdSearch className="absolute left-3 top-3 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search company or job role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-400 outline-none"
            />
          </div>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all"
          >
            <MdAdd size={18} /> Create Placement Drive
          </button>
        </div>

        {/* Drive Cards Grid */}
        {loading ? (
          <Loader />
        ) : filteredDrives.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <p className="text-slate-500 font-semibold text-sm">No placement drives found.</p>
            <p className="text-slate-400 text-xs mt-1">Click "Create Placement Drive" to announce a new hiring drive.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDrives.map((drive) => {
              const shortlistedCount = drive.shortlistedStudents?.length || 0;
              const sharedCount = drive.resumeSharedStudents?.length || 0;

              return (
                <div key={drive._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 font-bold text-lg">
                          <MdBusiness size={24} />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-base">{drive.companyName}</h3>
                          <p className="text-xs text-orange-600 font-semibold">{drive.jobRole}</p>
                        </div>
                      </div>
                      <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase">
                        {drive.workMode}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg">
                        <MdBadge className="text-slate-400" size={14} />
                        <span className="font-semibold text-slate-800">{drive.packageCTC}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg">
                        <MdLocationOn className="text-slate-400" size={14} />
                        <span className="truncate font-semibold text-slate-800">{drive.jobLocation}</span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                      <MdCalendarToday size={14} className="text-orange-500" />
                      <span>Drive Date: <strong>{new Date(drive.driveDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</strong></span>
                    </div>

                    <div className="mt-4 border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Shortlisted: <strong className="text-slate-800">{shortlistedCount}</strong></span>
                      <span className="text-slate-500 font-medium">Resumes Shared: <strong className="text-emerald-600">{sharedCount}</strong></span>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedDrive(drive);
                        setShortlistModalOpen(true);
                      }}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2 rounded-xl transition flex items-center justify-center gap-1"
                    >
                      <MdPeople size={14} /> Shortlist
                    </button>
                    <button
                      onClick={() => navigate(`/placements/resume-sharing?driveId=${drive._id}`)}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold py-2 rounded-xl transition flex items-center justify-center gap-1 shadow-sm"
                    >
                      <MdShare size={14} /> Resumes
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE DRIVE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Announce Placement Drive</h2>
                <p className="text-xs text-slate-500">Create company hiring drive profile and criteria</p>
              </div>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <MdClose size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateDrive} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 block">Company Name *</label>
                    <button
                      type="button"
                      onClick={() => setAddCompanyModalOpen(true)}
                      className="text-[11px] font-bold text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-0.5"
                    >
                      <MdAdd size={14} /> Add Company
                    </button>
                  </div>
                  <select
                    required
                    value={form.companyName}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "__add_new__") {
                        setAddCompanyModalOpen(true);
                      } else {
                        const matched = activeCompanies.find(c => c.companyName === val);
                        setForm({
                          ...form,
                          companyName: val,
                          jobLocation: form.jobLocation || matched?.location || matched?.city || ""
                        });
                      }
                    }}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                  >
                    <option value="">Select Company from Database...</option>
                    {activeCompanies.map((c) => (
                      <option key={c._id} value={c.companyName}>
                        {c.companyName} ({c.industry || "IT Services"} - {c.location || "N/A"})
                      </option>
                    ))}
                    <option value="__add_new__" className="font-bold text-orange-600">+ Add New Company to Database</option>
                  </select>
                </div>


                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Job Role *</label>
                  <input
                    type="text"
                    required
                    value={form.jobRole}
                    onChange={(e) => setForm({ ...form, jobRole: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-400"
                    placeholder="e.g. Software Developer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Package (CTC) *</label>
                  <input
                    type="text"
                    required
                    value={form.packageCTC}
                    onChange={(e) => setForm({ ...form, packageCTC: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-400"
                    placeholder="e.g. 6.5 LPA"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Location *</label>
                  <input
                    type="text"
                    required
                    value={form.jobLocation}
                    onChange={(e) => setForm({ ...form, jobLocation: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-400"
                    placeholder="e.g. Pune / Indore"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Work Mode</label>
                  <select
                    value={form.workMode}
                    onChange={(e) => setForm({ ...form, workMode: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-400"
                  >
                    <option value="WFO">WFO</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Drive Date *</label>
                  <input
                    type="date"
                    required
                    value={form.driveDate}
                    onChange={(e) => setForm({ ...form, driveDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Application Deadline</label>
                  <input
                    type="date"
                    value={form.applicationDeadline}
                    onChange={(e) => setForm({ ...form, applicationDeadline: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Job Description & Selection Rounds</label>
                <textarea
                  rows={3}
                  value={form.jobDescription}
                  onChange={(e) => setForm({ ...form, jobDescription: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="Round 1: Aptitude, Round 2: Technical, Round 3: HR"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition shadow-sm disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create Drive"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SHORTLIST CANDIDATES MODAL */}
      {isShortlistModalOpen && selectedDrive && (
        <ShortlistCandidatesModal
          drive={selectedDrive}
          readyStudents={readyStudents}
          onClose={() => {
            setShortlistModalOpen(false);
            setSelectedDrive(null);
            fetchDrives();
          }}
        />
      )}

      {/* ADD COMPANY MODAL */}
      <AddCompanyModal
        isOpen={isAddCompanyModalOpen}
        onClose={() => setAddCompanyModalOpen(false)}
        onSuccess={() => {
          refetchCompanies();
        }}
      />
    </div>
  );
};



// Shortlist Candidates Modal Component
const ShortlistCandidatesModal = ({ drive, readyStudents, onClose }) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Filter ready students
  const candidates = readyStudents.filter(s =>
    (s.readinessStatus === "Ready for Drive" || s.readinessStatus === "Ready for Placement" || s.readinessStatus === "Ready") &&
    (`${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    (s.prkey || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.technology || "").toLowerCase().includes(search.toLowerCase()))
  );

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === candidates.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(candidates.map(c => c._id || c.studentId));
    }
  };

  const handleShortlist = async () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one student");
      return;
    }

    setSubmitting(true);
    try {
      await shortlistStudentsForDrive(drive._id, selectedIds);
      toast.success(`Successfully shortlisted ${selectedIds.length} candidate(s) for ${drive.companyName}`);
      onClose();
    } catch (err) {
      toast.error("Failed to shortlist candidates");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Shortlist Candidates — {drive.companyName}</h2>
            <p className="text-xs text-orange-600 font-semibold">{drive.jobRole} ({drive.packageCTC})</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <MdClose size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between gap-4">
          <input
            type="text"
            placeholder="Search candidate by name, PRKey, technology..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-400 bg-white"
          />
          <button
            onClick={toggleSelectAll}
            className="text-xs font-bold text-orange-600 hover:text-orange-700 whitespace-nowrap px-3 py-2 bg-orange-50 rounded-xl border border-orange-100"
          >
            {selectedIds.length === candidates.length && candidates.length > 0 ? "Deselect All" : "Select All"}
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1 space-y-2">
          {candidates.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-8">No eligible Ready for Drive students found.</p>
          ) : (
            candidates.map(candidate => {
              const isChecked = selectedIds.includes(candidate._id || candidate.studentId);
              return (
                <div
                  key={candidate._id || candidate.studentId}
                  onClick={() => toggleSelect(candidate._id || candidate.studentId)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition cursor-pointer ${
                    isChecked ? "bg-orange-50/60 border-orange-300" : "bg-white border-slate-100 hover:border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="w-4 h-4 text-orange-500 rounded focus:ring-orange-400"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{candidate.firstName} {candidate.lastName}</h4>
                      <p className="text-[11px] text-slate-500">ID: {candidate.prkey || "—"} • Tech: {candidate.technology || candidate.track || "General"}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {candidate.readinessStatus}
                  </span>
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <span className="text-xs font-semibold text-slate-600">Selected: <strong>{selectedIds.length}</strong> candidates</span>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">
              Cancel
            </button>
            <button
              onClick={handleShortlist}
              disabled={submitting || selectedIds.length === 0}
              className="px-5 py-2 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition shadow-sm disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save Shortlist"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlacementDriveManagement;
