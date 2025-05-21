import OpenAI from 'openai';
import logger from './logger';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
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

// Get API key from environment or fail with helpful message
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  const errorMsg = "OpenAI API Key not found in environment variables. Please set OPENAI_API_KEY in .env file.";
  logger.error(errorMsg);
  throw new Error(errorMsg);
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: apiKey
});

interface TokenInfo {
  tokenName: string;
  tokenSymbol: string;
  amount: number;
  ownerAddress: string;
}

export async function extractTokenInfo(message: string): Promise<TokenInfo | null> {
  try {
    logger.info('Extracting token info from message using OpenAI');
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Extract the following information for token creation from the user message:
            - Token name
            - Token symbol (typically 3-4 characters)
            - Amount to mint
            - Owner address (Ethereum address format)
            
            Respond with a JSON object with these keys: tokenName, tokenSymbol, amount, ownerAddress.
            If any information is missing, use null for that field.`
        },
        {
          role: 'user',
          content: message
        }
      ],
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    
    if (!content) {
      logger.error('Empty response from OpenAI');
      return null;
    }

    const tokenInfo: TokenInfo = JSON.parse(content);
    logger.info(`Extracted token info: ${JSON.stringify(tokenInfo)}`);
    
    // Validate extracted information
    if (!tokenInfo.tokenName || !tokenInfo.tokenSymbol || !tokenInfo.amount || !tokenInfo.ownerAddress) {
      logger.warn('Some token information is missing');
    }
    
    return tokenInfo;
  } catch (error) {
    logger.error(`Error extracting token info: ${error}`);
    return null;
  }
}
