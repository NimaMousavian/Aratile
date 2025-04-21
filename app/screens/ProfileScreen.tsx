import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import ScreenHeader from "../components/ScreenHeader";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AppText from "../components/Text";
import AppButton from "../components/Button";
import IconButton from "../components/IconButton";
import colors from "../config/colors";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppNavigationProp } from "../StackNavigator";

// Define your RootStackParamList type
type RootStackParamList = {
  Profile: undefined;
  ChangePassword: undefined;
  // Add other screens here as needed
};

// Create type for the navigation prop
type ProfileScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Profile"
>;

const ProfileScreen = () => {
  // Use the navigation hook with the correct type
  const navigation = useNavigation<AppNavigationProp>();

  return (
    <View style={styles.mainContainer}>
      <LinearGradient
        colors={[colors.secondary, colors.primary]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <ScreenHeader title="پروفایل" isProfilePage={true} />
      <View style={styles.container}>
        <View style={styles.profileSection}>
          <View style={styles.avatarCircle}>
            <MaterialIcons name="person" size={100} color="#666666" />
          </View>
          <View style={{ marginVertical: 30 }}>
            <AppText style={styles.nameText}>خانم پوردایی</AppText>
            <AppText style={styles.roleText}>کارشناس فروش</AppText>
          </View>
        </View>

        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("ChangePassword")}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.15)"]}
              style={styles.menuItemBackground}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
            <View style={styles.menuItemLeftSide}>
              <View style={styles.iconContainer}>
                <MaterialIcons name="key" size={22} color={colors.primary} />
              </View>
              <AppText style={styles.menuItemText}>تغییر رمز عبور</AppText>
            </View>
            <MaterialIcons
              name="chevron-left"
              size={24}
              color={colors.medium}
            />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("Login")}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.15)"]}
              style={styles.menuItemBackground}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
            <View style={styles.menuItemLeftSide}>
              <View style={[styles.iconContainer, styles.logoutIconContainer]}>
                <MaterialIcons name="logout" size={22} color={colors.danger} />
              </View>
              <AppText style={[styles.menuItemText, { color: colors.danger }]}>
                خروج از حساب کاربری
              </AppText>
            </View>
            <MaterialIcons
              name="chevron-left"
              size={24}
              color={colors.medium}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  gradient: {
    position: "absolute",
    height: "25%",
    width: "100%",
    top: 0,
    zIndex: 0,
  },
  container: {
    flex: 1,
    padding: 14,
  },
  profileSection: {
    alignItems: "center",
    paddingTop: 15,
  },
  avatarCircle: {
    width: 175,
    height: 175,
    borderRadius: 100,
    backgroundColor: "#dddddd",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 12,
    borderColor: "#F8F8F8",
  },
  nameText: {
    fontFamily: "Yekan_Bakh_Bold",
    fontSize: 30,
    textAlign: "center",
    marginTop: -20,
  },
  roleText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: -1,
    color: colors.medium,
  },
  buttonSection: {
    marginTop: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 5,
    paddingVertical: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 1,
  },
  menuItem: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 15,
    borderRadius: 12,
    position: "relative",
    overflow: "hidden",
  },
  menuItemBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  menuItemLeftSide: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${colors.primary}15`,
    justifyContent: "center",
    alignItems: "center",
  },
  logoutIconContainer: {
    backgroundColor: `${colors.danger}15`,
  },
  menuItemText: {
    fontSize: 16,
    marginRight: 15,
    color: colors.dark,
    fontFamily: "Yekan_Bakh_Bold",
  },
  divider: {
    backgroundColor: colors.light,
    width: "100%",
    height: 1,
    marginVertical: 2,
  },
});

export default ProfileScreen;
