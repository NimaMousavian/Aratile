import React from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import colors from "../../config/colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { AppNavigationProp } from "../../StackNavigator";
import ScreenHeader from "../../components/ScreenHeader";

interface MenuItem {
  id: number;
  name: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor?: string;
  screenName?: string;
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

export const safeNavigate = (
  navigation: any,
  screenName: string,
  params?: any
) => {
  console.log(`Attempting to navigate to: ${screenName}`);

  try {
    navigation.navigate(screenName, params);
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

const marketingItems: MenuItem[] = [
  {
    id: 1,
    name: "بازاریابی میدانی B2B",
    icon: "business",
    iconColor: "#1C3F64",
    screenName: "B2BFieldMarketer",
  },
  {
    id: 2,
    name: "بازاریابی میدانی B2C",
    icon: "business-center",
    iconColor: "#1C3F64",
    screenName: "B2CFieldMarketer",
  },
];

const screenWidth = Dimensions.get("window").width;
const numColumns = 2;
const itemMargin = 10;
const itemWidth = (screenWidth - (numColumns + 1) * itemMargin) / numColumns;

const FieldMarketer: React.FC = () => {
  const navigation = useNavigation<AppNavigationProp>();

  const renderItem = (item: MenuItem, index: number) => {
    return (
      <View key={item.id} style={[styles.gridItemContainer]}>
        <TouchableOpacity
          style={styles.gridItem}
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
      <ScreenHeader title="بازاریابی میدانی" isFieldMarketerPage={true} />
      <View style={styles.gridContainer}>
        {marketingItems.map((item, index) => renderItem(item, index))}
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
  headerBox: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    marginVertical: 20,
  },
  headerText: {
    fontSize: 22,
    fontWeight: Platform.OS === "ios" ? "700" : "normal",
    color: "#1C3F64",
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "700"),
    textAlign: "center",
  },

  gridContainer: {
    flexDirection: "row-reverse",
    flexWrap: "nowrap",
    justifyContent: "center",
    paddingHorizontal: 10,
    alignItems: "center",
  },
  gridItemContainer: {
    margin: 5,
    paddingLeft: 5,
    paddingRight: 5,
    paddingBottom: 10,
    marginTop: 20,
    width: itemWidth,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 1,
  },
  gridItem: {
    padding: 25,
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
});

export default FieldMarketer;
