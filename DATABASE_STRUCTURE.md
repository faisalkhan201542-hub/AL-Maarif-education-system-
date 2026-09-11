# Backend Database Structure - Al-Maarif Education

This document outlines the complete Mongoose/MongoDB database schema for the backend of the Al-Maarif Education School Database Management System.

## 1. List of Collections/Models
1. **Announcement**: System-wide notifications and news.
2. **Attendance**: Daily student attendance records.
3. **Exam**: Defines scheduled examinations.
4. **FeeChallan**: Manages student fee records, billing, and payments.
5. **Principal**: System administrator credentials.
6. **Result**: Stores academic performance and exam results.
7. **SchoolSettings**: Global configuration (Singleton pattern).
8. **Student**: Student profiles and academic status.
9. **Subject**: Mapping of subjects to classes.
10. **Teacher**: Staff profiles and assignments.
11. **Timetable**: Daily class schedules.
12. **Certificate**: School Leaving Certificates (SLC) and their statuses.

---

## 2. Collection Details

### 2.1 Announcement
- **Purpose**: Stores announcements shown to students/parents or internally.

**Schema**:
| Field Name    | Data Type | Required | Default    | Unique | Constraints / Enum |
| ------------- | --------- | -------- | ---------- | ------ | ------------------ |
| `title`       | String    | Yes      | -          | No     | -                  |
| `description` | String    | Yes      | -          | No     | -                  |
| `type`        | String    | No       | "School"   | No     | "School", "Exam", "Fee", "Holiday" |
| `date`        | Date      | No       | Date.now   | No     | -                  |
| `priority`    | String    | No       | "Normal"   | No     | "Low", "Normal", "High" |
| `status`      | String    | No       | "Active"   | No     | "Active", "Archived" |

**Dummy Document**:
```json
{
  "_id": "64f9b23f8b0e1a1b2c3d4e51",
  "title": "Summer Holidays",
  "description": "School will remain closed from June 1st to August 14th.",
  "type": "Holiday",
  "date": "2026-05-20T10:00:00.000Z",
  "priority": "High",
  "status": "Active"
}
```

---

### 2.2 Attendance
- **Purpose**: Tracks daily attendance status for individual students.

**Schema**:
| Field Name   | Data Type | Required | Default    | Unique | Constraints / Enum | Ref       |
| ---------- | --------- | -------- | ---------- | ------ | ------------------ | --------- |
| `student`  | ObjectId  | Yes      | -          | No*    | -                  | `Student` |
| `class`    | String    | Yes      | -          | No     | CLASSES            | -         |
| `date`     | Date      | Yes      | -          | No     | -                  | -         |
| `dateString` | String  | Yes      | -          | No*    | "YYYY-MM-DD"       | -         |
| `status`   | String    | Yes      | -          | No     | "Present", "Absent", "Leave" | -   |
| `markedBy` | String    | No       | "Principal"| No     | -                  | -         |

**Indexes**:
- `{ student: 1, dateString: 1 }` (Unique): Ensures a student can only have one attendance record per day.
- `{ class: 1, dateString: 1 }`: Optimizes daily class attendance queries.

**Relationships**:
- Belongs to `Student` (One-to-Many).

**Dummy Document**:
```json
{
  "_id": "64f9b23f8b0e1a1b2c3d4e52",
  "student": "64f9b23f8b0e1a1b2c3d4e60",
  "class": "5th",
  "date": "2026-09-09T00:00:00.000Z",
  "status": "Present",
  "markedBy": "Principal"
}
```

---

### 2.3 Exam
- **Purpose**: Defines exam schedules and subjects.

**Schema**:
| Field Name             | Data Type | Required | Default        | Constraints / Enum |
| ---------------------- | --------- | -------- | -------------- | ------------------ |
| `title`                | String    | Yes      | -              | -                  |
| `examType`             | String    | No       | "Monthly Test" | "Monthly Test", "Mid Term", "Final Term", "Annual Examination" |
| `class`                | String    | Yes      | -              | CLASSES            |
| `subjects`             | [String]  | No       | []             | -                  |
| `totalMarksPerSubject` | Number    | No       | 100            | -                  |
| `examDate`             | Date      | No       | Date.now       | -                  |
| `academicYear`         | String    | No       | "2026"         | -                  |

