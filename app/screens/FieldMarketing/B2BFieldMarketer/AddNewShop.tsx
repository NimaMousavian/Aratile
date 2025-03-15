import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import AppText from "../../../components/Text";
import AppTextInput from "../../../components/TextInput";
import { getFontFamily } from "../../Cashier/ReceiveNewInvoiceScreen/ReceiveNewInvoiceScreen";
import colors from "../../../config/colors";
import { LinearGradient } from "expo-linear-gradient";
import {
  DatePickerField,
  PersianDatePicker,
} from "../../../components/PersianDatePicker";
import IconButton from "../../../components/IconButton";
import { useNavigation } from "@react-navigation/native";
import { AppNavigationProp } from "../../../StackNavigator";

const AddNewShop = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const [birthDateShow, setBirthDateShow] = useState<boolean>(false);

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

          <DatePickerField
            label="تاریخ تولد"
            onDateChange={(date) => {}}
            date="1400/01/01"
          />

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
            placeholder="مالکیت فروشگاه"
            onChangeText={() => {}}
          ></AppTextInput>
          <AppTextInput
            autoCapitalize="none"
            icon="shop"
            autoCorrect={false}
            keyboardType="default"
            placeholder="پانل ریلی دارد یا خیر"
            onChangeText={() => {}}
          ></AppTextInput>
          <AppTextInput
            autoCapitalize="none"
            icon="shop"
            autoCorrect={false}
            keyboardType="default"
            placeholder="تعداد دکور زنده"
            onChangeText={() => {}}
          ></AppTextInput>
          <AppTextInput
            autoCapitalize="none"
            icon="shop"
            autoCorrect={false}
            keyboardType="default"
            placeholder="ثبت عکس های فروشگاه"
            onChangeText={() => {}}
          ></AppTextInput>
        </InputContainer>
        <InputContainer title="مشخصات انبار">
          <AppTextInput
            autoCapitalize="none"
            icon="shop"
            autoCorrect={false}
            keyboardType="default"
            placeholder="آدرس انبار"
            onChangeText={() => {}}
          ></AppTextInput>
          <AppTextInput
            autoCapitalize="none"
            icon="shop"
            autoCorrect={false}
            keyboardType="default"
            placeholder="متراژ انبار"
            onChangeText={() => {}}
          ></AppTextInput>
          <AppTextInput
            autoCapitalize="none"
            icon="shop"
            autoCorrect={false}
            keyboardType="default"
            placeholder="تعداد لیفتراک"
            onChangeText={() => {}}
          ></AppTextInput>
          <AppTextInput
            autoCapitalize="none"
            icon="shop"
            autoCorrect={false}
            keyboardType="default"
            placeholder="متراژ دپویی"
            onChangeText={() => {}}
          ></AppTextInput>
          <AppTextInput
            autoCapitalize="none"
            icon="shop"
            autoCorrect={false}
            keyboardType="default"
            placeholder="مالکیت انبار"
            onChangeText={() => {}}
          ></AppTextInput>
          <AppTextInput
            autoCapitalize="none"
            icon="shop"
            autoCorrect={false}
            keyboardType="default"
            placeholder="ثبت عکس های انبار"
            onChangeText={() => {}}
          ></AppTextInput>
        </InputContainer>
        <InputContainer title="زمینه فعالیت فروشگاه">
          <AppTextInput
            autoCapitalize="none"
            icon="shop"
            autoCorrect={false}
            keyboardType="default"
            placeholder="شبکه فروش دارد یا خیر"
            onChangeText={() => {}}
          ></AppTextInput>
          <AppTextInput
            autoCapitalize="none"
            icon="shop"
            autoCorrect={false}
            keyboardType="default"
            placeholder="شریک دارد یا خیر"
            onChangeText={() => {}}
          ></AppTextInput>
          <AppTextInput
            autoCapitalize="none"
            icon="shop"
            autoCorrect={false}
            keyboardType="default"
            placeholder="سیستم مالی"
            onChangeText={() => {}}
          ></AppTextInput>
          <AppTextInput
            autoCapitalize="none"
            icon="shop"
            autoCorrect={false}
            keyboardType="default"
            placeholder="ثبت موقعیت جغرافیایی"
            onChangeText={() => {}}
          ></AppTextInput>
        </InputContainer>
        <InputContainer title="خلاصه مذاکرات انجام شده">
          <IconButton
            text="صوتی"
            iconName="record-voice-over"
            backgroundColor={colors.primaryLight}
            onPress={() => navigation.navigate("VoiceRecording")}
          />
          <View style={{ marginVertical: 7 }}></View>
          <IconButton
            text="متنی"
            iconName="text-snippet"
            backgroundColor={colors.primaryLight}
            onPress={() => {}}
          />
        </InputContainer>
        <IconButton
          text="ثبت"
          iconName="done"
          onPress={() => {}}
          backgroundColor={colors.success}
          flex={1}
        />
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
