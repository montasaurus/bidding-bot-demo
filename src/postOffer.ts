import { apiClient } from "./apiClient"
import { getNetwork } from "./network"
import { seaportContractAddress } from "./seaport"

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
    protocol_address: seaportContractAddress,
  }
  return await apiClient
    .post("v2/offers", payload)
    .then(response => {
      return response.data
    })
    .catch(function (error) {
      console.error(error.response.data)
    })
}

export const postItemOffer = async (offer: unknown, signature: string) => {
  const payload = {
    parameters: offer,
    signature,
    protocol_address: seaportContractAddress,
  }
  return await apiClient
    .post(`v2/orders/${network.chainName}/seaport/offers`, payload)
    .then(response => {
      return response.data
    })
    .catch(function (error) {
      console.error(error.response.data)
    })
}
