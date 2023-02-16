import axios from "axios"
import { getNetwork } from "./network"

const network = getNetwork()

export const apiClient = axios.create({
  baseURL: network.baseURL,
  headers: {
    "X-API-KEY": process.env.API_KEY,
  },
})
