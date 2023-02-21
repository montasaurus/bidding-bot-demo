require("dotenv").config()
import { buildCollectionOffer, buildItemOffer } from "./src/buildOffer"
import { postItemOffer, postCriteriaOffer } from "./src/postOffer"
import { signOffer } from "./src/signOffer"

const collectionSlug = "boredapeyachtclub-ehs3xmkzrw"
buildCollectionOffer({
  collectionSlug,
  quantity: 1,
  priceWei: BigInt("3130000000000000"),
  expirationSeconds: BigInt(901),
})
  .then(async offer => {
    return { offer, signature: await signOffer(offer) }
  })
  .then(payload =>
    postCriteriaOffer(collectionSlug, payload.offer, payload.signature),
  )
  .then(
    response =>
      console.log(
        `Collection offer posted! Order Hash: ${response.order_hash}`,
      ),
    error => {
      console.error("request failed " + error)
      console.error(JSON.stringify(error.response.data))
    },
  )
  .then(() =>
    buildItemOffer({
      assetContractAddress: "0xd0a21d074efc3393853accd481160a070a20cf32",
      tokenId: "143",
      quantity: 1,
      priceWei: BigInt("3130000000000000"),
      expirationSeconds: BigInt(901),
    }),
  )
  .then(async offer => {
    return { offer, signature: await signOffer(offer) }
  })
  .then(payload => postItemOffer(payload.offer, payload.signature))
  .then(
    response =>
      console.log(
        `Item offer posted! Order Hash: ${response.order.order_hash}`,
      ),
    error => {
      console.error("request failed " + error)
      console.error(JSON.stringify(error.response.data))
    },
  )
