import { useParams, useNavigate } from "react-router-dom";
import { useGetAdmittedStudentsByIdQuery, useGetReportCardQuery } from "../../redux/api/authApi";
import { HiArrowNarrowLeft } from "react-icons/hi";
import { FaUserGroup } from "react-icons/fa6";
import Loader from "../common-components/loader/Loader";
import logo from '../../assets/images/doulLogo.png';
import { RiEdit2Fill } from "react-icons/ri";

export default function StudentReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: studentData, isLoading, isError } = useGetAdmittedStudentsByIdQuery(id);
  const { data: reportCardData, isLoading: reportLoading, isError: reportError } = useGetReportCardQuery(id);


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
        <div className="mx-auto bg-[#F9FAFB] shadow-xl p-6" style={{ width: '210mm', minHeight: '297mm' }}>

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
                {(reportCardData?.technicalSkills || [
                  { name: 'HTML/CSS', percentage: 85 },
                  { name: 'JavaScript', percentage: 90 },
                  { name: 'React', percentage: 75 },
                  { name: 'Node.js', percentage: 70 }
                ]).map((tech, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">{tech.name}</span>
                      <span className="text-xs text-gray-500">{tech.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-[#FDA92D] h-2 rounded-full" style={{ width: `${tech.percentage}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Soft Skills Box */}
            <div className="col-span-1 bg-white rounded-lg shadow-md p-6">
              <h4 className="text-lg font-bold text-gray-800 mb-4">Soft Skills</h4>
              <div className="grid grid-cols-2 gap-2">
                {(reportCardData?.softSkills || [
                  { name: 'Presentation', percentage: 85 },
                  { name: 'Communication', percentage: 90 },
                  { name: 'Teamwork', percentage: 88 },
                  { name: 'Problem Solving', percentage: 82 },
                  { name: 'Confidence', percentage: 87 },
                  { name: 'Adaptability', percentage: 80 }
                ]).map((skill, index) => (
                  <div key={index} className="text-center">
                    <p className="text-xs text-gray-600">{skill.name}</p>
                  </div>
                ))}
              </div>
            </div>
              
            {/* Discipline Box */}
            <div className="col-span-1 bg-white rounded-lg shadow-md p-6">
              <h4 className="text-lg font-bold text-gray-800 mb-4">Discipline</h4>
              <div className="space-y-3">
                {(reportCardData?.discipline || [
                  { name: 'Attendance', percentage: 95, color: 'bg-green-500' },
                  { name: 'Punctuality', percentage: 80, color: 'bg-orange-500' },
                  { name: 'Assignment Submission', percentage: 90, color: 'bg-purple-500' },
                  { name: 'Class Participation', percentage: 85, color: 'bg-red-500' }
                ]).map((discipline, index) => (
                  <div key={index}>
                    <p className="text-sm text-gray-600 mb-1">{discipline.name}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className={`${discipline.color || 'bg-blue-500'} h-2 rounded-full`} style={{ width: `${discipline.percentage}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Career Readiness */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-4">
            <h4 className="text-lg font-bold text-gray-800 mb-4">Career Readiness</h4>
            <div className="grid grid-cols-4 gap-4">
              {(reportCardData?.careerReadiness || [
                { name: 'Resume', percentage: 85 },
                { name: 'LinkedIn', percentage: 75 },
                { name: 'Aptitude/Reasoning', percentage: 80 },
                { name: 'Interview Readiness', percentage: 70 }
              ]).map((career, index) => (
                <div key={index} className="text-center">
                  <p className="text-sm text-gray-600 mb-2">{career.name}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${career.percentage}%` }}></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">{career.percentage}%</span>
                </div>
              ))}
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
                  <span className="text-lg font-bold text-gray-800">{reportCardData?.firstYearSGPA || "8.5"}</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">2nd Year SGPA</p>
                <div className="bg-gray-100 rounded-lg p-3">
                  <span className="text-lg font-bold text-gray-800">{reportCardData?.secondYearSGPA || "8.2"}</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">3rd Year SGPA</p>
                <div className="bg-gray-100 rounded-lg p-3">
                  <span className="text-lg font-bold text-gray-800">{reportCardData?.thirdYearSGPA || "8.7"}</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Attendance</p>
                <div className="bg-gray-100 rounded-lg p-3">
                  <span className="text-lg font-bold text-gray-800">{reportCardData?.attendance || "95"}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Faculty Feedback */}
          <div className="bg-[#EFF6FF] rounded-lg shadow-md p-6 mt-4 relative">
            <h4 className="text-lg font-bold text-gray-800 mb-4">Faculty Feedback</h4>
            <div className="mb-8">
              <p className="text-sm text-gray-600 line-clamp-2">
                {reportCardData?.facultyFeedback || "Student shows excellent progress in technical skills and demonstrates strong problem-solving abilities. Needs to improve time management for project deliveries."}
              </p>
            </div>
            <p className="absolute bottom-4 right-6 text-sm font-bold" style={{ color: '#7335DD' }}>
              - Prof. {reportCardData?.facultyName || "John Smith"}
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
              
              {/* Remark */}
              <div>
                <h5 className="text-md font-semibold text-white mb-2">Remark</h5>
                <p className="text-sm text-white">
                  {reportCardData?.remark || "Good Performance"}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}