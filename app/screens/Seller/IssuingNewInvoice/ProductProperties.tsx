import { RouteProp, useRoute } from "@react-navigation/native";
import React from "react";
import { StyleSheet, View } from "react-native";
import { IProduct } from "../../../config/types";
import AppText from "../../../components/Text";
import { toPersianDigits } from "../../../utils/converters";
import colors from "../../../config/colors";
import AppButton from "../../../components/Button";
import AppTextInput from "../../../components/TextInput";
import Checkbox from "../../../components/CheckBox";

type ProductPropertiesRouteProp = RouteProp<
  { ProductProperties: { product: IProduct } },
  "ProductProperties"
>;

const ProductProperties = () => {
  const route = useRoute<ProductPropertiesRouteProp>();
  const product = route.params.product;
  return (
    <View style={styles.container}>
      <View style={styles.prductContainer}>
        <AppText style={{ fontSize: 18, fontFamily: "Yekan_Bakh_Bold" }}>
          {product.name}
        </AppText>
        <View style={styles.devider}></View>
        {/* <View style={styles.properties}>
          <AppText style={{ fontFamily: "Yekan_Bakh_Bold" }}>
            موجودی فیزیکی:
          </AppText>
          <AppText>{toPersianDigits(product.physicalInventory)}</AppText>
        </View> */}
        <View style={styles.properties}>
          <AppText style={{ fontFamily: "Yekan_Bakh_Bold" }}>
            موجودی قابل تعهد:
          </AppText>
          <AppText>{toPersianDigits(product.accountableInventory)}</AppText>
        </View>
        <View style={styles.properties}>
          <AppText style={{ fontFamily: "Yekan_Bakh_Bold" }}>طیف:</AppText>
          <AppText>ندارد</AppText>
        </View>
        {/* <View style={styles.properties}>
          <AppText style={{ fontFamily: "Yekan_Bakh_Bold" }}>قیمت:</AppText>
          <AppText>{toPersianDigits(product.price.toString())}</AppText>
        </View> */}
      </View>
      <View style={styles.prductContainer}>
        <AppTextInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="number-pad"
          placeholder="تعداد سفارش خریدار (متر مربع)"
          onChangeText={() => {}}
        ></AppTextInput>
        <Checkbox label="محاسبه به صورت دستی انجام شود" />
        <AppButton title="محاسبه کن" onPress={() => {}} />
      </View>
      <AppTextInput
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="default"
        placeholder="توضیحات"
        onChangeText={() => {}}
        multiline
        numberOfLines={5}
        height={150}
      ></AppTextInput>
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: 10,
          flexDirection: "row-reverse",
          justifyContent: "space-between",
          gap: 15,
        }}
      >
        <AppButton
          title="ثبت کالا"
          onPress={() => {}}
          color="success"
          style={{ width: "48%" }}
        />
        <AppButton
          title="انصراف"
          onPress={() => {}}
          color="danger"
          style={{ width: "48%" }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  prductContainer: {
    borderWidth: 1,
    borderRadius: 15,
    borderColor: colors.primary,
    padding: 15,
    marginVertical: 15,
  },
  devider: {
    width: "100%",
    height: 1,
    backgroundColor: colors.dark,
    marginVertical: 10,
  },
  properties: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginVertical: 5,
  },
});

export default ProductProperties;
