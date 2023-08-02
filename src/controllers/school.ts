import {Request, Response, NextFunction} from "express";
import { SchoolDocument, School } from "../models/School";
import { check, validationResult } from "express-validator";
