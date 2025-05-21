import React, { useState, useEffect } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import colors from "../config/colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { AppNavigationProp, RootStackParamList } from "../StackNavigator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLoginResponse } from "./LogingScreen";
import { ILoginResponse } from "../config/types";
import * as FileSystem from "expo-file-system";

export interface MenuItem {
  id: number;
  name: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor?: string;
  screenName?: keyof RootStackParamList;
}

type FontWeight = "700" | "600" | "500" | "bold" | "semi-bold" | string;

const getFontFamily = (baseFont: string, weight: FontWeight): string => {
  if (Platform.OS === "android") {
    switch (weight) {
      case "700":
      case "bold":
        return "Yekan_Bakh_Bold";
      case "500":
      case "600":
      case "semi-bold":
        return "Yekan_Bakh_Bold";
      default:
        return "Yekan_Bakh_Regular";
    }
  }
  return baseFont;
};

const safeNavigate = (navigation: any, screenName: string, params?: any) => {
  console.log(`Attempting to navigate to: ${screenName}`);

  let correctedName = screenName;

  if (screenName === "IssuingNewInvoic") {
    correctedName = "IssuingNewInvoice";
    console.log(`Corrected screen name from ${screenName} to ${correctedName}`);
  }

  const commonScreens: { [key: string]: string } = {
    IssuedInvoic: "IssuedInvoices",
    SupplyReques: "SupplyRequest",
    SupplyRequestLis: "SupplyRequestList",
    ReceiveNewInvoic: "ReceiveNewInvoice",
    StatusFilterScree: "StatusFilterScreen",
    FieldMarketer: "FieldMarketer",
    ShowRoom: "ShowRoom",
    Forms: "Forms",
    Checklist: "TaskManagement",
  };

  if (commonScreens[screenName]) {
    correctedName = commonScreens[screenName];
    console.log(`Corrected screen name from ${screenName} to ${correctedName}`);
  }

  try {
    if (correctedName === "IssuingNewInvoice") {
      console.log("Navigating to IssuingNewInvoice with explicit parameters");
      navigation.navigate(correctedName, { scannedCode: undefined });
    } else {
      navigation.navigate(correctedName, params);
    }
  } catch (error) {
    console.error(`Navigation error: ${error}`);

    try {
      console.log("Fallback to Home navigation");
      navigation.navigate("Home");
    } catch (fallbackError) {
      console.error(`Even fallback navigation failed: ${fallbackError}`);
    }
  }
};

const initialItems: MenuItem[] = [
  {
    id: 1,
    name: "صدور فاکتور جدید",
    icon: "receipt",
    iconColor: "#1C3F64",
    screenName: "IssuingNewInvoice",
  },
  {
    id: 2,
    name: "فاکتور ها",
    icon: "description",
    iconColor: "#1C3F64",
    screenName: "IssuedInvoices",
  },
  {
    id: 3,
    name: "راس گیر چک",
    icon: "account-balance",
    iconColor: "#1C3F64",
  },
  {
    id: 4,
    name: "ماشین حساب",
    icon: "calculate",
    iconColor: "#1C3F64",
    screenName: "ShowRoom",
  },
  {
    id: 5,
    name: "درخواست تامین",
    icon: "shopping-cart",
    iconColor: "#1C3F64",
    screenName: "SupplyRequest",
  },
  {
    id: 6,
    name: "بازاریابی میدانی",
    icon: "store",
    iconColor: "#1C3F64",
    screenName: "FieldMarketer",
  },
  {
    id: 7,
    name: "شوروم",
    icon: "filter-frames",
    iconColor: "#1C3F64",
    screenName: "ShowRoom",
  },
  {
    id: 8,
    name: "فرم ها",
    icon: "edit-note",
    iconColor: "#1C3F64",
    screenName: "Forms",
  },
];

const LAYOUT_STORAGE_KEY = "home_screen_items_layout";

