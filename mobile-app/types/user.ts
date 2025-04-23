export type User = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
  updatedAt: string;
};
