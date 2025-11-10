import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Svg, Circle, Rect, Line } from '@react-pdf/renderer';
import logo from '../../assets/images/doulLogo.png';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 20,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottom: 2,
    borderBottomColor: '#7335DD',
    paddingBottom: 10,
  },
  logo: {
    width: 70,
    height: 50,
  },
  headerLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7335DD',
    textAlign: 'center',
    whiteSpace: 'nowrap',
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'right',
  },
  section: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  threeColumnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  column: {
    width: '30%',
  },
  label: {
    fontSize: 10,
    color: '#666666',
    fontWeight: 'bold',
  },
  value: {
    fontSize: 10,
    color: '#333333',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    width: 100,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginLeft: 10,
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
  },
  chartContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    marginBottom: 10,
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#E5E7EB',
  },
  centerText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7335DD',
  },
  footer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#7335DD',
    borderRadius: 5,
  },
  footerText: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
  },
});

// Simple Bar Chart Component
const BarChart = ({ data, title }) => (
  <View style={styles.chartContainer}>
    <Text style={[styles.sectionTitle, { textAlign: 'center', marginBottom: 10 }]}>{title}</Text>
    <Svg height="120" width="300">
      {data.map((item, index) => {
        const barHeight = (item.value / 100) * 80;
        const x = index * 60 + 20;
        return (
          <View key={index}>
            <Rect
              x={x}
              y={100 - barHeight}
              width="40"
              height={barHeight}
              fill={item.color || '#7335DD'}
            />
            <Text
              x={x + 20}
              y="115"
              fontSize="8"
              textAnchor="middle"
              fill="#333333"
            >
              {item.label}
            </Text>
          </View>
        );
      })}
    </Svg>
  </View>
);

// Simple Pie Chart Component
const PieChart = ({ data, title }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;
  
  return (
    <View style={styles.chartContainer}>
      <Text style={[styles.sectionTitle, { textAlign: 'center', marginBottom: 10 }]}>{title}</Text>
      <Svg height="120" width="120">
        <Circle cx="60" cy="60" r="50" fill="#E5E7EB" />
        {data.map((item, index) => {
          const angle = (item.value / total) * 360;
          const slice = (
            <Circle
              key={index}
              cx="60"
              cy="60"
              r="45"
              fill={item.color || '#7335DD'}
              stroke="#FFFFFF"
              strokeWidth="2"
            />
          );
          currentAngle += angle;
          return slice;
        })}
      </Svg>
    </View>
  );
};

