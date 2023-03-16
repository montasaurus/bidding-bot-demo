require("dotenv").config()

import { estimateFulfillOfferGas } from "./src/fulfillOffer"

async function main() {
  const offerHash = process.argv.at(2)
  if (offerHash === undefined) {
    console.error("Please provide an offer hash")
    return
  }
  const fulfillerAddress = process.argv.at(3)
  if (fulfillerAddress === undefined) {
    console.error("Please provide a fulfillerAddress")
    return
  }
  const assetContractAddress = process.argv.at(4) // optional
  const tokenId = process.argv.at(5) // optional

  let consideration
  if (assetContractAddress !== undefined && tokenId !== undefined) {
    consideration = {
      assetContractAddress,
      tokenId,
    }
  }
  const gasEstimate = await estimateFulfillOfferGas({
    offerHash,
    fulfillerAddress,
    consideration,
  })
  console.log("gas to fulfill: " + gasEstimate)
}

main().catch(error => console.error(error))
