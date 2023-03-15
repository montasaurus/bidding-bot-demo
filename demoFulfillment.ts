require("dotenv").config()

import { estimateFulfillOfferGas } from "./src/fulfillOffer"

async function main() {
  const offerHash = process.argv.at(2)
  if (offerHash === undefined) {
    console.error("Please provide an offer hash")
    return
  }
  const fulfillerAddress = process.argv.at(3) // optional
  const gasEstimate = await estimateFulfillOfferGas({
    offerHash,
    fulfillerAddress,
  })
  console.log("gas to fulfill: " + gasEstimate)
}

main().catch(error => console.error(error))
