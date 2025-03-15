import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  FlatList,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppNavigationProp, RootStackParamList } from "../../StackNavigator";
import colors from "../../config/colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { getFontFamily } from "../Cashier/ReceiveNewInvoiceScreen/ReceiveNewInvoiceScreen";
import { MenuItem } from "./../Cashier/CashierHomeScreen";

const fieldMarketerItems: MenuItem[] = [
  {
    id: 1,
    name: "بازاریاب میدانی B2B",
    icon: "business",
    screenName: "B2BFieldMarketer",
  },
  {
    id: 2,
    name: "بازاریاب میدانی B2C",
    icon: "business-center",
    screenName: "B2CFieldMarketer",
  },
];

const screenWidth = Dimensions.get("window").width;
const numColumns = 2;
const itemMargin = 10;
const itemWidth = (screenWidth - (numColumns + 1) * itemMargin) / numColumns;

const MarketerHomeScreen: React.FC = () => {
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
          <Text style={styles.userName}>کارشناس میدانی</Text>
        </View>
        <MaterialIcons name="create" size={24} color="#666666" />
      </View>
      <FlatList
        data={fieldMarketerItems}
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
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
    backgroundColor: "#FFFFFF",
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
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
  },
  logo: {
    width: 100,
    height: 36,
  },
  headerBox: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 20,
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

export default MarketerHomeScreen;
