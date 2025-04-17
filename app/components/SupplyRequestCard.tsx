import React from "react";
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import colors from "../config/colors";
import { getFontFamily } from "../screens/ReceiveNewInvoiceScreen/ReceiveNewInvoiceScreen";
import Text from "./Text";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ISupplyRequest } from "../config/types";
import { toPersianDigits } from "../utils/converters";
import { LinearGradient } from "expo-linear-gradient";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import AppButton from "./Button";
type StatusType =
  | "بررسی نشده"
  | "در حال تامین"
  | "درخواست تولید"
  | "تامین شده"
  | "عدم تولید"
  | "لغو شده";

const statusStr = [
  "بررسی نشده",
  "در حال تامین",
  "درخواست تولید",
  "تامین شده",
  "عدم تولید",
  "لغو شده",
];

interface PurchaseInfoCardProps {
  supplyRequest: ISupplyRequest;
  headerTitle?: string;
  headerIcon?: keyof typeof MaterialIcons.glyphMap;
  invoiceNumber?: string;
  date?: string;
  address?: string;
  note?: string;
  gradientColors?: string[];
  containerStyle?: ViewStyle;
  status?: number;
  onPress?: (srID: number) => void;
}

const SupplyRequestCard: React.FC<PurchaseInfoCardProps> = ({
  supplyRequest,
  headerTitle = "اطلاعات خرید",
  headerIcon = "receipt",
  invoiceNumber = "",
  date = "",
  address = "",
  note = "",
  gradientColors = [colors.secondary, colors.primary],
  containerStyle,
  status,
  onPress,
}) => {
  const getStatusColor = (): string => {
    switch (supplyRequest.RequestState) {
      case 1:
        return colors.info || "#4CAF50";
      case 2:
        return colors.warning || "#FFA500";
      case 3:
        return colors.warning || "#3498db";
      case 4:
        return colors.success || "#FF0000";
      case 5:
        return colors.danger || "#FF0000";
      case 6:
        return colors.medium || "#FF0000";
      default:
        return colors.medium || "#9e9e9e";
    }
  };
  const getGradiantColor = (): string[] => {
    switch (supplyRequest.RequestState) {
      case 1:
        return ["#72aed6", colors.info];
      case 2:
        return ["#fdbf4d", colors.warning];
      case 3:
        return ["#fdbf4d", colors.warning];
      case 4:
        return ["#63af65", colors.success];
      case 5:
        return ["#ff4444", colors.danger];
      case 6:
        return ["#9e9e9e", colors.medium];
      default:
        return [colors.medium];
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress?.(supplyRequest.ProductSupplyRequestId)}
    >
      <View
        style={[
          styles.purchaseCard,
          Platform.OS === "android" && styles.androidCardAdjustment,
          containerStyle,
        ]}
      >
        <LinearGradient
          // @ts-ignore: type issues with LinearGradient colors prop
          colors={getGradiantColor()}
          style={styles.purchaseHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.headerTitleContainer}>
            <MaterialIcons
              name={headerIcon}
              size={22}
              color={colors.white || "#fff"}
            />
            <Text style={styles.purchaseHeaderText}>
              {toPersianDigits(supplyRequest.ShamsiInsertDate.split(" ")[0])}
            </Text>
          </View>

          <View
            style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}
          >
            <Text style={styles.statusText}>
              {statusStr[supplyRequest.RequestState - 1]}
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.purchaseContent}>
          <View style={styles.noteContainer}>
            <View style={styles.noteContainer}>
              <MaterialCommunityIcons
                name="shopping-outline"
                size={18}
                color={colors.secondary}
              />
              <View style={styles.noteTextContainer}>
                <Text style={styles.noteLabel}> محصول:</Text>
                <Text style={styles.noteContent}>
                  {supplyRequest.ProductName}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.purchaseRow}>
            <View style={styles.purchaseItem}>
              <MaterialIcons
                name="straighten"
                size={18}
                color={colors.secondary || "#6c5ce7"}
              />
              <View style={styles.purchaseTextContainer}>
                <Text style={styles.secondaryLabel}>مقدار مورد درخواست:</Text>
                <Text style={styles.secondaryValue}>
                  {supplyRequest.RequestedValue}
                </Text>
              </View>
            </View>
          </View>

          {/* <View style={styles.divider} />
          <View style={styles.purchaseRow}>
            <View style={styles.purchaseItem}>
              <MaterialIcons
                name="store"
                size={18}
                color={colors.secondary || "#6c5ce7"}
              />
              <View style={styles.purchaseTextContainer}></View>
            </View>
          </View> */}

          {/* {address && (
            <>
              <View style={styles.divider} />
              <View style={styles.addressContainer}>
                <MaterialIcons
                  name="location-on"
                  size={18}
                  color={colors.secondary || "#6c5ce7"}
                />
                <View style={styles.purchaseTextContainer}>
                  <Text style={styles.secondaryLabel}>آدرس:</Text>
                  <Text style={styles.addressValue}>{address}</Text>
                </View>
              </View>
            </>
          )} */}

          <View style={styles.divider} />
          <View style={styles.noteContainer}>
            <MaterialIcons
              name="error-outline"
              size={18}
              color={colors.secondary || "#6c5ce7"}
            />
            <View style={styles.noteTextContainer}>
              <Text style={styles.noteLabel}>توضیحات:</Text>
              <Text style={styles.noteContent}>
                {supplyRequest.Description}
              </Text>
            </View>
          </View>
        </View>
        {/* <View style={styles.buttonsContainter}>
          <AppButton
            title="فیلتر"
            onPress={() => {}}
            color="warning"
            style={{ width: "49%" }}
          />
          <AppButton
            title="فیلتر"
            onPress={() => {}}
            color="primary"
            style={{ width: "49%" }}
          />
        </View> */}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  productCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // elevation: 2,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e1e1e1",
  },
  productTitleContainer: {
    padding: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e1e1",
    // borderRightWidth: 3,
    // borderRightColor: colors.secondary,
  },
  productTitleRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productTitle: {
    fontSize: 18,
    color: colors.primary,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "600"),
    textAlign: "right",
    flex: 1,
    marginLeft: 8,
  },
  productDetailsContainer: {
    padding: 12,
  },
  productNoteContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 12,
  },
  infoWithImageContainer: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoSection: {
    flex: 1,
  },
  productImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: colors.light,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  spectrumValueHas: {
    fontSize: 15,
    color: colors.success,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "500"),
  },
  spectrumValueHasNot: {
    fontSize: 15,
    color: colors.danger,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "500"),
  },
  productCodeContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingRight: 0,
    paddingTop: 10,
    backgroundColor: colors.white,
    // borderTopWidth: 1,
    // borderTopColor: "#e1e1e1",
  },
  productCodeLabel: {
    fontSize: 15,
    color: colors.medium,
    fontFamily: getFontFamily("Yekan_Bakh_Regular", "normal"),
    marginRight: 8,
    marginLeft: 8,
  },
  productCode: {
    fontSize: 15,
    color: colors.dark,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "500"),
    letterSpacing: 1,
  },
  quantityContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 12,
  },
  quantityValue: {
    fontSize: 15,
    color: colors.dark,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "500"),
  },
  regularNoteContent: {
    fontSize: 15,
    color: colors.dark,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "500"),
  },
  iconTextSpacing: {
    marginRight: 10,
  },
  colorSpectrumContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 16,
  },
  androidCardAdjustment: {
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    marginVertical: 8,
  },
  value: {
    fontSize: 15,
    color: colors.dark,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "500"),
  },
  devider: {
    width: "100%",
    height: 1,
    backgroundColor: "#e1e1e1",
  },

  purchaseContent: {
    padding: 16,
  },
  purchaseRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  purchaseItem: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  purchaseTextContainer: {
    flexDirection: "row-reverse",
    marginRight: 8,
    flex: 1,
  },
  secondaryLabel: {
    fontSize: 15,
    color: "#757575",
    fontFamily: getFontFamily("Yekan_Bakh_Regular", "normal"),
    marginLeft: 8,
  },
  secondaryValue: {
    fontSize: 15,
    color: "#212121",
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "500"),
  },
  divider: {
    height: 1,
    backgroundColor: "#eeeeee",
    marginVertical: 12,
  },
  addressContainer: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
  },
  addressValue: {
    fontSize: 15,
    color: "#212121",
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "500"),
  },
  noteContainer: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    width: "100%",
  },
  noteTextContainer: {
    flexDirection: "column",
    flex: 1,
    marginRight: 8,
    alignItems: "flex-start",
  },
  noteLabel: {
    fontSize: 15,
    fontFamily: getFontFamily("Yekan_Bakh_Regular", "normal"),
    color: "#757575",
    marginBottom: 4,
    alignSelf: "flex-end",
  },
  noteContent: {
    fontSize: 15,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "500"),
    flex: 1,
    textAlign: "right",
    color: "#212121",
    width: "100%",
  },
  callButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderColor: "#4CAF50",
    borderWidth: 2,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },

  purchaseCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e1e1e1",
  },
  purchaseHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    padding: 16,
    justifyContent: "space-between",
  },
  headerTitleContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  purchaseHeaderText: {
    fontSize: 20,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "600"),
    color: "#ffffff",
    marginRight: 8,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  statusText: {
    color: "#ffffff",
    fontSize: 12,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "500"),
  },
  buttonsContainter: {
    flexDirection: "row-reverse",
    padding: 10,
    justifyContent: "center",
    gap: 10,
  },
});

export default SupplyRequestCard;
