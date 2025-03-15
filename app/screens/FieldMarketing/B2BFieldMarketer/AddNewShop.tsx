import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import AppText from "../../../components/Text";
import AppTextInput from "../../../components/TextInput";
import { getFontFamily } from "../../Cashier/ReceiveNewInvoiceScreen/ReceiveNewInvoiceScreen";
import colors from "../../../config/colors";
import { LinearGradient } from "expo-linear-gradient";

const AddNewShop = () => {
  const InputContainer: React.FC<{
    title: string;
    children: React.ReactElement[];
  }> = ({ title, children }) => {
    return (
      <View style={styles.inputContainer}>
        <View style={styles.titleContainer}>
          <LinearGradient
            colors={[colors.secondary, colors.primary]}
            style={styles.inputHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <AppText style={styles.title}>{title}</AppText>
          </LinearGradient>
        </View>
        {/* <View style={styles.divider}></View> */}
        <View style={styles.gridContainer}>{children.map((item) => item)}</View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <InputContainer title="مشخصات فردی">
          <AppTextInput
            autoCapitalize="none"
            icon="person"
            autoCorrect={false}
            keyboardType="default"
            placeholder="نام و نام خانوادگی"
            onChangeText={() => {}}
          ></AppTextInput>
          <AppTextInput
            autoCapitalize="none"
            icon="person-4"
            autoCorrect={false}
            keyboardType="default"
            placeholder="نام پدر"
            onChangeText={() => {}}
          ></AppTextInput>
          <AppTextInput
            autoCapitalize="none"
            icon="location-on"
            autoCorrect={false}
            keyboardType="default"
            placeholder="محل تولد"
            onChangeText={() => {}}
          ></AppTextInput>
          <AppTextInput
            autoCapitalize="none"
            icon="calendar-month"
            autoCorrect={false}
            keyboardType="default"
            placeholder="تاریخ تولد"
            onChangeText={() => {}}
          ></AppTextInput>
          <AppTextInput
            autoCapitalize="none"
            icon="numbers"
            autoCorrect={false}
            keyboardType="number-pad"
            placeholder="کد ملی"
            onChangeText={() => {}}
          ></AppTextInput>
          {/* <AppTextInput
          autoCapitalize="none"
          icon="person-4"
          autoCorrect={false}
          keyboardType="number-pad"
          placeholder="شماره شناسنامه"
          onChangeText={() => {}}
        ></AppTextInput> */}
          <AppTextInput
            autoCapitalize="none"
            icon="phone-android"
            autoCorrect={false}
            keyboardType="number-pad"
            placeholder="شماره موبایل"
            onChangeText={() => {}}
          ></AppTextInput>
          <AppTextInput
            autoCapitalize="none"
            icon="local-phone"
            autoCorrect={false}
            keyboardType="number-pad"
            placeholder="شماره تلفن"
            onChangeText={() => {}}
          ></AppTextInput>
        </InputContainer>
        <InputContainer title="وضعیت تاهل">
          <AppTextInput
            autoCapitalize="none"
            icon="person"
            autoCorrect={false}
            keyboardType="default"
            placeholder="انتخاب کنید"
            onChangeText={() => {}}
          ></AppTextInput>
          <View></View>
        </InputContainer>
        <InputContainer title="مشخصات فروشگاه">
          <AppTextInput
            autoCapitalize="none"
            icon="shopping-bag"
            autoCorrect={false}
            keyboardType="default"
            placeholder="نام فروشگاه"
            onChangeText={() => {}}
          ></AppTextInput>
          <AppTextInput
            autoCapitalize="none"
            icon="shop"
            autoCorrect={false}
            keyboardType="default"
            placeholder="آدرس فروشگاه"
            onChangeText={() => {}}
          ></AppTextInput>
          <AppTextInput
            autoCapitalize="none"
            icon="shop"
            autoCorrect={false}
            keyboardType="default"
            placeholder="متراژ فروشگاه"
            onChangeText={() => {}}
          ></AppTextInput>
          <AppTextInput
            autoCapitalize="none"
            icon="shop"
            autoCorrect={false}
            keyboardType="default"
            placeholder="مدت زمان فعالیت (سال)"
            onChangeText={() => {}}
          ></AppTextInput>
          <AppTextInput
            autoCapitalize="none"
            icon="shop"
            autoCorrect={false}
            keyboardType="default"
            placeholder=""
            onChangeText={() => {}}
          ></AppTextInput>
          <AppTextInput
            autoCapitalize="none"
            icon="shop"
            autoCorrect={false}
            keyboardType="default"
            placeholder=""
            onChangeText={() => {}}
          ></AppTextInput>
        </InputContainer>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50 },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 12,
    borderColor: colors.dark,
    marginBottom: 15,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: colors.gray,
    marginVertical: 5,
  },
  gridContainer: {
    padding: 15,
  },
  titleContainer: {},
  title: {
    fontFamily: "Yekan_Bakh_Bold",
    fontSize: 20,
    textAlign: "center",
    color: colors.white,
  },
  inputHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    padding: 12,
    justifyContent: "center",
    borderTopRightRadius: 12,
    borderTopLeftRadius: 12,
  },
});

export default AddNewShop;
