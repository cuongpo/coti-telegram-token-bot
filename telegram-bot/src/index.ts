import { Telegraf, session, Scenes } from 'telegraf';
import dotenv from 'dotenv';
import logger from './services/logger';
import { extractTokenInfo } from './services/openai';
import { deployToken, mintToken } from './services/token';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables from both the telegram-bot directory and parent directory
const envPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '..', '.env')
];

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    logger.info(`Loaded environment variables from ${envPath}`);
  }
}

// Initialize bot
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || '');

// Session middleware
bot.use(session());

// Set up commands
bot.command('start', async (ctx) => {
  await ctx.reply(
    'Welcome to the Private Token Creation Bot! 🚀\n\n' +
    'I can help you create private tokens on COTI network.\n\n' +
    'To create a token, simply send me a message with the following information:\n' +
    '- Token name\n' +
    '- Token symbol (3-4 characters)\n' +
    '- Amount to mint\n' +
    '- Owner address\n\n' +
    'For example: "Create a GameToken with symbol GTK, mint 100000 tokens to 0xABC123..."'
  );
});

bot.command('help', async (ctx) => {
  await ctx.reply(
    'Here are the commands you can use:\n\n' +
    '/start - Start the bot and get welcome information\n' +
    '/help - Show this help message\n' +
    '/create - Start token creation wizard\n\n' +
    'You can also simply send a message with all the token details.'
  );
});

// Token creation wizard
bot.command('create', async (ctx) => {
  await ctx.reply('Please send me the token details in the following format:\n\n' +
    'Token Name: [name]\n' +
    'Token Symbol: [symbol]\n' +
    'Amount: [amount]\n' +
    'Owner Address: [address]');
});

