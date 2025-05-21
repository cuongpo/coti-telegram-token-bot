import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';
import logger from './logger';

const execAsync = promisify(exec);

interface TokenDeployResult {
  success: boolean;
  contractAddress?: string;
  transactionHash?: string;
  error?: string;
}

interface TokenMintResult {
  success: boolean;
  totalSupply?: string;
  transactionHash?: string;
  error?: string;
}

export async function deployToken(name: string, symbol: string): Promise<TokenDeployResult> {
  try {
    logger.info(`Deploying token with name: ${name}, symbol: ${symbol}`);
    
    // First, modify deploy.ts to use the provided name and symbol and to log transaction hash
    const deployPath = path.resolve(process.cwd(), '..', 'scripts', 'deploy.ts');
    let deployContent = fs.readFileSync(deployPath, 'utf8');
    
    // Update the deploy script with the provided name and symbol
    deployContent = deployContent.replace(
      /.deploy\("PrivateToken", "PTOK"\)/,
      `.deploy("${name}", "${symbol}")`
    );
    
    // Add code to log transaction hash if not already present
    if (!deployContent.includes('transaction hash')) {
      const deployRegex = /await privateStorage\.waitForDeployment\(\)\s*\n/;
      const transactionLogCode = `
    const deployTx = await privateStorage.deploymentTransaction();
    console.log("Transaction hash: ", deployTx?.hash);
`;
      
      deployContent = deployContent.replace(
        deployRegex,
        (match) => match + transactionLogCode
      );
    }
    
    // Write the updated script
    fs.writeFileSync(deployPath, deployContent);
    
    // Run the deploy script
    const { stdout, stderr } = await execAsync('npx hardhat run ../scripts/deploy.ts');
    
    if (stderr) {
      logger.error(`Error deploying token: ${stderr}`);
      return { success: false, error: stderr };
    }
    
    // Extract contract address from stdout
    const addressMatch = stdout.match(/Contract address:\s+([0-9a-fA-Fx]+)/);
    if (!addressMatch || !addressMatch[1]) {
      return { success: false, error: 'Could not extract contract address from output' };
    }
    
    const contractAddress = addressMatch[1];
    logger.info(`Token deployed at address: ${contractAddress}`);
    
    // Extract transaction hash from stdout (if available)
    const txHashMatch = stdout.match(/Transaction hash:\s+([0-9a-fA-Fx]+)/) || 
                        stdout.match(/tx:\s+([0-9a-fA-Fx]+)/) || 
                        stdout.match(/hash:\s+([0-9a-fA-Fx]+)/);
    const transactionHash = txHashMatch ? txHashMatch[1] : undefined;
    
    if (transactionHash) {
      logger.info(`Deployment transaction hash: ${transactionHash}`);
    }
    
    // Save the contract address to be used by mint script
    updateMintScript(contractAddress);
    
    return { success: true, contractAddress, transactionHash };
  } catch (error: any) {
    logger.error(`Error in deployToken: ${error.message}`);
    return { success: false, error: error.message };
  }
}

export async function mintToken(amount: number, ownerAddress: string): Promise<TokenMintResult> {
  try {
    logger.info(`Minting ${amount} tokens to address: ${ownerAddress}`);
    
    // Modify mint.ts to use the provided amount and address
    const mintPath = path.resolve(process.cwd(), '..', 'scripts', 'mint.ts');
    let mintContent = fs.readFileSync(mintPath, 'utf8');
    
    // Update the mint script with the provided address and amount
    mintContent = mintContent.replace(
      /await PrivateTokenFactory\.connect\(owner\)\.mint\([^)]+\)/,
      `await PrivateTokenFactory.connect(owner).mint("${ownerAddress}", ${amount}n)`
    );
    
    // Add code to log transaction hash if not already present
    if (!mintContent.includes('transaction hash')) {
      const mintRegex = /await PrivateTokenFactory\.connect\(owner\)\.mint\([^)]+\)\s*\n/;
      const transactionLogCode = `
    const mintTx = await PrivateTokenFactory.connect(owner).mint("${ownerAddress}", ${amount}n);
    console.log("Transaction hash: ", mintTx.hash);
`;
      
      mintContent = mintContent.replace(
        mintRegex,
        transactionLogCode
      );
    }
    
    // Write the updated script
    fs.writeFileSync(mintPath, mintContent);
    
    // Run the mint script
    const { stdout, stderr } = await execAsync('npx hardhat run ../scripts/mint.ts');
    
    if (stderr) {
      logger.error(`Error minting tokens: ${stderr}`);
      return { success: false, error: stderr };
    }
    
    // Extract total supply from stdout (assuming the mint script logs total supply)
    const totalSupplyMatch = stdout.match(/(\d+)/);
    const totalSupply = totalSupplyMatch ? totalSupplyMatch[1] : 'unknown';
    
    // Extract transaction hash from stdout (if available)
    const txHashMatch = stdout.match(/Transaction hash:\s+([0-9a-fA-Fx]+)/) || 
                        stdout.match(/tx:\s+([0-9a-fA-Fx]+)/) || 
                        stdout.match(/hash:\s+([0-9a-fA-Fx]+)/);
    const transactionHash = txHashMatch ? txHashMatch[1] : undefined;
    
    if (transactionHash) {
      logger.info(`Minting transaction hash: ${transactionHash}`);
    }
    
    logger.info(`Minting successful, total supply: ${totalSupply}`);
    return { success: true, totalSupply, transactionHash };
  } catch (error: any) {
    logger.error(`Error in mintToken: ${error.message}`);
    return { success: false, error: error.message };
  }
}

function updateMintScript(contractAddress: string): void {
  try {
    const mintPath = path.resolve(process.cwd(), '..', 'scripts', 'mint.ts');
    let mintContent = fs.readFileSync(mintPath, 'utf8');
    
    // Update the contract address in mint.ts
    mintContent = mintContent.replace(
      /const CONTRACT_ADDRESS = "[0-9a-fA-Fx]+"/,
      `const CONTRACT_ADDRESS = "${contractAddress}"`
    );
    
    // Write the updated script
    fs.writeFileSync(mintPath, mintContent);
    logger.info(`Updated mint script with contract address: ${contractAddress}`);
  } catch (error: any) {
    logger.error(`Error updating mint script: ${error.message}`);
  }
}
