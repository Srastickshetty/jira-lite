import jwt from "jsonwebtoken";

export function verifyToken(req: Request) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    throw new Error("No token provided");
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    throw new Error("Invalid token format");
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET!);

  return decoded as { id: string; role: string };
}

