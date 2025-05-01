import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import AppButton from "../components/Button";
import colors from "../config/colors";
import { LinearGradient } from "expo-linear-gradient";
import AppText from "../components/Text";
import BlurTextInput from "../components/BlurTextInput";
import { BlurView } from "expo-blur";
import Toast from "../components/Toast";
import axios, { AxiosError } from "axios";
import appConfig from "../../config";
import { ILoginResponse } from "../config/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./AuthContext";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";

export const getLoginResponse = async (): Promise<ILoginResponse | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem("loginResponse");
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error("Error retrieving login response:", error);
    return null;
  }
};

const LoginScreen = () => {
  const [userName, setUserName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const { login } = useAuth();
  const navigation = useNavigation();

  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<
    "success" | "error" | "warning" | "info"
  >("error");

  const showToast = (
    message: string,
    type: "success" | "error" | "warning" | "info" = "error"
  ) => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const validateForm = (): boolean => {
    if (userName === "") {
      showToast("نام کاربری وارد نشده است", "error");
      return false;
    }
    if (password === "") {
      showToast("رمز عبور وارد نشده است", "error");
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    Keyboard.dismiss();
    if (validateForm()) {
      setIsLoading(true);
      const loginInfo = {
        Username: userName,
        Password: password,
      };

      try {
        const response = await axios.post<ILoginResponse>(
          `${appConfig.mobileApi}Account/MobileAppLogin`,
          loginInfo
        );

        if (response.status === 200) {
          showToast("خوش آمدید!", "success");

          setTimeout(async () => {
            await login(response.data);
          }, 1000);
        }
      } catch (error) {
        const axiosError = error as AxiosError;
        console.log(axiosError);

        // نمایش پیام خطای مستقیم از بک‌اند
        if (axiosError.response?.data?.message) {
          showToast(axiosError.response.data.message, "error");
        } else {
          showToast("خطا در ارتباط با سرور", "error");
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient
          colors={[colors.secondary, colors.primary]}
          style={styles.container}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Toast
            visible={toastVisible}
            message={toastMessage}
            type={toastType}
            onDismiss={() => setToastVisible(false)}
          />

          <View style={styles.logoContainer}>
            <Image
              style={styles.logo}
              source={require("../../assets/logo-01.png")}
              resizeMode="contain"
            />
            <AppText style={styles.headerTitle}>ورود به حساب کاربری</AppText>
          </View>

          <View style={styles.formContainer}>
            <BlurView intensity={40} tint="default" style={styles.glassForm}>
              <BlurTextInput
                autoCapitalize="none"
                icon="person"
                autoCorrect={false}
                keyboardType="default"
                placeholder="نام کاربری را وارد کنید"
                value={userName}
                onChangeText={(val) => setUserName(val)}
                height={60}
                containerStyle={{ marginBottom: 25 }}
                label="نام کاربری"
                inputStyle={styles.inputText}
                textAlign="right"
                placeholderTextAlign="right"
              />

              <View style={styles.passwordContainer}>
                <BlurTextInput
                  autoCapitalize="none"
                  icon="vpn-key"
                  autoCorrect={false}
                  keyboardType="default"
                  placeholder="رمز عبور را وارد کنید"
                  value={password}
                  onChangeText={(val) => setPassword(val)}
                  height={60}
                  containerStyle={{ marginBottom: 25 }}
                  label="رمز عبور"
                  secureTextEntry={!showPassword}
                  inputStyle={styles.inputText}
                  textAlign="right"
                  placeholderTextAlign="right"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={togglePasswordVisibility}
                >
                  <MaterialIcons
                    name={showPassword ? "visibility" : "visibility-off"}
                    size={22}
                    color={colors.white}
                  />
                </TouchableOpacity>
              </View>

              {/* فضای خالی بین فیلدها و دکمه */}
              <View style={{ height: 20 }} />

              <View style={styles.buttonContainer}>
                <AppButton
                  title={isLoading ? "در حال ورود..." : "ورود"}
                  onPress={handleLogin}
                  color="white"
                  style={styles.loginButton}
                  textColor={colors.dark}
                  disabled={isLoading}
                />
              </View>
            </BlurView>
          </View>
        </LinearGradient>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 25,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
    width: "100%",
  },
  logo: {
    height: 150,
    width: 150,
    marginBottom: 10,
  },
  headerTitle: {
    color: colors.white,
    fontFamily: "Yekan_Bakh_Bold",
    fontSize: 32,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    position: "relative",
  },
  glassForm: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
    paddingTop: 25,
    paddingHorizontal: 25,
    paddingBottom: 0,
    backgroundColor: "rgba(55, 88, 133, 0.15)",
    overflow: "hidden",
    position: "relative",
    maxHeight: 700,
  },
  passwordContainer: {
    position: "relative",
  },
  eyeIcon: {
    position: "absolute",
    left: 15,
    top: 43,
    color: colors.white,
    padding: 5,
    zIndex: 10,
  },
  buttonContainer: {
    marginHorizontal: -25,
    marginBottom: -1,
  },
  loginButton: {
    height: 55,
    marginBottom: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    width: "100%",
  },
  inputText: {
    fontSize: 18,
    textAlign: "right",
  },
});

export default LoginScreen;
