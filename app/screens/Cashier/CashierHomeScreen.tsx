import React from "react";
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
import colors from "../../config/colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../SellerStackNavigator";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type AppNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface MenuItem {
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

const cashierItems: MenuItem[] = [
  {
    id: 1,
    name: "دریافت فاکتور جدید",
    icon: "receipt-long",
    iconColor: "#1C3F64",
    screenName: "ReceiveNewInvoice",
  },
  {
    id: 2,
    name: "فاکتور های نهایی شده",
    icon: "done-all",
    iconColor: "#1C3F64",
    screenName: "FinalizedInvoices",
  },
  {
    id: 3,
    name: "فاکتور های لغو شده",
    icon: "cancel",
    iconColor: "#1C3F64",
    screenName: "CanceledInvoices",
  },
  {
    id: 4,
    name: "فاکتور های بسته شده",
    icon: "inventory",
    iconColor: "#1C3F64",
    screenName: "ClosedInvoices",
  },
  {
    id: 5,
    name: "فاکتور های تعلیق شده",
    icon: "pause-circle-outline",
    iconColor: "#1C3F64",
    screenName: "SuspendedInvoices",
  },
  {
    id: 6,
    name: "راس گیر چک",
    icon: "account-balance",
    iconColor: "#1C3F64",
    screenName: "CheckCalculator",
  },
];

const screenWidth = Dimensions.get("window").width;
const numColumns = 2;
const itemMargin = 10;
const itemWidth = (screenWidth - (numColumns + 1) * itemMargin) / numColumns;

const CashierHomeScreen: React.FC = () => {
  const navigation = useNavigation<AppNavigationProp>();

  const renderItem = ({ item }: { item: MenuItem }) => {
    return (
      <TouchableOpacity
        style={styles.gridItem}
        onPress={() => navigation.navigate(item.screenName ?? "Home")}
      >
        <MaterialIcons
          name={item.icon}
          size={40}
          color={item.iconColor || colors.primary}
        />
        <Text style={styles.gridText}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          style={styles.logo}
          source={require("../../../assets/aratile_logo_2.png")}
        />
      </View>
      <View style={styles.headerBox}>
        <View style={styles.infoBox}>
          <View style={styles.avatarCircle}>
            <MaterialIcons name="person" size={26} color="#666666" />
          </View>
          <Text style={styles.userName}>خانم صندوقدار</Text>
        </View>
        <MaterialIcons name="create" size={24} color="#666666" />
      </View>
      \
      <FlatList
        data={cashierItems}
        numColumns={2}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.columnWrapper}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: "#ffffff",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
  },
  logo: {
    width: 100,
    height: 36,
  },
  screenTitle: {
    fontSize: 22,
    textAlign: "center",
    marginBottom: 20,
    fontWeight: Platform.OS === "ios" ? "700" : "normal",
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "700"),
    color: "#333333",
  },
  list: {
    padding: itemMargin,
  },
  gridItem: {
    margin: 5,
    padding: 15,
    width: itemWidth,
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
  },
  headerBox: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginVertical: 20,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  columnWrapper: {
    flexDirection: "row-reverse",
    justifyContent: "center",
  },
});

export default CashierHomeScreen;
