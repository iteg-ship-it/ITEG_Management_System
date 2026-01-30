import { useParams } from "react-router-dom";
import { useGetUserByIdQuery, useUpdateUserMutation } from "../../redux/api/authApi";
import Loader from "../common-components/loader/Loader";
import { HiArrowNarrowLeft } from "react-icons/hi";
import { IoCamera } from "react-icons/io5";
import { FiUser, FiBriefcase, FiShield, FiSettings, FiMail, FiPhone, FiMapPin, FiCalendar, FiClock, FiUserCheck } from "react-icons/fi";
import profilePlaceholder from '../../assets/images/profile-img.png';
import studentProfileBg from "../../assets/images/Student_profile_2nd_bg.jpg";
import { toast } from 'react-toastify';
import { useState, useRef } from 'react';

const UserProfile = () => {
  const { id } = useParams();
  const { data, isLoading, isError, error, refetch } = useGetUserByIdQuery(id);
  const [updateUser] = useUpdateUserMutation();
  const [isImageUploading, setIsImageUploading] = useState(false);
  const fileInputRef = useRef(null);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-red-600 font-semibold py-6">
        Error loading user data: {error?.data?.message || "Something went wrong!"}
      </div>
    );
  }

  const userData = data?.user;

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const userId = id || userData?._id;
    if (!userId) {
      toast.error('User ID not found');
      return;
    }

    setIsImageUploading(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const base64Image = e.target.result;
        await updateUser({
          id: userId,
          data: { profileImage: base64Image }
        }).unwrap();
        refetch();
        toast.success('Profile image updated successfully!');
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error('Failed to upload image');
      } finally {
        setIsImageUploading(false);
      }
    };

    reader.onerror = () => {
      toast.error('Error reading file');
      setIsImageUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Professional Header */}
      <div className="sticky top-0 z-10">
        <div className="py-2 sm:py-4">
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
                <h1 className="text-lg sm:text-2xl font-bold text-black">Professional Profile</h1>
                <p className="text-xs sm:text-sm text-black hidden sm:block">Employee information & organizational details</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-2 sm:py-4">
        {/* Hero Section with User Info */}
        <div className="bg-white rounded-2xl overflow-hidden mb-8" style={{ boxShadow: '0 0 25px 8px rgba(0, 0, 0, 0.10)' }}>
          <div className="relative">
            <div className="absolute inset-0" style={{
              backgroundImage: `url(${studentProfileBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}></div>
            <div className="relative px-3 sm:px-8 py-4 sm:py-12">
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
                <div className="relative">
                  <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-full bg-white p-1 sm:p-2 shadow-md">
                    <img
                      src={userData?.profileImage || profilePlaceholder}
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
                      <IoCamera className="w-5 h-5 sm:w-7 sm:h-6 text-gray-700 hover:text-gray-900" />
                    )}
                  </div>
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
                    {userData?.name}
                  </h2>
                  <p className="text-gray-300 mb-3 sm:mb-4 text-xs sm:text-base">{userData?.position} | {userData?.department}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2 lg:gap-6">
                    <ContactCard icon={<FiMail className="w-3 h-3 sm:w-4 sm:h-4 text-gray-700" />} label="Email" value={userData?.email} />
                    <ContactCard icon={<FiPhone className="w-3 h-3 sm:w-4 sm:h-4 text-gray-700" />} label="Phone" value={userData?.mobileNo || "N/A"} />
                    <ContactCard icon={<FiBriefcase className="w-3 h-3 sm:w-4 sm:h-4 text-gray-700" />} label="Department" value={userData?.department || "N/A"} />
                    <ContactCard icon={<FiShield className="w-3 h-3 sm:w-4 sm:h-4 text-gray-700" />} label="Role" value={userData?.role?.toUpperCase() || "N/A"} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Metrics Dashboard */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6 mb-4 sm:mb-8 pr-2 sm:pr-0">
          <ProfessionalMetricCard
            icon={<FiBriefcase className="w-6 h-6 text-white" />}
            title="Department"
            value={userData?.department || "N/A"}
            bgColor="#FDA92D"
            description="Organizational unit"
          />
          <ProfessionalMetricCard
            icon={<FiUser className="w-6 h-6 text-white" />}
            title="Position"
            value={userData?.position || "N/A"}
            bgColor="#8E33FF"
            description="Job designation"
          />
          <ProfessionalMetricCard
            icon={<FiShield className="w-6 h-6 text-white" />}
            title="Access Level"
            value={userData?.role?.toUpperCase() || "N/A"}
            bgColor="#00B8D9"
            description="System privileges"
          />
          <ProfessionalMetricCard
            icon={<FiUserCheck className="w-6 h-6 text-white" />}
            title="Status"
            value={userData?.isActive ? "Active" : "Inactive"}
            bgColor="#22C55E"
            description="Account status"
          />
        </div>

        {/* Professional Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-4 sm:mb-8 pr-2 sm:pr-0">
          {/* Contact Information */}
          <DetailSection
            title="Contact Information"
            subtitle="Communication details and contact methods"
            icon={<FiMail className="w-5 h-5 text-gray-700" />}
          >
            <div className="space-y-4">
              <ProfessionalDetailRow icon={<FiMail />} label="Email Address" value={userData?.email || "N/A"} />
              <ProfessionalDetailRow icon={<FiPhone />} label="Mobile Number" value={userData?.mobileNo || "N/A"} />
              <ProfessionalDetailRow icon={<FiUser />} label="Full Name" value={userData?.name || "N/A"} />
            </div>
          </DetailSection>

          {/* Professional Details */}
          <DetailSection
            title="Professional Details"
            subtitle="Organizational role and responsibilities"
            icon={<FiBriefcase className="w-5 h-5 text-gray-700" />}
          >
            <div className="space-y-4">
              <ProfessionalDetailRow icon={<FiBriefcase />} label="Department" value={userData?.department || "N/A"} />
              <ProfessionalDetailRow icon={<FiUser />} label="Position" value={userData?.position || "N/A"} />
              <ProfessionalDetailRow icon={<FiShield />} label="Access Role" value={userData?.role?.toUpperCase() || "N/A"} />
            </div>
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiUserCheck className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Account Status</span>
                </div>
                <StatusBadge status={userData?.isActive ? "Active" : "Inactive"} />
              </div>
            </div>
          </DetailSection>

          {/* System Information */}
          <DetailSection
            title="System Information"
            subtitle="Account management and security details"
            icon={<FiSettings className="w-5 h-5 text-gray-700" />}
          >
            <div className="space-y-4">
              <ProfessionalDetailRow 
                icon={<FiCalendar />} 
                label="Account Created" 
                value={userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : "N/A"} 
              />
              <ProfessionalDetailRow 
                icon={<FiClock />} 
                label="Last Updated" 
                value={userData?.updatedAt ? new Date(userData.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : "N/A"} 
              />
              <ProfessionalDetailRow icon={<FiSettings />} label="User ID" value={userData?._id?.slice(-8) || "N/A"} />
            </div>
          </DetailSection>
        </div>

        {/* Security & Compliance Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-4 sm:mb-8 pr-2 sm:pr-0">
          {/* Security Information */}
          <DetailSection
            title="Security & Compliance"
            subtitle="Identity verification and security details"
            icon={<FiShield className="w-5 h-5 text-gray-700" />}
          >
            <div className="space-y-4">
              <ProfessionalDetailRow icon={<FiSettings />} label="Aadhar Number" value={userData?.adharCard ? `XXXX-XXXX-${userData.adharCard.slice(-4)}` : "N/A"} />
              <ProfessionalDetailRow icon={<FiShield />} label="Security Level" value={userData?.role === 'superadmin' ? 'High' : userData?.role === 'admin' ? 'Medium' : 'Standard'} />
              <ProfessionalDetailRow icon={<FiUserCheck />} label="Verification Status" value="Verified" />
            </div>
            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <FiShield className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-900">Security Compliant</p>
                  <p className="text-xs text-green-700">All security requirements met</p>
                </div>
              </div>
            </div>
          </DetailSection>

          {/* Activity Overview */}
          <DetailSection
            title="Activity Overview"
            subtitle="Account activity and system usage"
            icon={<FiClock className="w-5 h-5 text-gray-700" />}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <FiCalendar className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-medium text-blue-900">Member Since</span>
                  </div>
                  <p className="text-sm font-bold text-blue-800">
                    {userData?.createdAt ? new Date(userData.createdAt).getFullYear() : "N/A"}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <FiClock className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-medium text-purple-900">Last Active</span>
                  </div>
                  <p className="text-sm font-bold text-purple-800">
                    {userData?.updatedAt ? new Date(userData.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "N/A"}
                  </p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-lg border border-orange-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiUser className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-900">Profile Completion</span>
                  </div>
                  <span className="text-sm font-bold text-orange-800">100%</span>
                </div>
                <div className="mt-2 w-full bg-orange-200 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{width: '100%'}}></div>
                </div>
              </div>
            </div>
          </DetailSection>
        </div>
      </div>
    </div>
  );
};

// Professional Contact Card for Hero Section
const ContactCard = ({ icon, label, value }) => (
  <div className="bg-white/20 backdrop-blur-md rounded-lg p-1.5 sm:p-3 border border-white/30" style={{ backdropFilter: 'blur(12px)', background: 'rgba(255, 255, 255, 0.15)' }}>
    <div className="flex items-center gap-1.5 sm:gap-3">
      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
        <span className="text-xs sm:text-sm">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-300 uppercase tracking-wide font-medium">{label}</p>
        <p className="text-xs sm:text-sm font-semibold text-white truncate">{value}</p>
      </div>
    </div>
  </div>
);

// Professional Metric Card with Advanced Styling
const ProfessionalMetricCard = ({ icon, title, value, bgColor, description }) => (
  <div
    className="group relative bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300"
    style={{ boxShadow: '0 0 20px 5px rgba(0, 0, 0, 0.08)' }}
  >
    <div className="relative p-2 sm:p-6">
      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <div className="flex-1">
          <p className="text-xs sm:text-sm font-medium text-gray-600 mb-0.5 sm:mb-1">{title}</p>
          <h3 className="text-sm sm:text-xl lg:text-2xl font-bold mb-0.5 sm:mb-1" style={{ color: bgColor }}>{value}</h3>
          <p className="text-xs text-gray-500 hidden sm:block">{description}</p>
        </div>
        <div className="w-3 h-3 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 bg-gray-600 text-black">
          {icon}
        </div>
      </div>
    </div>
  </div>
);

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

// Professional Detail Row Component
const ProfessionalDetailRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 sm:gap-4 p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-200">
    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 text-gray-600">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">{label}</p>
      <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">{value || "N/A"}</p>
    </div>
  </div>
);

// Status Badge Component
const StatusBadge = ({ status }) => {
  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusStyle(status)}`}>
      {status || 'No Status'}
    </span>
  );
};

export default UserProfile;