const AdmittedStudent = require("../models/admittedStudent");

exports.getOverallAttendanceStats = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      gender = '', 
      year = '', 
      sortBy = 'firstName', 
      sortOrder = 'asc' 
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build match conditions
    const matchConditions = {
      $or: [
        { permissionDetails: { $exists: false } },
        { permissionDetails: null },
        { permissionDetails: {} }
      ]
    };

    if (gender && gender !== 'all') {
      matchConditions.gender = { $regex: new RegExp(gender, 'i') };
    }

    if (year && year !== 'all') {
      matchConditions.year = year;
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get total count for pagination
    const totalStudents = await AdmittedStudent.countDocuments(matchConditions);

    // Get paginated students with attendance calculation
    const students = await AdmittedStudent.aggregate([
      { $match: matchConditions },
      {
        $addFields: {
          // Calculate attendance percentage based on level completion
          attendancePercentage: {
            $cond: {
              if: { $gt: [{ $size: "$level" }, 0] },
              then: {
                $multiply: [
                  {
                    $divide: [
                      {
                        $size: {
                          $filter: {
                            input: "$level",
                            cond: { $eq: ["$$this.result", "Pass"] }
                          }
                        }
                      },
                      { $size: "$level" }
                    ]
                  },
                  100
                ]
              },
              else: 0
            }
          },
          fullName: { $concat: ["$firstName", " ", "$lastName"] }
        }
      },
      { $sort: sortObj },
      { $skip: skip },
      { $limit: limitNum },
      {
        $project: {
          _id: 1,
          prkey: 1,
          firstName: 1,
          lastName: 1,
          fullName: 1,
          fatherName: 1,
          email: 1,
          studentMobile: 1,
          gender: 1,
          year: 1,
          currentLevel: 1,
          readinessStatus: 1,
          attendancePercentage: { $round: ["$attendancePercentage", 2] },
          levelCount: { $size: "$level" },
          passedLevels: {
            $size: {
              $filter: {
                input: "$level",
                cond: { $eq: ["$$this.result", "Pass"] }
              }
            }
          }
        }
      }
    ]);

    // Calculate overall statistics
    const overallStats = await AdmittedStudent.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: null,
          totalStudents: { $sum: 1 },
          maleCount: {
            $sum: {
              $cond: [{ $eq: [{ $toLower: "$gender" }, "male"] }, 1, 0]
            }
          },
          femaleCount: {
            $sum: {
              $cond: [{ $eq: [{ $toLower: "$gender" }, "female"] }, 1, 0]
            }
          },
          readyStudents: {
            $sum: {
              $cond: [{ $eq: ["$readinessStatus", "Ready"] }, 1, 0]
            }
          }
        }
      }
    ]);

    const stats = overallStats[0] || {
      totalStudents: 0,
      maleCount: 0,
      femaleCount: 0,
      readyStudents: 0
    };

    // Calculate average attendance
    const avgAttendance = students.length > 0 
      ? students.reduce((sum, student) => sum + student.attendancePercentage, 0) / students.length
      : 0;

    const totalPages = Math.ceil(totalStudents / limitNum);

    res.status(200).json({
      success: true,
      data: {
        students,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalStudents,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
          limit: limitNum
        },
        statistics: {
          ...stats,
          averageAttendance: Math.round(avgAttendance * 100) / 100
        }
      }
    });

  } catch (error) {
    console.error("Error fetching attendance stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance statistics",
      error: error.message
    });
  }
};