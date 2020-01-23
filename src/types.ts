import { Response } from "express";

export interface Context {
  user?: string;
  req: AuthInfoRequest;
  res: Response;
}

export interface AuthInfoRequest extends Request {
  user: string;
}
