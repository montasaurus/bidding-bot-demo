require("dotenv").config()
import { buildItemListing } from "./src/buildListing"
import { getNetwork } from "./src/network"
import { postItemListing as postItemListing } from "./src/postListing"
import { signOffer as signListing } from "./src/signOffer"

const network = getNetwork()

async function main() {
  // Build and post an item listing (to sell)
  const itemListing = await buildItemListing({
    assetContractAddress: network.itemAssetContractAddress,
    tokenId: network.itemTokenIdentifier,
    priceWei: BigInt("110000000000000000"),
    expirationSeconds: BigInt(901),
  })
  const itemSignature = await signListing(itemListing)
  const itemResponse = await postItemListing(itemListing, itemSignature)
  const itemOrderHash = itemResponse.order.order_hash
  console.log(`Item listing posted! Order Hash: ${itemOrderHash}`)
}

main().catch(error => console.error(error))
