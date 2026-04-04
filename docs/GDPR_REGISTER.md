# Data Processing Register — Constellation

**Data Controller:** Constellation Project (Ironhack student project)
**Created:** April 2026
**Last updated:** April 2026

---

## Collected Data and Processing Activities

### 1. User Account Data

**Source:** `User` model (PostgreSQL / Prisma)

| Data | Field | Legal Basis | Retention Period | Justification |
|---|---|---|---|---|
| Email address | `email` | Consent (voluntary registration) | Account lifetime + 1 month | Unique identification, communication |
| Hashed password | `passwordHash` | Consent | Account lifetime + 1 month | Secure authentication (bcrypt) |
| Username | `username` | Consent | Account lifetime + 1 month | Public identification on the platform |
| Avatar (URL) | `avatarUrl` | Consent | Account lifetime + 1 month | Profile customization (optional) |
| Role | `role` | Legitimate interest | Account lifetime + 1 month | Access management (VISITOR / USER / ADMIN) |
| Points | `points` | Legitimate interest | Account lifetime + 1 month | Gamification system |
| Level | `level` | Legitimate interest | Account lifetime + 1 month | Gamification system |
| Creation date | `createdAt` | Legitimate interest | Account lifetime + 1 month | Traceability, admin management |

---

### 2. Donation Pledges

**Source:** `Pledge` model (PostgreSQL / Prisma)

| Data | Field | Legal Basis | Retention Period | Justification |
|---|---|---|---|---|
| User reference | `userId` | Consent | Account lifetime + 1 month | Link pledge to user |
| Project reference | `projectId` | Consent | Account lifetime + 1 month | Link pledge to project |
| Pledged amount | `amount` | Consent | Account lifetime + 1 month | Core feature of the app |
| Pledge date | `createdAt` | Consent | Account lifetime + 1 month | User's personal history |

> **Note:** Pledges are not real financial transactions. No banking or payment data is collected.

---

### 3. Activity Logs

**Source:** `ActivityLog` model (MongoDB Atlas / Mongoose)

| Data | Field | Legal Basis | Retention Period | Justification |
|---|---|---|---|---|
| User reference | `userId` | Legitimate interest | 12 months (rolling) | Action traceability |
| Action type | `action` | Legitimate interest | 12 months (rolling) | e.g. `pledge_made`, `profile_updated`, `level_up` |
| Metadata | `metadata` | Legitimate interest | 12 months (rolling) | Contextual data for the action (projectId, amount...) |
| Date | `createdAt` | Legitimate interest | 12 months (rolling) | Action timestamp |

---

### 4. Notifications

**Source:** `Notification` model (MongoDB Atlas / Mongoose)

| Data | Field | Legal Basis | Retention Period | Justification |
|---|---|---|---|---|
| User reference | `userId` | Legitimate interest | 3 months | Link notification to user |
| Message | `message` | Legitimate interest | 3 months | Notification content |
| Read status | `read` | Legitimate interest | 3 months | Display management (read / unread) |
| Date | `createdAt` | Legitimate interest | 3 months | Timestamp |

---

## User Rights (GDPR Art. 15–22)

Users may exercise the following rights from their profile page or by email:

| Right | Implementation |
|---|---|
| **Access** (Art. 15) | `/profile` page — view personal data |
| **Rectification** (Art. 16) | Profile edit form (username, avatar) |
| **Erasure** (Art. 17) | "Delete my account" button — cascading deletion of all data (pledges, activity logs) via `onDelete: Cascade` |
| **Objection** (Art. 21) | Contact by email |
| **Portability** (Art. 20) | Not implemented (out of MVP scope) |

---

## Hosting and Data Transfers

| Service | Data hosted | Location |
|---|---|---|
| **Render** (back-end) | All data in transit | United States 🇺🇸 |
| **PostgreSQL on Render** | User, Project, Pledge | United States 🇺🇸 |
| **MongoDB Atlas** | ActivityLog, Notification | To be confirmed based on chosen cluster |
| **Netlify** (front-end) | No personal data | United States 🇺🇸 |

> ⚠️ **Transfers outside the EU:** Render and Netlify are US-based services. These transfers must be disclosed in the privacy policy with appropriate safeguards (Standard Contractual Clauses, etc.).

---

## Security Measures

- Passwords hashed with **bcrypt** (never stored in plain text)
- Authentication via signed **JWT**
- Environment variables excluded from the repo (`.env` in `.gitignore`)
- Database connections via secure URIs (SSL)
- Cascading deletion of all user data upon account deletion