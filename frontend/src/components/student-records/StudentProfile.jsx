/* eslint-disable react/prop-types */
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useGetAdmittedStudentsByIdQuery, useUpdateStudentImageMutation, useUploadResumeMutation } from "../../redux/api/authApi";
import PermissionModal from "./PermissionModal";
import PlacementModal from "./PlacementModal";
import Loader from "../common-components/loader/Loader";
import UpdateTechnologyModal from "./UpdateTechnologyModal";
import { toast } from "react-toastify";

// Icons & Images
import profilePlaceholder from "../../assets/images/profile-img.png";
import attendence from "../../assets/icons/attendence-card-icon.png";
import level from "../../assets/icons/level-card-icon.png";
import permission from "../../assets/icons/permission-card-icon.png";
import placed from "../../assets/icons/placement-card-icon.png";
import company from "../../assets/icons/company-icon.png";
import position from "../../assets/icons/position-icon.png";
import loca from "../../assets/icons/location-icon.png";
import date from "../../assets/icons/calendar-icon.png";
import download from "../../assets/icons/download-icon.png";
import studentProfileBg from "../../assets/images/Student_profile_2nd_bg.jpg";
import { HiArrowNarrowLeft } from "react-icons/hi";
import { IoCamera } from "react-icons/io5";
import { Chart } from "react-google-charts";