**Relationships**:
- Acts as a reference for `Result`.

**Dummy Document**:
```json
{
  "_id": "64f9b23f8b0e1a1b2c3d4e53",
  "title": "September Monthly Test",
  "examType": "Monthly Test",
  "class": "5th",
  "subjects": ["Math", "English", "Science"],
  "totalMarksPerSubject": 100,
  "examDate": "2026-09-15T09:00:00.000Z",
  "academicYear": "2026"
}
```

---

### 2.4 FeeChallan
- **Purpose**: Manages billing, fee collection, fines, and transaction verifications.

**Schema**:
| Field Name             | Data Type | Required | Default    | Unique | Constraints / Enum | Ref       |
| ---------------------- | --------- | -------- | ---------- | ------ | ------------------ | --------- |
| `student`              | ObjectId  | Yes      | -          | No     | -                  | `Student` |
| `challanNumber`        | String    | Yes      | -          | Yes    | -                  | -         |
| `challanType`          | String    | No       | "Monthly Fee" | No | "Monthly Fee", "Admission Fee", "Examination Fee", "Other Charges" | - |
| `class`                | String    | Yes      | -          | No     | CLASSES            | -         |
| `billingMonth`         | String    | Yes      | -          | No     | -                  | -         |
| `issueDate`            | Date      | No       | Date.now   | No     | -                  | -         |
| `dueDate`              | Date      | Yes      | -          | No     | -                  | -         |
| `feeAmount`            | Number    | Yes      | 0          | No     | -                  | -         |
| `admissionFee`         | Number    | No       | 0          | No     | -                  | -         |
| `examinationFee`       | Number    | No       | 0          | No     | -                  | -         |
| `otherCharges`         | Number    | No       | 0          | No     | -                  | -         |
| `discount`             | Number    | No       | 0          | No     | -                  | -         |
| `fine`                 | Number    | No       | 0          | No     | -                  | -         |
| `previousBalance`      | Number    | No       | 0          | No     | -                  | -         |
| `totalAmount`          | Number    | Yes      | 0          | No     | -                  | -         |
| `paidAmount`           | Number    | No       | 0          | No     | -                  | -         |
| `remainingAmount`      | Number    | No       | 0          | No     | -                  | -         |
| `paymentStatus`        | String    | No       | "Unpaid"   | No     | "Unpaid", "Partial", "Paid" | - |
| `paymentMethod`        | String    | No       | "EasyPaisa"| No     | -                  | -         |
| `easypaisaNumber`      | String    | No       | ""         | No     | -                  | -         |
| `transactionReference` | String    | No       | ""         | No     | -                  | -         |
| `paymentDate`          | Date      | No       | -          | No     | -                  | -         |
| `verifiedBy`           | String    | No       | ""         | No     | -                  | -         |
| `verificationStatus`   | String    | No       | "Pending"  | No     | "Pending", "Verified", "Rejected" | - |
| `receiptNumber`        | String    | No       | ""         | No     | -                  | -         |

**Indexes**:
- `{ student: 1, billingMonth: 1, challanType: 1 }` (Unique): Prevents duplicate challans for a student in the same cycle.
- `{ paymentStatus: 1, dueDate: 1 }`: Quickly query unpaid dues.
- `{ class: 1, billingMonth: 1 }`: For class-wise billing reports.

**Relationships**:
- Belongs to `Student` (One-to-Many).

**Business Logic**:
- **Pre-validate calculations**: 
  - `totalAmount` = feeAmount + admissionFee + examinationFee + otherCharges + previousBalance + fine - discount
  - `remainingAmount` = totalAmount - paidAmount
  - **Dynamic Status**: Automatically sets `paymentStatus` to "Paid" if `paidAmount >= totalAmount`, "Unpaid" if `paidAmount <= 0`, or "Partial" otherwise.

