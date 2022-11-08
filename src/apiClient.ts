import axios from "axios"

export const apiClient = axios.create({
  baseURL: "https://testnets-api.opensea.io/api/",
})
