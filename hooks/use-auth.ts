import { useUserContext } from "@/contexts/UserContext";
import {
  changePasswordApi,
  connectAuthProviderApi,
  forgotPasswordApi,
  getCurrentUser,
  loginUserApi,
  registerUserApi,
  resendVerifyEmailOtpApi,
  resetPasswordApi,
  setDeviceTokenApi,
  updateUserProfileApi,
  verifyEmailApi,
  verifyPinApi
} from "@/lib/api/auth";
import { getDeviceToken, setAuthTokens } from "@/lib/storage/secure-store";
import { LoginPayload, RegisterPayload } from "@/types/auth.types";
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { AxiosError } from "axios";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

// Export the hooks from UserContext for backward compatibility
export { useCurrentUser, useUser } from "@/contexts/UserContext";

// login function
export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { updateUser } = useUserContext();

  const loginUser = async (payload: LoginPayload) => {
    try {
      setIsLoading(true);

      const { access_token, refresh_token } = await loginUserApi(payload);

      // set auth token
      await setAuthTokens(access_token, refresh_token);

      // Get and store user profile
      const currentUser = await getCurrentUser();

      // Update user context (this will update all components)
      await updateUser(currentUser);

      // set the device token
      const expoPushToken = await getDeviceToken()
      if (expoPushToken) {
        await setDeviceTokenApi({ device_token: expoPushToken });
      }

      return { success: true, user: currentUser };
    } catch (err) {
      if (err instanceof AxiosError) {
        const { response } = err;
        const errorMessage = response?.data?.error || "Sign in failed";
        return { success: false, error: errorMessage };
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { loginUser, isLoading };
};

// register function
export const useRegister = () => {
  const [isLoading, setIsLoading] = useState(false);

  const registerUser = async (payload: RegisterPayload) => {
    try {
      setIsLoading(true);

      const res = await registerUserApi(payload);

      return { success: true, data: res };
    } catch (err) {
      if (err instanceof AxiosError) {
        const { response } = err;
        const errorMessage = response?.data?.error || "Sign up failed";
        return { success: false, error: errorMessage };
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { registerUser, isLoading };
};

// logout function
export const useLogout = () => {
  const { logout } = useUserContext();
  return { logout };
};

export const useForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);

  const forgotPassword = async (email: string) => {
    try {
      setIsLoading(true);

      const response = await forgotPasswordApi({ email });

      return { success: true, message: response.message };
    } catch (err) {
      if (err instanceof AxiosError) {
        const { response } = err;
        const errorMessage = response?.data?.error || "Password reset failed";
        return { success: false, error: errorMessage };
      }
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPin = async (email: string, code: string) => {
    try {
      setIsLoading(true);

      const response = await verifyPinApi({ email, code });

      return { success: true, message: response.message };
    } catch (err) {
      if (err instanceof AxiosError) {
        const { response } = err;
        const errorMessage = response?.data?.error || "Pin verification failed";
        return { success: false, error: errorMessage };
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (
    email: string,
    code: string,
    new_password: string
  ) => {
    try {
      setIsLoading(true);

      const response = await resetPasswordApi({ email, code, new_password });

      return { success: true, message: response.message };
    } catch (err) {
      if (err instanceof AxiosError) {
        const { response } = err;
        const errorMessage = response?.data?.error || "Password reset failed";
        return { success: false, error: errorMessage };
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, forgotPassword, verifyPin, resetPassword };
};

// update profile function
export const useUpdateProfile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { updateUser } = useUserContext();

  const updateProfile = async (payload: FormData) => {
    try {
      setIsLoading(true);

      await updateUserProfileApi(payload);

      // Get updated user profile and update context
      const updatedUser = await getCurrentUser();
      await updateUser(updatedUser);

      return { success: true, user: updatedUser };
    } catch (err) {
      if (err instanceof AxiosError) {
        const { response } = err;
        const errorMessage = response?.data?.error || "Profile update failed";
        return { success: false, error: errorMessage };
      }
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (payload: {
    old_password: string;
    new_password: string;
  }) => {
    try {
      setIsLoading(true);

      const response = await changePasswordApi(payload);

      return { success: true, message: response.message };
    } catch (err) {
      if (err instanceof AxiosError) {
        const { response } = err;
        const errorMessage = response?.data?.error || "Password change failed";
        return { success: false, error: errorMessage };
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { updateProfile, changePassword, isLoading };
};

export const useConnectAuthProvider = () => {
  const [isLoading, setIsLoading] = useState(false);

  const connectAuthProvider = async (payload: {
    provider: string;
    user_type: "customer" | "stylist";
    access_token: string;
  }) => {
    try {
      setIsLoading(true);
      const response = await connectAuthProviderApi(payload);
      const { access_token, refresh_token } = response
      await setAuthTokens(access_token, refresh_token)

      return { success: true, message: response.message };
    } catch (err) {
      if (err instanceof AxiosError) {
        const { response } = err;
        const errorMessage = response?.data?.error || "Connection failed";
        return { success: false, error: errorMessage };
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { connectAuthProvider, isLoading };
};

// google sign-in hook
export const useGoogleSignIn = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { connectAuthProvider } = useConnectAuthProvider();
  const { updateUser } = useUserContext();
  const router = useRouter();

  const handleGoogleSignIn = async (user_type: "customer" | "stylist") => {
    try {
      setIsLoading(true);
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (isSuccessResponse(response)) {
        const { idToken } = response.data;
        if (!idToken) {
          Alert.alert("Sign In Failed", "No idToken received from Google.");
          setIsLoading(false);
          return;
        }

        const connectResult = await connectAuthProvider({
          provider: "google",
          user_type,
          access_token: idToken,
        });

        if (connectResult && connectResult.success) {
          // Get and store user profile after successful connection
          const updatedUser = await getCurrentUser();
          await updateUser(updatedUser);

          if (updatedUser?.user_type === "customer") {
            router.replace("/customer/home");
          } else if (updatedUser?.user_type === "stylist") {
            router.replace("/stylist/home");
          }
        }
      } else {
        Alert.alert("Sign In Cancelled", "Google Signin was cancelled.");
      }
      setIsLoading(false);
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            Alert.alert(
              "Sign In Cancelled",
              "User cancelled the sign-in flow."
            );
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            Alert.alert(
              "Play Services Not Available",
              "Google Play Services are not available on this device."
            );
            break;
          default:
            Alert.alert("Sign In Failed", error.code);
        }
      } else {
        Alert.alert(
          "Sign In Failed",
          "An unexpected error occurred. Please try again."
        );
      }
      setIsLoading(false);
    }
  };

  return { handleGoogleSignIn, isLoading };
};

export const useEmailVerification = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isResendLoading, setIsResendLoading] = useState(false);
  const { updateUser } = useUserContext();

  const verifyEmail = async (verification_id: string, code: string) => {
    const payload = {
      verification_id,
      code,
      type: "verification"
    }

    try {
      setIsLoading(true);
      const response = await verifyEmailApi(payload);

      // Add a bit delay before fetching user data
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (response) {
        const updatedUser = await getCurrentUser();
        await updateUser(updatedUser);

        return { success: true, message: response };
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        const { response } = err;
        const errorMessage = response?.data?.error || "Password change failed";
        return { success: false, error: errorMessage };
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerifyEmailOtp = async (email: string) => {
    try {
      setIsResendLoading(true);
      const response = await resendVerifyEmailOtpApi(email);

      return { success: true, data: response };
    } catch (err) {
      if (err instanceof AxiosError) {
        const { response } = err;
        const errorMessage = response?.data?.error || "Resend OTP failed";
        return { success: false, error: errorMessage };
      }
    } finally {
      setIsResendLoading(false);
    }
  };

  return { verifyEmail, resendVerifyEmailOtp, isLoading, isResendLoading };
}