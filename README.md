# COTI Telegram Token Bot

[![image](https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)](https://telegram.coti.io)
[![image](https://img.shields.io/badge/Node%20js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/download/release/v18.20.5/)

A privacy-enabled ERC20 token on COTI blockchain with Telegram bot integration for token interaction. This project uses Hardhat, TypeScript, and COTI's MPC (Multi-Party Computation) privacy features.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start Guide](#quick-start-guide)
  - [Step 0: Configure Environment](#step-0-configure-environment)
  - [Step 1: Deploy Contract](#step-1-deploy-contract)
  - [Step 2: Mint Tokens](#step-2-mint-tokens)
  - [Step 3: Configure Contract in Telegram Bot](#step-3-configure-contract-in-telegram-bot)
  - [Step 4: Run Telegram Bot](#step-4-run-telegram-bot)

## Overview

This project provides a complete implementation of a private token on COTI blockchain with a user-friendly Telegram bot interface. The bot allows users to interact with the token without needing technical knowledge.

## Prerequisites

- [Node.js](https://nodejs.org/) v18.x.x
- Telegram account and bot token from [BotFather](https://t.me/botfather)
- Basic knowledge of TypeScript and Solidity
- COTI network credentials

## Quick Start Guide

### Step 0: Configure Environment

1. Clone the repository and install dependencies:
   ```bash
   git clone https://github.com/cuongpo/coti-telegram-token-bot.git
   cd coti-telegram-token-bot
   npm install
   ```

2. Create and configure your main environment file:
   ```bash
   cp env.example .env
   ```

3. Open `.env` in your editor and add your COTI network credentials:
   ```
   PUBLIC_KEYS=your_public_key
   SIGNING_KEYS=your_signing_key
   USER_KEYS=your_user_key
   ```

### Step 1: Deploy Contract

1. Run the deployment script to deploy your PrivateERC20 token to COTI blockchain:
   ```bash
   npx hardhat run scripts/deploy.ts
   ```

2. Note the contract address displayed in the console after successful deployment.

### Step 2: Mint Tokens

1. Mint tokens to your desired address:
   ```bash
   npx hardhat run scripts/mint.ts
   ```

2. The script will output the transaction details and balance after minting.

### Step 3: Configure Telegram Bot Token

1. Add your Telegram Bot Token to the root `.env` file:
   ```
   # Add this to your root .env file
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   ```

2. The contract address is automatically configured in the bot's service file when you deploy the contract in Step 1.

### Step 4: Run Telegram Bot

1. Navigate to the bot directory and install dependencies:
   ```bash
   cd telegram-bot
   npm install
   ```

2. Start the bot:
   ```bash
   npm start
   ```

3. Open Telegram and interact with your bot to manage your private tokens.

## Privacy Features

This implementation uses COTI's privacy features through MPC. Important considerations:

- Uses `uint64` type for token amounts due to privacy implementation constraints
- The token implements standard ERC20 interface with added privacy features
- Token operations are encrypted using MPC technology

## License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.

## Additional Resources

For more information about COTI and its privacy features, visit the [COTI documentation](https://docs.coti.io/coti-v2-documentation/build-on-coti/tools/hardhat).