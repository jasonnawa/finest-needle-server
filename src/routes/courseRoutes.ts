import { container, inject, injectable } from "tsyringe";
import { CourseController } from "../controllers/courseController";
import { Router } from "express";

@injectable()
export class CourseRoutes {
    public readonly router: Router;
    private readonly _courseController: CourseController;

    constructor(@inject(CourseController.name) courseController: CourseController) {
        this.router = Router();
        this._courseController = courseController;

        this.registerRoutes();
    }

    private registerRoutes() {
        // GET /api/courses
        this.router.get("/", async (req, res) => {
            return this._courseController.getAllCourses(req, res);
        });

        // GET /api/courses/:id
        this.router.get("/:id", async (req, res) => {
            return this._courseController.getCourseById(req, res);
        });

        // POST /api/courses
        this.router.post("/", async (req, res) => {
            return this._courseController.createCourse(req, res);
        });

    }
}

export const registerCourseRoutesDI = () => {
    container.register(CourseRoutes.name, { useClass: CourseRoutes });
};
