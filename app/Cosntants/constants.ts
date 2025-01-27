export const inputStyles = `text-black shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline`;
export const createTournamentInputStyles = `w-full p-3 text-black shadow appearance-none border rounded leading-tight focus:outline-none focus:shadow-outline`;

export type User = {
  id: string;
  username: string;
  password: string;
  email: string;
  isAdmin: boolean;
  teamName?: string;
};
export interface Tournament {
  id: string;
  name: string;
  description: string;
  date: string;
  startDate: string;
  endDate: string;
  startTime: string;
  registrationDeadline: string;
  maxParticipants: number;
  participants: User[];
  format: TournamentFormat;
  enrtyFee: TournamentEntryFee;
  prizes: TournamentPrizes[];
  rules: string;
  createdBy: User;
  status: "upcoming" | "ongoing" | "finished";
  chat: Chat[];
  notifications: Notification[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TournamentFormat {
  tournamentType: "string"; //single elimination, double elimination, round robin, etc.
  rounds: number;
}

export interface TournamentEntryFee {
  amount: number; //0 for free tournaments
  currency: string;
}

export interface TournamentPrizes {
  position: number;
  reward: number | string;
}

export interface Chat {
  user: User;
  message: string;
  timestamp: Date;
}

export interface Notification {
  referenceId: string;
  user: User;
  type:
    | "tournament_update"
    | "tournament_start"
    | "tournament_end"
    | "tournament_canceled"
    | "tournament_created"
    | "new_message"
    | "prize_awarded";
  message: string;
  timestamp: Date;
}
