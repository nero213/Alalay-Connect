<div align="center">

<br/>

<img src="https://img.shields.io/badge/-%F0%9F%A4%9D%20ALALAY%20CONNECT-1a1a2e?style=for-the-badge&logoColor=white" height="50"/>

### Proximity-Based Platform for Hiring Skilled Workers

*Connecting communities, one skilled hand at a time.*

<br/>

[![Status](https://img.shields.io/badge/Status-Completed-22c55e?style=flat-square&logo=checkmarx&logoColor=white)](./)<space>
[![Methodology](https://img.shields.io/badge/Methodology-RAD-6366f1?style=flat-square)](./)<space>
[![Vue.js](https://img.shields.io/badge/Vue.js-3.x-4FC08D?style=flat-square&logo=vue.js&logoColor=white)](./)<space>
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=flat-square&logo=node.js&logoColor=white)](./)<space>
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql&logoColor=white)](./)<space>


<br/>

> 📌 **Bachelor's Thesis — Computer Science**  
> Virgen Milagrosa University Foundation, Inc. · Academic Year 2025–2026  
> Deployed in **The whole region of Pangasinan🇵🇭**

<br/>

</div>

---

## 📖 What is Alalay Connect?

**Alalay Connect** is a web-based platform that bridges the gap between **clients** and **verified skilled workers** — carpenters, tutors, household helpers, and more — using **proximity-based matching** within a local network. Say goodbye to unreliable word-of-mouth referrals and scattered social media searches.

> **"Alalay"** (Filipino) — *to support, to assist, to be there for someone.*

The platform brings structure, transparency, and efficiency to local service hiring through a full-featured digital ecosystem complete with booking management, real-time notifications, ratings, and admin oversight.

---

## 🖼️ Screenshots

### Authentication & Dashboard

| User Dashboard | Registration |
|:-:|:-:|
| <img width="400" alt="User Dashboard" src="https://github.com/user-attachments/assets/6a183f95-ae27-487e-b262-5f8cb65afe8c" /> | <img width="400" alt="Registration" src="https://github.com/user-attachments/assets/330b9689-65fd-435d-b1e4-a5c0c7c266e9" /> |

### Skilled Worker Onboarding & Discovery

| Become a Skilled Worker | Worker Verification (Admin) |
|:-:|:-:|
| <img width="400" alt="Become a Skilled Worker" src="https://github.com/user-attachments/assets/ff0882fd-c391-4fa0-adc7-38d4aec2ff3a" /> | <img width="400" alt="Skilled Worker Verification" src="https://github.com/user-attachments/assets/e62a4d81-7e03-45ef-b5a7-9454837474ad" /> |

| Skilled Worker Profile | Search & Browse Workers |
|:-:|:-:|
| <img width="400" alt="Skilled Profile" src="https://github.com/user-attachments/assets/c6ca126e-f7d9-45c2-a0cb-cf6218506799" /> | <img width="400" alt="Search Skilled Worker" src="https://github.com/user-attachments/assets/417b6ca7-9c0e-482f-9154-a4507343e0d9" /> |

### Booking System

| Create Booking | Manage Bookings (Worker View) |
|:-:|:-:|
| <img width="400" alt="Booking" src="https://github.com/user-attachments/assets/62734db7-088e-4d45-b22d-61ce9b59abd4" /> | <img width="400" alt="Manage Booking Skilled Profile" src="https://github.com/user-attachments/assets/8a68aade-7095-447e-948f-1472abfd6214" /> |

| Confirmed Bookings | Client Reviews |
|:-:|:-:|
| <img width="400" alt="Manage Bookings Confirmed" src="https://github.com/user-attachments/assets/2cbe70d7-35e8-4de4-8654-3faecbc838da" /> | <img width="400" alt="Client Reviews" src="https://github.com/user-attachments/assets/6bea1a41-57ae-4e60-b83d-1e5b95d44567" /> |

### Notifications & Help

| Notifications | Booking Alerts | All Notifications |
|:-:|:-:|:-:|
| <img width="260" alt="Notification Messages" src="https://github.com/user-attachments/assets/884bf0e8-26f1-4b60-b5e2-80de36d299fb" /> | <img width="260" alt="Booking Notification" src="https://github.com/user-attachments/assets/4b9065ff-8dbd-4c0c-b8ef-95295656128f" /> | <img width="260" alt="All Notifications" src="https://github.com/user-attachments/assets/4f1401e6-663a-4180-9722-94f3aad52934" /> |

| Help Center — My Tickets | Create Support Ticket |
|:-:|:-:|
| <img width="400" alt="Help Center My Ticket" src="https://github.com/user-attachments/assets/cc1a6134-5ca8-4c00-9803-1e36f9c45da2" /> | <img width="400" alt="Help Center Create Ticket" src="https://github.com/user-attachments/assets/770446f9-6bc6-41fe-833c-4459d2332fd7" /> |

### Admin Panel

| Report Dashboard | User Management | Report Modal |
|:-:|:-:|:-:|
| <img width="260" alt="Admin Report Panel" src="https://github.com/user-attachments/assets/5cb60088-4b7e-4e14-a1d3-229fbcc2ae8f" /> | <img width="260" alt="Admin All Users Route" src="https://github.com/user-attachments/assets/a2a77981-a8a9-4a8f-8aec-f269fc807855" /> | <img width="260" alt="Report Modal" src="https://github.com/user-attachments/assets/24b7388f-9ba8-4a45-b422-809bc2973d10" /> |

---

## 🎯 Problem → Solution

| ❌ Before Alalay Connect | ✅ After Alalay Connect |
|:--|:--|
| No worker verification or vetting | Admin-driven verification with document review |
| Limited service visibility; word-of-mouth only | Searchable profiles with proximity-based filters |
| Unreliable, informal booking arrangements | Structured booking with real-time status tracking |
| Poor client-worker communication | In-app messaging and push notifications |
| No accountability or feedback system | Ratings, reviews, and dispute resolution |

---

## 🏗️ Architecture Overview

```
alalay-connect/
├── frontend/          # Vue.js 3 SPA + Tailwind CSS
│   ├── src/
│   │   ├── views/     # Client, Worker, Admin pages
│   │   ├── components/
│   │   └── router/
├── backend/           # Node.js + Express.js REST API
│   ├── routes/
│   ├── controllers/
│   └── middleware/
└── database/
    └── alalay_db.sql  # MySQL 8.0 schema
```

> Deployed on a **LAN (Wi-Fi)** environment via XAMPP for local community use.

---

## 👥 User Roles

<table>
<thead>
<tr><th>Role</th><th>Capabilities</th></tr>
</thead>
<tbody>
<tr>
<td><b>👤 Client</b></td>
<td>Register · Browse & search workers · Book services · Rate & review · Report issues · Save favorites</td>
</tr>
<tr>
<td><b>🛠️ Skilled Worker</b></td>
<td>Manage profile & services · Accept or reject bookings · View earnings & ratings · Respond to messages</td>
</tr>
<tr>
<td><b>🧑‍💼 Admin</b></td>
<td>Verify worker credentials · Manage all users · Handle disputes · Monitor bookings · Manage skill categories</td>
</tr>
</tbody>
</table>

---

## ⚙️ Features at a Glance

| Category | Features |
|:--|:--|
| 🔐 **Authentication** | Register, Login, Logout, Session management |
| 📍 **Discovery** | Proximity-based worker matching, skill filtering, keyword search |
| 📅 **Booking** | Create, update, cancel bookings with status tracking |
| 🔔 **Notifications** | Real-time booking alerts, admin broadcasts, system messages |
| ⭐ **Feedback** | Star ratings and written reviews post-service |
| 🧾 **Admin Tools** | Worker verification, dispute resolution, report dashboard |
| 💬 **Messaging** | In-app client–worker communication |
| ❤️ **Personalization** | Save and revisit favorite workers |
| 📞 **Support** | Help center with ticket creation and tracking |

---

## 🛠️ Tech Stack

<table>
<thead>
<tr><th>Layer</th><th>Technology</th></tr>
</thead>
<tbody>
<tr><td><b>Frontend</b></td><td>Vue.js 3, Tailwind CSS, HTML5, CSS3</td></tr>
<tr><td><b>Backend</b></td><td>Node.js, Express.js</td></tr>
<tr><td><b>Database</b></td><td>MySQL 8.0 (MySQL Workbench)</td></tr>
<tr><td><b>Deployment</b></td><td>XAMPP (LAN/Wi-Fi)</td></tr>
<tr><td><b>Version Control</b></td><td>Git + GitHub</td></tr>
<tr><td><b>API Testing</b></td><td>Postman</td></tr>
<tr><td><b>Design</b></td><td>Figma, Adobe Photoshop, Canva</td></tr>
<tr><td><b>Documentation</b></td><td>Notion, Google Docs</td></tr>
</tbody>
</table>

---

## 🚀 Getting Started

### Prerequisites

- Node.js `v20.x`
- MySQL `8.0`
- XAMPP (for local deployment)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/alalay-connect.git
cd alalay-connect
```

```bash
# 2. Set up the backend
cd backend
npm install
cp .env.example .env       # Configure your DB credentials
npm start
```

```bash
# 3. Set up the frontend (new terminal)
cd ../frontend
npm install
npm run dev
```

```bash
# 4. Import the database
# Open MySQL Workbench → Server → Data Import
# Select: database/alalay_db.sql
```

The app will be available at `http://localhost:5173` (frontend) and `http://localhost:3000` (API).

---

## 📊 Performance Results

All modules were tested for response time under realistic load conditions. Each module met acceptable usability thresholds (< 1 second).

| Module | Avg. Response Time |
|:--|:-:|
| Authentication | 0.69s |
| User Module | 0.85s |
| Skilled Worker | 0.88s |
| Booking Module | 0.88s |
| Notification | 0.66s |
| Admin Module | 0.87s |
| **Overall Average** | **0.80s ✅** |

---

## ✅ User Acceptance Testing (UAT)

> **Overall Score: 4.27 / 5.00 — Excellent**

Evaluated by 10 respondents (clients + skilled workers) using a 5-point Likert scale.

| Criteria | Rating |
|:--|:-:|
| Functionality | ⭐ Excellent |
| Reliability | ⭐ Excellent |
| Efficiency | ⭐ Excellent |
| Ease of Use | ⭐ Very Good |
| Interface Design | ⭐ Very Good |

---

## 🧪 Testing Strategy

All testing phases were completed successfully prior to deployment.

- ✅ Unit Testing
- ✅ Integration Testing
- ✅ System Testing
- ✅ User Acceptance Testing (UAT)
- ✅ Stress & Performance Testing

---

## 👨‍💻 Authors

> Developed by Computer Science students at **Virgen Milagrosa University Foundation, Inc.**  
> Academic Year 2025–2026

---

## 📄 License

This project was developed for academic purposes. All rights reserved by the authors and Virgen Milagrosa University Foundation, Inc.

---

<div align="center">

*Built with 💙 in Pangasinan, Philippines*

</div>
