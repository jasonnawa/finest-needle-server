import { container, inject } from "tsyringe";
import CourseModel from "../models/courseModel";
import { injectable } from "tsyringe";

@injectable()
export class CourseController {
    public readonly model: CourseModel

    constructor(
        @inject(CourseModel.name) courseModel: CourseModel,
    ) {
        this.model = courseModel
    }

    // Create a course
    async createCourse(req, res) {
        try {
            const { title, description, price } = req.body;
            const course = await this.model.createCourse({ title, description, price });
            return res.status(201).json({ status: true, message: 'course creation successful', data: course });
        } catch (err) {
            return res.status(500).json({ status: false, message: 'error creating course', err });
        }
    }

    // Get all courses
    async getAllCourses(req, res) {
        try {
            const courses = await this.model.getAllCourses();
            return res.status(200).json({ status: true, message: 'course fetch successful', data: courses });
        } catch (err) {
            return res.status(500).json({ status: false, message: 'error fetching courses' });
        }
    }

    // Get course by ID
    async getCourseById(req, res) {
        try {
            const { id } = req.params;
            const course = await this.model.getCourseById(id);
            if (!course) return res.status(404).json({ status: false, message: "Course not found" });
            return res.status(200).json({ status: true, message: 'course fetched successfully', data: course });
        } catch (err) {
            return res.status(500).json({ status: false, message: 'an error occured' });
        }
    }


}

export const registerCourseControllerDI = () => {
    container.register(CourseController.name, { useClass: CourseController })
}