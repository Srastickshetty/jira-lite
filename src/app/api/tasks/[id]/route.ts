import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Task from "@/models/Task";
import User from "@/models/User";
import mongoose from "mongoose";
import { verifyToken } from "@/lib/auth";

// --- GET: Fetch a specific task with Full Details ---
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await context.params;
    verifyToken(req);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    // 🆕 Added .populate() to get name/email/role for details page
    const task = await Task.findById(id)
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role");

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// --- PATCH: Update task (With Security & Comments) ---
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await context.params;
    const decoded = verifyToken(req);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { comment, ...otherUpdates } = body;

    // Build update object
    const updateQuery: any = { $set: otherUpdates };
    
    // Support for the comments feature
    if (comment) {
      updateQuery.$push = { comments: { text: comment, author: currentUser.name } };
    }

    // 🔒 Security: Admin updates any, Employee only updates tasks assigned TO them
    const filter = currentUser.role === "admin" 
      ? { _id: id } 
      : { _id: id, assignedTo: decoded.id }; // Changed userId to assignedTo

    const updated = await Task.findOneAndUpdate(
      filter,
      updateQuery,
      { new: true, runValidators: true }
    ).populate("assignedTo", "name email");

    if (!updated) {
      return NextResponse.json({ error: "Unauthorized or Task not found" }, { status: 403 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 401 });
  }
}

// --- DELETE: Remove a specific task ---
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await context.params;
    const decoded = verifyToken(req);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const currentUser = await User.findById(decoded.id);

    // 🔒 Security: Only Admins can delete tasks, or employees deleting their own
    const filter = currentUser?.role === "admin"
      ? { _id: id }
      : { _id: id, assignedTo: decoded.id };

    const deleted = await Task.findOneAndDelete(filter);

    if (!deleted) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}