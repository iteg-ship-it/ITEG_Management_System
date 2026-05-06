const SubDepartment = require("../models/department/SubDepartment");
const Department = require("../models/department/Department");

const GLOBAL_ROLES = ["superadmin", "admin"];

/**
 * Resolves allowed subDepartment IDs for the requesting user.
 *
 * - superadmin / admin  → no restriction (req.subDeptFilter = null)
 *                         optionally accepts ?departmentId or ?subDepartmentId query param
 * - faculty (or others) → restricted to their own department name stored in JWT
 *
 * Sets req.subDeptFilter = { subDepartmentId: { $in: [...] } }  OR  null (no restriction)
 * Sets req.allowedSubDeptIds = ObjectId[]  OR  null
 */
const departmentFilter = async (req, res, next) => {
  try {
    const { role, department } = req.user; // from JWT

    // ── Admin / Superadmin ───────────────────────────────────
    if (GLOBAL_ROLES.includes(role)) {
      // Optional manual filter via query params
      const { departmentId, subDepartmentId } = req.query;

      if (subDepartmentId) {
        req.allowedSubDeptIds = [subDepartmentId];
        req.subDeptFilter = { subDepartmentId };
      } else if (departmentId) {
        const subDepts = await SubDepartment.find({ departmentId, isActive: true }).select("_id");
        const ids = subDepts.map((s) => s._id);
        req.allowedSubDeptIds = ids;
        req.subDeptFilter = ids.length ? { subDepartmentId: { $in: ids } } : null;
      } else {
        // No restriction — see all
        req.allowedSubDeptIds = null;
        req.subDeptFilter = null;
      }

      return next();
    }

    // ── Faculty / Other roles ────────────────────────────────
    if (!department) {
      return res.status(403).json({ message: "Department not assigned to your account." });
    }

    // Resolve department name → Department doc → SubDepartment IDs
    const dept = await Department.findOne({ name: department, isActive: true }).select("_id");
    if (!dept) {
      return res.status(403).json({ message: `Department '${department}' not found or inactive.` });
    }

    const subDepts = await SubDepartment.find({ departmentId: dept._id, isActive: true }).select("_id");
    if (!subDepts.length) {
      return res.status(403).json({ message: "No active sub-departments found for your department." });
    }

    const ids = subDepts.map((s) => s._id);
    req.allowedSubDeptIds = ids;
    req.subDeptFilter = { subDepartmentId: { $in: ids } };

    next();
  } catch (err) {
    return res.status(500).json({ message: "Department filter error", error: err.message });
  }
};

module.exports = { departmentFilter, GLOBAL_ROLES };
