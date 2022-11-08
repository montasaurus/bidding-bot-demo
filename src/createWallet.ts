import crypto from "crypto"
import { Wallet } from "ethers"

const id = crypto.randomBytes(32).toString("hex")
const privateKey = "0x" + id
console.log("SAVE BUT DO NOT SHARE THIS:", privateKey)

const wallet = new Wallet(privateKey)
console.log("Address: " + wallet.address)
console.log(
  "Add the above address to your .env file as WALLET_PRIVATE_KEY. e.g.",
)
console.log("WALLET_PRIVATE_KEY=" + privateKey)
