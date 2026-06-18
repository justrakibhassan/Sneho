export interface IUser {
  id: number;
  email: string;
  role: "PARENT" | "BABYSITTER" | "ADMIN" | "USER";
  name: string;
  isApproved: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      io?: any;
    }
  }
}