**Dummy Document**:
```json
{
  "_id": "64f9b23f8b0e1a1b2c3d4e54",
  "student": "64f9b23f8b0e1a1b2c3d4e60",
  "challanNumber": "CHL-202609-1001",
  "challanType": "Monthly Fee",
  "class": "5th",
  "billingMonth": "September 2026",
  "issueDate": "2026-09-01T00:00:00.000Z",
  "dueDate": "2026-09-10T00:00:00.000Z",
  "feeAmount": 3800,
  "totalAmount": 3800,
  "paidAmount": 3800,
  "remainingAmount": 0,
  "paymentStatus": "Paid",
  "paymentMethod": "EasyPaisa",
  "transactionReference": "TID123456789",
  "verificationStatus": "Verified"
}
```

---

### 2.5 Principal
- **Purpose**: Administrator account for the school software.

**Schema**:
| Field Name | Data Type | Required | Default          | Unique |
| ---------- | --------- | -------- | ---------------- | ------ |
| `name`     | String    | Yes      | "Murad Khalil"   | No     |
| `whatsapp` | String    | Yes      | -                | Yes    |
| `password` | String    | Yes      | -                | No     |

**Business Logic**:
- `pre('save')`: Hashes password using bcrypt (10 rounds).
- `toJSON`: Excludes the hashed password when converting to a plain object (e.g., in API responses).

**Dummy Document**:
```json
{
  "_id": "64f9b23f8b0e1a1b2c3d4e55",
  "name": "Admin Principal",
  "whatsapp": "+923000000000"
}
```

---

### 2.6 Result
- **Purpose**: Stores student grades for a specific Exam.

**Schema**:
| Field Name      | Data Type               | Required | Default | Unique | Constraints / Enum | Ref       |
| --------------- | ----------------------- | -------- | ------- | ------ | ------------------ | --------- |
| `student`       | ObjectId                | Yes      | -       | No*    | -                  | `Student` |
| `exam`          | ObjectId                | Yes      | -       | No*    | -                  | `Exam`    |
| `class`         | String                  | Yes      | -       | No     | -                  | -         |
| `subjects`      | [subjectMarkSchema]     | No       | []      | No     | see below          | -         |
| `totalMarks`    | Number                  | No       | 0       | No     | -                  | -         |
| `obtainedMarks` | Number                  | No       | 0       | No     | -                  | -         |
| `percentage`    | Number                  | No       | 0       | No     | -                  | -         |
| `grade`         | String                  | No       | ""      | No     | -                  | -         |
| `status`        | String                  | No       | "Pass"  | No     | "Pass", "Fail"     | -         |
| `position`      | Number                  | No       | null    | No     | -                  | -         |
| `remarks`       | String                  | No       | ""      | No     | -                  | -         |

*`subjectMarkSchema` Structure:*
`subject` (String, required), `totalMarks` (Number, default 100), `obtainedMarks` (Number, default 0), `grade` (String).

**Indexes**:
- `{ student: 1, exam: 1 }` (Unique): A student can only have one result entry per exam.
- `{ exam: 1, class: 1, percentage: -1 }`: Fast ranking/position calculation and class report cards.
- `{ student: 1, class: 1 }`: Quickly retrieve a student's full academic history.

**Relationships**:
- Many-to-One to `Student` and `Exam`.

**Business Logic**:
- **Pre-validate calculations**:
  - Automatically calculates grade for each subject inside `subjects` list.
  - Sums up `totalMarks` and `obtainedMarks`.
  - Calculates `percentage` as `(obtained / total) * 100`.
  - Determines overall `grade` (A+, A, B, C, D, F).
  - Evaluates `status`: "Pass" if percentage >= 40, else "Fail".

**Dummy Document**:
```json
{
  "_id": "64f9b23f8b0e1a1b2c3d4e56",
  "student": "64f9b23f8b0e1a1b2c3d4e60",
  "exam": "64f9b23f8b0e1a1b2c3d4e53",
  "class": "5th",
  "subjects": [
    {
      "subject": "Math",
      "totalMarks": 100,
      "obtainedMarks": 85,
      "grade": "A"
    }
  ],
  "totalMarks": 100,
  "obtainedMarks": 85,
  "percentage": 85.00,
  "grade": "A",
  "status": "Pass"
}
```

---

### 2.7 SchoolSettings
- **Purpose**: System-wide configuration. Intended to have exactly one document.

