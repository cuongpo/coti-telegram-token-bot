# Token Creation Telegram Bot

A Telegram bot that helps users create private tokens on the COTI network by processing natural language requests, extracting token information using OpenAI, and deploying tokens using your existing hardhat scripts.

## Features

- Natural language processing using OpenAI to extract token creation parameters
- Automated token deployment and minting
- Real-time status updates to users
- Easy-to-use Telegram interface

## Prerequisites

- Node.js 16+
- Telegram Bot Token (obtained from [@BotFather](https://t.me/BotFather))
- OpenAI API Key
- COTI network credentials (signing keys, user keys)

## Setup

1. Install dependencies:
   ```bash
   cd telegram-bot
   npm install
   ```

2. Copy the example environment file and fill in your details:
   ```bash
   cp .env.example .env
   ```

3. Edit the `.env` file with your:
   - Telegram bot token
   - OpenAI API key
   - COTI keys (these will be automatically copied from your main project's .env if available)

## Usage

1. Start the bot:
   ```bash
   npm start
   ```

2. Open Telegram and find your bot by the username you registered with BotFather

3. Send the bot a message with token creation details, for example:
   ```
   Create a GameCoin token with symbol GC, mint 50000 tokens to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e
   ```

4. The bot will:
   - Extract the token information
   - Confirm the details
   - Deploy the token contract
   - Mint the tokens
   - Send you confirmation with the contract address

## Commands

- `/start` - Introduction to the bot
- `/help` - Show available commands
- `/create` - Start the token creation process

## Development

For development mode with automatic restarts:
```bash
npm run dev
```

## Note on COTI Privacy Features

When working with the COTI privacy features:
- The bot interfaces with your existing deploy.ts and mint.ts scripts
- All privacy-related operations are handled by the underlying COTI SDK
- Token amounts are subject to uint64 size limitations
