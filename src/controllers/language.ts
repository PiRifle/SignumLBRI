import { Request, Response, NextFunction } from "express";
import * as langProvider from "../lang";

interface LangPicker {
  [key: string]: langProvider.Language;
}

export function languageMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const lang = req.acceptsLanguages(...Object.keys(langProvider));
  console.log(lang);
  if (lang) {
    req.language = (langProvider as LangPicker)[lang];
  } else {
    req.language = langProvider.en;
  }
  res.locals.language = req.language;
  next();
}