// Handle incoming messages
bot.on('text', async (ctx) => {
  // Skip commands
  if (ctx.message.text.startsWith('/')) return;
  
  const statusMsg = await ctx.reply('⏳ Processing your request...');

  try {
    // Extract token info using OpenAI
    await ctx.telegram.editMessageText(
      ctx.chat.id, 
      statusMsg.message_id, 
      undefined, 
      '🧠 Analyzing your message using AI...'
    );
    
    const tokenInfo = await extractTokenInfo(ctx.message.text);
    
    if (!tokenInfo) {
      await ctx.telegram.editMessageText(
        ctx.chat.id, 
        statusMsg.message_id, 
        undefined, 
        '❌ Failed to extract token information from your message.\n\n' +
        'Please provide the token name, symbol, amount, and owner address.'
      );
      return;
    }
    
    // Check if all necessary info is provided
    const missingFields = [];
    if (!tokenInfo.tokenName) missingFields.push('Token Name');
    if (!tokenInfo.tokenSymbol) missingFields.push('Token Symbol');
    if (!tokenInfo.amount) missingFields.push('Amount');
    if (!tokenInfo.ownerAddress) missingFields.push('Owner Address');
    
    if (missingFields.length > 0) {
      await ctx.telegram.editMessageText(
        ctx.chat.id, 
        statusMsg.message_id, 
        undefined, 
        `❌ Missing information: ${missingFields.join(', ')}.\n\nPlease provide all required details.`
      );
      return;
    }
    
    // Confirm with user
    await ctx.telegram.editMessageText(
      ctx.chat.id, 
      statusMsg.message_id, 
      undefined, 
      `📋 Token Request:\n\n` +
      `Name: ${tokenInfo.tokenName}\n` +
      `Symbol: ${tokenInfo.tokenSymbol}\n` +
      `Amount: ${tokenInfo.amount}\n` +
      `Owner: ${tokenInfo.ownerAddress}\n\n` +
      `⏳ Deploying token contract...`
    );
    
    // Deploy token
    const deployResult = await deployToken(tokenInfo.tokenName, tokenInfo.tokenSymbol);
    
    if (!deployResult.success) {
      await ctx.telegram.editMessageText(
        ctx.chat.id, 
        statusMsg.message_id, 
        undefined, 
        `❌ Failed to deploy token contract:\n${deployResult.error}`
      );
      return;
    }
    
    await ctx.telegram.editMessageText(
      ctx.chat.id, 
      statusMsg.message_id, 
      undefined, 
      `✅ Token deployed successfully!\n` +
      `Contract address: ${deployResult.contractAddress}\n` +
      `${deployResult.transactionHash ? `Transaction: https://testnet.cotiscan.io/tx/${deployResult.transactionHash}\n` : ''}\n` +
      `⏳ Minting ${tokenInfo.amount} tokens to ${tokenInfo.ownerAddress}...`
    );
    
    // Mint tokens
    const mintResult = await mintToken(tokenInfo.amount, tokenInfo.ownerAddress);
    
    if (!mintResult.success) {
      await ctx.telegram.editMessageText(
        ctx.chat.id, 
        statusMsg.message_id, 
        undefined, 
        `✅ Token deployed but minting failed:\n${mintResult.error}\n\n` +
        `Contract address: ${deployResult.contractAddress}\n` +
        `${deployResult.transactionHash ? `Deployment transaction: https://testnet.cotiscan.io/tx/${deployResult.transactionHash}\n` : ''}` +
        `${mintResult.transactionHash ? `Minting transaction: https://testnet.cotiscan.io/tx/${mintResult.transactionHash}\n` : ''}`
      );
      return;
    }
    
    // Final success message
    await ctx.telegram.editMessageText(
      ctx.chat.id, 
      statusMsg.message_id, 
      undefined, 
      `✅ Success! Your private token has been created!\n\n` +
      `📋 Token Details:\n` +
      `Name: ${tokenInfo.tokenName}\n` +
      `Symbol: ${tokenInfo.tokenSymbol}\n` +
      `Contract: ${deployResult.contractAddress}\n` +
      `Contract Explorer: https://testnet.cotiscan.io/address/${deployResult.contractAddress}\n` +
      `Total Supply: ${mintResult.totalSupply || tokenInfo.amount}\n\n` +
      `Tokens have been minted to: ${tokenInfo.ownerAddress}\n\n` +
      `${deployResult.transactionHash ? `Deployment TX: https://testnet.cotiscan.io/tx/${deployResult.transactionHash}\n` : ''}` +
      `${mintResult.transactionHash ? `Minting TX: https://testnet.cotiscan.io/tx/${mintResult.transactionHash}\n` : ''}`
    );
    
  } catch (error: any) {
    logger.error(`Error processing message: ${error.message}`);
    await ctx.telegram.editMessageText(
      ctx.chat.id, 
      statusMsg.message_id, 
      undefined, 
      `❌ An error occurred while processing your request:\n${error.message}`
    );
  }
});

// Error handling
bot.catch((err, ctx) => {
  logger.error(`Error for ${ctx.updateType}: ${err}`);
  ctx.reply('An error occurred while processing your request. Please try again later.');
});

// Start bot
(async () => {
  try {
    // Make sure environment variables are set up properly
    await ensureEnvSetup();
    
    await bot.launch();
    logger.info('Bot started successfully');
    console.log('Token Creation Bot is running!');
  } catch (error: any) {
    logger.error(`Failed to start bot: ${error.message}`);
    console.error('Error starting bot:', error);
  }
})();

// Handle shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

// Ensure environment variables are set up
async function ensureEnvSetup(): Promise<void> {
  // Check for required environment variables
  const requiredEnvVars = [
    'TELEGRAM_BOT_TOKEN',
    'OPENAI_API_KEY'
  ];
  
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  }
  
  // Copy the COTI environment variables from the main project if they don't exist
  const cotiEnvVars = ['SIGNING_KEYS', 'USER_KEYS', 'PUBLIC_KEYS'];
  const mainEnvPath = path.resolve(process.cwd(), '..', '.env');
  
  if (fs.existsSync(mainEnvPath)) {
    const mainEnvContent = fs.readFileSync(mainEnvPath, 'utf8');
    
    for (const envVar of cotiEnvVars) {
      if (!process.env[envVar]) {
        const match = mainEnvContent.match(new RegExp(`${envVar}=(.+)`));
        if (match && match[1]) {
          process.env[envVar] = match[1];
          logger.info(`Copied ${envVar} from main project .env file`);
        }
      }
    }
  }
}