**Schema**:
| Field Name               | Data Type | Default                                |
| ------------------------ | --------- | -------------------------------------- |
| `schoolName`             | String    | "Al-Maarif Education"                  |
| `logoUrl`                | String    | ""                                     |
| `qrCodeUrl`              | String    | ""                                     |
| `address`                | String    | "512, Near Professor Colony"           |
| `principalName`          | String    | "Murad Khalil"                         |
| `principalWhatsapp`      | String    | "+923139163732"                        |
| `schoolPhone`            | String    | "+923139163732"                        |
| `schoolEmail`            | String    | "info@almaarifeducation.edu.pk"        |
| `googleMapsLink`         | String    | ""                                     |
| `academicYear`           | String    | "2026"                                 |
| `paymentMethod`          | String    | "EasyPaisa"                            |
| `easypaisaNumber`        | String    | "+923139163732"                        |
| `easypaisaAccountName`   | String    | "Murad Khalil"                         |
| `paymentInstructions`    | String    | (Long string with steps)               |
| `feeStructure`           | Mixed     | `{ "KG": 3000, "1st": 3200 ... }`      |

**Business Logic**:
- Enforces Singleton pattern via `getSettings()` static method.

**Dummy Document**:
```json
{
  "_id": "64f9b23f8b0e1a1b2c3d4e57",
  "schoolName": "Al-Maarif Education",
  "academicYear": "2026",
  "feeStructure": {
    "KG": 3000,
    "1st": 3200,
    "2nd": 3200
  }
}
```

---

### 2.8 Student
- **Purpose**: Manages student demographic and academic profiles.

**Schema**:
| Field Name           | Data Type | Required | Default    | Unique | Constraints / Enum |
| -------------------- | --------- | -------- | ---------- | ------ | ------------------ |
| `registrationNumber` | String    | Yes      | -          | Yes    | -                  |
| `photoUrl`           | String    | No       | ""         | No     | -                  |
| `name`               | String    | Yes      | -          | No     | -                  |
| `fatherName`         | String    | Yes      | -          | No     | -                  |
| `fatherWhatsapp`     | String    | Yes      | -          | No     | -                  |
| `parentContact`      | String    | No       | ""         | No     | -                  |
| `gender`             | String    | Yes      | -          | No     | "Male", "Female"   |
| `dob`                | Date      | Yes      | -          | No     | -                  |
| `address`            | String    | No       | ""         | No     | -                  |
| `admissionDate`      | Date      | No       | Date.now   | No     | -                  |
| `admissionNumber`    | String    | Yes      | -          | Yes    | -                  |
| `status`             | String    | No       | "Active"   | No     | "Active", "Inactive", "Graduated", "Left" |
| `class`              | String    | Yes      | -          | No*    | CLASSES            |
| `rollNumber`         | Number    | Yes      | -          | No*    | -                  |
| `academicYear`       | String    | Yes      | "2026"     | No*    | -                  |
| `isDeleted`          | Boolean   | No       | false      | No     | Soft delete flag   |
| `deletedAt`          | Date      | No       | null       | No     | -                  |

**Indexes**:
- `{ class: 1, rollNumber: 1, academicYear: 1 }` (Unique): Prevents duplicate roll numbers within the same class & year.
- `{ name: "text", fatherName: "text" }`: Text index to support full-text search.

**Relationships**:
- Referenced by `Attendance`, `FeeChallan`, and `Result`.

**Dummy Document**:
```json
{
  "_id": "64f9b23f8b0e1a1b2c3d4e60",
  "registrationNumber": "REG-1001",
  "admissionNumber": "ADM-2001",
  "name": "Ahmed Ali",
  "fatherName": "Ali Raza",
  "fatherWhatsapp": "+923012345678",
  "gender": "Male",
  "dob": "2015-04-12T00:00:00.000Z",
  "class": "5th",
  "rollNumber": 12,
  "status": "Active"
}
```

---

### 2.9 Subject
- **Purpose**: Maintains subjects assigned per class.

**Schema**:
| Field Name | Data Type | Required | Default | Constraints / Enum | Ref |
| ---------- | --------- | -------- | ------- | ------------------ | --- |
| `name`     | String    | Yes      | -       | Trimmed            | -   |
| `class`    | String    | Yes      | -       | -                  | -   |
| `teacher`  | ObjectId  | Yes      | -       | -                  | `Teacher` |

