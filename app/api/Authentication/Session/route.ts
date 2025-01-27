import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  
    try {
        const token = request.headers.get("cookie")?.split("; ").find(cookie => cookie.startsWith("token="))?.split("=")[1];

        if(!token || !process.env.JWT_SECRET) 
            return NextResponse.json({ user: null }, { status: 401 });

        const decodedToken =  jwt.verify(token, process.env.JWT_SECRET as string);
        return NextResponse.json({ user: decodedToken }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 401 });
    }

  
}