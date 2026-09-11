

const BASE_URL = 'http://localhost:5000/api';
let token = '';

const testApi = async () => {
  try {
    console.log("1. Testing Login...");
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ whatsapp: '+923139163732', password: 'Maarif@123' })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) throw new Error(loginData.message || 'Login failed');
    token = loginData.token;
    console.log("   ✅ Login successful");

    console.log("2. Testing Teachers...");
    const teachersRes = await fetch(`${BASE_URL}/teachers`, { headers: { Authorization: `Bearer ${token}` } });
    const teachersData = await teachersRes.json();
    if (!teachersRes.ok) throw new Error('Failed to fetch teachers');
    console.log(`   ✅ Teachers fetched (${teachersData.length} found)`);

    console.log("3. Testing Students...");
    const studentsRes = await fetch(`${BASE_URL}/students?limit=10`, { headers: { Authorization: `Bearer ${token}` } });
    const studentsData = await studentsRes.json();
    if (!studentsRes.ok) throw new Error('Failed to fetch students');
    console.log(`   ✅ Students fetched (${studentsData.students.length} found)`);
    
    const studentId = studentsData.students[0]?._id;

    if (studentId) {
      console.log(`4. Testing Student Profile (${studentId})...`);
      const profileRes = await fetch(`${BASE_URL}/students/${studentId}/profile`, { headers: { Authorization: `Bearer ${token}` } });
      if (!profileRes.ok) throw new Error('Failed to fetch student profile');
      console.log("   ✅ Profile fetched successfully");
    }

    console.log("5. Testing Attendance...");
    const attendanceRes = await fetch(`${BASE_URL}/attendance?class=KG&date=2026-09-09`, { headers: { Authorization: `Bearer ${token}` } });
    const attendanceData = await attendanceRes.json();
    if (!attendanceRes.ok) throw new Error('Failed to fetch attendance');
    console.log(`   ✅ Attendance fetched (${attendanceData.length} records)`);

    console.log("6. Testing Subjects...");
    const subjectsRes = await fetch(`${BASE_URL}/subjects?class=KG`, { headers: { Authorization: `Bearer ${token}` } });
    const subjectsData = await subjectsRes.json();
    if (!subjectsRes.ok) throw new Error('Failed to fetch subjects');
    console.log(`   ✅ Subjects fetched (${subjectsData.length} records)`);

    console.log("7. Testing Timetable...");
    const timetableRes = await fetch(`${BASE_URL}/timetable?class=KG`, { headers: { Authorization: `Bearer ${token}` } });
    const timetableData = await timetableRes.json();
    if (!timetableRes.ok) throw new Error('Failed to fetch timetable');
    console.log(`   ✅ Timetable fetched (${timetableData.length} records)`);

    console.log("8. Testing Fees...");
    const feesRes = await fetch(`${BASE_URL}/fees?limit=10`, { headers: { Authorization: `Bearer ${token}` } });
    const feesData = await feesRes.json();
    if (!feesRes.ok) throw new Error('Failed to fetch fees');
    console.log(`   ✅ Fees fetched (${feesData.challans.length} records)`);

    console.log("9. Testing Dashboard Metrics...");
    const dashboardRes = await fetch(`${BASE_URL}/dashboard`, { headers: { Authorization: `Bearer ${token}` } });
    const dashboardData = await dashboardRes.json();
    if (!dashboardRes.ok) throw new Error('Failed to fetch dashboard');
    console.log(`   ✅ Dashboard fetched (Total Students: ${dashboardData.totalStudents})`);

    console.log("🎉 ALL CORE READ ENDPOINTS WORKING PERFECTLY!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
};

testApi();
