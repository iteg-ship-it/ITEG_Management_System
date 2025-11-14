import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetAdmittedStudentsByIdQuery, useCreateReportCardMutation, useGetReportCardForEditQuery } from "../../redux/api/authApi";
import { HiArrowNarrowLeft } from "react-icons/hi";
import Loader from "../common-components/loader/Loader";
import { toast } from "react-toastify";

const SimpleDropdown = ({ label, value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef(null);

  const hasValue = value !== "";
  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`
          peer h-12 w-full border border-gray-300 rounded-md
          px-3 py-2 leading-tight bg-white text-left
          focus:outline-none focus:border-black 
          focus:ring-0 appearance-none flex items-center justify-between
          cursor-pointer
          ${isOpen ? "border-black" : ""}
          transition-all duration-200
        `}
      >
        <span className={selectedOption ? 'text-gray-900' : 'text-gray-400'}>
          {selectedOption ? selectedOption.label : 'Select'}
        </span>
        <span className={`ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      <label
        className={`
          absolute left-3 bg-white px-1 transition-all duration-200
          pointer-events-none
          ${isFocused || hasValue || isOpen
            ? "text-xs -top-2 text-black"
            : "text-gray-500 top-3"}
        `}
      >
        {label}
      </label>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full rounded-xl shadow-lg z-50 overflow-hidden border bg-white">
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-left transition-colors duration-150"
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


export default function StudentReportForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: studentData, isLoading, isError } = useGetAdmittedStudentsByIdQuery(id);
  const { data: existingReportData, isLoading: reportLoading, error: reportError } = useGetReportCardForEditQuery(id);
  const [createReportCard, { isLoading: isCreating, error: mutationError }] = useCreateReportCardMutation();
  const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
  
  console.log('🔍 StudentReportForm - Student ID:', id);
  console.log('📄 Report loading:', reportLoading);
  console.log('📄 Report error:', reportError);
  console.log('📄 Report data:', existingReportData);

  const [formData, setFormData] = useState({
    batchYear: "",
    generatedByName: loggedInUser?.name || "",
    softSkills: {
      sectionTitle: "Soft Skills Evaluation (50 Marks)",
      totalSoftSkillMarks: 0,
      categories: [
        {
          title: "Presentation Skills",
          maxMarks: 10,
          score: 0,
          subcategories: [
            { name: "Content & Structure", value: false },
            { name: "Confidence & Clarity", value: false },
            { name: "Body Language", value: false },
            { name: "Engagement with Audience", value: false },
            { name: "Voice Modulation", value: false }
          ]
        },
        {
          title: "Team Collaboration",
          maxMarks: 10,
          score: 0,
          subcategories: [
            { name: "Active Participation", value: false },
            { name: "Cooperation", value: false },
            { name: "Leadership", value: false },
            { name: "Task Contribution", value: false },
            { name: "Conflict Resolution", value: false }
          ]
        },
        {
          title: "Time Management",
          maxMarks: 10,
          score: 0,
          subcategories: [
            { name: "Punctuality", value: false },
            { name: "Deadline Handling", value: false },
            { name: "Task Prioritization", value: false },
            { name: "Consistency", value: false },
            { name: "Efficiency", value: false }
          ]
        }
      ]
    },
    discipline: {
      sectionTitle: "Discipline Evaluation (30 Marks)",
      totalDisciplineMarks: 0,
      categories: [
        {
          title: "Attendance",
          maxMarks: 10,
          score: 0,
          subcategories: [
            { name: "Regular Attendance", value: false },
            { name: "Leaves with Permission", value: false },
            { name: "Class Participation", value: false },
            { name: "Punctual Entry", value: false },
            { name: "Active Listening", value: false }
          ]
        },
        {
          title: "Behaviour",
          maxMarks: 10,
          score: 0,
          subcategories: [
            { name: "Politeness", value: false },
            { name: "Respect for Faculty", value: false },
            { name: "Team Behaviour", value: false },
            { name: "Classroom Conduct", value: false },
            { name: "Responsibility", value: false }
          ]
        },
        {
          title: "Professionalism",
          maxMarks: 10,
          score: 0,
          subcategories: [
            { name: "Dress Code", value: false },
            { name: "Communication Etiquette", value: false },
            { name: "Task Ownership", value: false },
            { name: "Timely Submission", value: false },
            { name: "Accountability", value: false }
          ]
        }
      ]
    },
    technicalSkills: [
      {
        skillName: "",
        theoryMarks: 0,
        practicalMarks: 0,
        totalPercentage: 0,
        remark: ""
      }
    ],
    careerReadiness: {
      resumeStatus: "",
      linkedinStatus: "",
      aptitudeStatus: "",
      placementReady: ""
    },
    academicPerformance: {
      yearWiseSGPA: [
        { year: "FY", sgpa: 0 },
        { year: "SY", sgpa: 0 },
        { year: "TY", sgpa: 0 }
      ],
      cgpa: 0
    },
    coCurricular: [
      {
        category: "",
        title: "",
        remark: ""
      }
    ],
    overallGrade: "",
    facultyRemark: "",
    isFinalReport: false
  });

  // Populate form with existing data when available
  useEffect(() => {
    console.log('🔍 useEffect triggered - existingReportData:', existingReportData);
    if (existingReportData?.data) {
      const reportData = existingReportData.data;
      console.log('📄 Populating form with existing data:', reportData);
      
      setFormData({
        batchYear: reportData.batchYear || "",
        generatedByName: reportData.generatedByName || loggedInUser?.name || "",
        
        // Soft Skills - preserve existing structure and data
        softSkills: {
          sectionTitle: reportData.softSkills?.sectionTitle || "Soft Skills Evaluation (50 Marks)",
          totalSoftSkillMarks: reportData.softSkills?.totalSoftSkillMarks || 0,
          categories: reportData.softSkills?.categories?.length > 0 
            ? reportData.softSkills.categories 
            : formData.softSkills.categories // fallback to default structure
        },
        
        // Discipline - preserve existing structure and data
        discipline: {
          sectionTitle: reportData.discipline?.sectionTitle || "Discipline Evaluation (30 Marks)",
          totalDisciplineMarks: reportData.discipline?.totalDisciplineMarks || 0,
          categories: reportData.discipline?.categories?.length > 0 
            ? reportData.discipline.categories 
            : formData.discipline.categories // fallback to default structure
        },
        
        // Technical Skills - ensure at least one empty entry for adding more
        technicalSkills: reportData.technicalSkills?.length > 0 
          ? [...reportData.technicalSkills, { skillName: "", theoryMarks: 0, practicalMarks: 0, totalPercentage: 0, remark: "" }]
          : [{ skillName: "", theoryMarks: 0, practicalMarks: 0, totalPercentage: 0, remark: "" }],
        
        // Career Readiness
        careerReadiness: {
          resumeStatus: reportData.careerReadiness?.resumeStatus || "",
          linkedinStatus: reportData.careerReadiness?.linkedinStatus || "",
          aptitudeStatus: reportData.careerReadiness?.aptitudeStatus || "",
          placementReady: reportData.careerReadiness?.placementReady || ""
        },
        
        // Academic Performance
        academicPerformance: {
          yearWiseSGPA: reportData.academicPerformance?.yearWiseSGPA?.length > 0 
            ? reportData.academicPerformance.yearWiseSGPA 
            : [{ year: "FY", sgpa: 0 }, { year: "SY", sgpa: 0 }, { year: "TY", sgpa: 0 }],
          cgpa: reportData.academicPerformance?.cgpa || 0
        },
        
        // Co-Curricular Activities - ensure at least one empty entry for adding more
        coCurricular: reportData.coCurricular?.length > 0 
          ? [...reportData.coCurricular, { category: "", title: "", remark: "" }]
          : [{ category: "", title: "", remark: "" }],
        
        // Final Assessment
        overallGrade: reportData.overallGrade || "",
        facultyRemark: reportData.facultyRemark || "",
        isFinalReport: reportData.isFinalReport || false
      });
    } else {
      console.log('⚠️ No existing report data found');
    }
  }, [existingReportData, loggedInUser?.name]);
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.batchYear.trim()) {
      toast.error('Please enter batch year');
      return;
    }
    if (!formData.generatedByName.trim()) {
      toast.error('Please enter faculty name');
      return;
    }
    if (!formData.overallGrade) {
      toast.error('Please select overall grade');
      return;
    }

    try {
      const reportData = {
        studentRef: id,
        batchYear: formData.batchYear.trim(),
        generatedByName: formData.generatedByName.trim(),
        softSkills: {
          sectionTitle: "Soft Skills Evaluation (50 Marks)",
          totalSoftSkillMarks: formData.softSkills.categories.reduce((sum, cat) => sum + (cat.score || 0), 0),
          categories: formData.softSkills.categories.map(cat => ({
            title: cat.title,
            maxMarks: cat.maxMarks,
            score: cat.score || 0,
            subcategories: cat.subcategories
          }))
        },
        discipline: {
          sectionTitle: "Discipline Evaluation (30 Marks)",
          totalDisciplineMarks: formData.discipline.categories.reduce((sum, cat) => sum + (cat.score || 0), 0),
          categories: formData.discipline.categories.map(cat => ({
            title: cat.title,
            maxMarks: cat.maxMarks,
            score: cat.score || 0,
            subcategories: cat.subcategories
          }))
        },
        technicalSkills: formData.technicalSkills
          .filter(skill => skill.skillName && skill.skillName.trim() !== "" && (skill.theoryMarks > 0 || skill.practicalMarks > 0))
          .map(skill => ({
            skillName: skill.skillName.trim(),
            theoryMarks: skill.theoryMarks || 0,
            practicalMarks: skill.practicalMarks || 0,
            totalPercentage: skill.totalPercentage || 0,
            remark: skill.remark.trim() || "No remarks"
          })),
        careerReadiness: formData.careerReadiness,
        academicPerformance: formData.academicPerformance,
        coCurricular: formData.coCurricular.filter(item => item.title && item.title.trim() !== "" && item.category && item.category.trim() !== ""),
        overallGrade: formData.overallGrade,
        facultyRemark: formData.facultyRemark.trim() || "No specific remarks",
        isFinalReport: formData.isFinalReport
      };

      console.log('Sending report data to API:', JSON.stringify(reportData, null, 2));
      const result = await createReportCard(reportData).unwrap();
      console.log('Report card created successfully:', result);

      toast.success(existingReportData?.data ? 'Report card updated successfully!' : 'Report card created successfully!');
      navigate(`/student/${id}/report`);
    } catch (error) {
      console.error('Submit Error:', error);

      let errorMsg = 'Failed to create report card';
      if (error.status === 400) {
        errorMsg = 'Invalid data format. Please check all fields.';
      } else if (error.status === 500) {
        errorMsg = 'Server error. Please try again later.';
      } else if (error.data?.message) {
        errorMsg = error.data.message;
      }

      toast.error(errorMsg);
    }
  };

  const updateSoftSkillSubcategory = (categoryIndex, subcategoryIndex, value) => {
    const newFormData = { ...formData };
    newFormData.softSkills.categories[categoryIndex].subcategories[subcategoryIndex].value = value;
    setFormData(newFormData);
  };

  const updateDisciplineSubcategory = (categoryIndex, subcategoryIndex, value) => {
    const newFormData = { ...formData };
    newFormData.discipline.categories[categoryIndex].subcategories[subcategoryIndex].value = value;
    setFormData(newFormData);
  };

  if (isLoading || reportLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader />
      </div>
    );
  }

  if (isError || !studentData) {
    return <div className="p-4 text-red-500">Error loading student data.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
        <button
          onClick={() => window.history.back()}
          className="group flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 text-gray-700 hover:text-gray-900"
        >
          <HiArrowNarrowLeft className="text-base sm:text-lg group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs sm:text-sm font-medium">Back</span>
        </button>
        <div className="h-6 sm:h-8 w-px bg-gray-300 hidden sm:block"></div>
        <div className="flex-1 sm:flex-none">
          <h1 className="text-lg sm:text-2xl font-bold text-black">
            {existingReportData?.data ? 'Edit Student Report' : 'Create Student Report'}
          </h1>
          <p className="text-gray-600">
            {existingReportData?.data ? 'Edit' : 'Create'} performance report for {studentData.firstName} {studentData.lastName}
          </p>
        </div>
      </div>


      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Batch Year <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.batchYear}
                onChange={(e) => setFormData({ ...formData, batchYear: e.target.value })}
                placeholder="e.g., 2024-25"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Generated By <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={`Prof. ${formData.generatedByName}`}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Academic Performance */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Academic Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {formData.academicPerformance.yearWiseSGPA.map((year, index) => (
              <div key={index}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {year.year} SGPA
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={year.sgpa}
                  onChange={(e) => {
                    const newFormData = { ...formData };
                    newFormData.academicPerformance.yearWiseSGPA[index].sgpa = parseFloat(e.target.value) || 0;

                    // Auto-calculate CGPA
                    const totalSGPA = newFormData.academicPerformance.yearWiseSGPA.reduce((sum, year) => sum + year.sgpa, 0);
                    const validSGPAs = newFormData.academicPerformance.yearWiseSGPA.filter(year => year.sgpa > 0).length;
                    newFormData.academicPerformance.cgpa = validSGPAs > 0 ? parseFloat((totalSGPA / validSGPAs).toFixed(2)) : 0;

                    setFormData(newFormData);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CGPA
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.academicPerformance.cgpa}
                onChange={(e) => {
                  const newFormData = { ...formData };
                  newFormData.academicPerformance.cgpa = parseFloat(e.target.value) || 0;
                  setFormData(newFormData);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Career Readiness */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Career Readiness</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <SimpleDropdown
                label="Resume Status"
                value={formData.careerReadiness.resumeStatus}
                onChange={(value) => {
                  const newFormData = { ...formData };
                  newFormData.careerReadiness.resumeStatus = value;
                  setFormData(newFormData);
                }}
                options={[
                  { value: "", label: "Select Status" },
                  { value: "Not created", label: "Not created" },
                  { value: "Need to improve", label: "Need to improve" },
                  { value: "Updated", label: "Updated" }
                ]}
              />
            </div>
            <div>
              <SimpleDropdown
                label="LinkedIn Status"
                value={formData.careerReadiness.linkedinStatus}
                onChange={(value) => {
                  const newFormData = { ...formData };
                  newFormData.careerReadiness.linkedinStatus = value;
                  setFormData(newFormData);
                }}
                options={[
                  { value: "", label: "Select Status" },
                  { value: "Not created", label: "Not created" },
                  { value: "Need to improve", label: "Need to improve" },
                  { value: "Updated", label: "Updated" }
                ]}
              />
            </div>
            <div>
              <SimpleDropdown
                label="Aptitude Status"
                value={formData.careerReadiness.aptitudeStatus}
                onChange={(value) => {
                  const newFormData = { ...formData };
                  newFormData.careerReadiness.aptitudeStatus = value;
                  setFormData(newFormData);
                }}
                options={[
                  { value: "", label: "Select Status" },
                  { value: "In-Progress", label: "In-Progress" },
                  { value: "Not Started", label: "Not Started" }
                ]}
              />
            </div>
            <div>
              <SimpleDropdown
                label="Placement Ready"
                value={formData.careerReadiness.placementReady}
                onChange={(value) => {
                  const newFormData = { ...formData };
                  newFormData.careerReadiness.placementReady = value;
                  setFormData(newFormData);
                }}
                  options={[
                  { value: "", label: "Select Status" },
                  { value: "Ready", label: "Ready" },
                  { value: "In-process", label: "In-process" },
                  { value: "Not Ready", label: "Not Ready" }
                ]}
              />
            </div>
          </div>
        </div>

        {/* Co-Curricular Activities */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Co-Curricular Activities</h3>
          {formData.coCurricular.map((activity, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={activity.category}
                  onChange={(e) => {
                    const newFormData = { ...formData };
                    newFormData.coCurricular[index].category = e.target.value;
                    setFormData(newFormData);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={activity.title}
                  onChange={(e) => {
                    const newFormData = { ...formData };
                    newFormData.coCurricular[index].title = e.target.value;
                    setFormData(newFormData);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remark
                </label>
                <input
                  type="text"
                  value={activity.remark}
                  onChange={(e) => {
                    const newFormData = { ...formData };
                    newFormData.coCurricular[index].remark = e.target.value;
                    setFormData(newFormData);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              const newFormData = { ...formData };
              newFormData.coCurricular.push({ category: "", title: "", remark: "" });
              setFormData(newFormData);
            }}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
          >
            Add More
          </button>
        </div>

        {/* Soft Skills */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Soft Skills Evaluation</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {formData.softSkills.categories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-lg font-bold text-gray-800 mb-3">{category.title}</h4>
                <div className="space-y-2 mb-3">
                  {category.subcategories.map((sub, subIndex) => (
                    <label key={subIndex} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sub.value}
                        onChange={(e) => {
                          updateSoftSkillSubcategory(categoryIndex, subIndex, e.target.checked);
                          // Auto-calculate score (2 points per checkbox)
                          const newFormData = { ...formData };
                          const checkedCount = newFormData.softSkills.categories[categoryIndex].subcategories.filter(s => s.value).length;
                          newFormData.softSkills.categories[categoryIndex].score = checkedCount * 2;
                          setFormData(newFormData);
                        }}
                        className="w-5 h-5 rounded border-2 border-gray-300 checked:bg-black checked:border-black focus:ring-2 focus:ring-black appearance-none relative checked:after:content-['✓'] checked:after:text-white checked:after:text-sm checked:after:font-bold checked:after:absolute checked:after:top-0 checked:after:left-1"
                      />
                      <span className="text-sm text-gray-700">{sub.name}</span>
                    </label>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Score:</span>
                  <input
                    type="number"
                    value={category.score}
                    readOnly
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-center bg-gray-100"
                  />
                  <span className="text-sm text-gray-600">/ {category.maxMarks}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Discipline */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Discipline Evaluation</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {formData.discipline.categories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-lg font-bold text-gray-800 mb-3">{category.title}</h4>
                <div className="space-y-2 mb-3">
                  {category.subcategories.map((sub, subIndex) => (
                    <label key={subIndex} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sub.value}
                        onChange={(e) => {
                          updateDisciplineSubcategory(categoryIndex, subIndex, e.target.checked);
                          // Auto-calculate score (2 points per checkbox)
                          const newFormData = { ...formData };
                          const checkedCount = newFormData.discipline.categories[categoryIndex].subcategories.filter(s => s.value).length;
                          newFormData.discipline.categories[categoryIndex].score = checkedCount * 2;
                          setFormData(newFormData);
                        }}
                        className="w-5 h-5 rounded border-2 border-gray-300 checked:bg-black checked:border-black focus:ring-2 focus:ring-black appearance-none relative checked:after:content-['✓'] checked:after:text-white checked:after:text-sm checked:after:font-bold checked:after:absolute checked:after:top-0 checked:after:left-1"
                      />
                      <span className="text-sm text-gray-700">{sub.name}</span>
                    </label>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Score:</span>
                  <input
                    type="number"
                    value={category.score}
                    readOnly
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-center bg-gray-100"
                  />
                  <span className="text-sm text-gray-600">/ {category.maxMarks}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Skills */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Technical Skills</h3>
          {formData.technicalSkills.map((skill, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4 p-4 border border-gray-200 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skill Name</label>
                <input
                  type="text"
                  value={skill.skillName}
                  onChange={(e) => {
                    const newSkills = [...formData.technicalSkills];
                    newSkills[index].skillName = e.target.value;
                    setFormData({ ...formData, technicalSkills: newSkills });
                  }}
                  placeholder="e.g., HTML & CSS"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Theory Marks (out of 10)</label>
                <input
                  type="number"
                  max="10"
                  value={skill.theoryMarks}
                  onChange={(e) => {
                    const newSkills = [...formData.technicalSkills];
                    const theoryMarks = Math.min(parseInt(e.target.value) || 0, 10);
                    newSkills[index].theoryMarks = theoryMarks;

                    // Calculate percentage and remark
                    const totalMarks = theoryMarks + newSkills[index].practicalMarks;
                    const percentage = Math.round((totalMarks / 20) * 100);
                    newSkills[index].totalPercentage = percentage;

                    // Auto-generate remark
                    if (percentage >= 90) newSkills[index].remark = "Excellent";
                    else if (percentage >= 80) newSkills[index].remark = "Very Good";
                    else if (percentage >= 70) newSkills[index].remark = "Good";
                    else if (percentage >= 60) newSkills[index].remark = "Average";
                    else if (percentage >= 50) newSkills[index].remark = "Below Average";
                    else newSkills[index].remark = "Poor";

                    setFormData({ ...formData, technicalSkills: newSkills });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Practical Marks (out of 10)</label>
                <input
                  type="number"
                  max="10"
                  value={skill.practicalMarks}
                  onChange={(e) => {
                    const newSkills = [...formData.technicalSkills];
                    const practicalMarks = Math.min(parseInt(e.target.value) || 0, 10);
                    newSkills[index].practicalMarks = practicalMarks;

                    // Calculate percentage and remark
                    const totalMarks = newSkills[index].theoryMarks + practicalMarks;
                    const percentage = Math.round((totalMarks / 20) * 100);
                    newSkills[index].totalPercentage = percentage;

                    // Auto-generate remark
                    if (percentage >= 90) newSkills[index].remark = "Excellent";
                    else if (percentage >= 80) newSkills[index].remark = "Very Good";
                    else if (percentage >= 70) newSkills[index].remark = "Good";
                    else if (percentage >= 60) newSkills[index].remark = "Average";
                    else if (percentage >= 50) newSkills[index].remark = "Below Average";
                    else newSkills[index].remark = "Poor";

                    setFormData({ ...formData, technicalSkills: newSkills });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Percentage</label>
                <input
                  type="number"
                  value={skill.totalPercentage}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remark</label>
                <input
                  type="text"
                  value={skill.remark}
                  onChange={(e) => {
                    const newSkills = [...formData.technicalSkills];
                    newSkills[index].remark = e.target.value;
                    setFormData({ ...formData, technicalSkills: newSkills });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              const newFormData = { ...formData };
              newFormData.technicalSkills.push({ skillName: "", theoryMarks: 0, practicalMarks: 0, totalPercentage: 0, remark: "" });
              setFormData(newFormData);
            }}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
          >
            Add More
          </button>
        </div>

        {/* Final Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Final Assessment</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall Grade <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.overallGrade}
                onChange={(e) => setFormData({ ...formData, overallGrade: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              >
                <option value="">Select Grade</option>
                <option value="A+">A+</option>
                <option value="A">A</option>
                <option value="B+">B+</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Faculty Remark</label>
              <textarea
                value={formData.facultyRemark}
                onChange={(e) => setFormData({ ...formData, facultyRemark: e.target.value })}
                rows={3}
                placeholder="Enter faculty remarks about student performance..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isCreating}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
          >
            {isCreating ? 'Saving...' : (existingReportData?.data ? 'Update Report' : 'Save Report')}
          </button>
        </div>
      </form>
    </div>
  );
}