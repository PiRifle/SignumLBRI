import { NextFunction, Request, Response } from "express";
import { check } from "express-validator";
import { UserPerformance } from "../models/Performance";

export async function registerPerformance(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const result = await check("performance", "Nie podano wartości wydajności")
    .isNumeric({ no_symbols: true })
    .isInt({ min: 0 })
    .run(req, { dryRun: true });
if (!result.isEmpty()){
    return next();
}

  if (req.user) {
    if (req.body.performance) {
      UserPerformance.create({
        user: req.user,
        time: req.body.performance,
        from: req.headers.referer,
        to: req.url,
      });
      req.body.performance = undefined;
    }
    if (req.query.performance) {
      UserPerformance.create({
        user: req.user,
        time: req.query.performance,
        from: req.headers.referer,
        to: req.url,
      });
    req.query.performance = undefined;
    }
  }
  next();
}
