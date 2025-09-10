import { container, inject } from "tsyringe";
import CourseModel from "../models/courseModel";
import { injectable } from "tsyringe";
import { NotificationService } from "../utils/messaging";

@injectable()
export class CourseController {
    public readonly model: CourseModel
    private readonly _notificationService: NotificationService

    constructor(
        @inject(CourseModel.name) courseModel: CourseModel,
        @inject(NotificationService) _notificationService: NotificationService
    ) {
        this.model = courseModel
        this._notificationService = _notificationService
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

    // send course to an email address
    async sendCourseToEmail(req, res) {
        try {
            const { courseId, email } = req.body

            if (!courseId || !email) return res.status(400).json({ status: false, message: 'course Id and email required' });

            const course = await this.model.getCourseById(courseId)

            if(!course) return res.status(400).json({ status: false, message: 'course does not exist' });

            const EMAIL_SUBJECT = "🎉 Thank You for Your Purchase – Your Course is Ready!";
            const EMAIL_DESCRIPTION = `
Hi there,

Thank you for purchasing ${course.title}! 🎓  
We’re excited to have you on board.

Here’s your course material attached. We hope you enjoy learning and gain valuable skills.  
If you have any questions or need support, feel free to reach out to us.

Happy learning,  
The Finest Needle Team
`;
            await this._notificationService.sendPDFEmail(email, EMAIL_SUBJECT, EMAIL_DESCRIPTION, courseId)

            return res.status(200).json({ status: true, message: `course delivered to ${email} successfully` });

        } catch (error) {
            console.error(error)
        }

    }
}

export const registerCourseControllerDI = () => {
    container.register(CourseController.name, { useClass: CourseController })
}