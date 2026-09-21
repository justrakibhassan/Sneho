# 🌿 Sneho: Personalizing Childcare with Heart & Intelligence

[![Standard](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![Modern](https://img.shields.io/badge/Tailwind-CSS_4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Database](https://img.shields.io/badge/Prisma-MySQL-2D3748?logo=prisma)](https://www.prisma.io/)
[![Chat](https://img.shields.io/badge/Powered_by-Stream-005FFF?logo=getstream)](https://getstream.io/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

**Sneho** (meaning *Affection* or *Care*) is a premium, high-fidelity platform designed to bridge the gap between families and trusted caregivers. By combining intelligent matching algorithms with real-time communication tools, Sneho ensures every child gets the care they deserve in a safe, transparent, and modern environment.

---

## 🔗 Live Experience

### 🌐 [Live Demo URL](https://sneho.vercel.app/): [Sneho](https://sneho.vercel.app/)

To experience the platform without creating new accounts, you can use the following test credentials:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@sneho.com` | `admin123` |
| **Parent** | `parent@sneho.com` | `parent123` |
| **Sitter** | `sitter@sneho.com` | `sitter123` |

---

## ✨ Key Features

### 🧠 Smart Match™ Technology
Our proprietary matching engine analyzes:
- **Availability Patterns:** Sophisticated overlap detection (supports both JSON and natural language inputs).
- **Personality Harmony:** Matching based on caregiver traits and family needs.
- **Proximity:** Location-aware sorting for convenient care.

### 💬 Real-time Ecosystem
- **Instant Messaging:** Seamless chat between parents and sitters powered by **Stream Chat**.
- **Live Video Interviews:** Integrated video conferencing for pre-hiring peace of mind.
- **Activity Tracking:** Live timers and status updates for active care sessions.

### 🛡️ Trust & Safety
- **Sitter Approvals:** Managed verification process via a dedicated Admin Dashboard.
- **Secure ID Verification:** Integrated identity checks for all parties.
- **Background Reports:** Comprehensive reports available for premium tiers.

### 💰 Professional Billing
- **Tiered Plans:** Standard, Premium, and Diamond subscriptions to suit every family's budget.
- **Stripe Integration:** Seamless, secure, and automated payment processing.

---

## 🛠️ Technical Architecture & Stack

Sneho is built with a focus on **performance, scalability, and security**, following a modern **MVC pattern**.

### **Core Stack**
- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS 4
- **Backend:** Node.js (Express 5.x)
- **Database:** MySQL with Prisma ORM
- **Communication:** GetStream (Chat & Video), Socket.IO

---

## 📂 Project Structure

```bash
sneho/
├── frontend/               # Next.js Application
│   ├── src/
│   │   ├── app/           # App Router (Pages & Layouts)
│   │   ├── components/    # Common UI Components
│   │   └── modules/       # Domain-specific logic (Home, Admin)
│   └── public/            # Static assets (Branding, Logo)
└── backend/                # Node.js API
    ├── src/
    │   ├── controllers/   # Request handlers
    │   ├── services/      # Business logic (Matching, Auth)
    │   └── routes/        # API Endpoints
    └── prisma/            # Database Schema & Migrations
```

---

## 💎 Premium Offering

Sneho offers a structured subscription model:

- **Standard:** Basic matching and verified sitter access.
- **Premium:** Advanced AI recommendations and priority support.
- **Diamond:** Complete peace of mind with background reports and personal family advisors.

---

## 👨‍💻 Author

Designed & built with ❤️ by [Rakib Hassan](https://rakibhassan.vercel.app).

---

*© 2026 Sneho. All rights reserved.*
