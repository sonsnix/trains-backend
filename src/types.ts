export interface Context {
  user?: string;
}

export interface AuthInfoRequest extends Request {
  user: string;
}
