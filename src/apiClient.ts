import axios from "axios"
import axiosRetry from "axios-retry"
import { getNetwork } from "./network"

const network = getNetwork()

const headers = network.apiKey ? { "X-API-KEY": network.apiKey } : {}

const client = axios.create({
  baseURL: network.baseURL,
  headers,
})

axiosRetry(client, {
  retryCondition: (error: any) => {
    return error.response && error.response.status === 429
  },
  retryDelay: (retryCount: number, error: any) => {
    if (error.response && error.response.headers["retry-after"]) {
      return parseInt(error.response.headers["retry-after"]) * 1000
    }
    return retryCount * 1000
  },
})

export const apiClient = client
