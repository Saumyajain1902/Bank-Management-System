#include <iostream>
#include <fstream>
#include <string>
#include <iomanip>
#include <vector>

using namespace std;

// BankAccount class demonstrating OOP concepts
class BankAccount {
private:
    char accountNumber[20];
    char name[50];
    double balance;
    int pin;

public:
    // Method to initialize account data
    void createAccount() {
        cout << "\n--- New Account Registration ---" << endl;
        cout << "Enter Account Number: ";
        cin >> accountNumber;
        cout << "Enter Account Holder Name: ";
        cin.ignore();
        cin.getline(name, 50);
        cout << "Set a 4-Digit Security PIN: ";
        cin >> pin;
        cout << "Enter Initial Deposit (INR): ";
        cin >> balance;
        cout << "\nAccount Successfully Created!" << endl;
    }

    // Method to display account details (Balance Check)
    void displayAccount() const {
        cout << "\n----------------------------" << endl;
        cout << "Account Number : " << accountNumber << endl;
        cout << "Account Holder : " << name << endl;
        cout << "Current Balance: INR " << fixed << setprecision(2) << balance << endl;
        cout << "----------------------------" << endl;
    }

    // Deposit functionality
    void deposit(double amount) {
        if (amount > 0) {
            balance += amount;
            cout << "\nINR " << amount << " deposited successfully.";
        }
    }

    // Withdrawal functionality
    bool withdraw(double amount) {
        if (amount > balance) {
            cout << "\nInsufficient balance. Transaction failed.";
            return false;
        } else if (amount <= 0) {
            cout << "\nInvalid amount.";
            return false;
        } else {
            balance -= amount;
            cout << "\nINR " << amount << " withdrawn successfully.";
            return true;
        }
    }

    // Getter for account number
    string getAccountNumber() const {
        return string(accountNumber);
    }

    // PIN Authentication
    bool authenticate(int inputPin) const {
        return pin == inputPin;
    }
};

// File Handling Functions
void writeAccountToFile() {
    BankAccount ac;
    ac.createAccount();
    ofstream outFile("accounts.dat", ios::binary | ios::app);
    outFile.write(reinterpret_cast<const char*>(&ac), sizeof(BankAccount));
    outFile.close();
}

void balanceInquiry(string accNo) {
    BankAccount ac;
    ifstream inFile("accounts.dat", ios::binary);
    bool found = false;

    if (!inFile) {
        cout << "File could not be opened. Press any key...";
        return;
    }

    while (inFile.read(reinterpret_cast<char*>(&ac), sizeof(BankAccount))) {
        if (ac.getAccountNumber() == accNo) {
            ac.displayAccount();
            found = true;
        }
    }
    inFile.close();
    if (!found) cout << "\nAccount number does not exist.";
}

void updateBalance(string accNo, int action) {
    BankAccount ac;
    fstream file("accounts.dat", ios::binary | ios::in | ios::out);
    bool found = false;

    if (!file) {
        cout << "File could not be opened. Press any key...";
        return;
    }

    while (!file.eof() && found == false) {
        long long pos = file.tellg();
        if (file.read(reinterpret_cast<char*>(&ac), sizeof(BankAccount))) {
            if (ac.getAccountNumber() == accNo) {
                if (action == 1) { // Deposit
                    double amt;
                    cout << "\nEnter amount to Deposit: ";
                    cin >> amt;
                    ac.deposit(amt);
                } else if (action == 2) { // Withdraw
                    double amt;
                    cout << "\nEnter amount to Withdraw: ";
                    cin >> amt;
                    ac.withdraw(amt);
                }
                file.seekp(pos);
                file.write(reinterpret_cast<const char*>(&ac), sizeof(BankAccount));
                found = true;
            }
        }
    }
    file.close();
    if (!found) cout << "\nRecord Not Found.";
}

int main() {
    int choice;
    string accNo;

    do {
        cout << "\n\n\t       APEX BANK MANAGEMENT SYSTEM";
        cout << "\n\t==========================================";
        cout << "\n\t01. OPEN NEW ACCOUNT";
        cout << "\n\t02. DEPOSIT AMOUNT";
        cout << "\n\t03. WITHDRAW AMOUNT";
        cout << "\n\t04. BALANCE INQUIRY";
        cout << "\n\t05. EXIT";
        cout << "\n\t==========================================";
        cout << "\n\tSelect Your Option (1-5): ";
        cin >> choice;

        switch (choice) {
            case 1:
                writeAccountToFile();
                break;
            case 2:
                cout << "\n\tEnter Account No. : ";
                cin >> accNo;
                updateBalance(accNo, 1);
                break;
            case 3:
                cout << "\n\tEnter Account No. : ";
                cin >> accNo;
                updateBalance(accNo, 2);
                break;
            case 4:
                cout << "\n\tEnter Account No. : ";
                cin >> accNo;
                balanceInquiry(accNo);
                break;
            case 5:
                cout << "\n\tThank you for using Apex Bank!";
                break;
            default:
                cout << "\a";
        }
    } while (choice != 5);

    return 0;
}
