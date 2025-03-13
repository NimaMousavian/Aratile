import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../SellerStackNavigator";
import colors from "../../config/colors";

type PlaceholderScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

// Cashier Home Screen
export const CashierHomeScreen: React.FC = () => {
  const navigation = useNavigation<PlaceholderScreenNavigationProp>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>صفحه اصلی صندوقدار</Text>
      <Text style={styles.subtitle}>این صفحه در حال توسعه است</Text>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate("AppSelection")}
      >
        <Text style={styles.buttonText}>بازگشت به صفحه انتخاب</Text>
      </TouchableOpacity>
    </View>
  );
};

// Marketer Home Screen
export const MarketerHomeScreen: React.FC = () => {
  const navigation = useNavigation<PlaceholderScreenNavigationProp>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>صفحه اصلی بازاریاب</Text>
      <Text style={styles.subtitle}>این صفحه در حال توسعه است</Text>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate("AppSelection")}
      >
        <Text style={styles.buttonText}>بازگشت به صفحه انتخاب</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 40,
    textAlign: "center",
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
