import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Dimensions,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import colors from "../config/colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AppText from "../components/Text";
import { useNavigation } from "@react-navigation/native";
import { AppNavigationProp } from "../StackNavigator";
import ColleagueBottomSheet, {
  Colleague,
} from "./IssuingNewInvoice/ColleagueSearchModal";
import { toPersianDigits } from "../utils/converters";
import ScreenHeader from "../components/ScreenHeader";
import Toast from "../components/Toast";
import { MenuItem } from "./HomeScreen";
import { getFontFamily } from "./IssuedInvoices";
import { safeNavigate } from "./FieldMarketer/FieldMarketer";

const showRoomItems: MenuItem[] = [
  {
    id: 1,
    name: "بازدید ها",
    icon: "groups",
    iconColor: "#1C3F64",
    screenName: "Visits",
  },
  // {
  //   id: 2,
  //   name: "درخواست برچسب",
  //   icon: "new-label",
  //   iconColor: "#1C3F64",
  //   screenName: "LabelRequest",
  // },
];

const screenWidth = Dimensions.get("window").width;
const numColumns = 2;
const itemMargin = 10;
const itemWidth = (screenWidth - (numColumns + 1) * itemMargin) / numColumns;

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
          <AppText style={styles.gridText}>{item.name}</AppText>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <>
      <ScreenHeader title="شوروم" />
      <View style={styles.container}>
        <View style={styles.gridContainer}>
          {showRoomItems?.length > 0 && showRoomItems.map((item, index) => renderItem(item, index))}
        </View>

        <Toast
          visible={toastVisible}
          message={toastMessage}
          type={toastType}
          onDismiss={() => setToastVisible(false)}
        />

        {/* <View style={styles.customerContainer}>
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
      </View> */}

        {/* <ColleagueBottomSheet
        title="انتخاب مشتری"
        visible={showColleagueSheet}
        onClose={() => setShowColleagueSheet(false)}
        onSelectColleague={(colleague) => {
          setSelectedColleague(colleague);
          setShowColleagueSheet(false);
          showToast(`مشتری ${colleague.name} انتخاب شد`, "success");
        }}
      /> */}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingBottom: 0,
    paddingTop: 5,
    backgroundColor: colors.background,
    display: "flex",
    flexDirection: "column",
  },
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
    backgroundColor: "#f2f2f2",
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

export default ShowRoom;
