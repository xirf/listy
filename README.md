# Listy

Listy is a Telegram bot designed to help you easily track your financial expenses. By leveraging the Google Gemini API for image recognition, you can send photos of your receipts, and Listy will automatically log the details of your expenses.


> [!WARNING]
> This bot isn't production-ready yet. It's still in development and may contain bugs or incomplete features.

## Development Checklist

- [ ] Security enchancements
- [ ] Write unit tests for the bot.
- [ ] Write integration tests for the bot.
- [ ] Error handling
- [ ] Receipt parsing improvements
- [ ] Track recurring expenses
- [ ] Analytics and insights (PDF or Web)
- [ ] Multi-user support
- [ ] Dockerize the bot
- [ ] Code documentation

## Table of Contents

- [Listy](#listy)
  - [Development Checklist](#development-checklist)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Contribution](#contribution)
  - [License](#license)

## Features

- **Automatic Expense Logging:** Send a photo of your receipt, and Listy will extract details like the date, items, and total amount.
- **Budget Management:** Set a monthly budget and monitor your expenses to ensure you stay within your limits.
- **Expense Reports:** Get daily, weekly, or monthly expense summaries directly in Telegram.
- **Over-Budget Notifications:** Receive alerts if your expenses approach or exceed your set budget.

## Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/xirf/listy.git
   cd listy
   ```

2. **Install Dependencies:**
   This project uses [Bun](https://bun.sh/) as its JavaScript runtime, but you can use any other runtime like [Node.js](https://nodejs.org/).

   To install dependencies, run:

   ```bash
    bun install
    # or
    npm install
   ```

3. **Configure Environment Variables:**
   Copy the `.env.example` file to `.env` and update the environment variables with your Telegram bot token and Google Gemini API credentials.

4. **Run Database Migrations:**
   Ensure you have postgresql database running and create a database for the bot. Then run the following command to create the necessary tables:
   ```bash
   bun run kysely migrate
   ```

5. **Start the Bot:**
   To start the bot, run:
   ```bash
   bun run src/index.ts
   ```

## Usage

Once the bot is running, you can interact with Listy on Telegram using the following commands:

- `/start` - Start interacting with Listy.
- `/help` - Display the list of available commands.
- `/setlimit` - Set your monthly budget limit.
- `/cek` - Check your expenses (monthly or weekly).
- `/list` - View the list of logged expenses.
- `/total` - Display the total of all your expenses.
- `/reset` - Clear all logged expenses.

To log an expense, simply send a photo of your receipt, and Listy will process it automatically.

## Contribution

Contributions are welcome! You can open an issue or submit a pull request for bug fixes or new features. Please make sure to follow the contribution guidelines.

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for more details.
```
