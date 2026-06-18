import { AxiosError } from "axios";

export interface ApiErrorResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: unknown;
}

export const getErrorMessage = (
  error: unknown,
  fallback: string = "An unexpected error occurred"
): string => {
  if (error instanceof AxiosError) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      fallback
    );
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
};
