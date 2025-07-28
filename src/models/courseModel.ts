import { injectable, container } from "tsyringe";
import mongoose, { Document, Schema, Model, ObjectId } from "mongoose";

// 1. Interface definition
interface ICourse extends Document {
  _id: ObjectId;
  title: string;
  description: string;
  price: number;
}

// 2. Mongoose schema with all required fields
const CourseSchema: Schema<ICourse> = new Schema<ICourse>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

// 3. Mongoose model creation (supports hot-reload scenarios)
export const CourseMongooseModel: Model<ICourse> =
  mongoose.models.Course || mongoose.model<ICourse>("Course", CourseSchema);

// 4. Class-based wrapper for DI
@injectable()
export default class CourseModel {
  async createCourse(data: any) {
    const course = new CourseMongooseModel(data);
    return await course.save();
  }

  async getAllCourses() {
    return await CourseMongooseModel.find();
  }

  async getCourseById(id: string) {
    return await CourseMongooseModel.findById(id);
  }
}

// 5. Register for dependency injection
export const registerCourseModelDI = () => {
  container.register(CourseModel.name, { useClass: CourseModel });
};
