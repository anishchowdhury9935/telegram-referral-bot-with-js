## 🤖 Telegram Referral Bot

A real-time Telegram bot designed to manage and track user referrals. This bot allows users to generate unique referral links, track the number of successful referrals, and automates the process of adding new users while providing incentives (e.g., a link to a main group).

---

### ✨ Key Features

* **🔗 Unique Referral Links:** Users can instantly generate a unique code and link using the `/create` command.
* **💾 MongoDB Persistence:** Stores referral codes, user usernames, and referral counts securely in a MongoDB database.
* **📈 Automatic Tracking:** Automatically increments the referral count for the referrer when a new, unreferred user clicks their link and starts the bot.
* **❌ Fraud Prevention:** Ensures a user cannot refer themselves and checks if a user has already been referred.
* **📊 User Statistics:** Users can check their referral count using `/check`.
* **👑 Admin Controls:** Includes an `/reset` command for the administrator to clear all referral data.

---

### ⚙️ Technology Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Language/Runtime** | **Node.js** | Core server-side environment. |
| **Bot Framework** | `node-telegram-bot-api` | Interacting with the Telegram Bot API. |
| **Database** | **MongoDB** & `mongodb` client | Persistent storage for referral data and user tracking. |
| **Configuration** | `dotenv` | Secure loading of environment variables (Tokens, IDs, etc.). |
| **Utilities** | `randomstring` | Generating unique, random referral codes. |

---

### 🚀 Getting Started

Follow these steps to set up and run the bot locally.

### 1. Prerequisites

* **Node.js** (LTS version recommended)
* **npm** or **yarn**
* A **MongoDB** instance (local or hosted, e.g., MongoDB Atlas).
* A **Telegram Bot Token** from BotFather.
* Your **Telegram User ID** (for admin privileges).

### 2. Installation

1.  **Clone the repository:**
    ```bash
    git clone [Your Repository URL]
    cd [Your-Repo-Name]
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

### 3. Environment Setup (`.env` file)

Create a file named **`.env`** in the root directory and add the following variables. These are essential for the bot to connect to Telegram and the database.

| Variable | Description | Source |
| :--- | :--- | :--- |
| `BOT_TOKEN` | The unique token provided by **BotFather** for your Telegram bot. | BotFather on Telegram |
| `MONGODB_CONNECTION_STRING` | The full URI for your MongoDB database (local or cloud). | MongoDB (Localhost or Atlas) |
| `ADMIN_ID` | Your personal Telegram User ID (numeric string) used to authorize the `/reset` command. | Telegram (Use a bot like `@userinfobot`) |

**Example `.env` Content:**

```env
# Telegram Bot Token from BotFather
BOT_TOKEN=1234567890:AAH_aAbBcCdDeEfFgGhHiIjJkKlL

# MongoDB Connection String (Update if using MongoDB Atlas)
MONGODB_CONNECTION_STRING=mongodb://127.0.0.1:27017/telegramReferralBot

# Your Telegram User ID
ADMIN_ID=9876543210