**Relationships**:
- Belongs to `Teacher` (Many-to-One).

**Dummy Document**:
```json
{
  "_id": "64f9b23f8b0e1a1b2c3d4e58",
  "name": "Science",
  "class": "5th",
  "teacher": "Mr. Asim"
}
```

---

### 2.10 Teacher
- **Purpose**: Teacher directory and staffing profiles.

**Schema**:
| Field Name      | Data Type | Required | Default    | Unique | Constraints / Enum |
| --------------- | --------- | -------- | ---------- | ------ | ------------------ |
| `teacherId`     | String    | Yes      | -          | Yes    | -                  |
| `name`          | String    | Yes      | -          | No     | -                  |
| `photoUrl`      | String    | No       | ""         | No     | -                  |
| `phone`         | String    | Yes      | -          | No     | -                  |
| `whatsapp`      | String    | Yes      | -          | No     | -                  |
| `qualification` | String    | No       | ""         | No     | -                  |
| `subject`       | String    | No       | ""         | No     | -                  |
| `joiningDate`   | Date      | No       | Date.now   | No     | -                  |
| `assignedClass` | String    | No       | ""         | No     | CLASSES + ""       |
| `status`        | String    | No       | "Active"   | No     | "Active", "Inactive"|

**Dummy Document**:
```json
{
  "_id": "64f9b23f8b0e1a1b2c3d4e59",
  "teacherId": "TCH-001",
  "name": "Sarah Khan",
  "phone": "+923210000000",
  "whatsapp": "+923210000000",
  "qualification": "MSc Physics",
  "subject": "Physics",
  "assignedClass": "9th",
  "status": "Active"
}
```

---

### 2.11 Timetable
- **Purpose**: Class scheduling mapping periods to subjects.

**Schema**:
| Field Name     | Data Type | Required | Default | Constraints / Enum | Ref       |
| -------------- | --------- | -------- | ------- | ------------------ | --------- |
| `class`        | String    | Yes      | -       | CLASSES            | -         |
| `day`          | String    | Yes      | -       | "Monday" - "Saturday" | -      |
| `periodNumber` | Number    | Yes      | -       | -                  | -         |
| `subject`      | String    | Yes      | -       | Trimmed            | -         |
| `teacher`      | ObjectId  | Yes      | -       | -                  | `Teacher` |
| `startTime`    | String    | Yes      | -       | e.g., "08:00 AM"   | -         |
| `endTime`      | String    | Yes      | -       | e.g., "08:45 AM"   | -         |

**Indexes**:
- `{ class: 1, day: 1, periodNumber: 1 }` (Unique): Ensures no overlapping periods exist for a specific class on a particular day.
- `{ teacher: 1, day: 1, periodNumber: 1 }` (Unique): Prevents teacher double-booking.

**Dummy Document**:
```json
{
  "_id": "64f9b23f8b0e1a1b2c3d4e61",
  "class": "5th",
  "day": "Monday",
  "periodNumber": 1,
  "subject": "Math",
  "teacher": "Mr. Asim",
  "startTime": "08:00 AM",
  "endTime": "08:45 AM"
}
```

---

## 3. Data Flow Patterns & Business Logic Overview

1. **Fee Calculation Pipeline**: The `FeeChallan` model strictly controls billing rules through Mongoose pre-validation hooks. It auto-calculates total dues and balances without relying on manual frontend calculations, ensuring data integrity. Automatic transition of `paymentStatus` happens natively when `paidAmount` updates.
2. **Result Compilation Pipeline**: The `Result` schema independently derives sub-grades and overall grades dynamically based on percentage scores through hooks. A student is flagged as "Fail" natively if their overall percentage is under 40%.
3. **Compound Identifiers & Isolation**:
   - Students cannot share the same `rollNumber` within a `class` and `academicYear`.
   - Attendance prevents double-entry through `{ student, dateString }` constraints.
   - Timetable averts period collision for classes through `{ class, day, periodNumber }` and double-booking for teachers through `{ teacher, day, periodNumber }`.
   - FeeChallan prevents duplicate bills via `{ student, billingMonth, challanType }`.
   - Results avert multiple entries for the same exam through `{ student, exam }` constraints.
