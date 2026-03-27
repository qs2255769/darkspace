import { Router, type IRouter } from "express";
import healthRouter from "./health";
import databasesRouter from "./databases";
import officialsRouter from "./officials";
import riskScoresRouter from "./riskscores";
import alertsRouter from "./alerts";
import statsRouter from "./stats";
import scraperRouter from "./scraper";

const router: IRouter = Router();

router.use(healthRouter);
router.use(databasesRouter);
router.use(officialsRouter);
router.use(riskScoresRouter);
router.use(alertsRouter);
router.use(statsRouter);
router.use(scraperRouter);

export default router;
