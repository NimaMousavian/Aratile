import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import colors from "../config/colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AppText from "../components/Text";
import { useNavigation } from "@react-navigation/native";
import { AppNavigationProp } from "../StackNavigator";
import { Colleague } from "./IssuingNewInvoice/ColleagueSearchModal";
import { toPersianDigits } from "../utils/converters";

const ShowRoom = () => {
  const navigation = useNavigation<AppNavigationProp>();

  const [selectedColleague, setSelectedColleague] = useState<Colleague | null>(
    null
  );
  const [showColleagueSheet, setShowColleagueSheet] = useState<boolean>(false);

  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<
    "success" | "error" | "warning" | "info"
  >("error");

  const showToast = (
    message: string,
    type: "success" | "error" | "warning" | "info" = "error"
  ) => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.customerContainer}>
        <LinearGradient
          colors={[colors.secondary, colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.customerGradient}
        >
          <View style={styles.customerRow}>
            <View style={styles.customerField}>
              <MaterialIcons
                name="person"
                size={24}
                color="white"
                style={styles.customerIcon}
              />
              <AppText style={styles.customerLabel}>مشتری</AppText>
            </View>
            <View style={styles.customerButtonsContainer}>
              {selectedColleague && (
                <TouchableOpacity
                  style={[
                    styles.iconCircleSmall,
                    { backgroundColor: "#fef2e0" },
                  ]}
                  onPress={() =>
                    navigation.navigate("CustomerInfo", {
                      customer: selectedColleague,
                    })
                  }
                >
                  <MaterialIcons name="edit" size={22} color={colors.warning} />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.iconCircleSmall, { backgroundColor: "#e5f9ec" }]}
                onPress={() => navigation.navigate("CustomerInfo", {})}
              >
                <MaterialIcons name="add" size={22} color={colors.success} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconCircleSmall, { backgroundColor: "#e4edf8" }]}
                onPress={() => setShowColleagueSheet(true)}
              >
                <MaterialIcons name="search" size={22} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.selectedCustomerContainer}>
          {selectedColleague ? (
            <AppText style={styles.selectedCustomerName}>
              {toPersianDigits(selectedColleague.name)}
            </AppText>
          ) : (
            <AppText style={styles.noCustomerText}>
              مشتری انتخاب نشده است.
            </AppText>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  customerContainer: {
    flexDirection: "column",
    marginBottom: 15,
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    borderWidth: 2,
    borderColor: colors.gray,
  },
  customerGradient: {
    padding: 12,
  },
  customerRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  customerField: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  customerLabel: {
    fontSize: 16,
    marginRight: 4,
    fontFamily: "Yekan_Bakh_Bold",
    color: "white",
  },
  customerIcon: {},
  customerButtonsContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  iconCircleSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "white",
  },
  selectedCustomerContainer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray,
    backgroundColor: colors.light,
  },
  selectedCustomerName: {
    fontSize: 16,
    color: colors.dark,
    fontFamily: "Yekan_Bakh_Bold",
    textAlign: "center",
  },
  noCustomerText: {
    fontSize: 14,
    color: colors.medium,
    fontFamily: "Yekan_Bakh_Bold",
    textAlign: "center",
  },
});

export default ShowRoom;
