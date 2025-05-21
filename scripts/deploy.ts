import hre from "hardhat"
import { setupAccounts } from "./utils/accounts"

async function main() {
    const [owner, otherAccount] = await setupAccounts()

    const PrivateStorageFactory = await hre.ethers.getContractFactory("PrivateToken")

    const privateStorage = await PrivateStorageFactory
        .connect(owner)
        .deploy("GameToken", "GTK")
    
    await privateStorage.waitForDeployment()


    const deployTx = await privateStorage.deploymentTransaction();
    console.log("Transaction hash: ", deployTx?.hash);
    console.log("Contract address: ", await privateStorage.getAddress())
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})