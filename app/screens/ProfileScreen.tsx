import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import ScreenHeader from "../components/ScreenHeader";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AppText from "../components/Text";
import colors from "../config/colors";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppNavigationProp } from "../StackNavigator";
import { toPersianDigits } from "../utils/converters";
import { useAuth } from "./AuthContext";
import ReusableModal from "../components/Modal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";

const { width, height } = Dimensions.get("window");
const calculateImageHeight = () => {
  const imageRatio = 520 / 1000;
  return width * imageRatio;
};

type RootStackParamList = {
  Profile: undefined;
  ChangePassword: undefined;
};

type ProfileScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Profile"
>;

const ProfileScreen = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const { user, logout } = useAuth();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(
    user?.AvatarImageURL || ""
  );
  const avatarCacheKey = "@AvatarImage";
  const avatarLocalPath = FileSystem.documentDirectory
    ? `${FileSystem.documentDirectory}avatar.jpg`
    : null;

  // Load or cache avatar image
  useEffect(() => {
    const loadAvatar = async () => {
      try {
        if (!user?.AvatarImageURL) {
          setAvatarUri(null);
          return;
        }

        if (!avatarLocalPath || !FileSystem.getInfoAsync) {
          console.warn(
            "FileSystem is not available, falling back to default icon"
          );
          setAvatarUri(null);
          return;
        }

        // Check if image exists in AsyncStorage
        // const cachedUri = await AsyncStorage.getItem(avatarCacheKey);
        // if (cachedUri) {
        //   const fileInfo = await FileSystem.getInfoAsync(avatarLocalPath);
        //   if (fileInfo.exists) {
        //     setAvatarUri(cachedUri);
        //     return;
        //   }
        // }

        // If online, download and cache the image
        const downloadResult = await FileSystem.downloadAsync(
          user.AvatarImageURL,
          avatarLocalPath
        );

        if (downloadResult.status === 200) {
          const uri = `${avatarLocalPath}`;
          await AsyncStorage.setItem(avatarCacheKey, uri);
          // setAvatarUri(uri);
          setAvatarUri(user.AvatarImageURL);
        } else {
          setAvatarUri(null);
        }
      } catch (error) {
        console.error("Error loading avatar:", error);
        setAvatarUri(null);
      }
    };

    loadAvatar();
  }, [user?.AvatarImageURL]);

  const handleLogout = async () => {
    setLogoutModalVisible(true);
  };

  const clearAllDatabaseData = async () => {
    try {
      // Clear all AsyncStorage data
      await AsyncStorage.clear();

      // If you're using SQLite or other database, clear them here
      // Example for SQLite:
      // const db = SQLite.openDatabase('your_database.db');
      // db.transaction(tx => {
      //   // Clear all tables or drop them as needed
      //   tx.executeSql('DELETE FROM table1');
      //   tx.executeSql('DELETE FROM table2');
      //   // ... other tables
      // });

      // Delete cached avatar image if FileSystem is available
      // if (
      //   avatarLocalPath &&
      //   FileSystem.getInfoAsync &&
      //   FileSystem.deleteAsync
      // ) {
      //   const fileInfo = await FileSystem.getInfoAsync(avatarLocalPath).catch(
      //     () => ({ exists: false })
      //   );
      //   if (fileInfo.exists) {
      //     await FileSystem.deleteAsync(avatarLocalPath);
      //   }
      // }

      console.log("All database data has been cleared");
      return true;
    } catch (error) {
      console.error("Error clearing database:", error);
      return false;
    }
  };

  const performLogout = async () => {
    try {
      setIsLoggingOut(true);

      // Clear all database data before logout
      const dataCleared = await clearAllDatabaseData();
      if (!dataCleared) {
        console.error("Failed to clear database data");
        // Continue with logout anyway
      }

      // --- Clear avatar cache safely ---
      try {
        if (avatarCacheKey) {
          await AsyncStorage.removeItem(avatarCacheKey);
        }

        if (avatarLocalPath) {
          const fileInfo = await FileSystem.getInfoAsync(avatarLocalPath).catch(
            () => ({ exists: false })
          );
          if (fileInfo.exists) {
            await FileSystem.deleteAsync(avatarLocalPath, { idempotent: true });
            console.log("Avatar cache cleared");
          }
        }

        // Reset local avatar state too
        setAvatarUri(null);
      } catch (err) {
        console.error("Failed to clear avatar cache:", err);
      }

      // Perform the original logout operation
      const success = await logout();

      setLogoutModalVisible(false);
      setIsLoggingOut(false);

      // Optional: navigate to login screen
      // navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (error) {
      console.error("Error during logout process:", error);
      setIsLoggingOut(false);
      setLogoutModalVisible(false);
    }
  };

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
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <MaterialIcons name="person" size={100} color="#666666" />
            )}
          </View>
          <View style={{ marginVertical: 30 }}>
            <AppText style={styles.nameText}>{user?.DisplayName}</AppText>
            <AppText style={styles.roleText}>
              {toPersianDigits(user?.UserMobile || "")}
            </AppText>
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
            onPress={handleLogout}
            activeOpacity={0.7}
            disabled={isLoggingOut}
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

      {/* مدال خروج از حساب کاربری */}
      <ReusableModal
        visible={logoutModalVisible}
        onClose={() => !isLoggingOut && setLogoutModalVisible(false)}
        headerConfig={{
          title: "خروج از حساب کاربری",
          icon: "logout",
          colors: [colors.danger, colors.dangerLight || "#ff6b6b"],
        }}
        messages={[
          {
            text: "آیا مطمئن هستید که می‌خواهید از حساب کاربری خود خارج شوید؟",
            icon: "warning",
            iconColor: colors.danger,
          },
        ]}
        buttons={[
          {
            id: "cancel",
            text: "انصراف",
            color: colors.medium,
            icon: "close",
            onPress: () => !isLoggingOut && setLogoutModalVisible(false),
            disabled: isLoggingOut,
          },
          {
            id: "logout",
            text: isLoggingOut ? "در حال خروج..." : "خروج",
            color: colors.danger,
            icon: isLoggingOut ? "hourglass-empty" : "logout",
            onPress: performLogout,
            disabled: isLoggingOut,
          },
        ]}
      />
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
  avatarImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "#ccc",
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