const StudentReportPDF = ({ studentData, reportCardData }) => {
  // Sample chart data
  const technicalSkillsData = reportCardData?.technicalSkills?.map((skill, index) => ({
    label: skill.skillName.substring(0, 8),
    value: skill.totalPercentage,
    color: ['#3B82F6', '#10B981', '#8B5CF6', '#EF4444', '#F59E0B'][index % 5]
  })) || [];

  const academicData = [
    { label: 'FY', value: reportCardData?.academicPerformance?.yearWiseSGPA?.find(y => y.year === 'FY')?.sgpa * 10 || 70, color: '#3B82F6' },
    { label: 'SY', value: reportCardData?.academicPerformance?.yearWiseSGPA?.find(y => y.year === 'SY')?.sgpa * 10 || 75, color: '#10B981' },
    { label: 'TY', value: reportCardData?.academicPerformance?.yearWiseSGPA?.find(y => y.year === 'TY')?.sgpa * 10 || 80, color: '#8B5CF6' },
  ];

  const skillsDistribution = [
    { label: 'Technical', value: 60, color: '#3B82F6' },
    { label: 'Soft Skills', value: 25, color: '#10B981' },
    { label: 'Leadership', value: 15, color: '#F59E0B' },
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image src={logo} style={styles.logo} />
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.title}>Report Card</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.subtitle}>Academic Year</Text>
            <Text style={styles.subtitle}>Session 2024-25</Text>
          </View>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.threeColumnRow}>
            <View style={styles.column}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{studentData?.firstName} {studentData?.lastName}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Course:</Text>
              <Text style={styles.value}>{studentData?.course || 'N/A'}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{studentData?.email || 'N/A'}</Text>
            </View>
          </View>
          <View style={styles.threeColumnRow}>
            <View style={styles.column}>
              <Text style={styles.label}>Father's Name:</Text>
              <Text style={styles.value}>{studentData?.fatherName || 'N/A'}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Contact:</Text>
              <Text style={styles.value}>{studentData?.studentMobile || 'N/A'}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Track:</Text>
              <Text style={styles.value}>{studentData?.track || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* Level Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Level Progress</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Current Level:</Text>
            <Text style={styles.value}>{studentData?.currentLevel || 'N/A'}</Text>
          </View>
        </View>

        {/* Technical Skills Chart */}
        {technicalSkillsData.length > 0 && (
          <View style={styles.section}>
            <BarChart data={technicalSkillsData} title="Technical Skills Performance" />
          </View>
        )}

        {/* Academic Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Academic Performance</Text>
          <View style={styles.gridContainer}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>CGPA</Text>
              <Text style={styles.centerText}>{reportCardData?.academicPerformance?.cgpa || 'N/A'}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Overall Grade</Text>
              <Text style={styles.centerText}>{reportCardData?.overallGrade || 'N/A'}</Text>
            </View>
          </View>
          <BarChart data={academicData} title="Year-wise SGPA Performance" />
        </View>

        {/* Soft Skills */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Soft Skills</Text>
          <View style={styles.gridContainer}>
            {reportCardData?.softSkills?.categories?.length > 0 ? reportCardData.softSkills.categories.map((category, index) => {
              const percentage = (category.score / category.maxMarks) * 100;
              let status = "Poor";
              if (percentage >= 90) status = "Excellent";
              else if (percentage >= 70) status = "Good";
              else if (percentage >= 50) status = "Average";
              
              return (
                <View key={index} style={styles.gridItem}>
                  <Text style={styles.label}>{category.title}</Text>
                  <Text style={styles.value}>{status}</Text>
                </View>
              );
            }) : (
              <View style={styles.gridItem}>
                <Text style={styles.value}>N/A</Text>
              </View>
            )}
          </View>
        </View>

        {/* Discipline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Discipline</Text>
          <View style={styles.gridContainer}>
            {reportCardData?.discipline?.categories?.length > 0 ? reportCardData.discipline.categories.map((category, index) => (
              <View key={index} style={styles.gridItem}>
                <Text style={styles.label}>{category.title}</Text>
                <Text style={styles.value}>{category.score}/{category.maxMarks}</Text>
              </View>
            )) : (
              <View style={styles.gridItem}>
                <Text style={styles.value}>N/A</Text>
              </View>
            )}
          </View>
        </View>

        {/* Career Readiness */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Career Readiness</Text>
          <View style={styles.gridContainer}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Resume</Text>
              <Text style={styles.value}>{reportCardData?.careerReadiness?.resumeStatus || 'N/A'}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>LinkedIn</Text>
              <Text style={styles.value}>{reportCardData?.careerReadiness?.linkedinStatus || 'N/A'}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Aptitude</Text>
              <Text style={styles.value}>{reportCardData?.careerReadiness?.aptitudeStatus || 'N/A'}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Placement Ready</Text>
              <Text style={styles.value}>{reportCardData?.careerReadiness?.placementReady || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* Co-Curricular Activities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Co-Curricular Activities</Text>
          <View style={styles.threeColumnRow}>
            {['Certificate', 'Project', 'Sports'].map((category) => {
              const count = reportCardData?.coCurricular?.filter(activity => 
                activity.category.toLowerCase() === category.toLowerCase()
              ).length || 0;
              
              return (
                <View key={category} style={styles.column}>
                  <Text style={styles.label}>{category}:</Text>
                  <Text style={styles.centerText}>{count}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Faculty Feedback */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Faculty Feedback</Text>
          <Text style={styles.value}>{reportCardData?.facultyRemark || 'No feedback available'}</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Rating:</Text>
            <Text style={styles.value}>
              {(() => {
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
              })()} ★
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Generated by:</Text>
            <Text style={styles.value}>{reportCardData?.generatedByName || 'N/A'}</Text>
          </View>
        </View>

        {/* Final Assessment */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Final Status: Level {studentData?.currentLevel || 'N/A'} | 
            Result: {studentData?.currentLevel || 'N/A'} | 
            Overall Grade: {reportCardData?.overallGrade || 'N/A'}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default StudentReportPDF;