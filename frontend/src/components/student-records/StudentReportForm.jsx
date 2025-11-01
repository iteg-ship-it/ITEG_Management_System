import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetAdmittedStudentsByIdQuery } from "../../redux/api/authApi";
import { HiArrowNarrowLeft } from "react-icons/hi";
import Loader from "../common-components/loader/Loader";

export default function StudentReportForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: studentData, isLoading, isError } = useGetAdmittedStudentsByIdQuery(id);

  const [formData, setFormData] = useState({
    batchYear: "2024-25",
    generatedByName: "Prof. Azhar Ali",
    softSkills: {
      sectionTitle: "Soft Skills Evaluation (50 Marks)",
      totalSoftSkillMarks: 42,
      categories: [
        {
          title: "Presentation Skills",
          maxMarks: 10,
          score: 8,
          subcategories: [
            { name: "Content & Structure", value: true },
            { name: "Confidence & Clarity", value: true },
            { name: "Body Language", value: false },
            { name: "Engagement with Audience", value: true },
            { name: "Voice Modulation", value: true }
          ]
        },
        {
          title: "Team Collaboration",
          maxMarks: 10,
          score: 9,
          subcategories: [
            { name: "Active Participation", value: true },
            { name: "Cooperation", value: true },
            { name: "Leadership", value: false },
            { name: "Task Contribution", value: true },
            { name: "Conflict Resolution", value: true }
          ]
        },
        {
          title: "Time Management",
          maxMarks: 10,
          score: 7,
          subcategories: [
            { name: "Punctuality", value: true },
            { name: "Deadline Handling", value: false },
            { name: "Task Prioritization", value: true },
            { name: "Consistency", value: true },
            { name: "Efficiency", value: false }
          ]
        }
      ]
    },
    discipline: {
      sectionTitle: "Discipline Evaluation (30 Marks)",
      totalDisciplineMarks: 26,
      categories: [
        {
          title: "Attendance",
          maxMarks: 10,
          score: 9,
          subcategories: [
            { name: "Regular Attendance", value: true },
            { name: "Leaves with Permission", value: true },
            { name: "Class Participation", value: false },
            { name: "Punctual Entry", value: true },
            { name: "Active Listening", value: true }
          ]
        },
        {
          title: "Behaviour",
          maxMarks: 10,
          score: 8,
          subcategories: [
            { name: "Politeness", value: true },
            { name: "Respect for Faculty", value: true },
            { name: "Team Behaviour", value: true },
            { name: "Classroom Conduct", value: false },
            { name: "Responsibility", value: true }
          ]
        },
        {
          title: "Professionalism",
          maxMarks: 10,
          score: 9,
          subcategories: [
            { name: "Dress Code", value: true },
            { name: "Communication Etiquette", value: true },
            { name: "Task Ownership", value: true },
            { name: "Timely Submission", value: false },
            { name: "Accountability", value: true }
          ]
        }
      ]
    },
    technicalSkills: [
      {
        skillName: "HTML & CSS",
        theoryMarks: 9,
        practicalMarks: 10,
        totalPercentage: 95,
        remark: "Excellent design understanding"
      },
      {
        skillName: "JavaScript",
        theoryMarks: 8,
        practicalMarks: 9,
        totalPercentage: 85,
        remark: "Good logical thinking"
      },
      {
        skillName: "React.js",
        theoryMarks: 7,
        practicalMarks: 8,
        totalPercentage: 80,
        remark: "Can build UI independently"
      }
    ],
    careerReadiness: {
      resumeStatus: "Uploaded",
      linkedinStatus: "Up-to-date",
      aptitudeStatus: "Done",
      placementReady: "Ready"
    },
    academicPerformance: {
      yearWiseSGPA: [
        { year: "FY", sgpa: 8.1 },
        { year: "SY", sgpa: 8.5 },
        { year: "TY", sgpa: 8.8 }
      ],
      cgpa: 8.47
    },
    coCurricular: [
      {
        category: "Certification",
        title: "React Developer Course - Coursera",
        remark: "Completed with distinction"
      },
      {
        category: "Project",
        title: "Job Portal MERN App",
        remark: "Deployed successfully on Render"
      },
      {
        category: "Sports",
        title: "Football Championship",
        remark: "Team Captain"
      }
    ],
    overallGrade: "A",
    facultyRemark: "Shows consistent improvement and discipline.",
    isFinalReport: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Report Data:", formData);
    // Add API call here to save the report
    navigate(`/student/${id}/report`);
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Batch Year</label>
              <input
                type="text"
                value={formData.batchYear}
                onChange={(e) => setFormData({...formData, batchYear: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Generated By</label>
              <input
                type="text"
                value={formData.generatedByName}
                onChange={(e) => setFormData({...formData, generatedByName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Overall Grade</label>
              <select
                value={formData.overallGrade}
                onChange={(e) => setFormData({...formData, overallGrade: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              >
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
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Report
          </button>
        </div>
      </form>
    </div>
  );
}