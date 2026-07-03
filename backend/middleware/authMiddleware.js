const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const SECRET = process.env.JWT_SECRET || "mysecret";

function authMiddleware(req, res, next) {
  console.log(`\n--- AUTH LOG ---`);
  console.log(`Request: ${req.method} ${req.originalUrl}`);
  
  try {
    const authHeader = req.headers.authorization;
    console.log(`Authorization Header: ${authHeader ? 'Present' : 'Missing'}`);
    
    if (!authHeader) {
      console.log(`Returning 401 - Missing Authorization Token`);
      return res.status(401).json({ success: false, message: "Access denied: Missing authorization token" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      console.log(`Returning 401 - Malformed Authorization Token`);
      return res.status(401).json({ success: false, message: "Access denied: Malformed authorization token" });
    }

    const decoded = jwt.verify(token, SECRET);
    req.user = decoded; // { id, roleId, roleName }
    
    console.log(`JWT Verified: Yes`);
    console.log(`User ID: ${req.user.id}`);
    console.log(`Role: ${req.user.roleName}`);
    
    next();

  } catch (err) {
    console.log(`JWT Verified: No (${err.message})`);
    console.log(`Returning 401 - Invalid or expired token`);
    return res.status(401).json({ success: false, message: "Access denied: Invalid or expired token" });
  }
}

// Check specific permission on a module
function checkPermission(module, action) {
  return async (req, res, next) => {
    try {
      const roleNameRaw = req.user.roleName || req.user.role || "";
      const roleLower = roleNameRaw.toLowerCase();
      if (roleLower === "admin" || roleLower === "super admin" || roleLower === "super_admin") {
        console.log(`[Auth] Bypassing permission check for Admin: ${roleNameRaw}`);
        console.log(`Permission Check: Passed`);
        console.log(`----------------\n`);
        return next();
      }

      const result = await pool.query(
        `SELECT can_view, can_add, can_edit, can_delete
         FROM permissions
         WHERE role_id = $1 AND module = $2`,
        [req.user.roleId, module]
      );

      if (result.rows.length === 0) {
        console.log(`Returning 403 - No permission record found for module: ${module}`);
        console.log(`----------------\n`);
        return res.status(403).json({ success: false, message: `Access denied: No permissions configured for module '${module}'` });
      }

      if (!result.rows[0][`can_${action}`]) {
        console.log(`Returning 403 - Missing 'can_${action}' permission on module: ${module}`);
        console.log(`----------------\n`);
        return res.status(403).json({ success: false, message: `Access denied: You lack '${action}' permission for module '${module}'` });
      }

      console.log(`Permission Check: Passed (Module: ${module}, Action: ${action})`);
      console.log(`----------------\n`);
      next();
    } catch (err) {
      console.error("Permission check error:", err);
      res.status(500).json({ success: false, message: "Server error during permission check" });
    }
  };
}

module.exports = { authMiddleware, checkPermission };