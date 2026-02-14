import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";

export async function PATCH(req: Request) {
  try {
    await connectDB();

    const decoded = verifyToken(req);

    const currentUser = await User.findById(decoded.id);

    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { userId, role } = body;

    await User.findByIdAndUpdate(userId, { role });

    return NextResponse.json({ message: "Role updated successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
