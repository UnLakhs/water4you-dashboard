import { ObjectId } from "mongodb";

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
  _id: ObjectId;
  type: "sms" | "email";
  recipient: string;
  status: "sent" | "failed";
  timestamp: Date;
  successMessage?: string;
  errorMessage?: ErrorMessage;
}

export interface ErrorMessage {
  status: number;
  code: number;
  moreInfo: string;
}

export interface LogsResponse {
  logs: NotificationLogs[]
}

export interface NotificationTemplates {
  _id?: ObjectId;      // Optional for new inserts
  smsTemplate: {
    body: string;
    lastUpdated?: Date;  // Track when SMS template was last modified
  };
  emailTemplate: {
    subject: string;
    htmlContent: string;
    lastUpdated?: Date;  // Track when Email template was last modified
  };
}