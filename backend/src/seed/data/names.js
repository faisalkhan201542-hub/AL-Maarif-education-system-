export const boyFirstNames = [
  "Ahmad", "Ali", "Bilal", "Usman", "Hamza", "Zain", "Faizan", "Hassan", "Hussain", "Umar",
  "Abdullah", "Talha", "Saad", "Danish", "Arsalan", "Shahzaib", "Rayyan", "Haris", "Fahad", "Ibrahim",
  "Yousaf", "Waqas", "Kashif", "Junaid", "Salman", "Adeel", "Nouman", "Sheraz", "Asad", "Rizwan",
  "Farhan", "Zeeshan", "Imran", "Shahroz", "Mohsin", "Awais", "Bilawal", "Tayyab", "Ahsan", "Moiz",
];

export const girlFirstNames = [
  "Ayesha", "Fatima", "Zainab", "Mariam", "Sara", "Hira", "Amina", "Sana", "Iqra", "Laiba",
  "Areeba", "Rimsha", "Komal", "Anaya", "Eman", "Noor", "Mahnoor", "Aiman", "Sadia", "Kinza",
  "Alishba", "Warda", "Nimra", "Zoya", "Rabia", "Maryam", "Hafsa", "Duaa", "Momina", "Amna",
  "Khadija", "Sumaiya", "Bushra", "Farah", "Neha", "Anum", "Tehreem", "Javeria", "Palwasha", "Shanzay",
];

export const lastNames = [
  "Khan", "Ahmed", "Ali", "Malik", "Shah", "Hussain", "Raza", "Iqbal", "Baig", "Yousafzai",
  "Afridi", "Mehsud", "Wazir", "Marwat", "Khattak", "Durrani", "Gul", "Zaman", "Sethi", "Cheema",
  "Butt", "Farooq", "Abbasi", "Qureshi", "Siddiqui", "Awan", "Chaudhry", "Niazi", "Bangash", "Orakzai",
];

export const teacherQualifications = ["B.Ed", "M.Ed", "M.A Education", "M.Phil Education", "B.A, B.Ed"];

export const addresses = [
  "Street 4, Near Professor Colony, Peshawar",
  "House 12, University Road, Peshawar",
  "Mohallah Jinnah Abad, Peshawar",
  "Sector B, Hayatabad, Peshawar",
  "Street 9, Gulbahar, Peshawar",
  "Faqirabad, Peshawar",
  "Board Bazaar, Peshawar",
  "Danishabad, Peshawar",
  "Tehkal, Peshawar",
  "Regi Model Town, Peshawar",
];

export function pick(arr, index) {
  return arr[index % arr.length];
}
