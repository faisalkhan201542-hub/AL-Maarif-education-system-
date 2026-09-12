import axios from 'axios';

const test = async () => {
  try {
    const res = await axios.post('https://al-maarif-education-system.onrender.com/api/students', {
      name: "Test User",
      fatherName: "Test Father",
      fatherWhatsapp: "1234567890",
      gender: "Male",
      dob: "2010-01-01",
      class: "Nursery",
      rollNumber: "999",
      photoBase64: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAAAAAAD/2wBDAAoHBwkHBgoJCAkLCwoMDxkQDw4ODx4WFxIZJCAmJSMgIyIoLTkwKCo2KyIjNDQyNjc4PDwzOEQ8Qx00XQ=="
    }, {
      headers: {
        // Need a valid token or just remove protect temporarily, but since I don't have token, I might get 401.
        // Wait, the API requires a token!
      }
    });
    console.log("Success:", res.status, res.data.registrationNumber);
  } catch (err) {
    console.error("Error:", err.response ? err.response.status + " " + err.response.statusText : err.message);
    if (err.response) console.error(err.response.data);
  }
};
test();
