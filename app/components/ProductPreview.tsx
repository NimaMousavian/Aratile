import React from "react";
import { StyleSheet, View } from "react-native";
import colors from "../config/colors";
import AppText from "./Text";
import AppButton from "./Button";
import { toPersianDigits } from "../utils/converters";

interface IProps {
  title: string;
  orderCount: string;
}

const ProductPreview: React.FC<IProps> = ({ title, orderCount }) => {
  return (
    <View style={styles.container}>
      <AppText style={{ fontFamily: "Yekan_Bakh_Bold", textAlign: "center" }}>
        {title}
      </AppText>
      <AppText style={{ textAlign: "center" }}>{`تعداد سفارش: ${toPersianDigits(
        orderCount
      )} متر مربع`}</AppText>
      <View style={styles.buttonContainer}>
        <AppButton
          title="ویرایش"
          onPress={() => {}}
          color="warning"
          style={{ width: "48%" }}
        />
        <AppButton
          title="حذف"
          onPress={() => {}}
          color="danger"
          style={{ width: "48%" }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 15,
    borderColor: colors.primary,
    padding: 15,
    marginVertical: 15,
  },
  buttonContainer: {
    flexDirection: "row-reverse",
    gap: 10,
  },
});

export default ProductPreview;
