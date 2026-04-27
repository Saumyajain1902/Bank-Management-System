import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs/promises";

const DATA_FILE = path.join(process.cwd(), "data", "accounts.json");

interface Transaction {
  id: string;
  type: "deposit" | "withdrawal" | "transfer";
  amount: number;
  date: string;
  description: string;
}

interface Account {
  accountNumber: string;
  pin: string;
  holderName: string;
  balance: number;
  transactions: Transaction[];
  createdAt: string;
}

async function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function readAccounts(): Promise<Account[]> {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function writeAccounts(accounts: Account[]) {
  await fs.writeFile(DATA_FILE, JSON.stringify(accounts, null, 2));
}

async function startServer() {
  await ensureDataDir();
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // API Routes
  app.get("/api/accounts", async (req, res) => {
    const accounts = await readAccounts();
    // Strip PINs for safety in transit (though this is a local simulation)
    const safeAccounts = accounts.map(({ pin, ...rest }) => rest);
    res.json(safeAccounts);
  });

  app.post("/api/accounts/login", async (req, res) => {
    const { accountNumber, pin } = req.body;
    const accounts = await readAccounts();
    const account = accounts.find(a => a.accountNumber === accountNumber && a.pin === pin);
    
    if (account) {
      const { pin: _, ...safeAccount } = account;
      res.json(safeAccount);
    } else {
      res.status(401).json({ error: "Invalid account number or PIN" });
    }
  });

  app.post("/api/accounts", async (req, res) => {
    const { holderName, pin, initialDeposit } = req.body;
    const accounts = await readAccounts();
    
    const newAccount: Account = {
      accountNumber: Math.floor(100000 + Math.random() * 900000).toString(),
      pin,
      holderName,
      balance: initialDeposit || 0,
      transactions: [{
        id: Math.random().toString(36).substr(2, 9),
        type: "deposit",
        amount: initialDeposit || 0,
        date: new Date().toISOString(),
        description: "Initial Deposit"
      }],
      createdAt: new Date().toISOString()
    };

    accounts.push(newAccount);
    await writeAccounts(accounts);
    
    const { pin: _, ...safeAccount } = newAccount;
    res.json(safeAccount);
  });

  app.post("/api/accounts/transaction", async (req, res) => {
    const { accountNumber, type, amount, description } = req.body;
    const accounts = await readAccounts();
    const accountIndex = accounts.findIndex(a => a.accountNumber === accountNumber);

    if (accountIndex === -1) {
      return res.status(404).json({ error: "Account not found" });
    }

    const account = accounts[accountIndex];

    if (type === "withdrawal" && account.balance < amount) {
      return res.status(400).json({ error: "Insufficient funds" });
    }

    const transaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      amount,
      date: new Date().toISOString(),
      description
    };

    account.balance = type === "deposit" ? account.balance + amount : account.balance - amount;
    account.transactions.unshift(transaction);

    await writeAccounts(accounts);
    const { pin: _, ...safeAccount } = account;
    res.json(safeAccount);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
