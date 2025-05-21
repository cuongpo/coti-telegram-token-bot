# Private ERC20 Token on COTI

[![image](https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)](https://telegram.coti.io)
[![image](https://img.shields.io/badge/Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.coti.io)
[![image](https://img.shields.io/badge/X-000000?style=for-the-badge&logo=x&logoColor=white)](https://twitter.coti.io)
[![image](https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://youtube.coti.io)
[![image](https://img.shields.io/badge/Node%20js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/download/release/v18.20.5/)

This project implements a privacy-enabled ERC20 token on the COTI blockchain using Hardhat and TypeScript. It leverages COTI's privacy features through MPC (Multi-Party Computation) and includes a Telegram bot for token interaction.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
  - [Deploying the Contract](#deploying-the-contract)
  - [Minting Tokens](#minting-tokens)
  - [Running the Telegram Bot](#running-the-telegram-bot)
- [Testing](#testing)
- [Pushing to GitHub](#pushing-to-github)
- [Contributing](#contributing)
- [License](#license)

## Features

- Privacy-enabled ERC20 token implementation
- COTI blockchain integration
- Hardhat development environment
- TypeScript support
- Telegram bot for token interaction
- MPC-based privacy features

## Prerequisites

- [Node.js](https://nodejs.org/) v18.x.x
- Git
- GitHub account
- Basic knowledge of Solidity and TypeScript
- Basic understanding of COTI privacy features

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/token-creation.git
   cd token-creation
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment configuration:
   ```bash
   cp example.env .env
   ```

4. Configure your `.env` file with appropriate values.

## Configuration

Edit the `.env` file with your specific configuration:

```env
COTI_PRIVATE_KEY=your_private_key_here
```

## Usage

### Deploying the Contract

To deploy the PrivateERC20 token contract:

```bash
npx hardhat run scripts/deploy.ts
```

### Minting Tokens

To mint tokens to a specific address:

```bash
npx hardhat run scripts/mint.ts
```

### Running the Telegram Bot

Configure the Telegram bot in the `telegram-bot/.env` file, then:

```bash
cd telegram-bot
npm install
npm start
```

## Testing

Run tests using Hardhat:

```bash
npx hardhat test
```

## Pushing to GitHub

Follow these steps to push your code to GitHub:

1. **Create a new repository on GitHub**:
   - Go to [GitHub](https://github.com) and sign in
   - Click the "+" icon in the top right corner and select "New repository"
   - Name your repository (e.g., "private-erc20-token")
   - Add a description (optional)
   - Choose public or private visibility
   - Do NOT initialize with README, .gitignore, or license (we already have these)
   - Click "Create repository"

2. **Configure your local git repository**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

3. **Add the GitHub repository as a remote**:
   ```bash
   git remote add origin https://github.com/yourusername/your-repo-name.git
   ```

4. **Push your code to GitHub**:
   ```bash
   git push -u origin main
   ```
   Note: If your default branch is named "master" instead of "main", use:
   ```bash
   git push -u origin master
   ```

5. **Verify your repository on GitHub**:
   - Go to your GitHub profile
   - Navigate to the repository you just created
   - Ensure all files have been pushed correctly

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.

---

## COTI Documentation

For more information about COTI and its privacy features, visit the [COTI documentation](https://docs.coti.io/coti-v2-documentation/build-on-coti/tools/hardhat).

## Important Notes on COTI Privacy Features

When implementing COTI blockchain privacy features:

1. Avoid using `MpcCore.constant()` - use `MpcCore.from(uint64(value))` instead
2. Be aware of uint64 size limitations for privacy-enabled applications
3. When integrating with frontend applications, remember that the encrypted value format requires proper handling
4. The encryptValue method returns an object that needs additional formatting for the contract
5. For simplicity, start with basic functionality before implementing full privacy features