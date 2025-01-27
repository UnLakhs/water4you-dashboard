export const inputStyles = `text-black shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline`;

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
}