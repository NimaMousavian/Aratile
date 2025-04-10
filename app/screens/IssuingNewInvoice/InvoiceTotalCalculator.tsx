// InvoiceTotalCalculator.tsx - بدون اسکرول داخلی
import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import colors from "../../config/colors";
import { toPersianDigits } from "../../utils/numberConversions";
import { Product } from "./IssuingNewInvoice";

interface InvoiceTotalProps {
  products: Product[];
  containerStyle?: any;
}

const InvoiceTotalCalculator: React.FC<InvoiceTotalProps> = ({
  products,
  containerStyle,
}) => {
  const [totalQuantity, setTotalQuantity] = useState<number>(0);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [finalTotal, setFinalTotal] = useState<number>(0);

  // محاسبه مجموع‌ها هنگام تغییر محصولات
  useEffect(() => {
    // محاسبه مجموع تعداد
    const quantity = products.reduce((sum, product) => {
      const qty = parseFloat(product.quantity) || 0;
      return sum + qty;
    }, 0);
    setTotalQuantity(quantity);

    // محاسبه مجموع قیمت
    const price = products.reduce((sum, product) => {
      const qty = parseFloat(product.quantity) || 0;
      const productPrice = product.price || 0;
      return sum + qty * productPrice;
    }, 0);
    setTotalPrice(price);

    // محاسبه مالیات (۹٪)
    const taxAmount = price * 0.09;
    setTax(taxAmount);

    // محاسبه مبلغ نهایی با مالیات
    setFinalTotal(price + taxAmount);
  }, [products]);

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
          <Text style={styles.headerTitle}>خلاصه فاکتور</Text>
        </View>
      </LinearGradient>

      {/* محتوای ثابت بدون اسکرول */}
      <View style={styles.contentContainer}>
        <View style={styles.contentInnerContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>تعداد اقلام:</Text>
            <Text style={styles.summaryValue}>
              {toPersianDigits(products.length.toString())}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>مجموع مقدار:</Text>
            <Text style={styles.summaryValue}>
              {toPersianDigits(totalQuantity.toFixed(2))} متر مربع
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>جمع کل:</Text>
            <Text style={styles.summaryValue}>
              {toPersianDigits(totalPrice.toLocaleString())} ریال
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>مالیات (۹٪):</Text>
            <Text style={styles.summaryValue}>
              {toPersianDigits(tax.toLocaleString())} ریال
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>مبلغ نهایی:</Text>
            <Text style={styles.totalValue}>
              {toPersianDigits(finalTotal.toLocaleString())} ریال
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
  },
  headerContent: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    color: colors.white,
    marginRight: 8,
    fontFamily: "Yekan_Bakh_Bold",
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
    fontFamily: "Yekan_Bakh_Regular",
    color: colors.medium,
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: colors.dark,
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
    fontFamily: "Yekan_Bakh_Bold",
    color: colors.secondary,
  },
  totalValue: {
    fontSize: 18,
    fontFamily: "Yekan_Bakh_Bold",
    color: colors.primary,
  },
});

export default InvoiceTotalCalculator;
