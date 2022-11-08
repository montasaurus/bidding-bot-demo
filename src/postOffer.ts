import { apiClient } from "./apiClient"

const getCriteria = (collectionSlug: string) => {
  return {
    collection: {
      slug: collectionSlug,
    },
  }
}

export const postOffer = async (
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
