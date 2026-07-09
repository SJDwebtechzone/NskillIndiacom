const pool = require('../config/db');
pool.query(`
  SELECT u.id, u.name, u.email, u.status, u.created_at, u.phone_number, u.dob, r.name as role_name, r.id as role_id 
  FROM users u 
  LEFT JOIN roles r ON u.role_id = r.id AND r.is_deleted = false 
  WHERE (u.status IS NULL OR u.status <> 'Deleted') 
  AND u.is_deleted = false 
  AND LOWER(r.name) = LOWER('Admin') 
  ORDER BY u.created_at DESC
`).then(res => { 
  console.log("Without placement_users condition:", res.rows); 
});

pool.query(`
  SELECT u.id, u.name, u.email, u.status, u.created_at, u.phone_number, u.dob, r.name as role_name, r.id as role_id 
  FROM users u 
  LEFT JOIN roles r ON u.role_id = r.id AND r.is_deleted = false 
  WHERE (u.status IS NULL OR u.status <> 'Deleted') 
  AND u.is_deleted = false 
  AND u.id NOT IN (SELECT id FROM placement_users) 
  AND LOWER(r.name) = LOWER('Admin') 
  ORDER BY u.created_at DESC
`).then(res => { 
  console.log("With placement_users condition:", res.rows); 
  process.exit(0);
});
