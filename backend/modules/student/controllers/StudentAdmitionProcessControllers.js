const Student_Admission_process = require('../models/StudentAdmissionProcess');
const bcrypt = require('bcrypt');
// Create Super Admin
exports.createStudent_Admission_process = async (req, res) => {
  try {
    const { First_name, Last_name, Father_name,
      //  Mother_name, 
      stream, percent12th, email, aadharCard, student_Mb_no, father_Mb_no, course, track, address, status, interviewAttempts ,feeStatus} = req.body;
    // const hashedPassword = await bcrypt.hash(password, 10);

    const studentAdmission = new Student_Admission_process({
      First_name,
      Last_name,
      Father_name,
      // Mother_name,
      stream,
      percent12th,
      email,
      aadharCard,
      student_Mb_no,
      father_Mb_no,
      course,
      track,
      status,
      address,
      interviewAttempts,
      feeStatus,
    });

    await studentAdmission.save();
    res.status(201).json({ message: 'Student Admission Process created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};






// router.get('/admission-dashboard', async (req, res) => {
  exports.getAdmissionDashboard = async (req, res) => {
    try {
        // Total number of students who gave an interview
        const totalInterviewed = await Student_Admission_process.countDocuments({ interviewAttempts: { $gt: 0 } });

        // Student profile breakdown
        const rejectedCount = await Student_Admission_process.countDocuments({ status: 'Rejected' });
        const attemptedCount = await Student_Admission_process.countDocuments({ status: 'Attempted' });
        const roundAttemptCount = await Student_Admission_process.countDocuments({ status: 'Round Attempt' });

        // Track-wise student record
        const trackWiseStudents = await Student_Admission_process.aggregate([
            {
                $group: {
                    _id: '$track',
                    total: { $sum: 1 }
                }
            }
        ]);

        // Fee status breakdown
        const fullFeeCount = await Student_Admission_process.countDocuments({ feeStatus: 'Full' });
        const partialFeeCount = await Student_Admission_process.countDocuments({ feeStatus: 'Partial' });
        const notPaidCount = await Student_Admission_process.countDocuments({ feeStatus: 'Not Paid' });

        // Response
        res.json({
            totalInterviewed,
            profileBreakdown: {
                rejected: rejectedCount,
                attempted: attemptedCount,
                roundAttempt: roundAttemptCount
            },
            trackWiseStudents,
            feeStatus: {
                full: fullFeeCount,
                partial: partialFeeCount,
                notPaid: notPaidCount
            }
        });

    } catch (error) {
        console.error('Error fetching admission dashboard data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

