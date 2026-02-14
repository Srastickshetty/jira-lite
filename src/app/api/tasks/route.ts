import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Task from "@/models/Task";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await connectDB();

    const decoded = verifyToken(req);
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let tasks;

    if (currentUser.role === "admin") {
      // Admins see everything
      tasks = await Task.find()
        .populate("assignedTo", "name email role")
        .populate("createdBy", "name email");
    } else {
      // Employees only see tasks assigned to them
      tasks = await Task.find({
        assignedTo: decoded.id,
      }).populate("createdBy", "name email");
    }

    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const decoded = verifyToken(req);
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { title, description, priority, status, dueDate, assignedTo } = body;

    // 🚀 Implementation of the "Auto-Assign" feature
    let finalAssignedTo = assignedTo;

    // If an employee is creating the task, force the assignment to themselves
    // If an admin is creating it, use the 'assignedTo' provided in the body
    if (currentUser.role === "employee") {
      finalAssignedTo = decoded.id;
    }

    const task = await Task.create({
      title,
      description,
      priority,
      status: status || "todo", // Default to todo if not provided
      dueDate,
      createdBy: decoded.id,
      assignedTo: finalAssignedTo,
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Task Creation Error:", error);
    return NextResponse.json(
      { error: "Unauthorized or Invalid Data" },
      { status: 401 }
    );
  }
}