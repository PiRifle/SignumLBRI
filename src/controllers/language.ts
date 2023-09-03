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
  if (req.session.usesLang){
    req.language = (langProvider as LangPicker)[req.session.usesLang];
  }else{
    const lang = req.acceptsLanguages(...Object.keys(langProvider));
    if (lang) {
      req.language = (langProvider as LangPicker)[lang];
    } else {
      req.language = langProvider.dbg;
    }
  }
    res.locals.language = req.language;
    // console.log(req.session.usesLang);
    next();
}


export function changeLanguage(req: Request, res:Response){
  if(req.body.language && [...Object.keys(langProvider)].includes(req.body.language)){
    req.session.usesLang = req.body.language;
  }
  res.redirect("back");
}