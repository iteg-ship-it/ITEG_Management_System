/* eslint-disable react/jsx-key */
import { 
  Users, 
  GraduationCap, 
  Eye,
  Building2,
  Award
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import admissionFlowBg from '../../assets/images/Group 880.jpg';
import admittedFlowBg from '../../assets/images/Group 881.jpg';
import placementFlowBg from '../../assets/images/Group 882.jpg';
import { 
  useGetAllStudentsQuery,
  useAdmitedStudentsQuery,
  useGetReadyStudentsForPlacementQuery
} from '../../redux/api/authApi';
import Loader from '../common-components/loader/Loader';
import { Chart } from 'react-google-charts';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import PageNavbar from '../common-components/navbar/PageNavbar';

// Auto-Swapping Flow Cards Component
const FlowSwapCard = () => {
  const [currentCard, setCurrentCard] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const flowCards = [
    {
      title: 'Admission Module',
      description: 'Manage the complete student admission journey — from application to final selection, all in one place.',
      icon: <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
      color: '#3B82F6',
      backgroundImage: admissionFlowBg
    },
    {
      title: 'Admitted Module', 
      description: 'Track academic progress, attendance, and performance of students enrolled in ITEG seamlessly.',
      icon: <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>,
      color: '#8B5CF6',
      backgroundImage: admittedFlowBg
    },
    {
      title: 'Placements Module',
      description: 'Control, manage, and monitor placement drives and interview records with full visibility.',
      icon: <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0H8" /></svg>, 
      color: '#10B981',
      backgroundImage: placementFlowBg
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentCard((prev) => (prev + 1) % flowCards.length);
        setIsTransitioning(false);
      }, 150);
    }, 4000);
    return () => clearInterval(timer);
  }, [flowCards.length]);

  const currentFlow = flowCards[currentCard];

  return (
    <div className="bg-white rounded-2xl overflow-hidden h-full" style={{ boxShadow: '0 0 25px 8px rgba(0, 0, 0, 0.10)' }}>
      <div className="relative h-full">
        {/* Fixed admitted flow background */}
        <div 
          className="absolute inset-0"
          style={{ 
            backgroundImage: `url(${admittedFlowBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        ></div>
        <div className={`relative p-6 h-full flex flex-col justify-center transition-all duration-300 ease-out ${
          isTransitioning ? 'opacity-80 transform translate-y-1' : 'opacity-100 transform translate-y-0'
        }`}>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-md border border-white/30">
              <div className="text-white">{currentFlow.icon}</div>
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
                className={`h-2 rounded-full transition-all duration-500 ease-in-out ${
                  index === currentCard ? 'w-8 bg-white' : 'w-2 bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

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

  // Calculate placed students from admitted students data
  const placedStudents = Array.isArray(admittedStudents) ? 
    admittedStudents.filter(student => student.placedInfo && student.placedInfo !== null && typeof student.placedInfo === 'object' && Object.keys(student.placedInfo).length > 0).length : 0;

  // Calculate trends based on actual data counts
  const admissionRate = `${admittedStudents.length}/${allStudents.length}`;
  const placementRate = `${placedStudents}/${placementStudents.length}`;
  const enrollmentGrowth = `+${allStudents.length}`;

  const statsCards = [
    {
      title: 'Total Registered',
      value: allStudents.length,
      subtitle: 'Admission students',
      icon: Users,
      color: '#3B82F6',
      trend: enrollmentGrowth
    },
    {
      title: 'Admitted Students', 
      value: admittedStudents.length,
      subtitle: 'Currently admitted',
      icon: GraduationCap,
      color: '#10B981',
      trend: admissionRate
    },
    {
      title: 'Successfully Placed',
      value: placedStudents,
      subtitle: 'Career achieved',
      icon: Award,
      color: '#8B5CF6',
      trend: placementRate
    },
  ];

  // Calculate real admission flow data
  const totalRegistered = allStudents.length;
  const admitted = admittedStudents.length;
  const underReview = totalRegistered - admitted; // Remaining students who are not yet admitted
  const interviewed = allStudents.filter(student => student.interviewRecord && student.interviewRecord.length > 0).length;
  
  const admissionFlowData = [
    ['Status', 'Count'],
    ['Registered', totalRegistered],
    ['Under Review', underReview],
    ['Interviewed', interviewed],
    ['Admitted', admitted]
  ];

  // Calculate current level-wise data from admitted students
  const levelCounts = {
    '1A': 0, '1B': 0, '1C': 0,
    '2A': 0, '2B': 0, '2C': 0
  };

  // Count students by their current level
  admittedStudents.forEach(student => {
    const currentLevel = student.currentLevel || '1A';
    
    // Only count students who haven't passed Level 2C for Level 2C
    if (currentLevel === '2C') {
      const level2CAttempts = (student.level || []).filter(lvl => lvl.levelNo === '2C');
      const hasPassedLevel2C = level2CAttempts.some(lvl => lvl.result === 'Pass');
      
      if (!hasPassedLevel2C) {
        levelCounts['2C']++;
      }
    // eslint-disable-next-line no-prototype-builtins
    } else if (levelCounts.hasOwnProperty(currentLevel)) {
      levelCounts[currentLevel]++;
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

  // Calculate real placement flow data
  const readyForPlacement = placementStudents.length;
  const interviewScheduled = placementStudents.filter(student => 
    student.PlacementinterviewRecord && student.PlacementinterviewRecord.length > 0
  ).length;
  const interviewCompleted = placementStudents.filter(student => 
    student.PlacementinterviewRecord && student.PlacementinterviewRecord.some(interview => 
      interview.status && interview.status !== 'Scheduled' && interview.status !== 'Pending'
    )
  ).length;
  
  const placementFlowData = [
    ['Stage', 'Students'],
    ['Ready for Placement', readyForPlacement],
    ['Interview Scheduled', interviewScheduled],
    ['Selected Students', interviewCompleted],
    ['Successfully Placed', placedStudents]
  ];

  // Calculate top companies from placed students data
  const companyStats = {};
  admittedStudents.forEach(student => {
    if (student.placedInfo && student.placedInfo.companyName) {
      const companyName = student.placedInfo.companyName;
      companyStats[companyName] = (companyStats[companyName] || 0) + 1;
    }
  });

  const topCompanies = Object.entries(companyStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([name, placements], index) => ({
      name,
      placements,
      logo: [
        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>,
        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
      ][index] || <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
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
      <PageNavbar 
        title="ITEG Management Dashboard" 
        subtitle="Real-time analytics & performance insights"
        showBackButton={false}
        rightContent={
          <div className="text-right">
            <div className="text-xl font-bold text-black">{currentTime.toLocaleTimeString()}</div>
            <div className="text-gray-600 text-sm">{currentTime.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</div>

          </div>
        }
      />
          
      <div className="px-2 sm:px-6 py-2 sm:py-4">
        {/* Welcome Section with Flow Cards */}
        <div className="flex gap-6 mb-8 h-80">
          {/* Welcome Card - 60% width */}
          <div className="w-3/5">
            <div className="bg-white rounded-2xl overflow-hidden h-full" style={{ boxShadow: '0 0 25px 8px rgba(0, 0, 0, 0.10)' }}>
              <div className="relative h-full">
                <div className="absolute inset-0" style={{ 
                  backgroundImage: `url(${admissionFlowBg})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}></div>
                <div className="relative px-6 py-8 h-full flex flex-col justify-center">
                  <div className="text-left">
                    <h2 className="text-2xl font-bold text-white mb-2">Welcome to 👋</h2>
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
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
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
                    colors: ['#FDA92D', '#22C55E', '#8E33FF', '#00B8D9'],
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
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
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
                    colors: ['#1E40AF', '#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE', '#EFF6FF'],
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
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0H8" /></svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Placement Flow</h3>
                  <p className="text-sm text-gray-600">Placement process stages</p>
                </div>
              </div>
            </div>
            {/* <div className="p-6">
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
            </div> */}
            <div className="p-6">
  <div className="h-64">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={placementFlowData.slice(1).map(([name, value]) => ({ name, value }))}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00FF00" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#00FF00" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#E5E7EB" vertical={false} />  
        <XAxis
          dataKey="name"
          stroke="#6B7280"
          fontSize={12}
        />
        <YAxis
          stroke="#6B7280"
          fontSize={12}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          labelStyle={{ color: '#374151', fontWeight: 'bold' }}
          itemStyle={{ color: '#00FF00' }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#00FF00"
          strokeWidth={2}
          fill="url(#greenGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
</div>
          </div>
        </div>

        {/* Top Companies */}
        <div className="bg-white rounded-xl overflow-hidden mb-8" style={{ boxShadow: '0 0 22px 6px rgba(0, 0, 0, 0.09)' }}>
          <div className="px-6 py-4 border-b-2 border-gray-200 shadow-sm bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
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
                <div key={`${company.name}-${index}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
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
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
                <p className="text-sm text-gray-600">Navigate to key system functions</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/admission-process" className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105">
                <GraduationCap className="w-5 h-5" />
                <span className="font-medium">Admission Process</span>
              </Link>
              <Link to="/student-dashboard" className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105">
                <Eye className="w-5 h-5" />
                <span className="font-medium">Level wise Student</span>
              </Link>
              <Link to="/readiness-status" className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105">
                <Building2 className="w-5 h-5" />
                <span className="font-medium">Placement Records</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdmissionDashboard;