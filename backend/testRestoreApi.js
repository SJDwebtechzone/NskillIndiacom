const jwt = require('jsonwebtoken');
const axios = require('axios');

async function test() {
  const token = jwt.sign({ id: 1, roleName: 'Admin' }, process.env.JWT_SECRET || 'mysecret');
  try {
    const res = await axios.get('http://localhost:5000/api/restore', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("RESTORE API RETURNED:", res.data);
  } catch (err) {
    console.error("ERROR:", err.response ? err.response.data : err.message);
  }
}
test();