const screenWidth = Dimensions.get("window").width;
const numColumns = 2;
const itemMargin = 10;
const itemWidth = (screenWidth - (numColumns + 1) * itemMargin) / numColumns;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const [items, setItems] = useState(initialItems);
  const [userData, setUserData] = useState<ILoginResponse>();
  const [avatarUri, setAvatarUri] = useState<string | undefined>(
    userData?.AvatarImageFileName
  );

  const avatarCacheKey = "@AvatarImage";
  const avatarLocalPath = FileSystem.documentDirectory
    ? `${FileSystem.documentDirectory}avatar.jpg`
    : null;

  const fetchUserData = async () => {
    const storedData = await getLoginResponse();
    if (storedData) {
      setUserData(storedData);
    } else {
      console.log("No data found");
    }
  };

  // Load or download avatar image
  useEffect(() => {
    const loadAvatar = async () => {
      try {
        // If userData or AvatarImageURL is not available, fall back to default
        if (!userData?.AvatarImageURL) {
          setAvatarUri(undefined);
          return;
        }

        if (!avatarLocalPath || !FileSystem.getInfoAsync) {
          console.warn(
            "FileSystem is not available, falling back to default icon"
          );
          setAvatarUri(undefined);
          return;
        }

        // Check if image exists in AsyncStorage
        const cachedUri = await AsyncStorage.getItem(avatarCacheKey);
        if (cachedUri) {
          const fileInfo = await FileSystem.getInfoAsync(avatarLocalPath).catch(
            () => ({ exists: false })
          );
          if (fileInfo.exists) {
            setAvatarUri(cachedUri);
            return;
          }
        }

        // If not cached, download and cache the image
        const downloadResult = await FileSystem.downloadAsync(
          userData.AvatarImageURL,
          avatarLocalPath
        );

        if (downloadResult.status === 200) {
          const uri = `${avatarLocalPath}`;
          await AsyncStorage.setItem(avatarCacheKey, uri);
          setAvatarUri(uri);
        } else {
          setAvatarUri(undefined);
        }
      } catch (error) {
        console.error("Error loading avatar:", error);
        setAvatarUri(undefined);
      }
    };

    loadAvatar();
  }, [userData?.AvatarImageURL]);

  useEffect(() => {
    loadSavedLayout();
    fetchUserData();
  }, []);

  const loadSavedLayout = async () => {
    try {
      const savedLayout = await AsyncStorage.getItem(LAYOUT_STORAGE_KEY);
      if (savedLayout !== null) {
        const parsedLayout = JSON.parse(savedLayout);
        setItems(parsedLayout);
      }
    } catch (error) {
      console.error("خطا در بارگذاری چیدمان:", error);
    }
  };

  const renderItem = ({ item, index }: { item: MenuItem; index: number }) => {
    const isLastItemInOddList =
      index === items.length - 1 && items.length % 2 !== 0;

    return (
      <View
        style={[
          styles.gridItemContainer,
          isLastItemInOddList && styles.fullWidthItem,
        ]}
      >
        <TouchableOpacity
          style={[
            styles.gridItem,
            isLastItemInOddList && styles.fullWidthItemContent,
          ]}
          activeOpacity={0.7}
          onPress={() => {
            if (item.screenName) {
              console.log("Navigating to:", item.screenName);
              safeNavigate(navigation, item.screenName);
            }
          }}
        >
          <MaterialIcons
            name={item.icon}
            size={40}
            color={item.iconColor || colors.primary}
          />
          <Text style={styles.gridText}>{item.name}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          style={styles.logo}
          source={require("../../assets/logo-aratile.png")}
        />
      </View>

      <View style={styles.headerBox}>
        <TouchableOpacity
          style={styles.infoBox}
          onPress={() => safeNavigate(navigation, "Profile")}
        >
          <View style={styles.avatarCircle}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <MaterialIcons name="person" size={26} color="#666666" />
            )}
          </View>
          <Text style={styles.userName}>{userData?.DisplayName}</Text>
        </TouchableOpacity>

        <View style={styles.iconsContainer}>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              safeNavigate(navigation, "TaskManagement");
            }}
          >
            <MaterialIcons
              name="checklist-rtl"
              size={25}
              color={colors.light}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              safeNavigate(navigation, "PersianCalendar");
            }}
          >
            <MaterialIcons
              name="calendar-month"
              size={25}
              color={colors.light}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.listContainer}>
        <FlatList
          data={items}
          numColumns={2}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={true}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
    marginTop: 50,
  },
  logo: {
    width: 100,
    height: 36,
  },
  listContainer: {
    flex: 1,
    width: "100%",
  },
  calendarIconContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: -6,
  },
  list: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    paddingBottom: 100,
  },
  gridItemContainer: {
    margin: 5,
    paddingLeft: 5,
    paddingRight: 5,
    paddingBottom: 10,
    width: itemWidth,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 1,
  },
  gridItem: {
    padding: 15,
    height: 150,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 15,
    backgroundColor: "#F2F2F2",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#E4E4E4",
  },
  gridText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: Platform.OS === "ios" ? "700" : "normal",
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "700"),
    color: "#333333",
  },
  headerBox: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  iconsContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  iconButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 43,
    height: 43,
    borderRadius: 25,
    marginLeft: 0,
    marginRight: 7,
    backgroundColor: colors.secondary,
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  infoBox: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: Platform.OS === "ios" ? "700" : "normal",
    color: "#666666",
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "700"),
  },
  avatarCircle: {
    width: 45,
    height: 45,
    borderRadius: 50,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginRight: 0,
  },
  columnWrapper: {
    flexDirection: "row-reverse",
    justifyContent: "center",
  },
  fullWidthItem: {
    width: screenWidth - 2 * itemMargin,
    alignSelf: "center",
  },
  fullWidthItemContent: {
    width: "100%",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "#ccc",
  },
});

export default HomeScreen;