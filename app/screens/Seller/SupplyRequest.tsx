import React, { useState } from "react";
import { Modal, StyleSheet, View } from "react-native";
import AppText from "../../components/Text";
import AppButton from "../../components/Button";
import AppTextInput from "../../components/TextInput";
import { ISupplyRequest } from "../../config/types";

const sampleDatas: ISupplyRequest[] = [
  {
    id: 1,
    title: "پرسلان نگار ارتور سفید مات",
    requestCount: 160,
    grade: "۱",
    status: "بررسی نشده",
    dateCreated: "۱۴۰۳/۹/۲۷",
    dateModified: "۱۴۰۳/۹/۲۷",
  },
  {
    id: 2,
    title: "پرسلان نگار ارتور سفید مات",
    requestCount: 500,
    grade: "۱",
    status: "عدم تولید",
    dateCreated: "۱۴۰۳/۹/۲۷",
    dateModified: "۱۴۰۳/۹/۲۷",
  },
  {
    id: 3,
    title: "پرسلان نگار ارتور سفید مات",
    requestCount: 88,
    grade: "۱",
    status: "تامین شد",
    dateCreated: "۱۴۰۳/۹/۲۷",
    dateModified: "۱۴۰۳/۹/۲۷",
  },
  {
    id: 4,
    title: "پرسلان نگار ارتور سفید مات",
    requestCount: 150,
    grade: "۱",
    status: "تامین شد",
    dateCreated: "۱۴۰۳/۹/۲۷",
    dateModified: "۱۴۰۳/۹/۲۷",
  },
];

const SupplyRequest = () => {
  const [showModal, setShowModal] = useState<boolean>(false);

  return (
    <View style={styles.container}>
      <AppText style={styles.productTitle}>عنوان کالا</AppText>
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
          onPress={() => {}}
          color="danger"
          style={{ width: "49%" }}
        />
      </View>
      <Modal visible={showModal} animationType="slide">
        <View style={{ padding: 20, flex: 1 }}>
          <AppTextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="default"
            placeholder="نام کالا را وارد کنید"
            onChangeText={() => {}}
            style={{ width: "100%" }}
          ></AppTextInput>
          <AppButton title="جستجو" onPress={() => {}} color="success" />
          <AppButton
            title="بستن"
            onPress={() => setShowModal(false)}
            color="danger"
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50, padding: 20 },
  productTitle: {
    textAlign: "center",
    fontFamily: "Yekan_Bakh_Bold",
    marginVertical: 15,
  },
  buttonContainer: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
  },
});

export default SupplyRequest;
