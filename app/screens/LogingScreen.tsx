import React from "react";
import { StyleSheet, View } from "react-native";
import ScreenHeader from "../components/ScreenHeader";
import { InputContainer } from "./FieldMarketing/B2BFieldMarketer/AddNewShop";
import AppTextInput from "../components/TextInput";
import AppButton from "../components/Button";
import colors from "../config/colors";
import { LinearGradient } from "expo-linear-gradient";
import AppText from "../components/Text";
import BlurTextInput from "../components/BlurTextInput";

const LogingScreen = () => {
  return (
    <>
      {/* <ScreenHeader title="ورود به حساب کاربری" /> */}

      <LinearGradient
        colors={[colors.secondary, colors.primary]}
        style={styles.container}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
      >
        <View style={styles.headerTitleContainer}>
          <AppText style={styles.headerTitle}>ورود به حساب کاربری</AppText>
          <AppText style={styles.headerSubTitle}>به آراتایل خوش آمدید</AppText>
        </View>
        {/* <InputContainer title="ورود"> */}
        <BlurTextInput
          autoCapitalize="none"
          icon="person"
          autoCorrect={false}
          keyboardType="default"
          placeholder="نام کاربری"
          onChangeText={() => {}}
          height={60}
          containerStyle={{ marginBottom: 30 }}
        ></BlurTextInput>
        <BlurTextInput
          autoCapitalize="none"
          icon="vpn-key"
          autoCorrect={false}
          keyboardType="default"
          placeholder="رمز عبور"
          onChangeText={() => {}}
          height={60}
          containerStyle={{ marginBottom: 30 }}
        ></BlurTextInput>
        <AppButton
          title="ورود"
          onPress={() => {}}
          color="primary"
          style={{ height: 60 }}
        />
      </LinearGradient>

      {/* </InputContainer> */}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 35,
    justifyContent: "center",
  },
  headerTitle: {
    color: colors.white,
    fontFamily: "Yekan_Bakh_Bold",
    fontSize: 35,
    textAlign: "center",
  },
  headerTitleContainer: { marginBottom: 90, marginHorizontal: "auto", gap: 20 },
  headerSubTitle: {
    color: colors.white,
    fontSize: 18,
    textAlign: "center",
  },
});

export default LogingScreen;
