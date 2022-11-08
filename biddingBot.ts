require("dotenv").config()
import { buildOffer } from "./src/buildOffer"
import { postOffer } from "./src/postOffer"
import { signOffer } from "./src/signOffer"

const collectionSlug = "boredapeyachtclub-ehs3xmkzrw"
buildOffer({
  collectionSlug,
  quantity: 1,
  priceWei: BigInt("100000000000000"),
  creatorBasisPoints: BigInt(100),
  creatorFeeRecipient: "0xCFf0Ea7978D4b39138A693E82Ddd139c55D24810",
  expirationSeconds: BigInt(901),
})
  .then(async offer => {
    await delay(2000) // have to wait between requests because of API limits on testnets :(
    return { offer, signature: await signOffer(offer) }
  })
  .then(payload => postOffer(collectionSlug, payload.offer, payload.signature))
  .then(
    response => console.log(`Offer posted! Order Hash: ${response.order_hash}`),
    error => {
      console.error("request failed")
      console.error(JSON.stringify(error.response.data))
    },
  )

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
