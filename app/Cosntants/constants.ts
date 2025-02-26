import { ObjectId } from "mongodb";

export const inputStyles = `text-black shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline`;

export interface User {
  _id: ObjectId;
  username: string;
  email: string;
  password: string;
  role: "admin" | "staff"
}

export interface Customer {
  _id: ObjectId;
  name: string;
  email: string;
  phoneNumber: string;
  description: string;
  date: string;
  createdAt: Date;
}

export interface NotificationLogs {
  type: "sms" | "email",
  recipient: string,
  status: "sent" | "failed",
  timestamp: Date,
  message: string,
  errorMessage?: any
}