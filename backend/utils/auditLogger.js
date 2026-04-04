// backend/utils/auditLogger.js
import { pool } from "../config/db.js";

export const logAdminAction = async (
  req,
  entityType,
  entityId,
  action,
  oldData = null,
  newData = null,
) => {
  try {
    const adminId = req.user.id;
    const ipAddress =
      req.ip || req.connection.remoteAddress || req.headers["x-forwarded-for"];

    await pool.query(
      `INSERT INTO audit_logs 
       (admin_id, action, entity_type, entity_id, old_data, new_data, ip_address) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        adminId,
        action,
        entityType,
        entityId,
        oldData ? JSON.stringify(oldData) : null,
        newData ? JSON.stringify(newData) : null,
        ipAddress,
      ],
    );

    console.log(
      `📝 Audit: Admin ${adminId} - ${action} on ${entityType} #${entityId}`,
    );
  } catch (error) {
    console.error("Error logging admin action:", error);
  }
};

// Specific log functions
export const logProfileVerification = async (
  req,
  skilledId,
  oldStatus,
  newStatus,
  adminNotes = null,
) => {
  await logAdminAction(
    req,
    "skilled_profile",
    skilledId,
    `verify_profile_${newStatus}`,
    { status: oldStatus },
    { status: newStatus, admin_notes: adminNotes },
  );
};

export const logUserStatusChange = async (
  req,
  userId,
  oldStatus,
  newStatus,
  reason = null,
) => {
  await logAdminAction(
    req,
    "user",
    userId,
    `update_user_status_${newStatus}`,
    { status: oldStatus },
    { status: newStatus, reason: reason },
  );
};

export const logSkillManagement = async (
  req,
  skillId,
  action,
  skillName,
  oldName = null,
) => {
  await logAdminAction(
    req,
    "skill",
    skillId,
    action,
    oldName ? { name: oldName } : null,
    { name: skillName },
  );
};

export const logReportResolution = async (
  req,
  reportId,
  actionTaken,
  resolution,
  adminNotes = null,
) => {
  await logAdminAction(
    req,
    "report",
    reportId,
    `resolve_report_${actionTaken}`,
    { status: "pending" },
    {
      status: "resolved",
      action: actionTaken,
      resolution: resolution,
      admin_notes: adminNotes,
    },
  );
};
