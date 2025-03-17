import React from "react";
import { StyleSheet, View } from "react-native";
import ScreenHeader from "../components/ScreenHeader";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AppText from "../components/Text";
import AppButton from "../components/Button";
import IconButton from "../components/IconButton";
import colors from "../config/colors";

const ProfileScreen = () => {
  return (
    <>
      <ScreenHeader title="پروفایل" />
      <View style={styles.container}>
        <View>
          <View style={styles.avatarCircle}>
            <MaterialIcons name="person" size={100} color="#666666" />
          </View>
          <View style={{ marginVertical: 30 }}>
            <AppText style={styles.nameTtext}>خانم پوردایی</AppText>
            <AppText style={styles.roleText}>کارشناس فروش</AppText>
          </View>
        </View>
        <View style={{}}>
          <View style={styles.buttonContainer}>
            <IconButton
              text="تغییر رمز عبور"
              onPress={() => {}}
              style={{ width: "100%", marginTop: 60 }}
              iconName="key"
              backgroundColor={colors.primary}
              flex={0.5}
            />
          </View>
          <View style={styles.buttonContainer}>
            <IconButton
              text="خروج از حساب کاربری"
              iconName="logout"
              onPress={() => {}}
              backgroundColor={colors.danger}
              flex={0.5}
            />
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  avatarCircle: {
    width: 150,
    height: 150,
    borderRadius: "100%",
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginHorizontal: "auto",
  },
  nameTtext: {
    fontFamily: "Yekan_Bakh_Bold",
    fontSize: 30,
    textAlign: "center",
  },

  roleText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
  },
  divider: {
    backgroundColor: colors.gray,
    width: "100%",
    height: 1,
    flex: 0.4,
  },
});

export default ProfileScreen;
