# GigXpress - On-Demand Staffing & Gig Management Platform

## 🚀 Overview

GigXpress is a full-stack web application that connects event organizers with volunteers and gig workers for short-term jobs and events. The platform streamlines the entire hiring workflow, from job posting and application management to hiring, KYC verification, and workforce coordination.

The system supports multiple user roles and provides a secure, scalable solution for managing temporary staffing requirements.

---

## ✨ Features

### 👨‍💼 Organizer Features

* Create and manage job postings
* View and manage applications
* Hire or reject applicants
* Track workforce requirements
* KYC verification for trusted job posting
* Dashboard with analytics and job statistics


### 👷 Volunteer Features

* Browse available gigs and events
* Apply for jobs
* Track application status
* View upcoming assignments
* Access completed gig history
* KYC verification for enhanced trust


### 🛡️ Admin Features

* Manage users and platform activity
* Review and verify KYC submissions
* Monitor jobs and applications
* Dashboard analytics
* User moderation and platform oversight

---

## 🔐 Authentication & Security

* JWT Authentication
* Secure HTTP-only Cookie-based Sessions
* Protected Routes
* Role-Based Access Control (RBAC)
* KYC Verification Workflow
* Input Validation & Error Handling

---

## 🏗️ System Architecture

```text
Frontend (React.js)
       │
       ▼
REST APIs (Express.js)
       │
       ▼
Business Logic Layer
       │
       ▼
MongoDB Database
```

### User Roles

1. Volunteer
2. Organizer
3. Admin

---

## 🛠️ Tech Stack

### Frontend

* React.js
* React Router DOM
* Tailwind CSS
* Lucide React Icons

### Backend

* Node.js
* Express.js
* JWT Authentication
* Multer

### Database

* MongoDB Atlas
* Mongoose

### Tools & Deployment

* Git & GitHub
* Postman
* Vercel (Frontend)
* Render / Railway (Backend)

---

---

## 📊 Core Modules

### Authentication Module

* Registration
* Login
* Logout
* JWT Token Verification

### KYC Module

* Document Upload
* Verification Workflow
* Admin Approval/Rejection

### Job Management Module

* Create Jobs
* Edit Jobs
* Delete Jobs
* Manage Slots

### Application Management Module

* Apply for Jobs
* Accept/Reject Applicants
* Application Tracking

### Dashboard Module

* Organizer Dashboard
* Volunteer Dashboard
* Admin Dashboard

---

## 🌍 Sustainable Development Goals (SDGs)

GigXpress contributes to the following United Nations SDGs:

* SDG 8 – Decent Work and Economic Growth
* SDG 9 – Industry, Innovation and Infrastructure
* SDG 10 – Reduced Inequalities
* SDG 11 – Sustainable Cities and Communities
* SDG 4 – Quality Education (Indirect Contribution)

---

## 📈 Technology Readiness Level (TRL)

**Current TRL: 6**

GigXpress is a fully functional prototype demonstrating:

* End-to-end job management
* Role-based access control
* KYC verification workflow
* Hiring and application lifecycle management

The system is ready for pilot deployment with further scalability and production enhancements.

---

## ⚙️ Installation & Setup

### Clone Repository

```bash
git clone https://github.com/your-username/GigXpress.git
cd GigXpress
```

### Backend Setup

```bash
cd backend
npm install
```

Create `.env`

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```

Run Backend

```bash
npm start
```

---

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

Backend URL:

```text
http://localhost:5000
```

---

## 🔄 Workflow

```text
Organizer Creates Job
        │
        ▼
Volunteer Applies
        │
        ▼
Organizer Reviews Applications
        │
        ▼
Hire / Reject Applicant
        │
        ▼
Volunteer Completes Gig
        │
        ▼
Completed Job History
```

---

## 📜 License

This project is developed for educational, research, and portfolio purposes.
