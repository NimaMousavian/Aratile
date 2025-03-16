import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import AppTextInput from "../../../components/TextInput";
import AppButton from "../../../components/Button";
import AppPicker from "../../../components/Picker";
import { InputContainer } from "../../FieldMarketing/B2BFieldMarketer/AddNewShop";
import SelectionDialog from "../../../components/SelectionDialog";
import ScreenHeader from "../../../components/ScreenHeader";

const CustomerInfo = () => {
  return (
    <>
      <ScreenHeader title="ثبت خریدار جدید" />
      <View style={styles.container}>
        <ScrollView>
          <InputContainer title="اطلاعات مشتری">
            <AppTextInput
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="default"
              icon="person"
              placeholder="نام و نام خانوادگی"
              onChangeText={() => {}}
            ></AppTextInput>
            <AppTextInput
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="number-pad"
              icon="phone-android"
              placeholder="شماره موبایل "
              onChangeText={() => {}}
            ></AppTextInput>
            <SelectionDialog
              placeholderText="نوع مشتری"
              title="نوع مشتری"
              iconName="group"
              options={[
                "مصرف کننده",
                "همکار B2B",
                "انبوه ساز",
                "طراح",
                "کاشیکار",
                "سازنده",
                "ارگان دولتی",
                "واسط",
                "پیمانکار",
              ]}
              onSelect={(value) => {}}
            />

            <AppTextInput
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="default"
              icon="person-4"
              placeholder="نام مستعار/ جایگزین/ معرف"
              onChangeText={() => {}}
            ></AppTextInput>

            <SelectionDialog
              placeholderText="از طرف همکار معرفی شده؟"
              title="از طرف همکار معرفی شده؟"
              iconName="group"
              options={["بله", "خیر"]}
              onSelect={(value) => {}}
            />
            <AppTextInput
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="default"
              icon="location-pin"
              placeholder="آدرس مشتری"
              onChangeText={() => {}}
              multiline
              numberOfLines={5}
              height={150}
            ></AppTextInput>
            <SelectionDialog
              placeholderText="منطقه خریدار"
              title="منطقه خریدار"
              iconName="location-city"
              options={[
                "شاهین شهر",
                "مبارکه",
                "اصفهان",
                "دستگرد",
                "خورزوق",
                "دولت آباد",
                "خمینی شهر",
                "نجف آباد",
                "گلپایگان",
              ]}
              onSelect={(value) => {}}
            />
          </InputContainer>
          <InputContainer title="سایر اطلاعات">
            <AppTextInput
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="default"
              icon="pin"
              placeholder="متراژ درخواستی"
              onChangeText={() => {}}
            ></AppTextInput>
            <AppTextInput
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="default"
              icon="text-snippet"
              placeholder="توضیحات"
              onChangeText={() => {}}
              multiline
              numberOfLines={5}
              height={150}
            ></AppTextInput>
          </InputContainer>

          <AppButton
            title="ثبت"
            onPress={() => {}}
            style={{ width: "100%" }}
            color="success"
          />
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
});

export default CustomerInfo;
