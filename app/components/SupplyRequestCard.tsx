import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import colors from "../config/colors";
import { getFontFamily } from "../screens/Cashier/ReceiveNewInvoiceScreen/ReceiveNewInvoiceScreen";
import Text from "./Text";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ISupplyRequest } from "../config/types";
import { toPersianDigits } from "../utils/converters";

interface IProps {
  suuplyRequest: ISupplyRequest;
}

const SupplyRequestCard: React.FC<IProps> = ({ suuplyRequest }) => {
  return (
    <View
      key={suuplyRequest.id}
      style={[
        styles.productCard,
        Platform.OS === "android" && styles.androidCardAdjustment,
      ]}
    >
      <View style={styles.productTitleContainer}>
        <View style={styles.productTitleRow}>
          <Text style={styles.productTitle}>{suuplyRequest.title}</Text>
        </View>
      </View>

      <View style={styles.productDetailsContainer}>
        <View style={styles.infoWithImageContainer}>
          <View style={styles.infoSection}>
            <View style={styles.productNoteContainer}>
              <MaterialIcons
                name="numbers"
                size={22}
                color={colors.secondary}
              />
              <Text style={[styles.secondaryLabel, styles.iconTextSpacing]}>
                مقدار درخواست شده:
              </Text>
              <Text style={styles.productCode}>
                {toPersianDigits(suuplyRequest.requestCount.toString())}
              </Text>
            </View>
            <View style={styles.quantityContainer}>
              <MaterialIcons name="grade" size={18} color={colors.secondary} />
              <Text style={[styles.secondaryLabel, styles.iconTextSpacing]}>
                درجه:
              </Text>
              <Text style={styles.quantityValue}>{suuplyRequest.grade}</Text>
            </View>

            <View style={styles.colorSpectrumContainer}>
              <MaterialIcons name="grade" size={18} color={colors.secondary} />
              <Text style={[styles.secondaryLabel, styles.iconTextSpacing]}>
                وضعیت:
              </Text>
              <Text style={styles.value}>{suuplyRequest.status}</Text>
              {/* {suuplyRequest.hasColorSpectrum ? (
                <Text style={styles.spectrumValueHas}>دارد</Text>
              ) : (
                <Text style={styles.spectrumValueHasNot}>ندارد</Text>
              )} */}
            </View>
          </View>

          <View style={styles.productImagePlaceholder}>
            <MaterialIcons
              name="qr-code-2"
              size={36}
              color={colors.secondary}
            />
          </View>
        </View>
        <View style={styles.devider}></View>
        <View style={styles.productCodeContainer}>
          <MaterialIcons
            name="calendar-month"
            size={18}
            color={colors.secondary}
          />
          <Text style={[styles.secondaryLabel, styles.iconTextSpacing]}>
            تاریخ ثبت:
          </Text>
          <Text style={styles.regularNoteContent}>
            {suuplyRequest.dateCreated}
          </Text>
        </View>
        <View style={styles.productCodeContainer}>
          <MaterialIcons
            name="calendar-month"
            size={18}
            color={colors.secondary}
          />
          <Text style={[styles.secondaryLabel, styles.iconTextSpacing]}>
            تاریخ بروزرسانی:
          </Text>
          <Text style={styles.regularNoteContent}>
            {suuplyRequest.dateModified}
          </Text>
        </View>
      </View>
    </View>
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
  secondaryLabel: {
    fontSize: 15,
    color: colors.medium,
    fontFamily: getFontFamily("Yekan_Bakh_Regular", "normal"),
    marginLeft: 8,
  },
  secondaryValue: {
    fontSize: 15,
    color: colors.dark,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "500"),
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
});

export default SupplyRequestCard;
