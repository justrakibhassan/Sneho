import { useAuthContext } from "../context/auth-context";

// ✅ আমরা এখন সরাসরি Context থেকে ডাটা এবং ফাংশনগুলো এক্সপোর্ট করছি
export function useAuth() {
  const context = useAuthContext();

  return {
    user: context.user,
    isAuthenticated: context.isAuthenticated,
    isLoading: context.isLoading,
    login: context.login,
    logout: context.logout,
    refreshUser: context.refreshUser,
  };
}
