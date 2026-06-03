import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import surveyRouter from "./survey";
import plansRouter from "./plans";
import progressRouter from "./progress";
import adminRouter from "./admin";
import extendedSurveyRouter from "./extended-survey";
import reviewsRouter from "./reviews";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(surveyRouter);
router.use(extendedSurveyRouter);
router.use(plansRouter);
router.use(progressRouter);
router.use(adminRouter);
router.use(reviewsRouter);

export default router;
