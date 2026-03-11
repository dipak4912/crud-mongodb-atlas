import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/mongodb";
import Student from "@/app/models/Student";
import { studentSchema } from "@/app/lib/validation";

// GET: Fetch all students
export async function GET() {
  await dbConnect();
  try {
    const students = await Student.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: students }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// POST: Create a new student with Zod validation
export async function POST(request) {
  await dbConnect();
  try {
    const body = await request.json();
    
    // Validate the request body against the Zod schema
    const validatedData = studentSchema.parse(body);

    const student = await Student.create(validatedData);
    return NextResponse.json({ success: true, data: student }, { status: 201 });
  } catch (error) {
    if (error.name === "ZodError") {
      const errorMessages = error.errors.map(err => err.message).join(", ");
      return NextResponse.json({ success: false, error: errorMessages }, { status: 400 });
    }
    // Check for duplicate email (Mongoose error)
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: "Email already exists" }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
