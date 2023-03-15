require("dotenv").config()
import { buildCollectionOffer, buildItemOffer } from "./src/buildOffer"
import { getNetwork } from "./src/network"
import { postItemOffer, postCriteriaOffer } from "./src/postOffer"
import { signOffer } from "./src/signOffer"

const network = getNetwork()

async function main() {
  const collectionOffer = await buildCollectionOffer({
    collectionSlug: network.collectionSlug,
    quantity: 1,
    priceWei: BigInt("3130000000000000"),
    expirationSeconds: BigInt(901),
  })
  const collectionSignature = await signOffer(collectionOffer)
  const collectionResponse = await postCriteriaOffer(
    network.collectionSlug,
    collectionOffer,
    collectionSignature,
  )
  console.log(
    `Collection offer posted! Order Hash: ${collectionResponse.order_hash}`,
  )

  const itemOffer = await buildItemOffer({
    assetContractAddress: network.itemAssetContractAddress,
    tokenId: network.itemTokenIdentifier,
    quantity: 1,
    priceWei: BigInt("3130000000000000"),
    expirationSeconds: BigInt(901),
  })
  const itemSignature = await signOffer(itemOffer)
  const itemResponse = await postItemOffer(itemOffer, itemSignature)
  const itemOrderHash = itemResponse.order.order_hash
  console.log(`Item offer posted! Order Hash: ${itemOrderHash}`)
}

main().catch(error => console.error(error))