4. **Configuration Safety**: The `SchoolSettings` model acts as a singleton database entry ensuring that updates to fee structures, payment methods, or the global school identity only affect a single source of truth used across the API.

---

### 2.12 Certificate
- **Purpose**: Generates, stores, and manages School Leaving Certificates (SLC) for students.

**Schema**:
| Field Name        | Data Type | Required | Default    | Unique | Constraints / Enum | Ref       |
| ----------------- | --------- | -------- | ---------- | ------ | ------------------ | --------- |
| `serialNo`        | String    | Yes      | -          | Yes    | Uppercase, trimmed | -         |
| `student`         | ObjectId  | Yes      | -          | No     | -                  | `Student` |
| `name`            | String    | Yes      | -          | No     | -                  | -         |
| `fatherName`      | String    | Yes      | -          | No     | -                  | -         |
| `admissionNumber` | String    | Yes      | -          | No     | -                  | -         |
| `dateOfAdmission` | Date      | No       | -          | No     | -                  | -         |
| `dob`             | Date      | Yes      | -          | No     | -                  | -         |
| `dobWords`        | String    | No       | -          | No     | -                  | -         |
| `class`           | String    | Yes      | -          | No     | -                  | -         |
| `dateOfLeaving`   | Date      | Yes      | -          | No     | -                  | -         |
| `duesPaidUpTo`    | String    | Yes      | -          | No     | -                  | -         |
| `conduct`         | String    | No       | "Good"     | No     | -                  | -         |
| `isOrphan`        | Boolean   | No       | false      | No     | -                  | -         |
| `isAfghanCitizen` | Boolean   | No       | false      | No     | -                  | -         |
| `reasonOfLeaving` | String    | Yes      | -          | No     | -                  | -         |
| `resultStatus`    | String    | No       | "PASS"     | No     | "PASS", "FAILED", "PROMOTED", "STUDYING", "N/A" | - |
| `remarks`         | String    | No       | ""         | No     | -                  | -         |
| `dateOfIssue`     | Date      | No       | Date.now   | No     | -                  | -         |
| `preparedBy`      | String    | No       | "Principal"| No     | -                  | -         |
| `status`          | String    | No       | "Issued"   | No     | "Issued", "Cancelled"| -       |
| `isDeleted`       | Boolean   | No       | false      | No     | Soft delete flag   | -         |

**Indexes**:
- `{ serialNo: 1 }` (Unique): Ensures no duplicate certificate serial numbers.
- `{ student: 1 }`: Quick lookup of certificates by student.
- `{ dateOfIssue: -1 }`: Optimizes fetching latest certificates.

**Business Logic**:
- Generates auto-incrementing `serialNo` (e.g., SLC-YYYY-0001) if not provided.
- Updates referenced `Student.status` to "Left" upon creation.
- Stores snapshots of student data (e.g. `name`, `fatherName`) to preserve historical accuracy even if the student record changes.

**Dummy Document**:
```json
{
  "_id": "64f9b23f8b0e1a1b2c3d4e99",
  "serialNo": "SLC-2026-0001",
  "student": "64f9b23f8b0e1a1b2c3d4e60",
  "name": "Ahmed Ali",
  "fatherName": "Ali Raza",
  "admissionNumber": "ADM-2001",
  "dateOfAdmission": "2020-04-10T00:00:00.000Z",
  "dob": "2015-04-12T00:00:00.000Z",
  "dobWords": "Twelfth April Two Thousand Fifteen",
  "class": "5th",
  "dateOfLeaving": "2026-09-01T00:00:00.000Z",
  "duesPaidUpTo": "September 2026",
  "conduct": "Excellent",
  "isOrphan": false,
  "isAfghanCitizen": false,
  "reasonOfLeaving": "Relocation",
  "resultStatus": "PASS",
  "remarks": "Best of luck",
  "dateOfIssue": "2026-09-10T00:00:00.000Z",
  "preparedBy": "Principal",
  "status": "Issued",
  "isDeleted": false
}
```
