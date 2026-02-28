# CNA Pro — Backend API Documentation

**Base URL:** `http://localhost:4000`

All API routes are prefixed with `/api`. Authentication is via JWT Bearer token in the `Authorization` header:

```
Authorization: Bearer <token>
```

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Courses](#2-courses)
3. [Modules](#3-modules)
4. [Lessons](#4-lessons)
5. [Enrollment](#5-enrollment)
6. [Quizzes](#6-quizzes)
7. [Certificates](#7-certificates)
8. [Admin](#8-admin)
9. [File Upload](#9-file-upload)

---

## 1. Authentication

### POST `/api/auth/register`

Register a new user.

**Request Body:**

```json
{
  "email": "student@example.com",
  "password": "secret123",
  "name": "John Doe",
  "role": "STUDENT"
}
```

| Field      | Type   | Required | Notes                          |
|------------|--------|----------|--------------------------------|
| `email`    | string | ✅       | Must be unique                 |
| `password` | string | ✅       |                                |
| `name`     | string | ❌       | Defaults to email prefix       |
| `role`     | string | ❌       | `"STUDENT"` (default) or `"ADMIN"` |

**Response (201):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "student@example.com",
    "name": "John Doe",
    "role": "STUDENT"
  }
}
```

---

### POST `/api/auth/login`

Log in an existing user.

**Request Body:**

```json
{
  "email": "student@example.com",
  "password": "secret123"
}
```

**Response (200):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "student@example.com",
    "name": "John Doe",
    "role": "STUDENT"
  }
}
```

---

### GET `/api/auth/me`

Get the currently authenticated user's profile.

🔒 **Auth Required**

**Response (200):**

```json
{
  "user": {
    "id": "uuid",
    "email": "student@example.com",
    "name": "John Doe",
    "role": "STUDENT",
    "createdAt": "2026-02-01T00:00:00.000Z"
  }
}
```

---

### PUT `/api/auth/profile`

Update the authenticated user's name/email.

🔒 **Auth Required**

**Request Body:**

```json
{
  "name": "New Name",
  "email": "newemail@example.com"
}
```

**Response (200):**

```json
{
  "user": {
    "id": "uuid",
    "email": "newemail@example.com",
    "name": "New Name",
    "role": "STUDENT",
    "createdAt": "2026-02-01T00:00:00.000Z"
  }
}
```

---

### PUT `/api/auth/password`

Change the authenticated user's password.

🔒 **Auth Required**

**Request Body:**

```json
{
  "currentPassword": "oldpass",
  "newPassword": "newpass"
}
```

**Response (200):**

```json
{
  "message": "Password updated successfully"
}
```

---

## 2. Courses

### GET `/api/courses`

Get all courses. **Public — no auth required.**

**Response (200):**

```json
[
  {
    "id": "uuid",
    "title": "Foundations of Nursing",
    "description": "...",
    "thumbnail": "https://...",
    "category": "Nursing",
    "tags": ["Nursing", "Clinical"],
    "price": 0,
    "instructorId": "uuid",
    "instructor": { "id": "uuid", "name": "Admin" },
    "createdAt": "2026-02-01T00:00:00.000Z",
    "updatedAt": "2026-02-01T00:00:00.000Z",
    "_count": {
      "modules": 3,
      "quizzes": 2,
      "enrollments": 10
    }
  }
]
```

---

### GET `/api/courses/:id`

Get a single course with full details (modules, lessons, quizzes). **Public.**

**Response (200):**

```json
{
  "id": "uuid",
  "title": "Foundations of Nursing",
  "description": "...",
  "thumbnail": "https://...",
  "category": "Nursing",
  "tags": ["Nursing", "Clinical"],
  "price": 0,
  "instructorId": "uuid",
  "instructor": { "id": "uuid", "name": "Admin" },
  "modules": [
    {
      "id": "uuid",
      "title": "Module 1",
      "order": 1,
      "courseId": "uuid",
      "createdAt": "...",
      "lessons": [
        {
          "id": "uuid",
          "title": "Lesson 1",
          "description": "...",
          "videoUrl": "https://...",
          "materialUrl": "https://...",
          "order": 1,
          "moduleId": "uuid",
          "createdAt": "..."
        }
      ],
      "quizzes": [
        {
          "id": "uuid",
          "title": "Module Quiz",
          "passingScore": 70,
          "courseId": "uuid",
          "moduleId": "uuid",
          "createdAt": "...",
          "_count": { "questions": 5 }
        }
      ]
    }
  ],
  "quizzes": [
    {
      "id": "uuid",
      "title": "Final Exam",
      "passingScore": 70,
      "courseId": "uuid",
      "moduleId": null,
      "createdAt": "...",
      "_count": { "questions": 10 }
    }
  ],
  "_count": { "enrollments": 10 }
}
```

---

### POST `/api/courses`

Create a new course.

🔒 **Auth Required** | 🛡️ **Admin Only**

**Request Body:**

```json
{
  "title": "New Course",
  "description": "Course description",
  "price": 49.99,
  "thumbnail": "https://...",
  "category": "Nursing",
  "tags": ["Nursing", "CNAprep", "Clinical"]
}
```

| Field         | Type     | Required | Notes                                      |
|---------------|----------|----------|--------------------------------------------|
| `title`       | string   | ✅       |                                            |
| `description` | string   | ✅       |                                            |
| `price`       | number   | ❌       | Defaults to `0`                            |
| `thumbnail`   | string   | ❌       | URL to thumbnail image                     |
| `category`    | string   | ❌       | e.g. Nursing, CNA Prep, Clinical Skills    |
| `tags`        | string[] | ❌       | Array of tags. e.g. `["Nursing","Clinical"]` |

**Response (201):** Returns the created `Course` object.

---

### PUT `/api/courses/:id`

Update an existing course.

🔒 **Auth Required** | 🛡️ **Admin Only**

**Request Body:** Same fields as create (all optional).

**Response (200):** Returns the updated `Course` object.

---

### DELETE `/api/courses/:id`

Delete a course and all its modules/lessons (cascading).

🔒 **Auth Required** | 🛡️ **Admin Only**

**Response (200):**

```json
{
  "message": "Course deleted"
}
```

---

## 3. Modules

### POST `/api/courses/:courseId/modules`

Add a module to a course. Order is auto-incremented.

🔒 **Auth Required** | 🛡️ **Admin Only**

**Request Body:**

```json
{
  "title": "Introduction to Patient Care"
}
```

**Response (201):**

```json
{
  "id": "uuid",
  "title": "Introduction to Patient Care",
  "courseId": "uuid",
  "order": 1,
  "createdAt": "..."
}
```

---

### DELETE `/api/courses/modules/:moduleId`

Delete a module and all its lessons (cascading).

🔒 **Auth Required** | 🛡️ **Admin Only**

**Response (200):**

```json
{
  "message": "Module deleted"
}
```

---

## 4. Lessons

### POST `/api/courses/modules/:moduleId/lessons`

Add a lesson to a module. Order is auto-incremented.

🔒 **Auth Required** | 🛡️ **Admin Only**

**Request Body:**

```json
{
  "title": "Vital Signs Basics",
  "description": "Learn to measure vital signs",
  "videoUrl": "https://...",
  "materialUrl": "https://..."
}
```

| Field         | Type   | Required | Notes               |
|---------------|--------|----------|----------------------|
| `title`       | string | ✅       |                      |
| `description` | string | ❌       |                      |
| `videoUrl`    | string | ❌       | URL to video file    |
| `materialUrl` | string | ❌       | URL to PDF/ZIP etc   |

**Response (201):** Returns the created `Lesson` object.

---

### PUT `/api/courses/lessons/:lessonId`

Update a lesson.

🔒 **Auth Required** | 🛡️ **Admin Only**

**Request Body:** Same fields as create (all optional).

**Response (200):** Returns the updated `Lesson` object.

---

### DELETE `/api/courses/lessons/:lessonId`

Delete a lesson.

🔒 **Auth Required** | 🛡️ **Admin Only**

**Response (200):**

```json
{
  "message": "Lesson deleted"
}
```

---

## 5. Enrollment

### POST `/api/courses/:courseId/enroll`

Enroll the authenticated user in a course.

🔒 **Auth Required**

**Request Body:** None.

**Response (201):**

```json
{
  "id": "uuid",
  "userId": "uuid",
  "courseId": "uuid",
  "progress": 0,
  "completed": false,
  "createdAt": "..."
}
```

**Error (400):** `{ "message": "Already enrolled" }`

---

### GET `/api/courses/my/enrollments`

Get the authenticated user's enrollments with course info.

🔒 **Auth Required**

**Response (200):**

```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "courseId": "uuid",
    "progress": 45,
    "completed": false,
    "createdAt": "...",
    "course": {
      "id": "uuid",
      "title": "...",
      "description": "...",
      "instructor": { "name": "Admin" },
      "_count": { "quizzes": 2, "lessons": 8 }
    }
  }
]
```

---

### PUT `/api/courses/:courseId/progress`

Update enrollment progress.

🔒 **Auth Required**

**Request Body:**

```json
{
  "progress": 75
}
```

| Field      | Type   | Required | Notes                |
|------------|--------|----------|----------------------|
| `progress` | number | ✅       | 0–100. Auto-clamps.  |

**Response (200):** Returns the updated `Enrollment` object. `completed` is set to `true` when progress ≥ 100.

---

## 6. Quizzes

### GET `/api/quizzes/:quizId`

Get a quiz with questions.

🔒 **Auth Required**

> **Note:** For students, `correctAnswer` is hidden from questions. Admins see full data.

**Response (200) — Student:**

```json
{
  "id": "uuid",
  "title": "Final Exam",
  "passingScore": 70,
  "courseId": "uuid",
  "moduleId": null,
  "course": { "title": "Nursing Fundamentals" },
  "questions": [
    {
      "id": "uuid",
      "text": "What is the normal resting heart rate?",
      "options": ["40-60 bpm", "60-100 bpm", "100-120 bpm", "120-150 bpm"],
      "quizId": "uuid"
    }
  ]
}
```

**Response (200) — Admin:** Same, but each question includes `"correctAnswer": 1`.

---

### POST `/api/quizzes/:quizId/submit`

Submit quiz answers.

🔒 **Auth Required**

**Request Body:**

```json
{
  "answers": {
    "question-uuid-1": 1,
    "question-uuid-2": 0,
    "question-uuid-3": 2
  }
}
```

`answers` is an object mapping `questionId` → selected option index (0-based).

**Response (200):**

```json
{
  "result": {
    "id": "uuid",
    "score": 80,
    "passed": true,
    "userId": "uuid",
    "quizId": "uuid",
    "createdAt": "..."
  },
  "totalQuestions": 10,
  "correctAnswers": 8,
  "score": 80,
  "passed": true,
  "passingScore": 70,
  "courseCompleted": true,
  "nextExamId": null,
  "certificateId": "uuid",
  "certificateUniqueId": "cuid-string"
}
```

| Field                 | Type          | Notes                                            |
|-----------------------|---------------|--------------------------------------------------|
| `courseCompleted`     | boolean       | `true` if all final exams are passed             |
| `nextExamId`         | string\|null  | ID of the next unpassed final exam               |
| `certificateId`      | string\|null  | Set if course was just completed                 |
| `certificateUniqueId`| string\|null  | Public ID for certificate verification           |

---

### GET `/api/quizzes/results/me`

Get authenticated user's quiz results.

🔒 **Auth Required**

**Response (200):**

```json
[
  {
    "id": "uuid",
    "score": 80,
    "passed": true,
    "createdAt": "...",
    "quiz": {
      "id": "uuid",
      "title": "Final Exam",
      "course": { "id": "uuid", "title": "Nursing Fundamentals" }
    }
  }
]
```

---

### POST `/api/quizzes`

Create a quiz (course-level exam or module-level quiz).

🔒 **Auth Required** | 🛡️ **Admin Only**

**Request Body:**

```json
{
  "courseId": "uuid",
  "moduleId": null,
  "title": "Final Exam",
  "passingScore": 70,
  "questions": [
    {
      "text": "What is the normal resting heart rate?",
      "options": ["40-60 bpm", "60-100 bpm", "100-120 bpm", "120-150 bpm"],
      "correctAnswer": 1
    }
  ]
}
```

| Field          | Type     | Required | Notes                                       |
|----------------|----------|----------|-----------------------------------------------|
| `courseId`     | string   | ✅       |                                               |
| `moduleId`    | string   | ❌       | `null` = final exam, set = module quiz        |
| `title`       | string   | ✅       |                                               |
| `passingScore`| number   | ❌       | Defaults to `50`                              |
| `questions`   | array    | ✅       | Array of question objects                     |

**Response (201):** Returns quiz with nested `questions`.

---

### PUT `/api/quizzes/:quizId`

Update a quiz. Replaces all questions atomically.

🔒 **Auth Required** | 🛡️ **Admin Only**

**Request Body:**

```json
{
  "title": "Updated Exam",
  "passingScore": 80,
  "questions": [
    {
      "text": "Updated question?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 2
    }
  ]
}
```

**Response (200):** Returns the updated quiz object.

---

### DELETE `/api/quizzes/:quizId`

Delete a quiz and all its results/questions.

🔒 **Auth Required** | 🛡️ **Admin Only**

**Response (200):**

```json
{
  "message": "Quiz deleted"
}
```

---

### POST `/api/quizzes/:quizId/questions`

Add a single question to an existing quiz.

🔒 **Auth Required** | 🛡️ **Admin Only**

**Request Body:**

```json
{
  "text": "New question?",
  "options": ["A", "B", "C", "D"],
  "correctAnswer": 0
}
```

**Response (201):** Returns the created `Question` object.

---

### DELETE `/api/quizzes/questions/:questionId`

Delete a single question.

🔒 **Auth Required** | 🛡️ **Admin Only**

**Response (200):**

```json
{
  "message": "Question deleted"
}
```

---

### GET `/api/quizzes/results/all`

Get all quiz results across all users (admin view).

🔒 **Auth Required** | 🛡️ **Admin Only**

**Response (200):**

```json
[
  {
    "id": "uuid",
    "score": 80,
    "passed": true,
    "createdAt": "...",
    "user": { "id": "uuid", "name": "John", "email": "john@example.com" },
    "quiz": {
      "id": "uuid",
      "title": "Final Exam",
      "course": { "id": "uuid", "title": "Nursing Fundamentals" }
    }
  }
]
```

---

## 7. Certificates

### POST `/api/certificates/generate/:courseId`

Generate a certificate after passing all final exams.

🔒 **Auth Required**

**Request Body:** None.

**Response (201):**

```json
{
  "id": "uuid",
  "uniqueId": "cuid-string",
  "issuedAt": "2026-02-01T00:00:00.000Z",
  "userId": "uuid",
  "courseId": "uuid"
}
```

**Error (400):** `{ "message": "You must pass ALL final exams in this course to get a certificate" }`

> If a certificate already exists, it returns the existing one with status `200`.

---

### GET `/api/certificates/download/:certificateId`

Download the certificate as a PDF.

**No auth required** (direct download link).

**Response:** `application/pdf` file stream.

---

### GET `/api/certificates/my`

Get the authenticated user's certificates.

🔒 **Auth Required**

**Response (200):**

```json
[
  {
    "id": "uuid",
    "uniqueId": "cuid-string",
    "issuedAt": "2026-02-01T00:00:00.000Z",
    "course": { "id": "uuid", "title": "Nursing Fundamentals" }
  }
]
```

---

### GET `/api/certificates/verify/:uniqueId`

Verify a certificate by its unique ID. **Public — no auth required.**

**Response (200):**

```json
{
  "valid": true,
  "certificate": {
    "uniqueId": "cuid-string",
    "studentName": "John Doe",
    "courseName": "Nursing Fundamentals",
    "issuedAt": "2026-02-01T00:00:00.000Z"
  }
}
```

**Error (404):**

```json
{
  "valid": false,
  "message": "Certificate not found"
}
```

---

## 8. Admin

### GET `/api/admin/dashboard`

Get dashboard statistics.

🔒 **Auth Required** | 🛡️ **Admin Only**

**Response (200):**

```json
{
  "stats": {
    "totalUsers": 50,
    "totalCourses": 5,
    "totalEnrollments": 120,
    "totalCertificates": 30
  },
  "recentEnrollments": [
    {
      "id": "uuid",
      "createdAt": "...",
      "user": { "name": "John", "email": "john@example.com" },
      "course": { "title": "Nursing Fundamentals" }
    }
  ]
}
```

---

### GET `/api/admin/users`

Get all users.

🔒 **Auth Required** | 🛡️ **Admin Only**

**Response (200):**

```json
[
  {
    "id": "uuid",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "STUDENT",
    "createdAt": "...",
    "_count": { "enrollments": 3, "certificates": 1 }
  }
]
```

---

### DELETE `/api/admin/users/:id`

Delete a user and all their related data (results, enrollments, certificates).

🔒 **Auth Required** | 🛡️ **Admin Only**

> Admin cannot delete their own account.

**Response (200):**

```json
{
  "message": "User deleted successfully"
}
```

---

### GET `/api/admin/certificates`

Get all issued certificates.

🔒 **Auth Required** | 🛡️ **Admin Only**

**Response (200):**

```json
[
  {
    "id": "uuid",
    "uniqueId": "cuid-string",
    "issuedAt": "...",
    "userId": "uuid",
    "courseId": "uuid",
    "user": { "name": "John", "email": "john@example.com" },
    "course": { "title": "Nursing Fundamentals" }
  }
]
```

---

## 9. File Upload

All upload endpoints store files to **Supabase Storage** and return a public URL.

### POST `/api/upload/video`

Upload a video file.

🔒 **Auth Required** | 🛡️ **Admin Only**

**Request:** `multipart/form-data` with field `video`.

| Allowed formats | Max size |
|-----------------|----------|
| `.mp4`, `.webm`, `.mov`, `.avi` | 100 MB |

**Response (200):**

```json
{
  "url": "https://supabase-storage-url/uploads/videos/123-filename.mp4",
  "filename": "lecture.mp4"
}
```

---

### POST `/api/upload/material`

Upload a course material file.

🔒 **Auth Required** | 🛡️ **Admin Only**

**Request:** `multipart/form-data` with field `material`.

| Allowed formats | Max size |
|-----------------|----------|
| `.pdf`, `.doc`, `.docx`, `.zip`, `.ppt`, `.pptx` | 100 MB |

**Response (200):**

```json
{
  "url": "https://supabase-storage-url/uploads/materials/123-filename.pdf",
  "filename": "notes.pdf"
}
```

---

### POST `/api/upload/thumbnail`

Upload a course thumbnail image.

🔒 **Auth Required** | 🛡️ **Admin Only**

**Request:** `multipart/form-data` with field `thumbnail`.

| Allowed formats | Max size |
|-----------------|----------|
| `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif` | 100 MB |

**Response (200):**

```json
{
  "url": "https://supabase-storage-url/uploads/thumbnails/123-filename.png",
  "filename": "cover.png"
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "message": "Error description"
}
```

| Status | Meaning                  |
|--------|--------------------------|
| `400`  | Bad request / validation |
| `401`  | Unauthorized / bad creds |
| `404`  | Resource not found       |
| `500`  | Internal server error    |