export default function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: studentData, isLoading, isError } = useGetAdmittedStudentsByIdQuery(id);
  const [updateStudentImage] = useUpdateStudentImageMutation();
  const [uploadResume, { isLoading: isResumeUploading }] = useUploadResumeMutation();
  const [latestLevel, setLatestLevel] = useState("1A");
  const [isPermissionModalOpen, setPermissionModalOpen] = useState(false);
  const [isPlacedModalOpen, setPlacedModalOpen] = useState(false);
  const [isYearView, setIsYearView] = useState(false);
  const [isTechModalOpen, setTechModalOpen] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);

  const fileInputRef = useRef(null);


  useEffect(() => {
    if (studentData?.level?.length > 0) {
      const passed = studentData.level.filter((lvl) => lvl.result === "Pass");
      setLatestLevel(passed.length > 0 ? passed[passed.length - 1].levelNo : "1A");
    }
  }, [studentData]);

  // Check if student can choose elective (Level 2B or 2C passed)
  const canChooseElective = () => {
    if (!studentData?.level?.length) return false;
    const passedLevels = studentData.level.filter(lvl => lvl.result === "Pass");
    return passedLevels.some(lvl => lvl.levelNo === "2B" || lvl.levelNo === "2C" || lvl.levelNo === "2A");
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setIsImageUploading(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const base64Image = e.target.result;
        console.log('Uploading image for student ID:', studentData._id);

        // Update student image via RTK Query
        const result = await updateStudentImage({
          id: studentData._id,
          image: base64Image
        }).unwrap();

        console.log('Image upload successful:', result);

      } catch (error) {
        console.error('Error uploading image:', error);
        alert(`Failed to upload image: ${error.data?.message || error.message || 'Unknown error'}`);
      } finally {
        setIsImageUploading(false);
      }
    };

    reader.onerror = () => {
      console.error('Error reading file');
      alert('Error reading file');
      setIsImageUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleResumeUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast.error('Please select a PDF file');
      return;
    }

    // Validate file size (max 5MB to avoid server issues)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Resume size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const base64Data = e.target.result;
        // Remove the data:application/pdf;base64, prefix
        const base64String = base64Data.split(',')[1];

        console.log('Uploading resume:', {
          studentId: studentData._id,
          fileName: file.name,
          fileSize: file.size,
          base64Length: base64String.length
        });

        const payload = {
          studentId: studentData._id,
          fileName: file.name,
          fileData: base64String
        };

        console.log('API Payload:', payload);

        await uploadResume(payload).unwrap();

        toast.success('Resume uploaded successfully!');

      } catch (error) {
        console.error('Full error object:', error);
        console.error('Error status:', error?.status);
        console.error('Error data:', error?.data);

        let errorMessage = 'Failed to upload resume';
        if (error?.status === 500) {
          errorMessage = 'Server error. Please try with a smaller file or contact support.';
        } else if (error?.data?.message) {
          errorMessage = error.data.message;
        }

        toast.error(errorMessage);
      }
    };

    reader.onerror = () => {
      console.error('Error reading file');
      toast.error('Error reading file');
    };

    reader.readAsDataURL(file);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader />
      </div>
    );
  }

  if (isError || !studentData) return <div className="p-4 text-red-500">Error loading student data.</div>;

  const monthlyData = [
    ["Month", "Attendance", { role: "style" }],
    ["Jan", 100, "#22C55E"],
    ["Feb", 90, "#22C55E"],
    ["Mar", 75, "#FDA92D"],
    ["Apr", 80, "#22C55E"],
    ["May", 60, "#FDA92D"],
    ["Jun", 50, "#FDA92D"],
    ["Jul", 45, "#EF4444"],
    ["Aug", 40, "#EF4444"],
    ["Sep", 38, "#EF4444"],
    ["Oct", 30, "#EF4444"],
    ["Nov", 30, "#EF4444"],
    ["Dec", 25, "#EF4444"],
  ];
  // Check permission status
  const hasPermission = studentData.permissionDetails && studentData.permissionDetails !== null && typeof studentData.permissionDetails === 'object' && Object.keys(studentData.permissionDetails).length > 0;
  const permissionStatus = hasPermission ? "Yes" : "No";

  // Check placement status
  const hasPlacement = studentData.placedInfo && studentData.placedInfo !== null && typeof studentData.placedInfo === 'object' && Object.keys(studentData.placedInfo).length > 0;
  const placementStatus = hasPlacement ? "Placed" : "Not Placed";

  // Debug student data to check resume field
  console.log('Student Data:', studentData);
  console.log('Resume field:', studentData.resume);
  console.log('Has resume:', !!studentData.resume);

  return (
    <div className="min-h-screen bg-white">
      {/* Professional Header */}
      <div className="sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.history.back()}
                className="group flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 text-gray-700 hover:text-gray-900"
              >
                <HiArrowNarrowLeft className="text-lg group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">Back</span>
              </button>
              <div className="h-8 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-black">Student Profile</h1>
                <p className="text-sm text-black">Comprehensive analytics & performance insights</p>
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

      <div className="px-2 sm:px-6 py-2 sm:py-4">
        {/* Hero Section with Student Info */}
        <div className="bg-white rounded-2xl overflow-hidden mb-8" style={{ boxShadow: '0 0 25px 8px rgba(0, 0, 0, 0.10)' }}>
          <div className="relative">
            <div className="absolute inset-0" style={{
              backgroundImage: `url(${studentProfileBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}></div>
            <div className="absolute top-7 right-8 flex gap-3 z-20">
              <button
                onClick={() => {
                  if (canChooseElective()) {
                    console.log('Update Technology button clicked');
                    setTechModalOpen(true);
                  }
                }}
                disabled={!canChooseElective()}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg ${canChooseElective()
                    ? 'bg-[#FDA92D] hover:bg-[#E6941A] hover:shadow-xl hover:scale-105 text-black font-extrabold cursor-pointer'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                  }`}
              >
                Choose Elective
              </button>
              <button
                onClick={() => document.getElementById('resume-upload').click()}
                disabled={isResumeUploading}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg bg-[#FDA92D] hover:bg-[#E6941A] hover:shadow-xl hover:scale-105 text-black disabled:opacity-50"
              >
                {isResumeUploading ? 'Uploading...' : 'Upload Resume'}
              </button>
              <input
                id="resume-upload"
                type="file"
                accept=".pdf"
                onChange={handleResumeUpload}
                className="hidden"
              />
            </div>
            <div className="relative px-3 sm:px-8 py-4 sm:py-12">
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
                <div className="relative">
                  <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-full bg-white p-1 sm:p-2 shadow-md">
                    <img
                      src={studentData.image || profilePlaceholder}
                      alt="Profile"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div
                    className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full shadow-md flex items-center justify-center cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={triggerImageUpload}
                    style={{ transform: 'translate(-25%, -25%)' }}
                  >
                    {isImageUploading ? (
                      <div className="w-4 h-4 sm:w-3 sm:h-3 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <IoCamera
                        className="w-5 h-5 sm:w-7 sm:h-6 text-gray-700 hover:text-gray-900" />
                    )}
                  </div>
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 text-white">
                    {studentData.firstName} {studentData.lastName}
                  </h2>
                  <p className="text-gray-300 mb-3 sm:mb-4 text-xs sm:text-base">Course: {studentData.course || "N/A"}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6">
                    <ContactCard icon={<svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>} label="Email" value={studentData.email} />
                    <ContactCard icon={<svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>} label="Phone" value={studentData.studentMobile || "N/A"} />
                    <ContactCard icon={<svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} label="Location" value={studentData.address || studentData.village || "N/A"} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Performance Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6 mb-4 sm:mb-8">
          <ProfessionalMetricCard
            icon={attendence}
            title="Attendance Rate"
            value="93%"
            bgColor="#FDA92D"
            description="Monthly average"
          />
          <ProfessionalMetricCard
            icon={level}
            title="Level History"
            value={latestLevel}
            bgColor="#8E33FF"
            description="Academic progress"
            onClick={() => navigate(`/student/${id}/level-interviews`)}
          />
          <ProfessionalMetricCard
            icon={permission}
            title="Permission Status"
            // value={studentData.permissionStatus || "None"}
            value={permissionStatus || "None"}
            bgColor="#00B8D9"
            description="Current requests"
            onClick={() => setPermissionModalOpen(true)}
          />
          <ProfessionalMetricCard
            icon={placed}
            title="Placement Status"
            // value={studentData.placementStatus || "Pending"}
            value={placementStatus || "Pending"}
            bgColor="#22C55E"
            description="Career progress"
            onClick={() => setPlacedModalOpen(true)}
          />
        </div>

        {/* Analytics Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8 mb-6 sm:mb-8">
          {/* Attendance Analytics */}
          <div className="lg:col-span-2">
            <div className={`transition-all duration-500 ${isYearView ? 'hidden' : 'block'}`}>
              <AnalyticsCard
                title="Attendance Analytics"
                subtitle="Monthly performance tracking with trends"
                icon={<svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
                showButton={true}
                buttonText="Yearly"
                onButtonClick={() => setIsYearView(!isYearView)}
              >
                <div className="h-48 sm:h-80">
                  <Chart
                    chartType="ColumnChart"
                    data={monthlyData}
                    options={{
                      backgroundColor: 'transparent',
                      chartArea: { width: '85%', height: '75%' },
                      colors: ['#22C55E', '#FDA92D', '#EF4444'],
                      bar: { groupWidth: '60%' },
                      hAxis: {
                        textStyle: { color: '#6B7280', fontSize: 11 },
                        gridlines: { color: 'transparent' }
                      },
                      vAxis: {
                        textStyle: { color: '#6B7280', fontSize: 11 },
                        gridlines: { color: '#F3F4F6' }
                      },
                      legend: 'none'
                    }}
                    width="100%"
                    height="100%"
                  />
                </div>
              </AnalyticsCard>
            </div>
            <div className={`transition-all duration-500 ${isYearView ? 'block' : 'hidden'}`}>
              <AnalyticsCard
                title="Attendance Analytics"
                subtitle="Yearly performance overview"
                icon={<svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
                showButton={true}
                buttonText="Monthly"
                onButtonClick={() => setIsYearView(!isYearView)}
              >
                <div className="h-48 sm:h-80 flex items-center justify-center gap-8">
                  <div className="relative w-80 h-80">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200" opacity={0.7}>
                      {/* 2022 - Innermost ring */}
                      <circle cx="100" cy="100" r="40" fill="none" stroke="#F8F9FA" strokeWidth="8" />
                      <circle cx="100" cy="100" r="40" fill="none" stroke="#B66816" strokeWidth="8"
                        strokeDasharray={`${92 * 2.51} 251`} strokeLinecap="round" />

                      {/* 2023 - Middle ring */}
                      <circle cx="100" cy="100" r="60" fill="none" stroke="#F8F9FA" strokeWidth="8" />
                      <circle cx="100" cy="100" r="60" fill="none" stroke="#FDA92D" strokeWidth="8"
                        strokeDasharray={`${88 * 3.77} 377`} strokeLinecap="round" />

                      {/* 2024 - Outermost ring */}
                      <circle cx="100" cy="100" r="80" fill="none" stroke="#F8F9FA" strokeWidth="8" />
                      <circle cx="100" cy="100" r="80" fill="none" stroke="#ED9A21" strokeWidth="8"
                        strokeDasharray={`${65 * 5.03} 503`} strokeLinecap="round" />
                    </svg>

                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-2xl font-bold text-gray-800">82%</div>
                      <div className="text-xs text-gray-500">Average</div>
                    </div>

                    {/* Year Labels */}
                    <div className="absolute inset-0">
                      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600">2024</div>
                      <div className="absolute top-12 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600">2023</div>
                      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600">2022</div>
                    </div>
                  </div>

                  {/* Progress Rate Indicator */}
                  <div className="bg-white rounded-lg p-4" style={{ boxShadow: '0 0 18px 5px rgba(0, 0, 0, 0.08)' }}>
                    <h4 className="text-sm font-semibold text-gray-800 mb-4">Progress Rate</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">2024</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full">
                            <div className="h-2 bg-orange-200 rounded-full" style={{ width: '65%' }}></div>
                          </div>
                          <span className="text-xs font-medium text-gray-700">65%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">2023</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full">
                            <div className="h-2 bg-orange-300 rounded-full" style={{ width: '88%' }}></div>
                          </div>
                          <span className="text-xs font-medium text-gray-700">88%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">2022</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full">
                            <div className="h-2 bg-orange-400 rounded-full" style={{ width: '92%' }}></div>
                          </div>
                          <span className="text-xs font-medium text-gray-700">92%</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Trend</span>
                        <span className="text-xs font-medium text-red-600">↓ -4.5%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </AnalyticsCard>
            </div>
          </div>

          {/* Progress Overview */}
          <div>
            <AnalyticsCard
              title="Progress Overview"
              subtitle="Academic achievements"
              icon={<svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>}
            >
              <div className="space-y-6">
                <ProgressMetric title="Certificates" value="2" total="5" color="#FFAB00" />
                <ProgressMetric title="Success Rate" value="99" total="100" color="#22C55E" suffix="%" />
                <ProgressMetric title="Levels Completed" value="6" total="10" color="#8E33FF" />
              </div>
            </AnalyticsCard>
          </div>
        </div>

        {/* Detailed Information Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mb-4 sm:mb-8">
          {/* Placement Information */}
          <DetailSection
            title="Placement Information"
            subtitle="Current placement status and company details"
            icon={<svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
          >
            <div className="space-y-4">
              <DetailRow icon={company} label="Company" value={studentData.placedInfo?.companyName} />
              <DetailRow icon={position} label="Position" value={studentData.placedInfo?.jobProfile} />
              <DetailRow icon={loca} label="Location" value={studentData.placedInfo?.location} />
              <DetailRow icon={date} label="Joining Date" value={studentData.placedInfo?.joiningDate ? new Date(studentData.placedInfo.joiningDate).toLocaleDateString() : null} />
            </div>
            {!studentData.placedInfo?.companyName && (
              <div className="mt-6 p-4 bg-yellow-50 rounded-lg" style={{ boxShadow: '0 0 15px 4px rgba(0, 0, 0, 0.06)' }}>
                <p className="text-sm text-yellow-800">No placement information available yet.</p>
              </div>
            )}
          </DetailSection>

          {/* Permission Details */}
          <DetailSection
            title="Permission Management"
            subtitle="Recent requests and approval status"
            icon={<svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}
          >
            <div className="space-y-4">
              <DetailRow
                icon={date}
                label="Last Request"
                value={studentData?.permissionDetails?.uploadDate
                  ? new Date(studentData.permissionDetails.uploadDate).toLocaleDateString()
                  : "No recent requests"}
              />
              <DetailRow
                icon={permission}
                label="Reason"
                value={studentData?.permissionDetails?.remark || "N/A"}
              />
              <DetailRow
                icon={permission}
                label="Approved By"
                value={studentData?.permissionDetails?.approved_by || "N/A"}
              />
              {studentData?.permissionDetails?.imageURL && (
                <div className="mt-4">
                  <p className="text-xs text-black uppercase tracking-wide font-medium mb-2">Signature</p>
                  <img
                    src={studentData.permissionDetails.imageURL}
                    alt="Permission Signature"
                    className="h-20 object-contain border rounded shadow"
                  />
                </div>
              )}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg" style={{ boxShadow: '0 0 15px 4px rgba(0, 0, 0, 0.06)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Current Status</span>
                  <StatusBadge status={hasPermission ? "Approved" : "No Permission"} />
                </div>
              </div>
            </div>
          </DetailSection>
        </div>

        {/* Resume and Additional Info Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mb-4 sm:mb-8">
          {/* Resume Card */}
          <DetailSection
            title="Resume"
            subtitle="Student's uploaded resume document"
            icon={<svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
          >
            <div className="space-y-4">
              {studentData.resumeURL ? (
                <div>
                  {/* Resume Header */}
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-t-lg border border-blue-200 border-b-0">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 text-sm">📄</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-blue-900">{studentData.resumeURL.split('/').pop().split('-').slice(1).join('-') || 'Resume.pdf'}</p>
                        <p className="text-xs text-blue-600">Resume document</p>
                      </div>
                    </div>
                    <a
                      href={studentData.resumeURL}
                      download
                      className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs font-medium rounded transition-colors flex items-center"
                    >
                      <img src={download} />

                    </a>
                  </div>
                  {/* Resume Card */}
                  <div className="border border-blue-200 rounded-b-lg bg-blue-50 p-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <span className="text-blue-600 text-2xl">📄</span>
                      </div>
                      <h4 className="text-lg font-semibold text-blue-900 mb-2">Resume Available</h4>
                      <p className="text-sm text-blue-700 mb-4">Student&rsquo;s resume has been uploaded successfully</p>
                      <div className="flex gap-3 justify-center">
                        <a
                          href={studentData.resumeURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          View Resume
                        </a>
                        <a
                          href={studentData.resumeURL}
                          download
                          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                        >
                          <img src={download} className="w-4 h-4" />
                          Download
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <span className="text-gray-400 text-xl">📄</span>
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-1">No Resume Uploaded</p>
                  <p className="text-xs text-gray-500">Student has not uploaded a resume yet</p>
                </div>
              )}
            </div>
          </DetailSection>

          {/* Additional Information Card */}
          <DetailSection
            title="Additional Information"
            subtitle="Extra details and notes"
            icon={<svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
          >
            <div className="space-y-4">
              {/* Offer Letter */}
              {studentData.placedInfo?.offerLetterURL ? (
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 text-sm">📄</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-green-900">Offer Letter</p>
                      <p className="text-xs text-green-600">Placement document</p>
                    </div>
                  </div>
                  <a
                    href={studentData.placedInfo.offerLetterURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded transition-colors flex items-center"
                  >
                    <img src={download} alt="Download" className="w-3 h-3" />
                  </a>
                </div>
              ) : null}
              
              {/* Application */}
              {studentData.placedInfo?.applicationURL ? (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 text-sm">📋</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-blue-900">Application</p>
                      <p className="text-xs text-blue-600">Placement document</p>
                    </div>
                  </div>
                  <a
                    href={studentData.placedInfo.applicationURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors flex items-center"
                  >
                    <img src={download} alt="Download" className="w-3 h-3" />
                  </a>
                </div>
              ) : null}
              
              {/* Show message if no documents */}
              {!studentData.placedInfo?.offerLetterURL && !studentData.placedInfo?.applicationURL && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <span className="text-gray-400 text-xl">📝</span>
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-1">No Additional Documents</p>
                  <p className="text-xs text-gray-500">Placement documents will appear here</p>
                </div>
              )}
            </div>
          </DetailSection>
        </div>
      </div>

      {/* Modals */}
      <PermissionModal
        isOpen={isPermissionModalOpen}
        onClose={() => setPermissionModalOpen(false)}
        studentData={studentData}
        studentId={studentData._id}
      />
      <PlacementModal
        isOpen={isPlacedModalOpen}
        onClose={() => setPlacedModalOpen(false)}
        studentData={studentData}
        studentId={studentData._id}
      />
      <UpdateTechnologyModal
        isOpen={isTechModalOpen}
        onClose={() => setTechModalOpen(false)}
        studentId={studentData._id}
      />
    </div>
  );
}

// Professional Contact Card for Hero Section
const ContactCard = ({ icon, label, value }) => (
  <div className="bg-white/20 backdrop-blur-md rounded-lg p-3 border border-white/30" style={{ backdropFilter: 'blur(12px)', background: 'rgba(255, 255, 255, 0.15)' }}>
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
        <span className="text-sm">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-300 uppercase tracking-wide font-medium">{label}</p>
        <p className="text-sm font-semibold text-white truncate">{value}</p>
      </div>
    </div>
  </div>
);

// Professional Metric Card with Advanced Styling
const ProfessionalMetricCard = ({ icon, title, value, bgColor, description, onClick }) => (
  <div
    className="group relative bg-white rounded-xl overflow-hidden cursor-pointer"
    style={{ boxShadow: '0 0 20px 5px rgba(0, 0, 0, 0.08)' }}
    onClick={onClick}
  // style={{ backgroundColor: bg }}
  >

    <div className="relative p-2 sm:p-6">
      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <div className="flex-1">
          <p className="text-xs sm:text-sm font-medium text-black mb-0.5 sm:mb-1">{title}</p>
          <h3 className="text-sm sm:text-xl lg:text-2xl font-bold mb-0.5 sm:mb-1" style={{ color: bgColor }}>{value}</h3>
          <p className="text-xs text-black hidden sm:block">{description}</p>
        </div>
        <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shadow-sm"
          style={{ backgroundColor: `${bgColor}90` }}>
          <img src={icon} className="h-3 w-3 sm:h-6 sm:w-6" alt={title} />
        </div>
      </div>
    </div>
  </div>
);

// Analytics Card Container
const AnalyticsCard = ({ title, subtitle, icon, children, showButton, buttonText, onButtonClick }) => (
  <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: '0 0 22px 6px rgba(0, 0, 0, 0.09)' }}>
    <div className="px-3 sm:px-6 py-3 sm:py-4 border-b-2 border-gray-200 shadow-sm bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center bg-gray-100">
            <span className="text-sm sm:text-lg">{icon}</span>
          </div>
          <div>
            <h3 className="text-sm sm:text-lg font-bold text-gray-900">{title}</h3>
            <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">{subtitle}</p>
          </div>
        </div>
        {showButton && (
          <button
            onClick={onButtonClick}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 text-xs sm:text-sm font-medium rounded-lg transition-colors duration-200"
          >
            {buttonText}
          </button>
        )}
      </div>
    </div>
    <div className="p-3 sm:p-6">{children}</div>
  </div>
);

// Progress Metric with Bar
const ProgressMetric = ({ title, value, total, color, suffix = '' }) => {
  const percentage = (value / total) * 100;
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-black">{title}</span>
        <span className="text-sm font-bold text-black">{value}{suffix}/{total}{suffix}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        ></div>
      </div>
    </div>
  );
};

// Detail Section Container
const DetailSection = ({ title, subtitle, icon, children }) => (
  <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: '0 0 22px 6px rgba(0, 0, 0, 0.09)' }}>
    <div className="px-3 sm:px-6 py-3 sm:py-4 border-b-2 border-gray-200 shadow-sm bg-white">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center bg-gray-100">
          <span className="text-sm sm:text-lg">{icon}</span>
        </div>
        <div>
          <h3 className="text-sm sm:text-lg font-bold text-gray-900">{title}</h3>
          <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">{subtitle}</p>
        </div>
      </div>
    </div>
    <div className="p-3 sm:p-6">{children}</div>
  </div>
);

// Detail Row Component
const DetailRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-2 sm:gap-4 p-1.5 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors">
    <div className="w-6 h-6 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
      <img className="h-3 w-3 sm:h-5 sm:w-5" src={icon} alt={label} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-black uppercase tracking-wide font-medium">{label}</p>
      <p className="text-xs sm:text-sm font-semibold text-black truncate">{value || "N/A"}</p>
    </div>
  </div>
);

// Status Badge Component
const StatusBadge = ({ status }) => {
  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusStyle(status)}`}>
      {status || 'No Status'}
    </span>
  );
};
