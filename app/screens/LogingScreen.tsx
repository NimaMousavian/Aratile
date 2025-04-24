import React, { useState } from "react";
import { StyleSheet, View, Image } from "react-native";
import ScreenHeader from "../components/ScreenHeader";
import AppTextInput from "../components/TextInput";
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

export const getLoginResponse = async (): Promise<ILoginResponse | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem("loginResponse");
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error("Error retrieving login response:", error);
    return null;
  }
};

const LogingScreen = () => {
  const [userName, setUserName] = useState<string>("");
  const [password, setPassword] = useState<string>("");

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
    if (validateForm()) {
      const loginInfo = {
        Username: userName,
        Password: password,
      };

      try {
        const response = await axios.post<ILoginResponse>(
          `${appConfig.mobileApi}Account/login`,
          loginInfo
        );
        console.log(response.data);

        if (response.status === 200) {
          console.log("login successfuly");
          storeLoginResponse(response.data);
        }
      } catch (error) {
        const axiosError = error as AxiosError;
        console.log(axiosError);

        showToast("خطا در ورود، لطفا دوباره سعی کنید", "error");
      }
    }
    console.log(userName, password);
  };

  const storeLoginResponse = async (loginResponse: ILoginResponse) => {
    try {
      await AsyncStorage.setItem(
        "loginResponse",
        JSON.stringify(loginResponse)
      );
      console.log("Login response stored successfully");
    } catch (error) {
      console.error("Error storing login response:", error);
    }
  };

  return (
    <>
      {/* <ScreenHeader title="ورود به حساب کاربری" /> */}

      <View
        // colors={[colors.secondary, colors.primary]}
        style={styles.container}
        // start={{ x: 0, y: 1 }}
        // end={{ x: 0, y: 0 }}
      >
        <Toast
          visible={toastVisible}
          message={toastMessage}
          type={toastType}
          onDismiss={() => setToastVisible(false)}
        />
        {/* <LinearGradient
          colors={[colors.secondary, colors.primary]}
          style={styles.sunCircle}
        /> */}
        <View
          style={{
            borderRadius: 15,
            overflow: "hidden",
            borderBottomEndRadius: 0,
            borderBottomStartRadius: 0,
          }}
        >
          <BlurView intensity={30} tint="default" style={styles.insideBox}>
            <View style={styles.headerTitleContainer}>
              <Image
                style={styles.logo}
                source={require("../../assets/logo-01.png")}
              />
              <AppText style={styles.headerTitle}>ورود به حساب کاربری</AppText>
              {/* <AppText style={styles.headerSubTitle}>به آراتایل خوش آمدید</AppText> */}
            </View>
            {/* <InputContainer title="ورود"> */}
            <BlurTextInput
              autoCapitalize="none"
              icon="person"
              autoCorrect={false}
              keyboardType="default"
              placeholder="نام کاربری را وارد کنید"
              value={userName}
              onChangeText={(val) => setUserName(val)}
              height={60}
              containerStyle={{ marginBottom: 30 }}
              label="نام کاربری"
            ></BlurTextInput>
            <BlurTextInput
              autoCapitalize="none"
              icon="vpn-key"
              autoCorrect={false}
              keyboardType="default"
              placeholder="رمز عبور را وارد کنید"
              value={password}
              onChangeText={(val) => setPassword(val)}
              height={60}
              containerStyle={{ marginBottom: 30 }}
              label="رمز عبور"
            ></BlurTextInput>
          </BlurView>
        </View>
        <AppButton
          title="ورود"
          onPress={handleLogin}
          color="white"
          style={{
            height: 60,
            marginTop: 0,
            borderTopEndRadius: 0,
            borderTopStartRadius: 0,
          }}
          textColor={colors.dark}
        />
      </View>

      {/* </InputContainer> */}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 35,
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  headerTitle: {
    color: colors.white,
    fontFamily: "Yekan_Bakh_Bold",
    fontSize: 35,
    textAlign: "center",
  },
  headerTitleContainer: {
    marginBottom: 70,
    marginHorizontal: "auto",
    gap: 10,
    justifyContent: "center",
    alignContent: "center",
    flexDirection: "column",
  },
  headerSubTitle: {
    color: colors.white,
    fontSize: 18,
    textAlign: "center",
  },
  logo: {
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: "auto",
  },
  insideBox: {
    padding: 20,
    borderWidth: 0.5,
    borderColor: colors.medium,
    borderRadius: 15,
    borderBottomEndRadius: 0,
    borderBottomStartRadius: 0,
  },
  sunCircle: {
    width: 100,
    height: 100,
    backgroundColor: colors.secondary,
    borderRadius: 100,
    position: "absolute",
    top: 140,
    left: 0,
  },
});

export default LogingScreen;
