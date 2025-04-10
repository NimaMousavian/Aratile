import React, { useState } from "react";
import { Modal, Platform, StyleSheet, View } from "react-native";
import AppText from "../components/Text";
import AppButton from "../components/Button";
import AppTextInput from "../components/TextInput";
import { ISupplyRequest } from "../config/types";
import colors from "../config/colors";
import ProductCard from "../components/ProductCard";
import { FlatList } from "react-native-gesture-handler";
import ScreenHeader from "../components/ScreenHeader";
import { productData } from "./ReceiveNewInvoiceScreen/ReceiveNewInvoiceScreen";

const SupplyRequest = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  return (
    <>
      <ScreenHeader title="درخواست تامین" />
      <View style={styles.container}>
        <AppTextInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="default"
          placeholder="نام کالا را وارد کنید"
          onChangeText={() => {}}
          style={{ width: "100%" }}
        ></AppTextInput>
        <AppButton title="جستجو" onPress={() => {}} color="success" />
        <FlatList
          data={productData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item: product }) => (
            <ProductCard
              key={product.id}
              title={product.title}
              onPress={() => {
                setSelectedProduct(product);
                setShowModal(true);
              }}
              // titleIcon={{
              //   name: "inventory",
              //   color: colors.primary,
              // }}
              fields={[
                {
                  icon: "qr-code",
                  iconColor: colors.secondary,
                  label: "کد:",
                  value: product.code,
                },
                {
                  icon: "straighten",
                  iconColor: colors.secondary,
                  label: "مقدار:",
                  value: product.quantity,
                },
                {
                  icon: "palette",
                  iconColor: colors.secondary,
                  label: "طیف رنگی:",
                  value: product.hasColorSpectrum ? "دارد" : "ندارد",
                  valueColor: product.hasColorSpectrum
                    ? colors.success
                    : colors.danger,
                },
              ]}
              note={product.note}
              noteConfig={{
                show: true,
                icon: "notes",
                iconColor: colors.secondary,
                label: "توضیحات:",
              }}
              qrConfig={{
                show: true,
                icon: "qr-code-2",
                iconSize: 36,
                iconColor: colors.secondary,
              }}
              containerStyle={
                Platform.OS === "android" ? styles.androidCardAdjustment : {}
              }
            />
          )}
        />

        <Modal visible={showModal} animationType="slide">
          <View style={{ padding: 20, flex: 1 }}>
            <View style={styles.productTitleContainer}>
              <AppText style={styles.productTitle}>
                {selectedProduct && selectedProduct.title}
              </AppText>
            </View>
            <AppTextInput
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="default"
              placeholder="درجه ی کالا"
              onChangeText={() => {}}
            ></AppTextInput>
            <AppTextInput
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="default"
              placeholder="سایز کالا"
              onChangeText={() => {}}
            ></AppTextInput>
            <AppTextInput
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="default"
              placeholder="پالت"
              onChangeText={() => {}}
            ></AppTextInput>
            <AppTextInput
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="default"
              placeholder="متراژ درخواستی"
              onChangeText={() => {}}
            ></AppTextInput>
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
            <View style={styles.buttonContainer}>
              <AppButton
                title="ثبت محصول"
                onPress={() => {}}
                color="success"
                style={{ width: "49%" }}
              />
              <AppButton
                title="بازگشت"
                onPress={() => setShowModal(false)}
                color="danger"
                style={{ width: "49%" }}
              />
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  androidContentAdjustment: {
    marginTop: 0,
  },
  androidCardAdjustment: {
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    marginVertical: 8,
  },
  productTitle: {
    textAlign: "center",
    fontFamily: "Yekan_Bakh_Bold",
    marginVertical: 15,
  },
  buttonContainer: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
  },
  productTitleContainer: {
    borderWidth: 1,
    borderColor: colors.medium,
    borderRadius: 15,
    padding: 5,
    marginVertical: 10,
  },
});

export default SupplyRequest;
