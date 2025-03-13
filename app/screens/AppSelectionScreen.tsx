import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../SellerStackNavigator";
import colors from "../config/colors";

type AppSelectionScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

const AppSelectionScreen: React.FC = () => {
  const navigation = useNavigation<AppSelectionScreenNavigationProp>();

  const navigateToApp = (appType: "seller" | "cashier" | "marketer"): void => {
    switch (appType) {
      case "seller":
        navigation.navigate("Home");
        break;
      case "cashier":
        // Will navigate to cashier home when it's created
        navigation.navigate("CashierHome");
        break;
      case "marketer":
        // Will navigate to marketer home when it's created
        navigation.navigate("MarketerHome");
        break;
      default:
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>انتخاب برنامه</Text>

        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => navigateToApp("seller")}
        >
          <Text style={styles.buttonText}>اپ فروشنده</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => navigateToApp("cashier")}
        >
          <Text style={styles.buttonText}>اپ صندوقدار</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => navigateToApp("marketer")}
        >
          <Text style={styles.buttonText}>اپ بازاریاب</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 40,
    textAlign: "center",
  },
  optionButton: {
    width: "100%",
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default AppSelectionScreen;
