🧠 Jira LiteFull-Stack Task Management System

Jira Lite is a high-performance productivity suite designed to bridge the gap between administrative oversight and employee execution. Built with the Next.js 15+ App Router, it leverages real-time data handling and role-based access control.🚀 


Key Highlight
👑 Admin Command Center: Centralized oversight for user roles and global task distribution.
👨‍💻 Employee Workspace: Personal Kanban boards with intuitive status tracking.
🎯 Drag & Drop Engine: Seamless task assignment using @hello-pangea/dnd.📊 Dynamic Analytics: Real-time data visualization via Recharts.
📅 Intelligence: Automated overdue detection and deadline sorting.



🛠 Tech Stack
ComponentTechnology
frontend - Next.js 15+ (App Router), TypeScript, Tailwind CSS
Backend - Next.js API Routes (Serverless)
Database - MongoDB & Mongoose
Auth - JWT (JSON Web Tokens) & Bcrypt.js
 Visuals - Recharts, Lucide Icons

******Test Credentials**:
**admin access:  1234  passs=1234**
**employee:  hello     pass=hello**

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

http://localhost:3001




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



🧠 How It Works Internally
Role Based Rendering
DashboardPage →
    if admin → AdminDashboard
    else → EmployeeDashboard

Task Assignment Flow

Admin:

Drag → PATCH /api/tasks/[id]
→ assignedTo updated


Employee:

Change status → PATCH /api/tasks/[id]
→ status updated

🎯 Key Functionalities Implemented

✔ JWT Authentication
✔ Role Based Access
✔ Admin Panel
✔ Employee Panel
✔ Drag & Drop
✔ Subtasks
✔ Comments
✔ Deadline System
✔ Overdue Detection
✔ Analytics Dashboard
✔ Task Detail Page
✔ MongoDB Integration
✔ REST API Routes

📦 Future Improvements (Optional)

Email notifications

Activity timeline

File attachments

Team-based filtering

Pagination

Dark mode

Audit logs

Production security hardening

👨‍💻 Author

Developed by: K Srastick Kumar Shetty


