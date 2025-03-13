import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import AppTextInput from "../../../components/TextInput";
import AppButton from "../../../components/Button";
import AppPicker from "../../../components/Picker";

const CustomerInfo = () => {
  return (
    <View style={styles.container}>
      <ScrollView>
        <AppTextInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="number-pad"
          placeholder="شماره موبایل مشتری"
          onChangeText={() => {}}
        ></AppTextInput>
        <AppTextInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="default"
          placeholder="نام و نام خانوادگی مشتری"
          onChangeText={() => {}}
        ></AppTextInput>
        <AppPicker
          items={[
            {
              label: "مصرف کنندع",
              value: 1,
            },
            {
              label: "همکار B2B",
              value: 2,
            },
            {
              label: "انبوه ساز",
              value: 3,
            },
            {
              label: "طراح",
              value: 4,
            },
            {
              label: "کاشیکار",
              value: 5,
            },
            {
              label: "سازنده",
              value: 6,
            },
            {
              label: "ارگان دولتی",
              value: 7,
            },
            {
              label: "واسط",
              value: 8,
            },
            {
              label: "پیمانکار",
              value: 9,
            },
          ]}
          onSelectItem={() => {}}
          placeholder="نوع مشتری"
        ></AppPicker>
        <AppTextInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="default"
          placeholder="نام مستعار/ جایگزین/ معرف"
          onChangeText={() => {}}
        ></AppTextInput>
        <AppTextInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="default"
          placeholder="از طرف همکار معرفی شده؟"
          onChangeText={() => {}}
        ></AppTextInput>
        <AppTextInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="default"
          placeholder="آدرس مشتری"
          onChangeText={() => {}}
          multiline
          numberOfLines={5}
          height={150}
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
        <AppPicker
          items={[]}
          onSelectItem={() => {}}
          placeholder="منطقه خریدار"
        ></AppPicker>
        <AppButton
          title="ثبت"
          onPress={() => {}}
          style={{ width: "100%" }}
          color="success"
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
});

export default CustomerInfo;
