import { useParams, useNavigate } from "react-router-dom";
import { useGetAdmittedStudentsByIdQuery } from "../../redux/api/authApi";
import { HiArrowNarrowLeft } from "react-icons/hi";
import { FaUserGroup } from "react-icons/fa6";
import Loader from "../common-components/loader/Loader";
import logo from '../../assets/images/doulLogo.png';

export default function StudentReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: studentData, isLoading, isError } = useGetAdmittedStudentsByIdQuery(id);

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
            {/* <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                Active Student
              </div>
            </div> */}

          </div>
        </div>
      </div>

      {/* A4 Page with Grey Background */}
      <div className="min-h-screen p-6">
        <div className="mx-auto bg-blue-50 shadow-xl p-6 w-[80vw]">

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
                  src={studentData.profileImage || "/default-avatar.png"}
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
                  {/* Connecting Line */}
                  <div className="absolute top-3 left-3 right-3 h-0.5 bg-gray-300"></div>

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
                            : 'w-6 h-6 bg-gray-300'
                            }`}>
                            {isPassed ? '✓' : ''}
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
          <div className="grid grid-cols-4 gap-4 mt-4">
            {/* Skills Box */}
            <div className="col-span-1 bg-white rounded-lg shadow-md p-6">
              <h4 className="text-lg font-bold text-gray-800 mb-4">Skills</h4>
              <div className="space-y-3">
                {[
                  { name: 'Communication', rating: 4 },
                  { name: 'Problem Solving', rating: 5 },
                  { name: 'Teamwork', rating: 3 },
                  { name: 'Leadership', rating: 4 }
                ].map((skill, index) => (
                  <div key={index} >
                    <span className="text-sm text-gray-600 block mb-1">{skill.name}</span>
                    <div>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className={`text-sm ${star <= skill.rating ? 'text-yellow-500' : 'text-gray-300'}`}>
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Technical Skills Box */}
            <div className="col-span-2 bg-white rounded-lg shadow-md p-6">
              <h4 className="text-lg font-bold text-gray-800 mb-4">Technical Skills</h4>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { name: 'HTML', percentage: 85, icon: '💻' },
                  { name: 'CSS', percentage: 75, icon: '⚙️' },
                  { name: 'JavaScript', percentage: 90, icon: '🚀' },
                  { name: 'React', percentage: 70, icon: '📊' },
                  { name: 'React', percentage: 70, icon: '📊' },
                  { name: 'React', percentage: 70, icon: '📊' },
                  { name: 'React', percentage: 70, icon: '📊' },
                  { name: 'React', percentage: 70, icon: '📊' },
                ].map((tech, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl mb-1">{tech.icon}</div>
                    <p className="text-xs text-gray-600 mb-2">{tech.name}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${tech.percentage}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Discipline Box */}
            <div className="col-span-1 bg-white rounded-lg shadow-md p-6">
              <h4 className="text-lg font-bold text-gray-800 mb-4">Discipline</h4>
              <div className="space-y-3">
                {[
                  { name: 'Attendance', percentage: 95, color: 'bg-green-500' },
                  { name: 'Punctuality', percentage: 80, color: 'bg-orange-500' },
                  { name: 'Assignment Submission', percentage: 90, color: 'bg-purple-500' },
                  { name: 'Class Participation', percentage: 85, color: 'bg-red-500' }
                ].map((discipline, index) => (
                  <div key={index}>
                    <p className="text-sm text-gray-600 mb-1">{discipline.name}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className={`${discipline.color} h-2 rounded-full`} style={{ width: `${discipline.percentage}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}