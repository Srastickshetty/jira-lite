import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Task from "@/models/Task";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";

export async function GET(req: Request) {
  await connectDB();

  const decoded = verifyToken(req);
  const currentUser = await User.findById(decoded.id);

  if (!currentUser || currentUser.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const tasks = await Task.find().sort({ createdAt: -1 });

  return NextResponse.json(tasks);
}
