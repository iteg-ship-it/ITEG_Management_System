// StudentReport.jsx
import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetAdmittedStudentsByIdQuery, useGetReportCardQuery } from "../../redux/api/authApi";
import { HiArrowNarrowLeft } from "react-icons/hi";
import { FaDownload } from "react-icons/fa6";
import Loader from "../common-components/loader/Loader";
import logo from '../../assets/images/doulLogo.png';
import { RiEdit2Fill } from "react-icons/ri";
import { PDFDownloadLink } from '@react-pdf/renderer';
import StudentReportPDF from './StudentReportPDF';
// import profileIcon from '../../assets/icons/StuReportprofile_icon.png';
// import courseIcon from '../../assets/icons/StuReportCourse_icon.png';
import mailIcon from '../../assets/icons/StuReportMail_icon.png';
import fatherIcon from '../../assets/icons/StuReportFather_icon.png';
import contactIcon from '../../assets/icons/StuReport_Phone.png';
import addressIcon from '../../assets/icons/StuReportAddress_icon.png';

/**
 * Simplified LevelStepper - only levels 1A..2C shown with a connecting line.
 * No trophy/goal. Pass `levels` and `currentLevel`.
 */
function LevelStepper({ levels = ['1A','1B','1C','2A','2B','2C'], currentLevel = '1A' }) {
  const currentIndex = useMemo(() => {
    const idx = levels.indexOf(currentLevel);
    return idx === -1 ? 0 : idx;
  }, [levels, currentLevel]);

  // percent of line filled up to current step (0..100)
  const fillPercent = useMemo(() => {
    if (levels.length <= 1) return 0;
    return (currentIndex / (levels.length - 1)) * 100;
  }, [levels.length, currentIndex]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Level Progress</h3>
          <p className="text-sm text-gray-600">
            Current Level: <span className="font-semibold text-indigo-600 ml-1">{currentLevel}</span>
          </p>
        </div>

        <div className="text-sm text-gray-700">{Math.round(fillPercent)}% Complete</div>
      </div>

      <div className="flex items-center gap-12 mt-6">
        {/* Stepper Section - 85% */}
        <div className="flex-1 relative">
          {/* baseline track */}
          <div className="absolute left-5 right-5 top-5 h-2 bg-gray-200 rounded-full"></div>

          {/* filled part */}
          <div
            className="absolute left-5 top-5 h-2 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full transition-all duration-500"
            style={{ width: `calc((100% - 40px) * ${fillPercent / 100})` }}
          />

          {/* steps: evenly distributed */}
          <div className="flex justify-between relative z-10">
            {levels.map((lvl, i) => {
              const isPassed = i < currentIndex;
              const isCurrent = i === currentIndex;
              const circleClass = isPassed
                ? "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm shadow-md bg-gradient-to-br from-green-500 to-emerald-600 text-white"
                : isCurrent
                  ? "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm shadow-md bg-orange-400 text-white"
                  : "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm shadow-md bg-white border border-gray-200 text-gray-500";

              return (
                <div key={lvl} className="flex flex-col items-center">
                  <div className={circleClass}>
                    {isPassed ? '✓' : lvl}
                  </div>
                  <div className={`text-xs mt-2 font-medium ${isPassed || isCurrent ? 'text-gray-700' : 'text-gray-400'}`}>
                    {lvl}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Goal Section - positioned at the end */}
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-2xl shadow-lg">
            🏆
          </div>
          <span className="text-xs mt-2 font-medium text-gray-700">Goal</span>
        </div>
      </div>
    </div>
  );
}

export default function StudentReport() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: studentData, isLoading, isError } = useGetAdmittedStudentsByIdQuery(id);
  const { data: reportCardResponse, isLoading: reportLoading, isError: reportError } = useGetReportCardQuery(id);
  const reportCardData = reportCardResponse?.data;

  // show loader while either is loading
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
    <div className="min-h-screen bg-white">
      {/* Top sticky header */}
      <div className="sticky top-0 z-10 print:hidden bg-white">
        <div className="py-2 sm:py-4 ">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 ">
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
                <h1 className="text-lg sm:text-2xl font-bold text-black">Student Report Card</h1>
                <p className="text-gray-600">Comprehensive performance report for {studentData.firstName} {studentData.lastName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <PDFDownloadLink
                document={<StudentReportPDF studentData={studentData} reportCardData={reportCardData} />}
                fileName={`${studentData.firstName}_${studentData.lastName}_Report_Card.pdf`}
                className="p-2 bg-green-500 text-white rounded-full text-2xl font-medium hover:bg-green-600 transition-colors"
              >
                {({ loading }) =>
                  loading ? (
                    <div className="animate-spin">⏳</div>
                  ) : (
                    <FaDownload />
                  )
                }
              </PDFDownloadLink>

              <button
                onClick={() => {
                  try {
                    navigate(`/student/${id}/report/edit`);
                  } catch (error) {
                    console.error('Navigation error:', error);
                    navigate('edit');
                  }
                }}
                className="p-2 bg-orange-400 text-white rounded-full text-2xl font-medium hover:bg-orange-500 transition-colors"
              >
                <RiEdit2Fill />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="min-h-screen p-6 print:p-0 print:m-0">
        <div id="pdf-content" className="max-w-7xl mx-auto bg-white shadow-2xl rounded-2xl p-8 print:shadow-none print:bg-white print:mx-0 print:rounded-none border border-gray-100">

          {/* Header */}
          <div className="relative bg-white rounded-xl p-6 mb-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <img src={logo} alt="ITEG Logo" className="h-16 object-contain" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold mb-1 text-gray-800">Student Report Card</h1>
                  <p className="text-gray-600 text-sm">Comprehensive Performance Analysis</p>
                </div>
              </div>
              <div className="text-right bg-gray-50 rounded-lg p-4">
                <p className="text-gray-600 text-sm">Academic Year</p>
                <p className="font-bold text-lg text-gray-800">{reportCardData?.batchYear || '2024-25'}</p>
                <p className="text-gray-500 text-xs mt-1">Generated: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Student Info */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 mb-6 border border-gray-200">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {studentData.firstName?.[0]}{studentData.lastName?.[0]}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{studentData.firstName} {studentData.lastName}</h2>
                <p className="text-blue-600 font-medium">{studentData.course || "N/A"} • Level {studentData.currentLevel || "1A"}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <img src={mailIcon} alt="Email" className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</span>
                </div>
                <p className="text-sm font-semibold text-gray-800 truncate">{studentData.email || "N/A"}</p>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <img src={contactIcon} alt="Phone" className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Contact</span>
                </div>
                <p className="text-sm font-semibold text-gray-800">{studentData.studentMobile || "N/A"}</p>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <img src={fatherIcon} alt="Father" className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Father</span>
                </div>
                <p className="text-sm font-semibold text-gray-800">{studentData.fatherName || "N/A"}</p>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <img src={addressIcon} alt="Track" className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Track</span>
                </div>
                <p className="text-sm font-semibold text-gray-800">{studentData.track || studentData.techno || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Simplified Level Stepper (only levels + line) */}
          <LevelStepper
            levels={['1A','1B','1C','2A','2B','2C']}
            currentLevel={studentData.currentLevel || '1A'}
          />

          {/* Skills & Performance Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Technical Skills */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-600 text-lg">💻</span>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Technical Skills</h3>
              </div>

              <div className="space-y-4">
                {reportCardData?.technicalSkills?.length > 0 ? reportCardData.technicalSkills.map((tech, index) => {
                  const colors = ['from-blue-500 to-blue-600', 'from-green-500 to-green-600', 'from-purple-500 to-purple-600', 'from-red-500 to-red-600', 'from-yellow-500 to-yellow-600'];
                  return (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-800">{tech.skillName}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-700">{tech.totalPercentage}%</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            tech.totalPercentage >= 90 ? 'bg-green-100 text-green-800' :
                            tech.totalPercentage >= 80 ? 'bg-blue-100 text-blue-800' :
                            tech.totalPercentage >= 70 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>{tech.remark}</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full bg-gradient-to-r ${colors[index % colors.length]} transition-all duration-1000`}
                          style={{ width: `${tech.totalPercentage}%` }}
                        />
                      </div>
                    </div>
                  );
                }) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No technical skills data</p>
                  </div>
                )}
              </div>
            </div>

            {/* Soft Skills */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-600 text-lg">🧠</span>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Soft Skills</h3>
              </div>

              <div className="space-y-4">
                {reportCardData?.softSkills?.categories?.length > 0 ? reportCardData.softSkills.categories.map((category, index) => {
                  const percentage = category.maxMarks ? (category.score / category.maxMarks) * 100 : 0;
                  let status = "Poor";
                  let statusColor = "bg-red-100 text-red-800";

                  if (percentage >= 90) {
                    status = "Excellent";
                    statusColor = "bg-green-100 text-green-800";
                  } else if (percentage >= 70) {
                    status = "Good";
                    statusColor = "bg-blue-100 text-blue-800";
                  } else if (percentage >= 50) {
                    status = "Average";
                    statusColor = "bg-yellow-100 text-yellow-800";
                  }

                  return (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-800">{category.title}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                          {status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Score: {category.score}/{category.maxMarks}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2 ml-2">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-1000"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="font-medium">{Math.round(percentage)}%</span>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No soft skills data</p>
                  </div>
                )}
              </div>
            </div>

            {/* Discipline */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-600 text-lg">🎖️</span>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Discipline</h3>
              </div>

              <div className="space-y-4">
                {reportCardData?.discipline?.categories?.length > 0 ? reportCardData.discipline.categories.map((category, index) => {
                  const percentage = category.maxMarks ? (category.score / category.maxMarks) * 100 : 0;
                  return (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-800">{category.title}</span>
                        <span className="text-sm font-bold text-gray-700">{category.score}/{category.maxMarks}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                          <div
                            className="h-3 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 transition-all duration-1000"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-600">{Math.round(percentage)}%</span>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No discipline data</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Career Readiness & Academic Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Career Readiness */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-600 text-lg">🚀</span>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Career Readiness</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {reportCardData?.careerReadiness ? (
                  <>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">📄</span>
                        <span className="text-sm font-medium text-blue-700">Resume</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        reportCardData.careerReadiness.resumeStatus === 'Updated' ? 'bg-green-100 text-green-800' :
                        reportCardData.careerReadiness.resumeStatus === 'Need to improve' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>{reportCardData.careerReadiness.resumeStatus}</span>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🔗</span>
                        <span className="text-sm font-medium text-indigo-700">LinkedIn</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        reportCardData.careerReadiness.linkedinStatus === 'Updated' ? 'bg-green-100 text-green-800' :
                        reportCardData.careerReadiness.linkedinStatus === 'Need to improve' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>{reportCardData.careerReadiness.linkedinStatus}</span>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🧠</span>
                        <span className="text-sm font-medium text-purple-700">Aptitude</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        reportCardData.careerReadiness.aptitudeStatus === 'In-Progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>{reportCardData.careerReadiness.aptitudeStatus}</span>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🎯</span>
                        <span className="text-sm font-medium text-green-700">Placement</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        reportCardData.careerReadiness.placementReady === 'Ready' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>{reportCardData.careerReadiness.placementReady}</span>
                    </div>
                  </>
                ) : (
                  <div className="col-span-2 text-center py-8 text-gray-500">
                    <p>No career readiness data</p>
                  </div>
                )}
              </div>
            </div>

            {/* Academic Performance */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-600 text-lg">🎓</span>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Academic Performance</h3>
              </div>

              <div className="space-y-4">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-4 text-white text-center">
                  <p className="text-sm opacity-90 mb-1">Overall CGPA</p>
                  <p className="text-3xl font-bold">{reportCardData?.academicPerformance?.cgpa || "N/A"}</p>
                  <p className="text-sm opacity-75">out of 10.0</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
                    <p className="text-xs font-medium text-blue-700 mb-1">FY SGPA</p>
                    <p className="text-lg font-bold text-blue-800">
                      {reportCardData?.academicPerformance?.yearWiseSGPA?.find(y => y.year === 'FY')?.sgpa || "N/A"}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center border border-green-200">
                    <p className="text-xs font-medium text-green-700 mb-1">SY SGPA</p>
                    <p className="text-lg font-bold text-green-800">
                      {reportCardData?.academicPerformance?.yearWiseSGPA?.find(y => y.year === 'SY')?.sgpa || "N/A"}
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 text-center border border-purple-200">
                    <p className="text-xs font-medium text-purple-700 mb-1">TY SGPA</p>
                    <p className="text-lg font-bold text-purple-800">
                      {reportCardData?.academicPerformance?.yearWiseSGPA?.find(y => y.year === 'TY')?.sgpa || "N/A"}
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Co-Curricular Activities */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-600 text-lg">🏆</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800">Co-Curricular Activities</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {(() => {
                const categories = [
                  { name: 'Certificate', icon: '🏅' },
                  { name: 'Project', icon: '💻' },
                  { name: 'Sports', icon: '⚽' }
                ];

                return categories.map((category) => {
                  const count = reportCardData?.coCurricular?.filter(activity =>
                    activity.category.toLowerCase() === category.name.toLowerCase()
                  ).length || 0;

                  return (
                    <div key={category.name} className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl text-gray-600">{category.icon}</span>
                      </div>
                      <h4 className="font-semibold text-gray-800 mb-1">{category.name}</h4>
                      <p className="text-2xl font-bold text-gray-700">{count}</p>
                      <p className="text-xs text-gray-500">Activities</p>
                    </div>
                  );
                });
              })()}
            </div>

            {reportCardData?.coCurricular?.length > 0 && (
              <div className="space-y-6">
                <h4 className="font-semibold text-gray-700 mb-4">Activity Details</h4>
                {(() => {
                  const groupedActivities = reportCardData.coCurricular.reduce((acc, activity) => {
                    const category = activity.category.toLowerCase();
                    if (!acc[category]) acc[category] = [];
                    acc[category].push(activity);
                    return acc;
                  }, {});

                  return Object.entries(groupedActivities).map(([category, activities]) => (
                    <div key={category} className="mb-6">
                      <h5 className={`font-semibold text-lg mb-3 uppercase tracking-wide ${
                        category === 'certificate' ? 'text-yellow-600' :
                        category === 'project' ? 'text-blue-600' :
                        'text-green-600'
                      }`}>{category} ({activities.length})</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activities.map((activity, index) => (
                          <div key={index} className={`rounded-lg p-4 border ${
                            category === 'certificate' ? 'border-yellow-200 bg-yellow-50' :
                            category === 'project' ? 'border-blue-200 bg-blue-50' :
                            'border-green-200 bg-green-50'
                          }`}>
                            <h6 className="font-semibold text-gray-800 mb-2">{activity.title}</h6>
                            <p className="text-sm text-gray-600">{activity.remark}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            )}
          </div>

          {/* Faculty Feedback */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-600 text-lg">📝</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800">Faculty Feedback</h3>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {reportCardData?.generatedByName?.split(' ').map(n => n[0]).join('') || 'FA'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-800">{reportCardData?.generatedByName || "Faculty"}</p>
                      <p className="text-sm text-gray-600">Course Instructor</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 mb-1">
                        {(() => {
                          const grade = reportCardData?.overallGrade;
                          let rating = 3;
                          if (grade === 'A+') rating = 5;
                          else if (grade === 'A') rating = 4.5;
                          else if (grade === 'B+') rating = 4;
                          else if (grade === 'B') rating = 3.5;
                          else if (grade === 'C+') rating = 3;
                          else if (grade === 'C') rating = 2.5;

                          return [1,2,3,4,5].map((star) => {
                            if (star <= Math.floor(rating)) {
                              return <span key={star} className="text-lg text-yellow-400">★</span>;
                            } else if (star === Math.floor(rating) + 1 && rating % 1 === 0.5) {
                              return (
                                <span key={star} className="relative text-lg inline-block">
                                  <span className="text-gray-300">★</span>
                                  <span className="absolute top-0 left-0 text-yellow-400 overflow-hidden" style={{ width: '50%' }}>★</span>
                                </span>
                              );
                            } else {
                              return <span key={star} className="text-lg text-gray-300">★</span>;
                            }
                          });
                        })()}
                      </div>
                      <p className="text-sm text-gray-600">Overall Grade: <span className="font-bold text-indigo-600">{reportCardData?.overallGrade || "N/A"}</span></p>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-blue-100">
                    <p className="text-gray-700 italic leading-relaxed">
                      "{reportCardData?.facultyRemark || "No specific remarks provided."}"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Final Assessment */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl shadow-lg p-6 text-white">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">Final Assessment</h3>
              <p className="text-indigo-200">Overall Performance Summary</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🎯</span>
                </div>
                <h4 className="font-semibold mb-2">Current Level</h4>
                <p className="text-2xl font-bold">{studentData.currentLevel || "1A"}</p>
                <p className="text-sm text-indigo-200 mt-1">Academic Progress</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🏆</span>
                </div>
                <h4 className="font-semibold mb-2">Overall Grade</h4>
                <p className="text-3xl font-bold">{reportCardData?.overallGrade || "N/A"}</p>
                <p className="text-sm text-indigo-200 mt-1">Performance Rating</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">📈</span>
                </div>
                <h4 className="font-semibold mb-2">Status</h4>
                <p className="text-xl font-bold">{reportCardData?.isFinalReport ? 'Final' : 'Progress'}</p>
                <p className="text-sm text-indigo-200 mt-1">Report Type</p>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-indigo-200 text-sm">
                Generated on {new Date(reportCardData?.updatedAt || Date.now()).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}



// import { useParams, useNavigate } from "react-router-dom";
// import { useGetAdmittedStudentsByIdQuery, useGetReportCardQuery } from "../../redux/api/authApi";
// import { HiArrowNarrowLeft } from "react-icons/hi";
// import { FaUserGroup, FaDownload } from "react-icons/fa6";
// import { useState } from "react";
// import Loader from "../common-components/loader/Loader";
// import logo from '../../assets/images/doulLogo.png';
// import { RiEdit2Fill } from "react-icons/ri";
// import { PDFDownloadLink } from '@react-pdf/renderer';
// import StudentReportPDF from './StudentReportPDF';
// import profileIcon from '../../assets/icons/StuReportprofile_icon.png';
// import courseIcon from '../../assets/icons/StuReportCourse_icon.png';
// import mailIcon from '../../assets/icons/StuReportMail_icon.png';
// import fatherIcon from '../../assets/icons/StuReportFather_icon.png';
// import contactIcon from '../../assets/icons/StuReport_Phone.png';
// import addressIcon from '../../assets/icons/StuReportAddress_icon.png';


// export default function StudentReport() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { data: studentData, isLoading, isError } = useGetAdmittedStudentsByIdQuery(id);
//   const { data: reportCardResponse, isLoading: reportLoading, isError: reportError } = useGetReportCardQuery(id);
//   const reportCardData = reportCardResponse?.data;




//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-white">
//         <Loader />
//       </div>
//     );
//   }

//   if (isError || !studentData) {
//     return <div className="p-4 text-red-500">Error loading student data.</div>;
//   }

//   return (
//     <div className="min-h-screen bg-white">
//       {/* Professional Header */}
//       <div className="sticky top-0 z-10 print:hidden">
//         <div className="py-2 sm:py-4 ">
//           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
//             <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
//               <button
//                 onClick={() => window.history.back()}
//                 className="group flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 text-gray-700 hover:text-gray-900"
//               >
//                 <HiArrowNarrowLeft className="text-base sm:text-lg group-hover:-translate-x-1 transition-transform" />
//                 <span className="text-xs sm:text-sm font-medium">Back</span>
//               </button>
//               <div className="h-6 sm:h-8 w-px bg-gray-300 hidden sm:block"></div>
//               <div className="flex-1 sm:flex-none">
//                 <h1 className="text-lg sm:text-2xl font-bold text-black">Student Report Card</h1>
//                 <p className="text-gray-600">Comprehensive performance report for {studentData.firstName} {studentData.lastName}</p>
//               </div>
//             </div>
//             <div className="flex items-center gap-3">
//               {/* PDF Download Button */}
//               <PDFDownloadLink
//                 document={<StudentReportPDF studentData={studentData} reportCardData={reportCardData} />}
//                 fileName={`${studentData.firstName}_${studentData.lastName}_Report_Card.pdf`}
//                 className="p-2 bg-green-500 text-white rounded-full text-2xl font-medium hover:bg-green-600 transition-colors"
//               >
//                 {({ blob, url, loading, error }) =>
//                   loading ? (
//                     <div className="animate-spin">⏳</div>
//                   ) : (
//                     <FaDownload />
//                   )
//                 }
//               </PDFDownloadLink>
              
//               <button
//                 onClick={() => {
//                   try {
//                     navigate(`/student/${id}/report/edit`);
//                   } catch (error) {
//                     console.error('Navigation error:', error);
//                     // Fallback: try relative navigation
//                     navigate('edit');
//                   }
//                 }}
//                 className="p-2 bg-orange-400 text-white rounded-full text-2xl font-medium hover:bg-orange-500 transition-colors"
//               >
//                 <RiEdit2Fill />
//               </button>
//             </div>

//           </div>
//         </div>
//       </div>

//       {/* Full Width Professional Background */}
//       <div className="min-h-screen p-6 print:p-0 print:m-0">
//         <div id="pdf-content" className="max-w-7xl mx-auto bg-white shadow-2xl rounded-2xl p-8 print:shadow-none print:bg-white print:mx-0 print:rounded-none border border-gray-100">

//           {/* Professional Header */}
//           <div className="relative bg-white rounded-xl p-6 mb-6 border border-gray-200">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-4">
//                 <div className="bg-gray-100 rounded-lg p-3">
//                   <img src={logo} alt="ITEG Logo" className="h-12 object-contain" />
//                 </div>
//                 <div>
//                   <h1 className="text-2xl font-bold mb-1 text-gray-800">Student Report Card</h1>
//                   <p className="text-gray-600 text-sm">Comprehensive Performance Analysis</p>
//                 </div>
//               </div>
//               <div className="text-right bg-gray-50 rounded-lg p-4">
//                 <p className="text-gray-600 text-sm">Academic Year</p>
//                 <p className="font-bold text-lg text-gray-800">{reportCardData?.batchYear || '2024-25'}</p>
//                 <p className="text-gray-500 text-xs mt-1">Generated: {new Date().toLocaleDateString()}</p>
//               </div>
//             </div>
//           </div>

//           {/* Student Information Card */}
//           <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 mb-6 border border-gray-200">
//             <div className="flex items-center gap-4 mb-6">
//               <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
//                 {studentData.firstName?.[0]}{studentData.lastName?.[0]}
//               </div>
//               <div>
//                 <h2 className="text-2xl font-bold text-gray-800">{studentData.firstName} {studentData.lastName}</h2>
//                 <p className="text-blue-600 font-medium">{studentData.course || "N/A"} • Level {studentData.currentLevel || "1A"}</p>
//               </div>
//             </div>
            
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//               <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
//                 <div className="flex items-center gap-2 mb-2">
//                   <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
//                     <img src={mailIcon} alt="Email" className="w-4 h-4" />
//                   </div>
//                   <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</span>
//                 </div>
//                 <p className="text-sm font-semibold text-gray-800 truncate">{studentData.email || "N/A"}</p>
//               </div>
              
//               <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
//                 <div className="flex items-center gap-2 mb-2">
//                   <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
//                     <img src={contactIcon} alt="Phone" className="w-4 h-4" />
//                   </div>
//                   <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Contact</span>
//                 </div>
//                 <p className="text-sm font-semibold text-gray-800">{studentData.studentMobile || "N/A"}</p>
//               </div>
              
//               <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
//                 <div className="flex items-center gap-2 mb-2">
//                   <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
//                     <img src={fatherIcon} alt="Father" className="w-4 h-4" />
//                   </div>
//                   <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Father</span>
//                 </div>
//                 <p className="text-sm font-semibold text-gray-800">{studentData.fatherName || "N/A"}</p>
//               </div>
              
//               <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
//                 <div className="flex items-center gap-2 mb-2">
//                   <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
//                     <img src={addressIcon} alt="Track" className="w-4 h-4" />
//                   </div>
//                   <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Track</span>
//                 </div>
//                 <p className="text-sm font-semibold text-gray-800">{studentData.track || studentData.techno || "N/A"}</p>
//               </div>
//             </div>
//           </div>

//           {/* Level Progress Card */}
//           <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
//             <div className="flex items-center justify-between mb-6">
//               <h3 className="text-xl font-bold text-gray-800">Academic Progress</h3>
//               <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium">
//                 Current: Level {studentData.currentLevel || "1A"}
//               </div>
//             </div>
            
//             <div className="relative">
//               {/* Progress Track */}
//               <div className="absolute top-6 left-8 right-16 h-2 bg-gray-200 rounded-full"></div>
//               <div 
//                 className="absolute top-6 left-8 h-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-1000"
//                 style={{
//                   width: `${((studentData.currentLevel ? ['1A', '1B', '1C', '2A', '2B', '2C'].indexOf(studentData.currentLevel) + 1 : 1) / 7) * 100}%`
//                 }}
//               ></div>
              
//               {/* Level Steps */}
//               <div className="flex justify-between items-center relative">
//                 {['1A', '1B', '1C', '2A', '2B', '2C'].map((level, index) => {
//                   const currentLevelIndex = studentData.currentLevel ? ['1A', '1B', '1C', '2A', '2B', '2C'].indexOf(studentData.currentLevel) : -1;
//                   const isPassed = currentLevelIndex > index;
//                   const isCurrent = currentLevelIndex === index;
                  
//                   return (
//                     <div key={level} className="flex flex-col items-center relative z-10">
//                       <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
//                         isPassed 
//                           ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg' 
//                           : isCurrent 
//                             ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg' 
//                             : 'bg-gray-200 text-gray-500'
//                       }`}>
//                         {isPassed ? '✓' : level}
//                       </div>
//                       <span className={`text-xs mt-2 font-medium ${
//                         isPassed || isCurrent ? 'text-gray-700' : 'text-gray-400'
//                       }`}>{level}</span>
//                     </div>
//                   );
//                 })}
                
//                 {/* Goal Trophy */}
//                 <div className="flex flex-col items-center">
//                   <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-2xl shadow-lg">
//                     🏆
//                   </div>
//                   <span className="text-xs mt-2 font-medium text-gray-700">Goal</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Skills & Performance Grid */}
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
//             {/* Technical Skills Card */}
//             <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
//               <div className="flex items-center gap-3 mb-6">
//                 <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
//                   <span className="text-gray-600 text-lg">💻</span>
//                 </div>
//                 <h3 className="text-lg font-bold text-gray-800">Technical Skills</h3>
//               </div>
              
//               <div className="space-y-4">
//                 {reportCardData?.technicalSkills?.length > 0 ? reportCardData.technicalSkills.map((tech, index) => {
//                   const colors = ['from-blue-500 to-blue-600', 'from-green-500 to-green-600', 'from-purple-500 to-purple-600', 'from-red-500 to-red-600', 'from-yellow-500 to-yellow-600'];
//                   return (
//                     <div key={index} className="bg-gray-50 rounded-lg p-4">
//                       <div className="flex justify-between items-center mb-2">
//                         <span className="font-medium text-gray-800">{tech.skillName}</span>
//                         <div className="flex items-center gap-2">
//                           <span className="text-sm font-bold text-gray-700">{tech.totalPercentage}%</span>
//                           <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                             tech.totalPercentage >= 90 ? 'bg-green-100 text-green-800' :
//                             tech.totalPercentage >= 80 ? 'bg-blue-100 text-blue-800' :
//                             tech.totalPercentage >= 70 ? 'bg-yellow-100 text-yellow-800' :
//                             'bg-red-100 text-red-800'
//                           }`}>{tech.remark}</span>
//                         </div>
//                       </div>
//                       <div className="w-full bg-gray-200 rounded-full h-3">
//                         <div 
//                           className={`h-3 rounded-full bg-gradient-to-r ${colors[index % colors.length]} transition-all duration-1000`} 
//                           style={{ width: `${tech.totalPercentage}%` }}
//                         ></div>
//                       </div>
//                     </div>
//                   );
//                 }) : (
//                   <div className="text-center py-8 text-gray-500">
//                     <span className="text-4xl mb-2 block">📊</span>
//                     <p>No technical skills data</p>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Soft Skills Card */}
//             <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
//               <div className="flex items-center gap-3 mb-6">
//                 <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
//                   <span className="text-gray-600 text-lg">🧠</span>
//                 </div>
//                 <h3 className="text-lg font-bold text-gray-800">Soft Skills</h3>
//               </div>
              
//               <div className="space-y-4">
//                 {reportCardData?.softSkills?.categories?.length > 0 ? reportCardData.softSkills.categories.map((category, index) => {
//                   const percentage = (category.score / category.maxMarks) * 100;
//                   let status = "Poor";
//                   let statusColor = "bg-red-100 text-red-800";
                  
//                   if (percentage >= 90) {
//                     status = "Excellent";
//                     statusColor = "bg-green-100 text-green-800";
//                   } else if (percentage >= 70) {
//                     status = "Good";
//                     statusColor = "bg-blue-100 text-blue-800";
//                   } else if (percentage >= 50) {
//                     status = "Average";
//                     statusColor = "bg-yellow-100 text-yellow-800";
//                   }

//                   return (
//                     <div key={index} className="bg-gray-50 rounded-lg p-4">
//                       <div className="flex justify-between items-center mb-2">
//                         <span className="font-medium text-gray-800">{category.title}</span>
//                         <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
//                           {status}
//                         </span>
//                       </div>
//                       <div className="flex items-center gap-2 text-sm text-gray-600">
//                         <span>Score: {category.score}/{category.maxMarks}</span>
//                         <div className="flex-1 bg-gray-200 rounded-full h-2 ml-2">
//                           <div 
//                             className="h-2 rounded-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-1000" 
//                             style={{ width: `${percentage}%` }}
//                           ></div>
//                         </div>
//                         <span className="font-medium">{Math.round(percentage)}%</span>
//                       </div>
//                     </div>
//                   );
//                 }) : (
//                   <div className="text-center py-8 text-gray-500">
//                     <span className="text-4xl mb-2 block">🎆</span>
//                     <p>No soft skills data</p>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Discipline Card */}
//             <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
//               <div className="flex items-center gap-3 mb-6">
//                 <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
//                   <span className="text-gray-600 text-lg">🎖️</span>
//                 </div>
//                 <h3 className="text-lg font-bold text-gray-800">Discipline</h3>
//               </div>
              
//               <div className="space-y-4">
//                 {reportCardData?.discipline?.categories?.length > 0 ? reportCardData.discipline.categories.map((category, index) => {
//                   const percentage = (category.score / category.maxMarks) * 100;
//                   return (
//                     <div key={index} className="bg-gray-50 rounded-lg p-4">
//                       <div className="flex justify-between items-center mb-2">
//                         <span className="font-medium text-gray-800">{category.title}</span>
//                         <span className="text-sm font-bold text-gray-700">{category.score}/{category.maxMarks}</span>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <div className="flex-1 bg-gray-200 rounded-full h-3">
//                           <div 
//                             className="h-3 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 transition-all duration-1000" 
//                             style={{ width: `${percentage}%` }}
//                           ></div>
//                         </div>
//                         <span className="text-sm font-medium text-gray-600">{Math.round(percentage)}%</span>
//                       </div>
//                     </div>
//                   );
//                 }) : (
//                   <div className="text-center py-8 text-gray-500">
//                     <span className="text-4xl mb-2 block">🏅</span>
//                     <p>No discipline data</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//           {/* Career Readiness & Academic Performance */}
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
//             {/* Career Readiness Card */}
//             <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
//               <div className="flex items-center gap-3 mb-6">
//                 <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
//                   <span className="text-gray-600 text-lg">🚀</span>
//                 </div>
//                 <h3 className="text-lg font-bold text-gray-800">Career Readiness</h3>
//               </div>
              
//               <div className="grid grid-cols-2 gap-4">
//                 {reportCardData?.careerReadiness ? (
//                   <>
//                     <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
//                       <div className="flex items-center gap-2 mb-2">
//                         <span className="text-lg">📄</span>
//                         <span className="text-sm font-medium text-blue-700">Resume</span>
//                       </div>
//                       <span className={`px-3 py-1 rounded-full text-xs font-medium ${
//                         reportCardData.careerReadiness.resumeStatus === 'Updated' ? 'bg-green-100 text-green-800' :
//                         reportCardData.careerReadiness.resumeStatus === 'Need to improve' ? 'bg-yellow-100 text-yellow-800' :
//                         'bg-red-100 text-red-800'
//                       }`}>{reportCardData.careerReadiness.resumeStatus}</span>
//                     </div>
                    
//                     <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200">
//                       <div className="flex items-center gap-2 mb-2">
//                         <span className="text-lg">🔗</span>
//                         <span className="text-sm font-medium text-indigo-700">LinkedIn</span>
//                       </div>
//                       <span className={`px-3 py-1 rounded-full text-xs font-medium ${
//                         reportCardData.careerReadiness.linkedinStatus === 'Updated' ? 'bg-green-100 text-green-800' :
//                         reportCardData.careerReadiness.linkedinStatus === 'Need to improve' ? 'bg-yellow-100 text-yellow-800' :
//                         'bg-red-100 text-red-800'
//                       }`}>{reportCardData.careerReadiness.linkedinStatus}</span>
//                     </div>
                    
//                     <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
//                       <div className="flex items-center gap-2 mb-2">
//                         <span className="text-lg">🧠</span>
//                         <span className="text-sm font-medium text-purple-700">Aptitude</span>
//                       </div>
//                       <span className={`px-3 py-1 rounded-full text-xs font-medium ${
//                         reportCardData.careerReadiness.aptitudeStatus === 'In-Progress' ? 'bg-blue-100 text-blue-800' :
//                         'bg-gray-100 text-gray-800'
//                       }`}>{reportCardData.careerReadiness.aptitudeStatus}</span>
//                     </div>
                    
//                     <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
//                       <div className="flex items-center gap-2 mb-2">
//                         <span className="text-lg">🎯</span>
//                         <span className="text-sm font-medium text-green-700">Placement</span>
//                       </div>
//                       <span className={`px-3 py-1 rounded-full text-xs font-medium ${
//                         reportCardData.careerReadiness.placementReady === 'Ready' ? 'bg-green-100 text-green-800' :
//                         'bg-red-100 text-red-800'
//                       }`}>{reportCardData.careerReadiness.placementReady}</span>
//                     </div>
//                   </>
//                 ) : (
//                   <div className="col-span-2 text-center py-8 text-gray-500">
//                     <span className="text-4xl mb-2 block">📈</span>
//                     <p>No career readiness data</p>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Academic Performance Card */}
//             <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
//               <div className="flex items-center gap-3 mb-6">
//                 <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
//                   <span className="text-gray-600 text-lg">🎓</span>
//                 </div>
//                 <h3 className="text-lg font-bold text-gray-800">Academic Performance</h3>
//               </div>
              
//               <div className="space-y-4">
//                 {/* CGPA Highlight */}
//                 <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-4 text-white text-center">
//                   <p className="text-sm opacity-90 mb-1">Overall CGPA</p>
//                   <p className="text-3xl font-bold">{reportCardData?.academicPerformance?.cgpa || "N/A"}</p>
//                   <p className="text-sm opacity-75">out of 10.0</p>
//                 </div>
                
//                 {/* Year-wise SGPA */}
//                 <div className="grid grid-cols-3 gap-3">
//                   <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
//                     <p className="text-xs font-medium text-blue-700 mb-1">FY SGPA</p>
//                     <p className="text-lg font-bold text-blue-800">
//                       {reportCardData?.academicPerformance?.yearWiseSGPA?.find(y => y.year === 'FY')?.sgpa || "N/A"}
//                     </p>
//                   </div>
//                   <div className="bg-green-50 rounded-lg p-3 text-center border border-green-200">
//                     <p className="text-xs font-medium text-green-700 mb-1">SY SGPA</p>
//                     <p className="text-lg font-bold text-green-800">
//                       {reportCardData?.academicPerformance?.yearWiseSGPA?.find(y => y.year === 'SY')?.sgpa || "N/A"}
//                     </p>
//                   </div>
//                   <div className="bg-purple-50 rounded-lg p-3 text-center border border-purple-200">
//                     <p className="text-xs font-medium text-purple-700 mb-1">TY SGPA</p>
//                     <p className="text-lg font-bold text-purple-800">
//                       {reportCardData?.academicPerformance?.yearWiseSGPA?.find(y => y.year === 'TY')?.sgpa || "N/A"}
//                     </p>
//                   </div>
//                 </div>
                

//               </div>
//             </div>
//           </div>
//           {/* Co-Curricular Activities */}
//           <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
//             <div className="flex items-center gap-3 mb-6">
//               <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
//                 <span className="text-gray-600 text-lg">🏆</span>
//               </div>
//               <h3 className="text-lg font-bold text-gray-800">Co-Curricular Activities</h3>
//             </div>
            
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//               {(() => {
//                 const categories = [
//                   { name: 'Certificate', icon: '🏅', color: 'from-yellow-400 to-orange-500' },
//                   { name: 'Project', icon: '💻', color: 'from-blue-400 to-indigo-500' },
//                   { name: 'Sports', icon: '⚽', color: 'from-green-400 to-emerald-500' }
//                 ];
                
//                 return categories.map((category) => {
//                   const count = reportCardData?.coCurricular?.filter(activity => 
//                     activity.category.toLowerCase() === category.name.toLowerCase()
//                   ).length || 0;
                  
//                   return (
//                     <div key={category.name} className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
//                       <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
//                         <span className="text-2xl text-gray-600">{category.icon}</span>
//                       </div>
//                       <h4 className="font-semibold text-gray-800 mb-1">{category.name}</h4>
//                       <p className="text-2xl font-bold text-gray-700">{count}</p>
//                       <p className="text-xs text-gray-500">Activities</p>
//                     </div>
//                   );
//                 });
//               })()}
//             </div>
            
//             {/* Activity Details */}
//             {reportCardData?.coCurricular?.length > 0 && (
//               <div className="space-y-6">
//                 <h4 className="font-semibold text-gray-700 mb-4">Activity Details</h4>
//                 {(() => {
//                   const groupedActivities = reportCardData.coCurricular.reduce((acc, activity) => {
//                     const category = activity.category.toLowerCase();
//                     if (!acc[category]) acc[category] = [];
//                     acc[category].push(activity);
//                     return acc;
//                   }, {});
                  
//                   return Object.entries(groupedActivities).map(([category, activities]) => (
//                     <div key={category} className="mb-6">
//                       <h5 className={`font-semibold text-lg mb-3 uppercase tracking-wide ${
//                         category === 'certificate' ? 'text-yellow-600' :
//                         category === 'project' ? 'text-blue-600' :
//                         'text-green-600'
//                       }`}>{category} ({activities.length})</h5>
//                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                         {activities.map((activity, index) => (
//                           <div key={index} className={`rounded-lg p-4 border ${
//                             category === 'certificate' ? 'border-yellow-200 bg-yellow-50' :
//                             category === 'project' ? 'border-blue-200 bg-blue-50' :
//                             'border-green-200 bg-green-50'
//                           }`}>
//                             <h6 className="font-semibold text-gray-800 mb-2">{activity.title}</h6>
//                             <p className="text-sm text-gray-600">{activity.remark}</p>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   ));
//                 })()}
//               </div>
//             )}
//           </div>
//           {/* Faculty Feedback */}
//           <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
//             <div className="flex items-center gap-3 mb-6">
//               <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
//                 <span className="text-gray-600 text-lg">📝</span>
//               </div>
//               <h3 className="text-lg font-bold text-gray-800">Faculty Feedback</h3>
//             </div>
            
//             <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
//               <div className="flex items-start gap-4">
//                 <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
//                   {reportCardData?.generatedByName?.split(' ').map(n => n[0]).join('') || 'FA'}
//                 </div>
//                 <div className="flex-1">
//                   <div className="flex items-center justify-between mb-3">
//                     <div>
//                       <p className="font-semibold text-gray-800">{reportCardData?.generatedByName || "Faculty"}</p>
//                       <p className="text-sm text-gray-600">Course Instructor</p>
//                     </div>
//                     <div className="text-right">
//                       <div className="flex items-center gap-1 mb-1">
//                         {(() => {
//                           const grade = reportCardData?.overallGrade;
//                           let rating = 3;
//                           if (grade === 'A+') rating = 5;
//                           else if (grade === 'A') rating = 4.5;
//                           else if (grade === 'B+') rating = 4;
//                           else if (grade === 'B') rating = 3.5;
//                           else if (grade === 'C+') rating = 3;
//                           else if (grade === 'C') rating = 2.5;
                          
//                           return [1, 2, 3, 4, 5].map((star) => {
//                             if (star <= Math.floor(rating)) {
//                               return <span key={star} className="text-lg text-yellow-400">★</span>;
//                             } else if (star === Math.floor(rating) + 1 && rating % 1 === 0.5) {
//                               return (
//                                 <span key={star} className="relative text-lg inline-block">
//                                   <span className="text-gray-300">★</span>
//                                   <span className="absolute top-0 left-0 text-yellow-400 overflow-hidden" style={{ width: '50%' }}>★</span>
//                                 </span>
//                               );
//                             } else {
//                               return <span key={star} className="text-lg text-gray-300">★</span>;
//                             }
//                           });
//                         })()}
//                       </div>
//                       <p className="text-sm text-gray-600">Overall Grade: <span className="font-bold text-indigo-600">{reportCardData?.overallGrade || "N/A"}</span></p>
//                     </div>
//                   </div>
//                   <div className="bg-white rounded-lg p-4 border border-blue-100">
//                     <p className="text-gray-700 italic leading-relaxed">
//                       "{reportCardData?.facultyRemark || "No specific remarks provided."}"
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Final Assessment Section */}
//           <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl shadow-lg p-6 text-white">
//             <div className="text-center mb-6">
//               <h3 className="text-2xl font-bold mb-2">Final Assessment</h3>
//               <p className="text-indigo-200">Overall Performance Summary</p>
//             </div>
            
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
//                 <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
//                   <span className="text-2xl">🎯</span>
//                 </div>
//                 <h4 className="font-semibold mb-2">Current Level</h4>
//                 <p className="text-2xl font-bold">{studentData.currentLevel || "1A"}</p>
//                 <p className="text-sm text-indigo-200 mt-1">Academic Progress</p>
//               </div>
              
//               <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
//                 <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
//                   <span className="text-2xl">🏆</span>
//                 </div>
//                 <h4 className="font-semibold mb-2">Overall Grade</h4>
//                 <p className="text-3xl font-bold">{reportCardData?.overallGrade || "N/A"}</p>
//                 <p className="text-sm text-indigo-200 mt-1">Performance Rating</p>
//               </div>
              
//               <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
//                 <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
//                   <span className="text-2xl">📈</span>
//                 </div>
//                 <h4 className="font-semibold mb-2">Status</h4>
//                 <p className="text-xl font-bold">{reportCardData?.isFinalReport ? 'Final' : 'Progress'}</p>
//                 <p className="text-sm text-indigo-200 mt-1">Report Type</p>
//               </div>
//             </div>
            
//             <div className="mt-6 text-center">
//               <p className="text-indigo-200 text-sm">
//                 Generated on {new Date(reportCardData?.updatedAt || Date.now()).toLocaleDateString('en-US', { 
//                   year: 'numeric', 
//                   month: 'long', 
//                   day: 'numeric' 
//                 })}
//               </p>
//             </div>
//           </div>

//         </div>
//       </div>


//     </div>
//   );
// }


// // import { useParams, useNavigate } from "react-router-dom";
// // import { useGetAdmittedStudentsByIdQuery, useGetReportCardQuery } from "../../redux/api/authApi";
// // import { HiArrowNarrowLeft } from "react-icons/hi";
// // import { useState } from "react";
// // import Loader from "../common-components/loader/Loader";
// // import logo from '../../assets/images/doulLogo.png';
// // import { RiEdit2Fill } from "react-icons/ri";
// // import profileIcon from '../../assets/icons/StuReportprofile_icon.png';
// // import courseIcon from '../../assets/icons/StuReportCourse_icon.png';
// // import mailIcon from '../../assets/icons/StuReportMail_icon.png';
// // import fatherIcon from '../../assets/icons/StuReportFather_icon.png';
// // import contactIcon from '../../assets/icons/StuReport_Phone.png';
// // import addressIcon from '../../assets/icons/StuReportAddress_icon.png';

// // export default function StudentReport() {
// //   const { id } = useParams();
// //   const navigate = useNavigate();
// //   const { data: studentData, isLoading, isError } = useGetAdmittedStudentsByIdQuery(id);
// //   const { data: reportCardResponse, isLoading: reportLoading, isError: reportError } = useGetReportCardQuery(id);
// //   const reportCardData = reportCardResponse?.data;

// //   if (isLoading || reportLoading) {
// //     return (
// //       <div className="min-h-screen flex items-center justify-center bg-white">
// //         <Loader />
// //       </div>
// //     );
// //   }

// //   if (isError || !studentData) {
// //     return <div className="p-4 text-red-500">Error loading student data.</div>;
// //   }

// //   if (reportError) {
// //     console.error('Report Card Error:', reportError);
// //   }

// //   const hasReportData = reportCardData && Object.keys(reportCardData).length > 0;

// //   return (
// //     <div className="min-h-screen bg-white">
// //       {/* Header */}
// //       <div className="sticky top-0 z-10 print:hidden">
// //         <div className="py-2 sm:py-4">
// //           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
// //             <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
// //               <button
// //                 onClick={() => window.history.back()}
// //                 className="group flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 text-gray-700 hover:text-gray-900"
// //               >
// //                 <HiArrowNarrowLeft className="text-base sm:text-lg group-hover:-translate-x-1 transition-transform" />
// //                 <span className="text-xs sm:text-sm font-medium">Back</span>
// //               </button>
// //               <div className="h-6 sm:h-8 w-px bg-gray-300 hidden sm:block"></div>
// //               <div className="flex-1 sm:flex-none">
// //                 <h1 className="text-lg sm:text-2xl font-bold text-black">Student Report Card</h1>
// //                 <p className="text-gray-600">Comprehensive performance report for {studentData.firstName} {studentData.lastName}</p>
// //               </div>
// //             </div>
// //             <div className="flex items-center gap-3">
// //               <button
// //                 onClick={() => navigate(`/student/${id}/report/edit`)}
// //                 className="p-2 bg-orange-400 text-white rounded-full text-2xl font-medium hover:bg-orange-500 transition-colors"
// //               >
// //                 <RiEdit2Fill />
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Content */}
// //       <div className="min-h-screen p-6 print:p-0 print:m-0">
// //         {!hasReportData ? (
// //           <div className="mx-auto bg-white shadow-xl p-8 rounded-lg text-center" style={{ maxWidth: '600px' }}>
// //             <h2 className="text-2xl font-bold text-gray-800 mb-4">No Report Card Data</h2>
// //             <p className="text-gray-600 mb-6">No report card has been created for {studentData.firstName} {studentData.lastName} yet.</p>
// //             <button
// //               onClick={() => navigate(`/student/${id}/report/edit`)}
// //               className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
// //             >
// //               Create Report Card
// //             </button>
// //           </div>
// //         ) : (
// //           <div className="mx-auto bg-[#F9FAFB] shadow-xl p-4 print:shadow-none print:bg-white print:mx-0" style={{ width: '210mm', minHeight: '297mm' }}>
// //             {/* Header with Logo */}
// //             <div className="relative flex items-center justify-between mb-4" style={{ height: '80px' }}>
// //               <div className="flex items-center gap-4">
// //                 <img src={logo} alt="ITEG Logo" className="h-16 object-contain" />
// //               </div>
// //               <div className="absolute left-1/2 transform -translate-x-1/2">
// //                 <h1 className="text-lg font-bold text-black">Report Card</h1>
// //               </div>
// //               <div className="text-right text-xs text-gray-600">
// //                 <p>Academic Year</p>
// //                 <p className="font-semibold text-gray-800">Session 2024-25</p>
// //               </div>
// //             </div>

// //             {/* Personal Information */}
// //             <div className="bg-white rounded-lg shadow-md p-4 mb-3">
// //               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
// //                 <div className="space-y-4">
// //                   <div>
// //                     <div className="flex items-center gap-2 mb-1">
// //                       <img src={profileIcon} alt="Profile" className="w-4 h-4" />
// //                       <label className="text-sm font-medium text-gray-600">Full Name</label>
// //                     </div>
// //                     <p className="text-sm font-semibold text-gray-800">{studentData.firstName} {studentData.lastName}</p>
// //                   </div>
// //                   <div>
// //                     <div className="flex items-center gap-2 mb-1">
// //                       <img src={courseIcon} alt="Course" className="w-4 h-4" />
// //                       <label className="text-sm font-medium text-gray-600">Course</label>
// //                     </div>
// //                     <p className="text-sm font-semibold text-gray-800">{studentData.course || "N/A"}</p>
// //                   </div>
// //                 </div>

// //                 <div className="space-y-4">
// //                   <div>
// //                     <div className="flex items-center gap-2 mb-1">
// //                       <img src={mailIcon} alt="Email" className="w-4 h-4" />
// //                       <label className="text-sm font-medium text-gray-600">Email</label>
// //                     </div>
// //                     <p className="text-sm font-semibold text-gray-800">{studentData.email || "N/A"}</p>
// //                   </div>
// //                   <div>
// //                     <div className="flex items-center gap-2 mb-1">
// //                       <img src={fatherIcon} alt="Father" className="w-4 h-4" />
// //                       <label className="text-sm font-medium text-gray-600">Father's Name</label>
// //                     </div>
// //                     <p className="text-sm font-semibold text-gray-800">{studentData.fatherName || "N/A"}</p>
// //                   </div>
// //                 </div>

// //                 <div className="space-y-4">
// //                   <div>
// //                     <div className="flex items-center gap-2 mb-1">
// //                       <img src={contactIcon} alt="Phone" className="w-4 h-4" />
// //                       <label className="text-sm font-medium text-gray-600">Contact Number</label>
// //                     </div>
// //                     <p className="text-sm font-semibold text-gray-800">{studentData.studentMobile || "N/A"}</p>
// //                   </div>
// //                   <div>
// //                     <div className="flex items-center gap-2 mb-1">
// //                       <img src={addressIcon} alt="Address" className="w-4 h-4" />
// //                       <label className="text-sm font-medium text-gray-600">Address</label>
// //                     </div>
// //                     <p className="text-sm font-semibold text-gray-800">{studentData.address || "N/A"}</p>
// //                   </div>
// //                 </div>
// //               </div>
// //             </div>

// //             {/* Report Card Content */}
// //             <div className="bg-white rounded-lg shadow-md p-4">
// //               <h4 className="text-lg font-bold text-gray-800 mb-4">Report Card Details</h4>
              
// //               {/* Academic Performance */}
// //               {reportCardData?.subjects && reportCardData.subjects.length > 0 && (
// //                 <div className="mb-6">
// //                   <h5 className="text-md font-semibold text-gray-700 mb-3">Academic Performance</h5>
// //                   <div className="overflow-x-auto">
// //                     <table className="w-full border-collapse border border-gray-300">
// //                       <thead>
// //                         <tr className="bg-gray-100">
// //                           <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Subject</th>
// //                           <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium">Marks Obtained</th>
// //                           <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium">Total Marks</th>
// //                           <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium">Percentage</th>
// //                           <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium">Grade</th>
// //                         </tr>
// //                       </thead>
// //                       <tbody>
// //                         {reportCardData.subjects.map((subject, index) => (
// //                           <tr key={index}>
// //                             <td className="border border-gray-300 px-3 py-2 text-sm">{subject.name || 'N/A'}</td>
// //                             <td className="border border-gray-300 px-3 py-2 text-center text-sm">{subject.marksObtained || 0}</td>
// //                             <td className="border border-gray-300 px-3 py-2 text-center text-sm">{subject.totalMarks || 0}</td>
// //                             <td className="border border-gray-300 px-3 py-2 text-center text-sm">
// //                               {subject.totalMarks ? ((subject.marksObtained / subject.totalMarks) * 100).toFixed(1) : 0}%
// //                             </td>
// //                             <td className="border border-gray-300 px-3 py-2 text-center text-sm font-medium">{subject.grade || 'N/A'}</td>
// //                           </tr>
// //                         ))}
// //                       </tbody>
// //                     </table>
// //                   </div>
// //                 </div>
// //               )}

// //               {/* Overall Performance */}
// //               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
// //                 <div className="bg-gray-50 p-4 rounded-lg">
// //                   <h5 className="text-md font-semibold text-gray-700 mb-3">Overall Performance</h5>
// //                   <div className="space-y-2">
// //                     <div className="flex justify-between">
// //                       <span className="text-sm text-gray-600">Total Marks:</span>
// //                       <span className="text-sm font-medium">{reportCardData?.totalMarks || 'N/A'}</span>
// //                     </div>
// //                     <div className="flex justify-between">
// //                       <span className="text-sm text-gray-600">Marks Obtained:</span>
// //                       <span className="text-sm font-medium">{reportCardData?.marksObtained || 'N/A'}</span>
// //                     </div>
// //                     <div className="flex justify-between">
// //                       <span className="text-sm text-gray-600">Percentage:</span>
// //                       <span className="text-sm font-medium">{reportCardData?.percentage || 'N/A'}%</span>
// //                     </div>
// //                     <div className="flex justify-between">
// //                       <span className="text-sm text-gray-600">Overall Grade:</span>
// //                       <span className="text-sm font-bold text-lg">{reportCardData?.grade || 'N/A'}</span>
// //                     </div>
// //                   </div>
// //                 </div>

// //                 <div className="bg-gray-50 p-4 rounded-lg">
// //                   <h5 className="text-md font-semibold text-gray-700 mb-3">Additional Information</h5>
// //                   <div className="space-y-2">
// //                     <div className="flex justify-between">
// //                       <span className="text-sm text-gray-600">Class:</span>
// //                       <span className="text-sm font-medium">{reportCardData?.class || 'N/A'}</span>
// //                     </div>
// //                     <div className="flex justify-between">
// //                       <span className="text-sm text-gray-600">Section:</span>
// //                       <span className="text-sm font-medium">{reportCardData?.section || 'N/A'}</span>
// //                     </div>
// //                     <div className="flex justify-between">
// //                       <span className="text-sm text-gray-600">Roll Number:</span>
// //                       <span className="text-sm font-medium">{reportCardData?.rollNumber || 'N/A'}</span>
// //                     </div>
// //                     <div className="flex justify-between">
// //                       <span className="text-sm text-gray-600">Exam Type:</span>
// //                       <span className="text-sm font-medium">{reportCardData?.examType || 'N/A'}</span>
// //                     </div>
// //                   </div>
// //                 </div>
// //               </div>

// //               {/* Attendance */}
// //               {reportCardData?.attendance && (
// //                 <div className="mb-6">
// //                   <h5 className="text-md font-semibold text-gray-700 mb-3">Attendance Record</h5>
// //                   <div className="bg-gray-50 p-4 rounded-lg">
// //                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
// //                       <div className="text-center">
// //                         <p className="text-sm text-gray-600">Total Days</p>
// //                         <p className="text-lg font-bold">{reportCardData.attendance.totalDays || 0}</p>
// //                       </div>
// //                       <div className="text-center">
// //                         <p className="text-sm text-gray-600">Present Days</p>
// //                         <p className="text-lg font-bold text-green-600">{reportCardData.attendance.presentDays || 0}</p>
// //                       </div>
// //                       <div className="text-center">
// //                         <p className="text-sm text-gray-600">Absent Days</p>
// //                         <p className="text-lg font-bold text-red-600">{reportCardData.attendance.absentDays || 0}</p>
// //                       </div>
// //                       <div className="text-center">
// //                         <p className="text-sm text-gray-600">Attendance %</p>
// //                         <p className="text-lg font-bold">{reportCardData.attendance.percentage || 0}%</p>
// //                       </div>
// //                     </div>
// //                   </div>
// //                 </div>
// //               )}

// //               {/* Teacher's Remarks */}
// //               {reportCardData?.remarks && (
// //                 <div className="mb-6">
// //                   <h5 className="text-md font-semibold text-gray-700 mb-3">Teacher's Remarks</h5>
// //                   <div className="bg-gray-50 p-4 rounded-lg">
// //                     <p className="text-sm text-gray-700">{reportCardData.remarks}</p>
// //                   </div>
// //                 </div>
// //               )}

// //               {/* Debug: Show all available data */}
// //               {process.env.NODE_ENV === 'development' && (
// //                 <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
// //                   <h5 className="text-md font-semibold text-yellow-800 mb-2">Debug: Available Report Data</h5>
// //                   <pre className="text-xs text-yellow-700 overflow-auto max-h-40">
// //                     {JSON.stringify(reportCardData, null, 2)}
// //                   </pre>
// //                 </div>
// //               )}

// //               {/* Fallback message */}
// //               {!reportCardData || Object.keys(reportCardData).length === 0 && (
// //                 <div className="text-center text-gray-500">
// //                   <p>No report card data available to display.</p>
// //                 </div>
// //               )}
// //             </div>
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }