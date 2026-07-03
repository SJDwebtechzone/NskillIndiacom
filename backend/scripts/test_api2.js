require("dotenv").config({ path: __dirname + '/../.env' });
const jwt = require("jsonwebtoken");
const axios = require("axios");
const SECRET = process.env.JWT_SECRET || "mysecret";

const token = jwt.sign(
  {
    id: 1,
    roleId: 3,
    roleName: "Admin",
  },
  SECRET,
  { expiresIn: "1d" }
);

axios.get("http://localhost:5000/api/users?role=Admin", {
  headers: { Authorization: `Bearer ${token}` }
}).then(res => {
  console.log("RESPONSE DATA:", res.data);
}).catch(err => {
  console.error("ERROR:", err.response ? err.response.data : err.message);
});
