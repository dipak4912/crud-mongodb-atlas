import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/mongodb";
import Student from "@/app/models/Student";
import { studentSchema } from "@/app/lib/validation";

// GET: Fetch a single student by ID
export async function GET(request, { params }) {
  await dbConnect();
  const { id } = await params;
  try {
    const student = await Student.findById(id);
    if (!student) return NextResponse.json({ success: false, message: "Not Found" }, { status: 404 });
    return NextResponse.json({ success: true, data: student }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// PUT: Update a student with Zod validation
export async function PUT(request, { params }) {
  await dbConnect();
  const { id } = await params;
  try {
    const body = await request.json();
    
    // Validate the request body against the Zod schema
    const validatedData = studentSchema.parse(body);

    const student = await Student.findByIdAndUpdate(id, validatedData, {
      new: true,
      runValidators: true,
    });
    if (!student) return NextResponse.json({ success: false }, { status: 404 });
    return NextResponse.json({ success: true, data: student }, { status: 200 });
  } catch (error) {
    if (error.name === "ZodError") {
      const errorMessages = error.errors.map(err => err.message).join(", ");
      return NextResponse.json({ success: false, error: errorMessages }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// DELETE: Remove a student
export async function DELETE(request, { params }) {
  await dbConnect();
  const { id } = await params;
  try {
    const deletedStudent = await Student.deleteOne({ _id: id });
    if (deletedStudent.deletedCount === 0) return NextResponse.json({ success: false, message: "Not Found" }, { status: 404 });
    return NextResponse.json({ success: true, data: {} }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
