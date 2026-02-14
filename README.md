🧠 Jira Lite – Full Stack Task Management System

A modern full-stack task management system with:

👑 Admin Command Center

👨‍💻 Employee Workspace

📊 Real-time Analytics

🎯 Drag & Drop Task Assignment

📅 Deadlines & Overdue Detection

🔐 JWT Authentication

📦 MongoDB Database

Built using Next.js App Router + MongoDB + JWT + TailwindCSS

🚀 Live Demo

(Add your deployed link here once deployed)

🛠 Tech Stack
Frontend

Next.js 16 (App Router)

React

TypeScript

Tailwind CSS

Recharts (Analytics)

@hello-pangea/dnd (Drag & Drop)

Lucide Icons

Backend (API Routes inside Next.js)

Next.js API Routes

MongoDB

Mongoose

JWT Authentication

bcryptjs

🏗 Project Architecture

+---app
|   |   globals.css
|   |   layout.tsx
|   |   page.tsx
|   |
|   +---api
|   |   +---admin
|   |   |   +---create-user
|   |   |   |       route.ts
|   |   |   |
|   |   |   +---tasks
|   |   |   |       route.ts
|   |   |   |
|   |   |   +---update-role
|   |   |   |       route.ts
|   |   |   |
|   |   |   \---users
|   |   |           route.ts
|   |   |
|   |   +---auth
|   |   |   +---login
|   |   |   |       route.ts
|   |   |   |
|   |   |   +---me
|   |   |   |       route.ts
|   |   |   |
|   |   |   \---register
|   |   |           route.ts
|   |   |
|   |   \---tasks
|   |       |   route.ts
|   |       |
|   |       \---[id]
|   |               route.ts
|   |
|   +---dashboard
|   |   |   layout.tsx
|   |   |   page.tsx
|   |   |
|   |   +---analytics
|   |   |       page.tsx
|   |   |
|   |   \---tasks
|   |       \---[id]
|   |               page.tsx
|   |
|   \---register
|           page.tsx
|
+---components
|   |   TaskModal.tsx
|   |
|   +---admin
|   |       AdminDashboard.tsx
|   |
|   \---employee
|           EmployeeDashboard.tsx
|
+---lib
|       auth.ts
|       db.ts
|
\---models
        Task.ts
        User.ts


🔐 Authentication Flow

User logs in via /api/auth/login

Backend validates password using bcrypt

JWT token generated

Token stored in localStorage

All API routes verify token using middleware logic

Role-based rendering:

admin → AdminDashboard

employee → EmployeeDashboard

👑 Admin Features
1️⃣ User Management

Create employees

Delete users

Toggle role (Admin ↔ Employee)

View workload per employee

2️⃣ Drag & Drop Task Assignment

Unassigned column

Employee columns

Drag task → assign to employee

Real-time backend update

3️⃣ System Analytics

Total tasks

Completion rate

Overdue tasks

Active employees

Tasks per employee (Bar Chart)

Status distribution (Pie Chart)

4️⃣ Live Task Monitor

Shows latest tasks

Click to view detailed page

👨‍💻 Employee Features
1️⃣ Kanban Board

Todo

In Progress

Done

Drag between columns

2️⃣ Task Creation

Title

Description

Priority

Due Date

3️⃣ Task Modal

Update status

Add subtasks

Mark subtasks complete

Add comments

4️⃣ Deadline System

Due Today indicator

Overdue highlight

Sorted by due date

📊 Analytics Logic

Metrics calculated in frontend:

Completion Rate = (Done / Total) × 100

Overdue = dueDate < today AND status != done

Tasks per employee = grouped by assignedTo

Status distribution = grouped by status

Charts built using Recharts.

🗄 Database Models
User Model
{
  name: String,
  email: String,
  password: String (hashed),
  role: "admin" | "employee"
}

Task Model
{
  title: String,
  description: String,
  status: "todo" | "inprogress" | "done",
  priority: "low" | "medium" | "high",
  dueDate: Date,
  createdBy: ObjectId,
  assignedTo: ObjectId,
  subtasks: [
    {
      title: String,
      completed: Boolean
    }
  ],
  comments: [
    {
      text: String,
      createdAt: Date
    }
  ]
}

⚙️ How To Run Locally
1️⃣ Clone
git clone <your-repo-url>
cd jira-lite

2️⃣ Install Dependencies
npm install

3️⃣ Create Environment File

Create:

.env.local


Add:

MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key

4️⃣ Run Development Server
npm run dev


Open:

http://localhost:3000

🌍 Deployment Guide
Recommended: Vercel
1️⃣ Push to GitHub
git add .
git commit -m "Production ready"
git push

2️⃣ Go to:

https://vercel.com

3️⃣ Import Project
4️⃣ Add Environment Variables in Vercel:

MONGODB_URI

JWT_SECRET

5️⃣ Deploy

Done.