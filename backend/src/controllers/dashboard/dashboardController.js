const Student = require("../../models/student/Student");
const StudentPlacement = require("../../models/placement/StudentPlacement");
const SubDepartment = require("../../models/department/SubDepartment");

// GET /api/dashboard/overview
// Respects req.subDeptFilter from departmentFilter middleware
exports.getDashboardOverview = async (req, res) => {
  try {
    const base = req.subDeptFilter ? { ...req.subDeptFilter } : {};
    const placementBase = req.subDeptFilter ? { ...req.subDeptFilter } : {};

    // ── 1. Student Stats ─────────────────────────────────────
    const [total, active, placed, dropped, completed, onPermission] = await Promise.all([
      Student.countDocuments(base),
      Student.countDocuments({ ...base, status: "Active" }),
      Student.countDocuments({ ...base, status: "Placed" }),
      Student.countDocuments({ ...base, status: "Dropped" }),
      Student.countDocuments({ ...base, status: "Completed" }),
      Student.countDocuments({ ...base, permissionDetails: { $ne: null } }),
    ]);

    // ── 2. Gender Breakdown ──────────────────────────────────
    const genderAgg = await Student.aggregate([
      { $match: base },
      { $group: { _id: { $toLower: "$gender" }, count: { $sum: 1 } } },
    ]);
    const genderMap = {};
    genderAgg.forEach(g => { genderMap[g._id] = g.count; });

    // ── 3. Department-wise Breakdown ─────────────────────────
    const deptAgg = await Student.aggregate([
      { $match: base },
      {
        $group: {
          _id: "$subDepartmentId",
          total:  { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ["$status", "Active"] }, 1, 0] } },
          placed: { $sum: { $cond: [{ $eq: ["$status", "Placed"] }, 1, 0] } },
          dropped:{ $sum: { $cond: [{ $eq: ["$status", "Dropped"] }, 1, 0] } },
        },
      },
    ]);

    const subDeptIds = deptAgg.map(d => d._id).filter(Boolean);
    const subDepts = await SubDepartment.find({ _id: { $in: subDeptIds } }).select("name").lean();
    const subDeptMap = {};
    subDepts.forEach(s => { subDeptMap[s._id.toString()] = s.name; });

    const departments = deptAgg
      .map(d => ({
        subDepartmentId: d._id,
        name: subDeptMap[d._id?.toString()] || "Unknown",
        total:   d.total,
        active:  d.active,
        placed:  d.placed,
        dropped: d.dropped,
        placementRate: d.total > 0 ? parseFloat(((d.placed / d.total) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.total - a.total);

    // ── 4. Placement Summary ─────────────────────────────────
    const [readyCount, interviewCount, placedInPlacement] = await Promise.all([
      StudentPlacement.countDocuments({ ...placementBase, readinessStatus: { $in: ["Ready", "Ready for Interview"] } }),
      StudentPlacement.countDocuments({ ...placementBase, "PlacementinterviewRecord.status": { $in: ["Scheduled", "Ongoing"] } }),
      StudentPlacement.countDocuments({ ...placementBase, placedInfo: { $ne: null } }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        studentStats: { total, active, placed, dropped, completed, onPermission },
        genderBreakdown: {
          male:   genderMap["male"]   || 0,
          female: genderMap["female"] || 0,
        },
        placementSummary: {
          readyForPlacement: readyCount,
          interviewRunning:  interviewCount,
          totalPlaced:       placedInPlacement,
          placementRate:     total > 0 ? parseFloat(((placedInPlacement / total) * 100).toFixed(1)) : 0,
        },
        departments,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
