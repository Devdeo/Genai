import axios, { AxiosInstance } from "axios";

export function createUpstoxClient(accessToken: string): AxiosInstance {
  return axios.create({
    baseURL: "https://api.upstox.com/v2",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
}
