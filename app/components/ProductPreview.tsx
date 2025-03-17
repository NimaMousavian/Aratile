import React from "react";
import { StyleSheet, View } from "react-native";
import colors from "../config/colors";
import AppText from "./Text";
import AppButton from "./Button";
import { toPersianDigits } from "../utils/converters";
import IconButton from "./IconButton";

interface IProps {
  title: string;
  orderCount: string;
}

const ProductPreview: React.FC<IProps> = ({ title, orderCount }) => {
  return (
    <View style={styles.container}>
      <AppText
        style={{
          fontFamily: "Yekan_Bakh_Bold",
          textAlign: "center",
          color: colors.primary,
        }}
      >
        {title}
      </AppText>
      <View style={styles.divider}></View>
      <View style={styles.orderCountContainer}>
        <AppText
          style={{ textAlign: "center", color: colors.medium }}
        >{`تعداد سفارش:`}</AppText>
        <AppText style={styles.orderCountText}>{`${toPersianDigits(
          orderCount
        )} متر مربع`}</AppText>
      </View>
      <View style={styles.buttonContainer}>
        <IconButton
          text="ویرایش"
          onPress={() => {}}
          iconName="edit"
          backgroundColor={colors.warning}
          style={{ width: "48%" }}
        />
        <IconButton
          text="حذف"
          onPress={() => {}}
          iconName="delete"
          backgroundColor={colors.danger}
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
    borderColor: colors.gray,
    padding: 10,
    marginVertical: 15,
  },
  buttonContainer: {
    flexDirection: "row-reverse",
    gap: 10,
    marginTop: 12,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: colors.gray,
    marginVertical: 10,
  },
  orderCountContainer: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
  },
  orderCountText: {
    fontFamily: "Yekan_Bakh_Bold",
    marginRight: 8,
  },
});

export default ProductPreview;
