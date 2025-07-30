import { 
  Users, 
  GraduationCap, 
  Eye,
  Building2,
  Award,
} from 'lucide-react';
import studentProfileBg from '../../assets/images/Student_profile_2nd_bg.jpg';
import { 
  useGetAllStudentsQuery,
  useAdmitedStudentsQuery,
  useGetReadyStudentsForPlacementQuery
} from '../../redux/api/authApi';
import Loader from '../common-components/loader/Loader';
import { Chart } from 'react-google-charts';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const AdmissionDashboard = () => {
  const { data: allStudentsData, isLoading: studentsLoading } = useGetAllStudentsQuery();
  const { data: admittedData, isLoading: admittedLoading } = useAdmitedStudentsQuery();
  const { data: placementData, isLoading: placementLoading } = useGetReadyStudentsForPlacementQuery();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Handle different API response structures
  const allStudents = allStudentsData?.data || allStudentsData || [];
  const admittedStudents = admittedData?.data || admittedData || [];
  const placementStudents = placementData?.data || placementData || [];

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate placed students from placement data
  const placedStudents = Array.isArray(placementStudents) ? 
    placementStudents.filter(student => 
      student.interviewRecord?.some(interview => interview.result === 'Selected')
    ).length : 0;



  const statsCards = [
    {
      title: 'Total Enrolled',
      value: allStudents.length,
      subtitle: 'Admission students',
      icon: Users,
      color: '#3B82F6',
      trend: '+5.2%'
    },
    {
      title: 'Admitted Students', 
      value: admittedStudents.length,
      subtitle: 'Currently admitted',
      icon: GraduationCap,
      color: '#10B981',
      trend: '+8.1%'
    },
    {
      title: 'Successfully Placed',
      value: placedStudents,
      subtitle: 'Career achieved',
      icon: Award,
      color: '#8B5CF6',
      trend: '+12.3%'
    },
  ];

  // Calculate flow data for 3 main processes
  const admissionFlowData = [
    ['Status', 'Count'],
    ['Applied', allStudents.length + 25],
    ['Under Review', 15],
    ['Interviewed', allStudents.length + 10],
    ['Admitted', allStudents.length]
  ];

  // Calculate real level-wise data from admitted students
  const levelCounts = {
    '1A': 0, '1B': 0, '1C': 0,
    '2A': 0, '2B': 0, '2C': 0
  };

  // Count students by their latest passed level
  admittedStudents.forEach(student => {
    if (student.level && Array.isArray(student.level)) {
      const passedLevels = student.level.filter(lvl => lvl.result === 'Pass');
      if (passedLevels.length > 0) {
        const latestLevel = passedLevels[passedLevels.length - 1].levelNo;
        // eslint-disable-next-line no-prototype-builtins
        if (levelCounts.hasOwnProperty(latestLevel)) {
          levelCounts[latestLevel]++;
        }
      }
    }
  });

  const admittedFlowData = [
    ['Level', 'Students'],
    ['Level 1A', levelCounts['1A']],
    ['Level 1B', levelCounts['1B']],
    ['Level 1C', levelCounts['1C']],
    ['Level 2A', levelCounts['2A']],
    ['Level 2B', levelCounts['2B']],
    ['Level 2C', levelCounts['2C']]
  ];

  const placementFlowData = [
    ['Stage', 'Students'],
    ['Ready for Placement', placementStudents.length],
    ['Interview Scheduled', Math.floor(placementStudents.length * 0.8)],
    ['Interview Completed', Math.floor(placementStudents.length * 0.6)],
    ['Successfully Placed', placedStudents]
  ];

  // Calculate top companies from placement data
  const companyStats = {};
  placementStudents.forEach(student => {
    (student.interviewRecord || []).forEach(interview => {
      if (interview.result === 'Selected') {
        companyStats[interview.companyName] = (companyStats[interview.companyName] || 0) + 1;
      }
    });
  });

  const topCompanies = Object.entries(companyStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([name, placements], index) => ({
      name,
      placements,
      logo: ['🔍', '🪟', '📦', '👥', '🍎'][index] || '🏢'
    }));

  if (studentsLoading || admittedLoading || placementLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Professional Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-black mb-2">ITEG Management Dashboard</h1>
                <p className="text-gray-600">Comprehensive analytics & performance insights</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-black">{currentTime.toLocaleTimeString()}</div>
              <div className="text-gray-600 text-sm">{currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</div>
              <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium mt-2">
                System Active
              </div>
            </div>
          </div>
        </div>
      </div>
          
      <div className="px-2 sm:px-6 py-2 sm:py-4">
        {/* Welcome Section with Flow Cards */}
        <div className="flex gap-6 mb-8 h-80">
          {/* Welcome Card - 60% width */}
          <div className="w-3/5">
            <div className="bg-white rounded-2xl overflow-hidden h-full" style={{ boxShadow: '0 0 25px 8px rgba(0, 0, 0, 0.10)' }}>
              <div className="relative h-full">
                <div className="absolute inset-0" style={{ 
                  backgroundImage: `url(${studentProfileBg})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}></div>
                <div className="relative px-6 py-8 h-full flex flex-col justify-center">
                  <div className="text-left">
                    <h2 className="text-2xl font-bold text-white mb-2">Welcome to</h2>
                    <h1 className="text-3xl font-bold text-white mb-4">ITEG Management System</h1>
                    <p className="text-sm text-gray-200 leading-relaxed">
                      A comprehensive platform designed to streamline student lifecycle management from admission to successful placement. 
                      Our system provides real-time analytics, progress tracking, and efficient workflow management for educational institutions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Auto-Swapping Flow Cards - 35% width */}
          <div className="w-2/5">
            <FlowSwapCard />
          </div>
        </div>



        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6 mb-4 sm:mb-8">
          {statsCards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <div key={index} className="group relative bg-white rounded-xl overflow-hidden cursor-pointer w-full" style={{ boxShadow: '0 0 20px 5px rgba(0, 0, 0, 0.08)' }}>
                <div className="relative p-2 sm:p-6">
                  <div className="flex items-center justify-between mb-2 sm:mb-4">
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm font-medium text-black mb-0.5 sm:mb-1">{card.title}</p>
                      <h3 className="text-sm sm:text-xl lg:text-2xl font-bold mb-0.5 sm:mb-1" style={{ color: card.color }}>
                        {card.value}
                      </h3>
                      <p className="text-xs text-black hidden sm:block">{card.subtitle}</p>
                      <div className="text-xs text-green-600 font-medium mt-1">{card.trend}</div>
                    </div>
                    <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shadow-sm" 
                         style={{ backgroundColor: `${card.color}20` }}>
                      <IconComponent className="h-3 w-3 sm:h-6 sm:w-6" style={{ color: card.color }} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Two Flow Analytics - Top Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8 mb-6 sm:mb-8">
          {/* Admission Flow - Smaller */}
          <div className="lg:col-span-1 bg-white rounded-xl overflow-hidden" style={{ boxShadow: '0 0 22px 6px rgba(0, 0, 0, 0.09)' }}>
            <div className="px-6 py-4 border-b-2 border-gray-200 shadow-sm bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100">
                  <span className="text-lg">📝</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Admission Flow</h3>
                  <p className="text-sm text-gray-600">Student admission process</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="h-64">
                <Chart
                  chartType="PieChart"
                  data={admissionFlowData}
                  options={{
                    backgroundColor: 'transparent',
                    chartArea: { width: '90%', height: '85%' },
                    colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
                    legend: { position: 'bottom', textStyle: { color: '#6B7280', fontSize: 10 } },
                    pieSliceText: 'value',
                    pieSliceTextStyle: { color: 'white', fontSize: 12 }
                  }}
                  width="100%"
                  height="100%"
                />
              </div>
            </div>
          </div>

          {/* Admitted Flow - Larger */}
          <div className="lg:col-span-2 bg-white rounded-xl overflow-hidden" style={{ boxShadow: '0 0 22px 6px rgba(0, 0, 0, 0.09)' }}>
            <div className="px-6 py-4 border-b-2 border-gray-200 shadow-sm bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100">
                  <span className="text-lg">🎓</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Admitted Flow</h3>
                  <p className="text-sm text-gray-600">Level-wise distribution</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="h-64">
                <Chart
                  chartType="ColumnChart"
                  data={admittedFlowData}
                  options={{
                    backgroundColor: 'transparent',
                    chartArea: { width: '85%', height: '75%' },
                    colors: ['#8B5CF6'],
                    bar: { groupWidth: '60%' },
                    hAxis: { 
                      textStyle: { color: '#6B7280', fontSize: 10 },
                      gridlines: { color: 'transparent' }
                    },
                    vAxis: { 
                      textStyle: { color: '#6B7280', fontSize: 10 },
                      gridlines: { color: '#F3F4F6' }
                    },
                    legend: 'none'
                  }}
                  width="100%"
                  height="100%"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Placement Flow - Bottom Row */}
        <div className="grid grid-cols-1 gap-4 sm:gap-8 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: '0 0 22px 6px rgba(0, 0, 0, 0.09)' }}>
            <div className="px-6 py-4 border-b-2 border-gray-200 shadow-sm bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100">
                  <span className="text-lg">💼</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Placement Flow</h3>
                  <p className="text-sm text-gray-600">Placement process stages</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="h-64">
                <Chart
                  chartType="AreaChart"
                  data={placementFlowData}
                  options={{
                    backgroundColor: 'transparent',
                    chartArea: { width: '85%', height: '75%' },
                    colors: ['#10B981'],
                    areaOpacity: 0.3,
                    lineWidth: 3,
                    pointSize: 5,
                    hAxis: { 
                      textStyle: { color: '#6B7280', fontSize: 10 },
                      gridlines: { color: '#F3F4F6' }
                    },
                    vAxis: { 
                      textStyle: { color: '#6B7280', fontSize: 10 },
                      gridlines: { color: '#F3F4F6' }
                    },
                    legend: 'none'
                  }}
                  width="100%"
                  height="100%"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Top Companies */}
        <div className="bg-white rounded-xl overflow-hidden mb-8" style={{ boxShadow: '0 0 22px 6px rgba(0, 0, 0, 0.09)' }}>
          <div className="px-6 py-4 border-b-2 border-gray-200 shadow-sm bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100">
                <span className="text-lg">🏢</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Top Placement Partners</h3>
                <p className="text-sm text-gray-600">Leading companies for student placements</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {topCompanies.length > 0 ? topCompanies.map((company, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                      {company.logo}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{company.name}</p>
                      <p className="text-xs text-gray-500">{company.placements} placements</p>
                    </div>
                  </div>
                  <div className="w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold text-blue-600">#{index + 1}</span>
                  </div>
                </div>
              )) : (
                <div className="col-span-full text-center py-8">
                  <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No company data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: '0 0 22px 6px rgba(0, 0, 0, 0.09)' }}>
          <div className="px-6 py-4 border-b-2 border-gray-200 shadow-sm bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100">
                <span className="text-lg">⚡</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
                <p className="text-sm text-gray-600">Navigate to key system functions</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/student-dashboard" className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105">
                <Eye className="w-5 h-5" />
                <span className="font-medium">View Students</span>
              </Link>
              <Link to="/admission-process" className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105">
                <GraduationCap className="w-5 h-5" />
                <span className="font-medium">Admission Process</span>
              </Link>
              <Link to="/placement-interview-record" className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105">
                <Building2 className="w-5 h-5" />
                <span className="font-medium">Placement Records</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Auto-Swapping Flow Cards Component
const FlowSwapCard = () => {
  const [currentCard, setCurrentCard] = useState(0);
  
  const flowCards = [
    {
      title: 'Admission Flow',
      description: 'Streamlined student admission process from application to enrollment.',
      subtitle: 'Efficient onboarding system for new students with automated workflows.',
      icon: '📝',
      color: '#3B82F6'
    },
    {
      title: 'Admitted Flow', 
      description: 'Comprehensive training and level progression management system.',
      subtitle: 'Track student progress through various learning levels and milestones.',
      icon: '🎓',
      color: '#8B5CF6'
    },
    {
      title: 'Placement Flow',
      description: 'End-to-end placement process from readiness to successful career placement.',
      subtitle: 'Connect students with top companies and track placement success rates.',
      icon: '💼', 
      color: '#10B981'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentCard((prev) => (prev + 1) % flowCards.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [flowCards.length]);

  const currentFlow = flowCards[currentCard];

  return (
    <div className="bg-white rounded-2xl overflow-hidden h-full" style={{ boxShadow: '0 0 25px 8px rgba(0, 0, 0, 0.10)' }}>
      <div className="relative h-full">
        <div className="absolute inset-0" style={{ 
          backgroundImage: `url(${studentProfileBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}></div>
        <div className="relative p-6 h-full flex flex-col justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-md border border-white/30">
              <span className="text-3xl">{currentFlow.icon}</span>
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">
              {currentFlow.title}
            </h3>
            <p className="text-gray-200 mb-2 font-medium">
              {currentFlow.description}
            </p>
            <p className="text-sm text-gray-300">
              {currentFlow.subtitle}
            </p>
          </div>
          
          <div className="flex justify-center mt-6 space-x-2">
            {flowCards.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentCard ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdmissionDashboard