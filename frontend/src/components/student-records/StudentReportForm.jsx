import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetAdmittedStudentsByIdQuery, useCreateReportCardMutation } from "../../redux/api/authApi";
import { HiArrowNarrowLeft } from "react-icons/hi";
import Loader from "../common-components/loader/Loader";

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
  const [createReportCard, { isLoading: isCreating, error: mutationError }] = useCreateReportCardMutation();
  const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');

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
      },
      {
        skillName: "",
        theoryMarks: 0,
        practicalMarks: 0,
        totalPercentage: 0,
        remark: ""
      },
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
      },
      {
        category: "",
        title: "",
        remark: ""
      },
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
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.batchYear.trim()) {
      alert('Please enter batch year');
      return;
    }
    if (!formData.generatedByName.trim()) {
      alert('Please enter faculty name');
      return;
    }
    if (!formData.overallGrade) {
      alert('Please select overall grade');
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
          .filter(skill => skill.skillName && skill.skillName.trim() !== "")
          .map(skill => ({
            skillName: skill.skillName.trim(),
            theoryMarks: skill.theoryMarks || 0,
            practicalMarks: skill.practicalMarks || 0,
            totalPercentage: skill.totalPercentage || 0,
            remark: skill.remark.trim() || "No remarks"
          })),
        careerReadiness: formData.careerReadiness,
        academicPerformance: formData.academicPerformance,
        coCurricular: formData.coCurricular.filter(item => item.title && item.title.trim() !== ""),
        overallGrade: formData.overallGrade,
        facultyRemark: formData.facultyRemark.trim() || "No specific remarks",
        isFinalReport: formData.isFinalReport
      };
      
      console.log('Sending report data to API:', JSON.stringify(reportData, null, 2));
      const result = await createReportCard(reportData).unwrap();
      console.log('Report card created successfully:', result);
      
      alert('Report card created successfully!');
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
      
      alert(errorMsg);
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

  if (isLoading) {
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
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-gray-700 hover:text-gray-900 mb-4"
        >
          <HiArrowNarrowLeft className="text-lg" />
          <span className="text-sm font-medium">Back</span>
        </button>
        
        <h1 className="text-2xl font-bold text-gray-900">Edit Student Report</h1>
        <p className="text-gray-600">Edit performance report for {studentData.firstName} {studentData.lastName}</p>
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
                onChange={(e) => setFormData({...formData, batchYear: e.target.value})}
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
                value={formData.generatedByName}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Academic Performance */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Academic Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
                    const newFormData = {...formData};
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
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CGPA
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.academicPerformance.cgpa}
              onChange={(e) => {
                const newFormData = {...formData};
                newFormData.academicPerformance.cgpa = parseFloat(e.target.value) || 0;
                setFormData(newFormData);
              }}
              className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
            />
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
                  const newFormData = {...formData};
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
                  const newFormData = {...formData};
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aptitude Status
              </label>
              <input
                type="text"
                value={formData.careerReadiness.aptitudeStatus}
                onChange={(e) => {
                  const newFormData = {...formData};
                  newFormData.careerReadiness.aptitudeStatus = e.target.value;
                  setFormData(newFormData);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Placement Ready
              </label>
              <input
                type="text"
                value={formData.careerReadiness.placementReady}
                onChange={(e) => {
                  const newFormData = {...formData};
                  newFormData.careerReadiness.placementReady = e.target.value;
                  setFormData(newFormData);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
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
                    const newFormData = {...formData};
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
                    const newFormData = {...formData};
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
                    const newFormData = {...formData};
                    newFormData.coCurricular[index].remark = e.target.value;
                    setFormData(newFormData);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Soft Skills */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Soft Skills Evaluation</h3>
          {formData.softSkills.categories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-800">{category.title}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Score:</span>
                  <input
                    type="number"
                    value={category.score}
                    max={category.maxMarks}
                    onChange={(e) => {
                      const newFormData = {...formData};
                      newFormData.softSkills.categories[categoryIndex].score = parseInt(e.target.value);
                      setFormData(newFormData);
                    }}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                  />
                  <span className="text-sm text-gray-600">/ {category.maxMarks}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {category.subcategories.map((sub, subIndex) => (
                  <label key={subIndex} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sub.value}
                      onChange={(e) => updateSoftSkillSubcategory(categoryIndex, subIndex, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{sub.name}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Discipline */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Discipline Evaluation</h3>
          {formData.discipline.categories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-800">{category.title}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Score:</span>
                  <input
                    type="number"
                    value={category.score}
                    max={category.maxMarks}
                    onChange={(e) => {
                      const newFormData = {...formData};
                      newFormData.discipline.categories[categoryIndex].score = parseInt(e.target.value);
                      setFormData(newFormData);
                    }}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                  />
                  <span className="text-sm text-gray-600">/ {category.maxMarks}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {category.subcategories.map((sub, subIndex) => (
                  <label key={subIndex} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sub.value}
                      onChange={(e) => updateDisciplineSubcategory(categoryIndex, subIndex, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{sub.name}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
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
                    setFormData({...formData, technicalSkills: newSkills});
                  }}
                  placeholder="e.g., HTML & CSS"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Theory Marks</label>
                <input
                  type="number"
                  value={skill.theoryMarks}
                  onChange={(e) => {
                    const newSkills = [...formData.technicalSkills];
                    newSkills[index].theoryMarks = parseInt(e.target.value);
                    setFormData({...formData, technicalSkills: newSkills});
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Practical Marks</label>
                <input
                  type="number"
                  value={skill.practicalMarks}
                  onChange={(e) => {
                    const newSkills = [...formData.technicalSkills];
                    newSkills[index].practicalMarks = parseInt(e.target.value);
                    setFormData({...formData, technicalSkills: newSkills});
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Percentage</label>
                <input
                  type="number"
                  value={skill.totalPercentage}
                  onChange={(e) => {
                    const newSkills = [...formData.technicalSkills];
                    newSkills[index].totalPercentage = parseInt(e.target.value);
                    setFormData({...formData, technicalSkills: newSkills});
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
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
                    setFormData({...formData, technicalSkills: newSkills});
                  }}
                  placeholder="e.g., Excellent understanding"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          ))}
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
                onChange={(e) => setFormData({...formData, overallGrade: e.target.value})}
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
                onChange={(e) => setFormData({...formData, facultyRemark: e.target.value})}
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
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isCreating ? 'Saving...' : 'Save Report'}
          </button>
        </div>
      </form>
    </div>
  );
}