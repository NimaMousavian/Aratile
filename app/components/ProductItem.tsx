import React, { useState } from "react";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import colors from "../config/colors";
import { IProduct } from "../config/types";
import AppText from "./Text";
import { toPersianDigits } from "../utils/converters";
import { useNavigation } from "@react-navigation/native";
import { AppNavigationProp } from "../SellerStackNavigator";
import ProductProperties from "../screens/Seller/IssuingNewInvoice/ProductProperties";

interface IProps {
  product: IProduct;
}

const ProductItem: React.FC<IProps> = ({ product }) => {
  const navigation = useNavigation<AppNavigationProp>();
  const [productPropertiesShow, setProductPropertiesShow] =
    useState<boolean>(false);
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setProductPropertiesShow(true)}>
        <AppText style={{ fontSize: 18, fontFamily: "Yekan_Bakh_Bold" }}>
          {product.name}
        </AppText>
        <View style={styles.devider}></View>
        <View style={styles.properties}>
          <AppText style={{ fontFamily: "Yekan_Bakh_Bold" }}>
            موجودی فیزیکی:
          </AppText>
          <AppText>{toPersianDigits(product.physicalInventory)}</AppText>
        </View>
        <View style={styles.properties}>
          <AppText style={{ fontFamily: "Yekan_Bakh_Bold" }}>
            موجودی قابل تعهد:
          </AppText>
          <AppText>{toPersianDigits(product.accountableInventory)}</AppText>
        </View>
        <View style={styles.properties}>
          <AppText style={{ fontFamily: "Yekan_Bakh_Bold" }}>درجه:</AppText>
          <AppText>{product.grade}</AppText>
        </View>
        <View style={styles.properties}>
          <AppText style={{ fontFamily: "Yekan_Bakh_Bold" }}>قیمت:</AppText>
          <AppText>{toPersianDigits(product.price.toString())}</AppText>
        </View>
      </TouchableOpacity>
      <Modal visible={productPropertiesShow} animationType="slide">
        <ProductProperties
          product={product}
          onClose={() => setProductPropertiesShow(false)}
        />
      </Modal>
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

export default ProductItem;
