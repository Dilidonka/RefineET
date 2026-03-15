import type { AuthProvider } from "@refinedev/core";
import axiosInstance from "./axiosInstance";

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    try {
      const { data } = await axiosInstance.post("/auth/login", {
        email,
        password,
      });
      localStorage.setItem("auth_token", data.token);
      return { success: true, redirectTo: "/" };
    } catch {
      return {
        success: false,
        error: { name: "Login Error", message: "Invalid credentials" },
      };
    }
  },

  logout: async () => {
    localStorage.removeItem("auth_token");
    return { success: true, redirectTo: "/login" };
  },

  check: async () => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      return { authenticated: true };
    }
    return { authenticated: false, redirectTo: "/login" };
  },

  getPermissions: async () => null,

  getIdentity: async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) return null;
    try {
      const { data } = await axiosInstance.get("/auth/me");
      return data;
    } catch {
      return null;
    }
  },

  onError: async (error) => {
    if (error.statusCode === 401) {
      return { logout: true, redirectTo: "/login" };
    }
    return { error };
  },
};
