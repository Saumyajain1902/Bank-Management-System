export interface Transaction {
  id: string;
  type: "deposit" | "withdrawal" | "transfer";
  amount: number;
  date: string;
  description: string;
}

export interface Account {
  accountNumber: string;
  holderName: string;
  balance: number;
  transactions: Transaction[];
  createdAt: string;
}

export type AppView = "login" | "register" | "dashboard";
