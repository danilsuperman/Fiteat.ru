import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import surveyRouter from "./survey";
import plansRouter from "./plans";
import progressRouter from "./progress";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(surveyRouter);
router.use(plansRouter);
router.use(progressRouter);
router.use(adminRouter);

export default router;
