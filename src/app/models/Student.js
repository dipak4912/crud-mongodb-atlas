import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
    },
    age: {
      type: Number,
    },
  },
  { timestamps: true }
);

// Prevent re-compiling the model if it already exists
export default mongoose.models.Student || mongoose.model("Student", StudentSchema);
