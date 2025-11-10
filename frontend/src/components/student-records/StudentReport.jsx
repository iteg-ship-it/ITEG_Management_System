import { useParams, useNavigate } from "react-router-dom";
import { useGetAdmittedStudentsByIdQuery, useGetReportCardQuery } from "../../redux/api/authApi";
import { HiArrowNarrowLeft } from "react-icons/hi";
import { FaUserGroup, FaDownload } from "react-icons/fa6";
import { useState } from "react";
import Loader from "../common-components/loader/Loader";
import logo from '../../assets/images/doulLogo.png';
import { RiEdit2Fill } from "react-icons/ri";
import { PDFDownloadLink } from '@react-pdf/renderer';
import StudentReportPDF from './StudentReportPDF';
import profileIcon from '../../assets/icons/StuReportprofile_icon.png';
import courseIcon from '../../assets/icons/StuReportCourse_icon.png';
import mailIcon from '../../assets/icons/StuReportMail_icon.png';
import fatherIcon from '../../assets/icons/StuReportFather_icon.png';
import contactIcon from '../../assets/icons/StuReport_Phone.png';
import addressIcon from '../../assets/icons/StuReportAddress_icon.png';


export default function StudentReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: studentData, isLoading, isError } = useGetAdmittedStudentsByIdQuery(id);
  const { data: reportCardResponse, isLoading: reportLoading, isError: reportError } = useGetReportCardQuery(id);
  const reportCardData = reportCardResponse?.data;




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
    <div className="min-h-screen bg-white">
      {/* Professional Header */}
      <div className="sticky top-0 z-10 print:hidden">
        <div className="py-2 sm:py-4 ">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
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
              {/* PDF Download Button */}
              <PDFDownloadLink
                document={<StudentReportPDF studentData={studentData} reportCardData={reportCardData} />}
                fileName={`${studentData.firstName}_${studentData.lastName}_Report_Card.pdf`}
                className="p-2 bg-green-500 text-white rounded-full text-2xl font-medium hover:bg-green-600 transition-colors"
              >
                {({ blob, url, loading, error }) =>
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
                    // Fallback: try relative navigation
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

      {/* A4 Page with Grey Background */}
      <div className="min-h-screen p-6 print:p-0 print:m-0">
        <div id="pdf-content" className="mx-auto bg-[#F9FAFB] shadow-xl p-4 print:shadow-none print:bg-white print:mx-0" style={{ width: '210mm', minHeight: '297mm' }}>

          {/* Header with Logos and Title */}
          <div className="relative flex items-center justify-between" style={{ height: '80px' }}>
            <div className="flex items-center gap-4">
              <img src={logo} alt="ITEG Logo" className="h-16 object-contain" />
            </div>
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <h1 className="text-lg font-bold text-black">Report Card</h1>
            </div>
            <div className="text-right text-xs text-gray-600">
              <p>Academic Year</p>
              <p className="font-semibold text-gray-800">Session 2024-25</p>
            </div>
          </div>

          {/* White Box 1 - Personal Information */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-3" style={{ height: '127px' }}>
            {/* <h2 className="text-2xl font-bold text-gray-800 mb-6">Personal Information</h2> */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <img src={profileIcon} alt="Profile" className="w-4 h-4" />
                    <label className="text-sm font-medium text-gray-600">Full Name</label>
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{studentData.firstName} {studentData.lastName}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <img src={courseIcon} alt="Course" className="w-4 h-4" />
                    <label className="text-sm font-medium text-gray-600">Course</label>
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{studentData.course || "N/A"}</p>
                </div>
              </div>

              <div className="md:col-span-1 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <img src={mailIcon} alt="Email" className="w-4 h-4" />
                    <label className="text-sm font-medium text-gray-600">Email</label>
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{studentData.email || "N/A"}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <img src={fatherIcon} alt="Father" className="w-4 h-4" />
                    <label className="text-sm font-medium text-gray-600">Father's Name</label>
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{studentData.fatherName || "N/A"}</p>
                </div>
              </div>

              <div className="md:col-span-1 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <img src={contactIcon} alt="Phone" className="w-4 h-4" />
                    <label className="text-sm font-medium text-gray-600">Contact Number</label>
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{studentData.studentMobile || "N/A"}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <img src={addressIcon} alt="Track" className="w-4 h-4" />
                    <label className="text-sm font-medium text-gray-600">Track</label>
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{studentData.track || "N/A"}</p>
                </div>
              </div>


            </div>
          </div>

          {/* White Box 2 - Stepper */}
          <div className="bg-white rounded-lg shadow-md p-4">
                        <h4 className="text-lg font-bold text-gray-800 mb-4">Level Progress</h4>
            <div className="grid grid-cols-6 gap-4">
              {/* Stepper Column - 80% */}
              <div className="col-span-5">
                <div className="relative">
                  {/* Background Connecting Line */}
                  <div className="absolute top-3 left-3 right-3 h-1 bg-gray-300"></div>

                  {/* Progress Line (Green) */}
                  <div
                    className="absolute top-3 left-3 h-1 bg-green-600"
                    style={{
                      width: `${((studentData.currentLevel ? ['1A', '1B', '1C', '2A', '2B', '2C'].indexOf(studentData.currentLevel) : -1) / 5) * 100}%`
                    }}
                  ></div>

                  {/* Steps */}
                  <div className="flex justify-between relative">
                    {['1A', '1B', '1C', '2A', '2B', '2C'].map((level, index) => {
                      const currentLevelIndex = studentData.currentLevel ?
                        ['1A', '1B', '1C', '2A', '2B', '2C'].indexOf(studentData.currentLevel) : -1;
                      const isPassed = currentLevelIndex > index;
                      const isCurrent = currentLevelIndex === index;

                      return (
                        <div key={level} className="flex flex-col items-center">
                          <div className={`flex items-center justify-center rounded-full text-xs font-medium relative z-10 ${isPassed
                              ? 'w-6 h-6 bg-green-600 text-white'
                              : isCurrent
                                ? 'w-6 h-6 bg-yellow-500 text-white'
                                : 'w-6 h-6 bg-gray-300'
                            }`}>
                            {isPassed ? '✓' : isCurrent ? level : ''}
                          </div>
                          <span className="text-xs text-gray-500 mt-2">{level}</span>
                        </div>
                      );
                    }
                    )}
                  </div>
                </div>
              </div>

              {/* Trophy Column - 20% */}
              <div className="col-span-1 flex justify-center items-start">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-10 h-10 text-white text-2xl font-medium">
                    🏆
                  </div>
                  <span className="text-xs text-gray-500 ">Goal</span>
                </div>
              </div>
            </div>
          </div>

          {/* Three Separate White Boxes with Gaps */}
          <div className="grid grid-cols-3 grid-rows-2 gap-3 mt-3">
            {/* Technical Skills Box */}
            <div className="col-span-1 row-span-2 bg-white rounded-lg shadow-md p-4">
              <h4 className="text-lg font-bold text-gray-800 mb-4">Technical Skills</h4>
              <div className="space-y-3">
                {reportCardData?.technicalSkills?.length > 0 ? reportCardData.technicalSkills.map((tech, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">{tech.skillName}</span>
                      <span className="text-xs text-gray-500">{tech.totalPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className={`h-2 rounded-full ${index === 0 ? 'bg-blue-500' :
                          index === 1 ? 'bg-green-500' :
                            index === 2 ? 'bg-purple-500' :
                              index === 3 ? 'bg-red-500' :
                                index === 4 ? 'bg-yellow-500' :
                                  'bg-pink-500'
                        }`} style={{ width: `${tech.totalPercentage}%` }}></div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center text-gray-500">
                    <span>N/A</span>
                  </div>
                )}
              </div>
            </div>

            {/* Soft Skills Box */}
            <div className="col-span-1 bg-white rounded-lg shadow-md p-4">
              <h4 className="text-lg font-bold text-gray-800 mb-4">Soft Skills</h4>
              <div className="space-y-3">
                {reportCardData?.softSkills?.categories?.length > 0 ? reportCardData.softSkills.categories.map((category, index) => {
                  const percentage = (category.score / category.maxMarks) * 100;
                  let status = "Poor";
                  if (percentage >= 90) status = "Excellent";
                  else if (percentage >= 70) status = "Good";
                  else if (percentage >= 50) status = "Average";

                  return (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-xs text-gray-600 flex-1">{category.title}</span>
                      <span className={`text-xs font-semibold ${status === 'Excellent' ? 'text-green-600' :
                          status === 'Good' ? 'text-blue-600' :
                            status === 'Average' ? 'text-yellow-600' :
                              'text-red-600'
                        }`}>{status}</span>
                    </div>
                  );
                }) : (
                  <div className="text-center text-gray-500">
                    <span>N/A</span>
                  </div>
                )}
              </div>
            </div>

            {/* Discipline Box */}
            <div className="col-span-1 bg-white rounded-lg shadow-md p-4">
              <h4 className="text-lg font-bold text-gray-800 mb-4">Discipline</h4>
              <div className="space-y-2">
                {reportCardData?.discipline?.categories?.length > 0 ? reportCardData.discipline.categories.map((category, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-600">{category.title}</span>
                      <span className="text-xs text-gray-500">{category.score}/{category.maxMarks}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${(category.score / category.maxMarks) * 100}%` }}></div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center text-gray-500">
                    <span>N/A</span>
                  </div>
                )}
              </div>
            </div>
            {/* Career Readiness - Spans 2 columns */}
            <div className="col-span-2 bg-white rounded-lg shadow-md p-4">
              <h4 className="text-lg font-bold text-gray-800 mb-4">Career Readiness</h4>
              <div className="grid grid-cols-4 gap-4">
                {reportCardData?.careerReadiness ? (
                  <>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">Resume</p>
                      <div className="bg-gray-100 rounded-lg p-3">
                        <span className="text-sm font-bold text-gray-800">{reportCardData.careerReadiness.resumeStatus}</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">LinkedIn</p>
                      <div className="bg-gray-100 rounded-lg p-3">
                        <span className="text-sm font-bold text-gray-800">{reportCardData.careerReadiness.linkedinStatus}</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">Aptitude</p>
                      <div className="bg-gray-100 rounded-lg p-3">
                        <span className="text-sm font-bold text-gray-800">{reportCardData.careerReadiness.aptitudeStatus}</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">Placement</p>
                      <div className="bg-gray-100 rounded-lg p-3">
                        <span className="text-sm font-bold text-gray-800">{reportCardData.careerReadiness.placementReady}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="col-span-4 text-center text-gray-500">
                    <span>N/A</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Academic Performance */}
          <div className="bg-white rounded-lg shadow-md p-4 mt-3">
            <h4 className="text-lg font-bold text-gray-800 mb-4">Academic Performance</h4>
            <div className="grid grid-cols-5 gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Current Level</p>
                <div className="bg-gray-100 rounded-lg p-3">
                  <span className="text-lg font-bold text-gray-800">{studentData.currentLevel || "1C"}</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">1st Year SGPA</p>
                <div className="bg-gray-100 rounded-lg p-3">
                  <span className="text-lg font-bold text-gray-800">
                    {reportCardData?.academicPerformance?.yearWiseSGPA?.find(y => y.year === 'FY')?.sgpa || "N/A"}
                  </span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">2nd Year SGPA</p>
                <div className="bg-gray-100 rounded-lg p-3">
                  <span className="text-lg font-bold text-gray-800">
                    {reportCardData?.academicPerformance?.yearWiseSGPA?.find(y => y.year === 'SY')?.sgpa || "N/A"}
                  </span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">3rd Year SGPA</p>
                <div className="bg-gray-100 rounded-lg p-3">
                  <span className="text-lg font-bold text-gray-800">
                    {reportCardData?.academicPerformance?.yearWiseSGPA?.find(y => y.year === 'TY')?.sgpa || "N/A"}
                  </span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">CGPA</p>
                <div className="bg-gray-100 rounded-lg p-3">
                  <span className="text-lg font-bold text-gray-800">{reportCardData?.academicPerformance?.cgpa || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>
          {/* Co-Curricular Activities */}
          <h4 className="text-lg font-bold text-gray-800 mb-4 mt-3">Co-Curricular Activities</h4>
          <div className="grid grid-cols-3 gap-4">
            {(() => {
              const categories = ['Certificate', 'Project', 'Sports'];
              return categories.map((category) => {
                const count = reportCardData?.coCurricular?.filter(activity => 
                  activity.category.toLowerCase() === category.toLowerCase()
                ).length || 0;
                
                return (
                  <div key={category} className="p-3 bg-gray-50 rounded-lg shadow-md flex flex-col justify-center" style={{ height: '80px' }}>
                    <div className="text-center">
                      <span className="text-sm font-bold px-2 py-1 rounded mb-2 inline-block">{category}</span>
                      <p className="text-2xl font-bold text-gray-800">{count}</p>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
          {/* Faculty Feedback */}
          <div className="bg-[#EFF6FF] rounded-lg shadow-md p-4 mt-3 relative" style={{ height: '120px' }}>
            <h4 className="text-lg font-bold text-gray-800 mb-4">Faculty Feedback</h4>
            <div className="mb-8">
              <p className="text-sm text-gray-600 line-clamp-2">
                {reportCardData?.facultyRemark || "N/A"}
              </p>
            </div>
            <div className="absolute bottom-8 right-6 flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Rating:</span>
              <div className="flex items-center gap-1">
                {(() => {
                  const grade = reportCardData?.overallGrade;
                  let rating = 3; // Default rating
                  if (grade === 'A+') rating = 5;
                  else if (grade === 'A') rating = 4.5;
                  else if (grade === 'B+') rating = 4;
                  else if (grade === 'B') rating = 3.5;
                  else if (grade === 'C+') rating = 3;
                  else if (grade === 'C') rating = 2.5;
                  else if (grade === 'D+') rating = 2;
                  else if (grade === 'D') rating = 1.5;
                  else if (grade === 'F') rating = 1;
                  
                  return [1, 2, 3, 4, 5].map((star) => {
                    if (star <= Math.floor(rating)) {
                      return <span key={star} className="text-2xl text-yellow-400">★</span>;
                    } else if (star === Math.floor(rating) + 1 && rating % 1 === 0.5) {
                      return (
                        <span key={star} className="relative text-2xl inline-block">
                          <span className="text-gray-300">★</span>
                          <span 
                            className="absolute top-0 left-0 text-yellow-400 overflow-hidden" 
                            style={{ width: '50%' }}
                          >
                            ★
                          </span>
                        </span>
                      );
                    } else {
                      return <span key={star} className="text-xl text-gray-300">★</span>;
                    }
                  });
                })()}
                <span className="text-sm text-gray-600 ml-1">
                  ({(() => {
                    const grade = reportCardData?.overallGrade;
                    if (grade === 'A+') return '5.0';
                    else if (grade === 'A') return '4.5';
                    else if (grade === 'B+') return '4.0';
                    else if (grade === 'B') return '3.5';
                    else if (grade === 'C+') return '3.0';
                    else if (grade === 'C') return '2.5';
                    else if (grade === 'D+') return '2.0';
                    else if (grade === 'D') return '1.5';
                    else if (grade === 'F') return '1.0';
                    else return '3.0';
                  })()})
                </span>
              </div>
            </div>
            <p className="absolute bottom-4 right-6 text-sm font-bold" style={{ color: '#7335DD' }}>
              - {reportCardData?.generatedByName || "N/A"}
            </p>
          </div>

          {/* Final Assessment Section */}
          <div className="rounded-lg shadow-md p-4 mt-3" style={{ backgroundColor: '#7335DD' }}>
            <div className="grid grid-cols-3 gap-6">
              {/* Final Status */}
              <div>
                <h5 className="text-md font-semibold text-white mb-2">Final Status</h5>
                <p className="text-sm text-white">
                  Level {studentData.currentLevel || "1C"}
                </p>
              </div>

              {/* Result */}
              <div>
                <h5 className="text-md font-semibold text-white mb-2">Result</h5>
                <p className="text-sm text-white">
                  {studentData.currentLevel || "1A"}
                </p>
              </div>

              {/* Overall Grade */}
              <div>
                <h5 className="text-md font-semibold text-white mb-2">Overall Grade</h5>
                <p className="text-sm text-white">
                  {reportCardData?.overallGrade || "N/A"}
                </p>
              </div>
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
// import { useState } from "react";
// import Loader from "../common-components/loader/Loader";
// import logo from '../../assets/images/doulLogo.png';
// import { RiEdit2Fill } from "react-icons/ri";
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

//   if (isLoading || reportLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-white">
//         <Loader />
//       </div>
//     );
//   }

//   if (isError || !studentData) {
//     return <div className="p-4 text-red-500">Error loading student data.</div>;
//   }

//   if (reportError) {
//     console.error('Report Card Error:', reportError);
//   }

//   const hasReportData = reportCardData && Object.keys(reportCardData).length > 0;

//   return (
//     <div className="min-h-screen bg-white">
//       {/* Header */}
//       <div className="sticky top-0 z-10 print:hidden">
//         <div className="py-2 sm:py-4">
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
//               <button
//                 onClick={() => navigate(`/student/${id}/report/edit`)}
//                 className="p-2 bg-orange-400 text-white rounded-full text-2xl font-medium hover:bg-orange-500 transition-colors"
//               >
//                 <RiEdit2Fill />
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Content */}
//       <div className="min-h-screen p-6 print:p-0 print:m-0">
//         {!hasReportData ? (
//           <div className="mx-auto bg-white shadow-xl p-8 rounded-lg text-center" style={{ maxWidth: '600px' }}>
//             <h2 className="text-2xl font-bold text-gray-800 mb-4">No Report Card Data</h2>
//             <p className="text-gray-600 mb-6">No report card has been created for {studentData.firstName} {studentData.lastName} yet.</p>
//             <button
//               onClick={() => navigate(`/student/${id}/report/edit`)}
//               className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
//             >
//               Create Report Card
//             </button>
//           </div>
//         ) : (
//           <div className="mx-auto bg-[#F9FAFB] shadow-xl p-4 print:shadow-none print:bg-white print:mx-0" style={{ width: '210mm', minHeight: '297mm' }}>
//             {/* Header with Logo */}
//             <div className="relative flex items-center justify-between mb-4" style={{ height: '80px' }}>
//               <div className="flex items-center gap-4">
//                 <img src={logo} alt="ITEG Logo" className="h-16 object-contain" />
//               </div>
//               <div className="absolute left-1/2 transform -translate-x-1/2">
//                 <h1 className="text-lg font-bold text-black">Report Card</h1>
//               </div>
//               <div className="text-right text-xs text-gray-600">
//                 <p>Academic Year</p>
//                 <p className="font-semibold text-gray-800">Session 2024-25</p>
//               </div>
//             </div>

//             {/* Personal Information */}
//             <div className="bg-white rounded-lg shadow-md p-4 mb-3">
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                 <div className="space-y-4">
//                   <div>
//                     <div className="flex items-center gap-2 mb-1">
//                       <img src={profileIcon} alt="Profile" className="w-4 h-4" />
//                       <label className="text-sm font-medium text-gray-600">Full Name</label>
//                     </div>
//                     <p className="text-sm font-semibold text-gray-800">{studentData.firstName} {studentData.lastName}</p>
//                   </div>
//                   <div>
//                     <div className="flex items-center gap-2 mb-1">
//                       <img src={courseIcon} alt="Course" className="w-4 h-4" />
//                       <label className="text-sm font-medium text-gray-600">Course</label>
//                     </div>
//                     <p className="text-sm font-semibold text-gray-800">{studentData.course || "N/A"}</p>
//                   </div>
//                 </div>

//                 <div className="space-y-4">
//                   <div>
//                     <div className="flex items-center gap-2 mb-1">
//                       <img src={mailIcon} alt="Email" className="w-4 h-4" />
//                       <label className="text-sm font-medium text-gray-600">Email</label>
//                     </div>
//                     <p className="text-sm font-semibold text-gray-800">{studentData.email || "N/A"}</p>
//                   </div>
//                   <div>
//                     <div className="flex items-center gap-2 mb-1">
//                       <img src={fatherIcon} alt="Father" className="w-4 h-4" />
//                       <label className="text-sm font-medium text-gray-600">Father's Name</label>
//                     </div>
//                     <p className="text-sm font-semibold text-gray-800">{studentData.fatherName || "N/A"}</p>
//                   </div>
//                 </div>

//                 <div className="space-y-4">
//                   <div>
//                     <div className="flex items-center gap-2 mb-1">
//                       <img src={contactIcon} alt="Phone" className="w-4 h-4" />
//                       <label className="text-sm font-medium text-gray-600">Contact Number</label>
//                     </div>
//                     <p className="text-sm font-semibold text-gray-800">{studentData.studentMobile || "N/A"}</p>
//                   </div>
//                   <div>
//                     <div className="flex items-center gap-2 mb-1">
//                       <img src={addressIcon} alt="Address" className="w-4 h-4" />
//                       <label className="text-sm font-medium text-gray-600">Address</label>
//                     </div>
//                     <p className="text-sm font-semibold text-gray-800">{studentData.address || "N/A"}</p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Report Card Content */}
//             <div className="bg-white rounded-lg shadow-md p-4">
//               <h4 className="text-lg font-bold text-gray-800 mb-4">Report Card Details</h4>
              
//               {/* Academic Performance */}
//               {reportCardData?.subjects && reportCardData.subjects.length > 0 && (
//                 <div className="mb-6">
//                   <h5 className="text-md font-semibold text-gray-700 mb-3">Academic Performance</h5>
//                   <div className="overflow-x-auto">
//                     <table className="w-full border-collapse border border-gray-300">
//                       <thead>
//                         <tr className="bg-gray-100">
//                           <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Subject</th>
//                           <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium">Marks Obtained</th>
//                           <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium">Total Marks</th>
//                           <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium">Percentage</th>
//                           <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium">Grade</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {reportCardData.subjects.map((subject, index) => (
//                           <tr key={index}>
//                             <td className="border border-gray-300 px-3 py-2 text-sm">{subject.name || 'N/A'}</td>
//                             <td className="border border-gray-300 px-3 py-2 text-center text-sm">{subject.marksObtained || 0}</td>
//                             <td className="border border-gray-300 px-3 py-2 text-center text-sm">{subject.totalMarks || 0}</td>
//                             <td className="border border-gray-300 px-3 py-2 text-center text-sm">
//                               {subject.totalMarks ? ((subject.marksObtained / subject.totalMarks) * 100).toFixed(1) : 0}%
//                             </td>
//                             <td className="border border-gray-300 px-3 py-2 text-center text-sm font-medium">{subject.grade || 'N/A'}</td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               )}

//               {/* Overall Performance */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//                 <div className="bg-gray-50 p-4 rounded-lg">
//                   <h5 className="text-md font-semibold text-gray-700 mb-3">Overall Performance</h5>
//                   <div className="space-y-2">
//                     <div className="flex justify-between">
//                       <span className="text-sm text-gray-600">Total Marks:</span>
//                       <span className="text-sm font-medium">{reportCardData?.totalMarks || 'N/A'}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-sm text-gray-600">Marks Obtained:</span>
//                       <span className="text-sm font-medium">{reportCardData?.marksObtained || 'N/A'}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-sm text-gray-600">Percentage:</span>
//                       <span className="text-sm font-medium">{reportCardData?.percentage || 'N/A'}%</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-sm text-gray-600">Overall Grade:</span>
//                       <span className="text-sm font-bold text-lg">{reportCardData?.grade || 'N/A'}</span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="bg-gray-50 p-4 rounded-lg">
//                   <h5 className="text-md font-semibold text-gray-700 mb-3">Additional Information</h5>
//                   <div className="space-y-2">
//                     <div className="flex justify-between">
//                       <span className="text-sm text-gray-600">Class:</span>
//                       <span className="text-sm font-medium">{reportCardData?.class || 'N/A'}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-sm text-gray-600">Section:</span>
//                       <span className="text-sm font-medium">{reportCardData?.section || 'N/A'}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-sm text-gray-600">Roll Number:</span>
//                       <span className="text-sm font-medium">{reportCardData?.rollNumber || 'N/A'}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-sm text-gray-600">Exam Type:</span>
//                       <span className="text-sm font-medium">{reportCardData?.examType || 'N/A'}</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Attendance */}
//               {reportCardData?.attendance && (
//                 <div className="mb-6">
//                   <h5 className="text-md font-semibold text-gray-700 mb-3">Attendance Record</h5>
//                   <div className="bg-gray-50 p-4 rounded-lg">
//                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                       <div className="text-center">
//                         <p className="text-sm text-gray-600">Total Days</p>
//                         <p className="text-lg font-bold">{reportCardData.attendance.totalDays || 0}</p>
//                       </div>
//                       <div className="text-center">
//                         <p className="text-sm text-gray-600">Present Days</p>
//                         <p className="text-lg font-bold text-green-600">{reportCardData.attendance.presentDays || 0}</p>
//                       </div>
//                       <div className="text-center">
//                         <p className="text-sm text-gray-600">Absent Days</p>
//                         <p className="text-lg font-bold text-red-600">{reportCardData.attendance.absentDays || 0}</p>
//                       </div>
//                       <div className="text-center">
//                         <p className="text-sm text-gray-600">Attendance %</p>
//                         <p className="text-lg font-bold">{reportCardData.attendance.percentage || 0}%</p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Teacher's Remarks */}
//               {reportCardData?.remarks && (
//                 <div className="mb-6">
//                   <h5 className="text-md font-semibold text-gray-700 mb-3">Teacher's Remarks</h5>
//                   <div className="bg-gray-50 p-4 rounded-lg">
//                     <p className="text-sm text-gray-700">{reportCardData.remarks}</p>
//                   </div>
//                 </div>
//               )}

//               {/* Debug: Show all available data */}
//               {process.env.NODE_ENV === 'development' && (
//                 <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
//                   <h5 className="text-md font-semibold text-yellow-800 mb-2">Debug: Available Report Data</h5>
//                   <pre className="text-xs text-yellow-700 overflow-auto max-h-40">
//                     {JSON.stringify(reportCardData, null, 2)}
//                   </pre>
//                 </div>
//               )}

//               {/* Fallback message */}
//               {!reportCardData || Object.keys(reportCardData).length === 0 && (
//                 <div className="text-center text-gray-500">
//                   <p>No report card data available to display.</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }