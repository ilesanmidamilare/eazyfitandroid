import axios from "axios";
import { useRouter } from "expo-router";
import {
  clearAllData,
  getAccessToken
} from "../storage/secure-store";

const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(async (config) => {
  if (config.authRequired !== false) {
    const token = await getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

apiClient.interceptors.response.use(
  (res) => {
    return res
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401) {
      const router = useRouter()
      await clearAllData()
      router.replace('/onboarding')
      // originalRequest._retry = true;

      // const refreshToken = await getRefreshToken();
      // if (!refreshToken) return Promise.reject(error);

      // try {
      // const res = await axios.post(
      //   `${process.env.EXPO_PUBLIC_API_URL}/token`,
      //   {
      //     refresh_token: refreshToken,
      //   }
      // );

      // const { access_token, refresh_token } = res.data;

      // await setAuthTokens(access_token, refresh_token);
      // apiClient.defaults.headers.Authorization = `Bearer ${access_token}`;

      // return apiClient(originalRequest);
      // } catch (err) {
      //   return Promise.reject(err);
      // }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
