import hre from "hardhat"
import { setupAccounts } from "./utils/accounts"
import { itString } from "@coti-io/coti-ethers"

const CONTRACT_ADDRESS = "0x2Bc8887b64aCbC224D03C4296e1c798954571Fbd"
async function main() {
    const [owner, otherAccount] = await setupAccounts()

    const PrivateTokenFactory = await hre.ethers.getContractAt("PrivateToken", CONTRACT_ADDRESS)

    
    const mintTx = await PrivateTokenFactory.connect(owner).mint("0x07d36857d6A48841193c131e735B24ADe93bDa37", 100000n);
    console.log("Transaction hash: ", mintTx.hash);
    console.log(await PrivateTokenFactory.totalSupply())
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})