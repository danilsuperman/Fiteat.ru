import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import surveyRouter from "./survey";
import plansRouter from "./plans";
import progressRouter from "./progress";
import adminRouter from "./admin";
import extendedSurveyRouter from "./extended-survey";
import reviewsRouter from "./reviews";
import snacksRouter from "./snacks";
import promosRouter from "./promos";
import supportRouter from "./support";
import profileRouter from "./profile";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(surveyRouter);
router.use(extendedSurveyRouter);
router.use(plansRouter);
router.use(progressRouter);
router.use(adminRouter);
router.use(reviewsRouter);
router.use(snacksRouter);
router.use(promosRouter);
router.use(supportRouter);
router.use(profileRouter);

export default router;
