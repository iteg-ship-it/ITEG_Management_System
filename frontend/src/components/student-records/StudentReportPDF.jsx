import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register fonts if needed
// Font.register({
//   family: 'Roboto',
//   src: 'https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu4mxK.woff2'
// });

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 20,
    fontFamily: 'Helvetica'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottom: 2,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 15
  },
  logo: {
    width: 80,
    height: 60
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center'
  },
  academicYear: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right'
  },
  section: {
    backgroundColor: '#f9fafb',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    border: 1,
    borderColor: '#e5e7eb'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 10
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  infoItem: {
    width: '48%',
    marginBottom: 8
  },
  label: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 2
  },
  value: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937'
  },
  gradesTable: {
    marginTop: 10
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#3b82f6',
    padding: 8,
    borderRadius: 4
  },
  tableHeaderText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center'
  },
  tableRow: {
    flexDirection: 'row',
    padding: 6,
    borderBottom: 1,
    borderBottomColor: '#e5e7eb'
  },
  tableCell: {
    fontSize: 11,
    flex: 1,
    textAlign: 'center',
    color: '#374151'
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    textAlign: 'center',
    fontSize: 10,
    color: '#6b7280',
    borderTop: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10
  }
});

const StudentReportPDF = ({ studentData, reportCardData }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>ITEG Management System</Text>
            <Text style={{ fontSize: 14, color: '#6b7280' }}>Student Report Card</Text>
          </View>
          <View style={styles.academicYear}>
            <Text>Academic Year</Text>
            <Text style={{ fontWeight: 'bold', color: '#1f2937' }}>Session 2024-25</Text>
          </View>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Full Name</Text>
              <Text style={styles.value}>{studentData?.firstName} {studentData?.lastName}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Course</Text>
              <Text style={styles.value}>{studentData?.course || "N/A"}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{studentData?.email || "N/A"}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Father's Name</Text>
              <Text style={styles.value}>{studentData?.fatherName || "N/A"}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Contact Number</Text>
              <Text style={styles.value}>{studentData?.studentMobile || "N/A"}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Address</Text>
              <Text style={styles.value}>{studentData?.address || "N/A"}</Text>
            </View>
          </View>
        </View>

        {/* Academic Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Academic Performance</Text>
          {reportCardData?.subjects && reportCardData.subjects.length > 0 ? (
            <View style={styles.gradesTable}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderText}>Subject</Text>
                <Text style={styles.tableHeaderText}>Marks</Text>
                <Text style={styles.tableHeaderText}>Grade</Text>
                <Text style={styles.tableHeaderText}>Status</Text>
              </View>
              {reportCardData.subjects.map((subject, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{subject.name}</Text>
                  <Text style={styles.tableCell}>{subject.marks}</Text>
                  <Text style={styles.tableCell}>{subject.grade}</Text>
                  <Text style={styles.tableCell}>{subject.status}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={{ fontSize: 12, color: '#6b7280', fontStyle: 'italic' }}>
              No academic data available
            </Text>
          )}
        </View>

        {/* Overall Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overall Performance</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Total Marks</Text>
              <Text style={styles.value}>{reportCardData?.totalMarks || "N/A"}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Percentage</Text>
              <Text style={styles.value}>{reportCardData?.percentage || "N/A"}%</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Overall Grade</Text>
              <Text style={styles.value}>{reportCardData?.overallGrade || "N/A"}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Result</Text>
              <Text style={styles.value}>{reportCardData?.result || "N/A"}</Text>
            </View>
          </View>
        </View>

        {/* Remarks */}
        {reportCardData?.remarks && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Remarks</Text>
            <Text style={{ fontSize: 12, color: '#374151', lineHeight: 1.5 }}>
              {reportCardData.remarks}
            </Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Generated on {new Date().toLocaleDateString()} | ITEG Management System
        </Text>
      </Page>
    </Document>
  );
};

export default StudentReportPDF;