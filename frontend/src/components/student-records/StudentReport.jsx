import { useParams, useNavigate } from "react-router-dom";
import { useGetAdmittedStudentsByIdQuery, useGetReportCardQuery } from "../../redux/api/authApi";
import { HiArrowNarrowLeft } from "react-icons/hi";
import { FaUserGroup } from "react-icons/fa6";
import { HiDownload } from "react-icons/hi";
import Loader from "../common-components/loader/Loader";
import logo from '../../assets/images/doulLogo.png';
import { RiEdit2Fill } from "react-icons/ri";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function StudentReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: studentData, isLoading, isError } = useGetAdmittedStudentsByIdQuery(id);
  const { data: reportCardResponse, isLoading: reportLoading, isError: reportError } = useGetReportCardQuery(id);
  const reportCardData = reportCardResponse?.data;

  const downloadPDF = async () => {
    console.log('Download PDF clicked');
    const element = document.getElementById('pdf-content');
    
    if (!element) {
      console.error('PDF content element not found');
      alert('Report content not found');
      return;
    }

    try {
      console.log('Starting PDF generation...');
      
      const canvas = await html2canvas(element, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#F9FAFB',
        logging: false
      });
      
      console.log('Canvas created successfully');
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      const fileName = `${studentData?.firstName || 'Student'}_${studentData?.lastName || 'Report'}_Report_Card.pdf`;
      pdf.save(fileName);
      
      console.log('PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF: ' + error.message);
    }
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
    <div className="min-h-screen bg-white">
      {/* Professional Header */}
      <div className="sticky top-0 z-10">
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
              <button
                onClick={() => {
                  console.log('Button clicked');
                  downloadPDF();
                }}
                className="p-2 bg-green-500 text-white rounded-full text-xl font-medium hover:bg-green-600 transition-colors"
                title="Download PDF"
              >
                <HiDownload />
              </button>
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
      <div className="min-h-screen p-6">
        <div id="pdf-content" className="mx-auto bg-[#F9FAFB] shadow-xl p-6 w-[50vw]">

          {/* Header with Logos and Title */}
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={logo} alt="ITEG Logo" className="h-20 object-contain" />
            </div>
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <h1 className="text-xl font-bold text-black">Report Card</h1>
            </div>
            <div className="text-right text-sm text-gray-600">
              <p>Academic Year</p>
              <p className="font-semibold text-gray-800">Session 2024-25</p>
            </div>
          </div>

          {/* White Box 1 - Personal Information */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-4">
            {/* <h2 className="text-2xl font-bold text-gray-800 mb-6">Personal Information</h2> */}

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center gap-2">
                  <FaUserGroup className="text-blue-500 text-2xl" />
                  <div>
                    <label className="text-sm font-medium text-gray-600">Full Name</label>
                    <p className="text-sm font-semibold text-gray-800">{studentData.firstName} {studentData.lastName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FaUserGroup className="text-blue-500 text-2xl" />
                  <div>
                    <label className="text-sm font-medium text-gray-600">Course</label>
                    <p className="text-sm font-semibold text-gray-800">{studentData.course || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FaUserGroup className="text-blue-500 text-2xl" />
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-sm font-semibold text-gray-800">{studentData.email || "N/A"}</p>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center gap-2">
                  <FaUserGroup className="text-blue-500 text-2xl" />
                  <div>
                    <label className="text-sm font-medium text-gray-600">Father's Name</label>
                    <p className="text-sm font-semibold text-gray-800">{studentData.fatherName || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FaUserGroup className="text-blue-500 text-2xl" />
                  <div>
                    <label className="text-sm font-medium text-gray-600">Contact Number</label>
                    <p className="text-sm font-semibold text-gray-800">{studentData.studentMobile || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FaUserGroup className="text-blue-500 text-2xl" />
                  <div>
                    <label className="text-sm font-medium text-gray-600">Address</label>
                    <p className="text-sm font-semibold text-gray-800">{studentData.address || "N/A"}</p>
                  </div>
                </div>
              </div>

              <div className="md:col-span-1 flex justify-center">
                <img
                  src={studentData.profileImage || "https://via.placeholder.com/80x80/4F46E5/FFFFFF?text=Student"}
                  alt="Student Photo"
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* White Box 2 - Stepper */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Level Progress</h3>
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
                          <div className={`flex items-center justify-center rounded-full text-xs font-medium relative z-10 ${
                            isPassed
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
          <div className="grid grid-cols-3 gap-4 mt-4">
            {/* Technical Skills Box */}
            <div className="col-span-1 bg-white rounded-lg shadow-md p-6">
              <h4 className="text-lg font-bold text-gray-800 mb-4">Technical Skills</h4>
              <div className="space-y-3">
                {reportCardData?.technicalSkills?.length > 0 ? reportCardData.technicalSkills.map((tech, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">{tech.skillName}</span>
                      <span className="text-xs text-gray-500">{tech.totalPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-[#FDA92D] h-2 rounded-full" style={{ width: `${tech.totalPercentage}%` }}></div>
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
            <div className="col-span-1 bg-white rounded-lg shadow-md p-6">
              <h4 className="text-lg font-bold text-gray-800 mb-4">Soft Skills</h4>
              <div className="space-y-2">
                {reportCardData?.softSkills?.categories?.length > 0 ? reportCardData.softSkills.categories.map((category, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-600">{category.title}</span>
                      <span className="text-xs text-gray-500">{category.score}/{category.maxMarks}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(category.score / category.maxMarks) * 100}%` }}></div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center text-gray-500">
                    <span>N/A</span>
                  </div>
                )}
              </div>
            </div>
              
            {/* Discipline Box */}
            <div className="col-span-1 bg-white rounded-lg shadow-md p-6">
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
          </div>

          {/* Career Readiness */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-4">
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
                    <p className="text-sm text-gray-600 mb-2">Placement Ready</p>
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

          {/* Academic Performance */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-4">
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

          {/* Faculty Feedback */}
          <div className="bg-[#EFF6FF] rounded-lg shadow-md p-6 mt-4 relative">
            <h4 className="text-lg font-bold text-gray-800 mb-4">Faculty Feedback</h4>
            <div className="mb-8">
              <p className="text-sm text-gray-600 line-clamp-2">
                {reportCardData?.facultyRemark || "N/A"}
              </p>
            </div>
            <p className="absolute bottom-4 right-6 text-sm font-bold" style={{ color: '#7335DD' }}>
              - {reportCardData?.generatedByName || "N/A"}
            </p>
          </div>

          {/* Final Assessment Section */}
          <div className="rounded-lg shadow-md p-6 mt-4" style={{ backgroundColor: '#7335DD' }}>
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