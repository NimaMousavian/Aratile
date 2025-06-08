import React, { useMemo } from "react";
import { StyleSheet, View, Text, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import colors from "../../config/colors";
import { toPersianDigits } from "../../utils/converters";
import { IInvoic } from "../../config/types";

interface InvoiceDetailsSummaryProps {
  invoic: IInvoic;
  containerStyle?: any;
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

const InvoiceDetailsSummary: React.FC<InvoiceDetailsSummaryProps> = ({
  invoic,
  containerStyle,
}) => {
  const calculations = useMemo(() => {
    const itemsCount = invoic.InvoiceItemList.length;

    const baseTotal = invoic.InvoiceItemList.reduce((sum, item) => {
      return sum + (item.PackagingQuantity * item.PerPackagePrice);
    }, 0);

    const totalDiscount = invoic.InvoiceItemList.reduce((sum, item) => {
      return sum + (item.Discount || 0);
    }, 0);

    const totalExtra = invoic.InvoiceItemList.reduce((sum, item) => {
      return sum + (item.Extra || 0);
    }, 0);

    const finalAmount = baseTotal - totalDiscount + totalExtra;

    return {
      itemsCount,
      baseTotal,
      totalDiscount,
      totalExtra,
      finalAmount
    };
  }, [invoic.InvoiceItemList]);

  return (
    <View style={[styles.container, containerStyle]}>
      <LinearGradient
        colors={[colors.secondary, colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <MaterialIcons name="calculate" size={24} color="white" />
          <Text style={styles.headerTitle} numberOfLines={1}>
            خلاصه فاکتور
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.contentContainer}>
        <View style={styles.contentInnerContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>تعداد اقلام:</Text>
            <Text style={styles.summaryValue}>
              {toPersianDigits(calculations.itemsCount.toString())}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>مبلغ پایه:</Text>
            <Text style={styles.summaryValue}>
              {toPersianDigits(calculations.baseTotal.toLocaleString())} ریال
            </Text>
          </View>

        
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              تخفیفات:
            </Text>
            <Text style={styles.summaryValue}>
              {toPersianDigits(calculations.totalDiscount.toLocaleString())} ریال
            </Text>
          </View>

        
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              اضافات:
            </Text>
            <Text style={styles.summaryValue}>
              {toPersianDigits(calculations.totalExtra.toLocaleString())} ریال
            </Text>
          </View>

          <View style={styles.divider} />

        
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>مبلغ نهایی:</Text>
            <Text style={styles.totalValue}>
              {toPersianDigits(calculations.finalAmount.toLocaleString())} ریال
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: "hidden",
    marginVertical: 10,
    borderWidth: 1,
    borderColor: colors.primary,
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 3,
    // elevation: 2,
  },
  header: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    minHeight: 48,
  },
  headerContent: {
    flexDirection: "row-reverse",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    color: colors.white,
    marginRight: 8,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "bold"),
    textAlign: "center",
    flexShrink: 1,
  },
  contentContainer: {
    padding: 16,
  },
  contentInnerContainer: {
    paddingBottom: 8,
  },
  summaryRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: getFontFamily("Yekan_Bakh_Regular", "normal"),
    color: colors.medium,
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "bold"),
    color: colors.dark,
  },
  discountLabel: {
    color: colors.danger,
  },
  discountValue: {
    color: colors.danger,
  },
  extraLabel: {
    color: colors.success,
  },
  extraValue: {
    color: colors.success,
  },
  divider: {
    height: 1,
    backgroundColor: colors.light,
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "bold"),
    color: colors.secondary,
  },
  totalValue: {
    fontSize: 18,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "bold"),
    color: colors.primary,
  },
});

export default InvoiceDetailsSummary;