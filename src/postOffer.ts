import { apiClient } from "./apiClient"
import { getNetwork } from "./network"

const getCriteria = (collectionSlug: string) => {
  return {
    collection: {
      slug: collectionSlug,
    },
  }
}

const network = getNetwork()

export const postCriteriaOffer = async (
  collectionSlug: string,
  offer: unknown,
  signature: string,
) => {
  const payload = {
    criteria: getCriteria(collectionSlug),
    protocol_data: {
      parameters: offer,
      signature,
    },
  }
  const response = await apiClient.post("v2/offers", payload)

  return response.data
}

export const postItemOffer = async (offer: unknown, signature: string) => {
  const payload = {
    parameters: offer,
    signature,
  }
  const response = await apiClient.post(
    `v2/orders/${network.chainName}/seaport/offers`,
    payload,
  )

  return response.data
}
