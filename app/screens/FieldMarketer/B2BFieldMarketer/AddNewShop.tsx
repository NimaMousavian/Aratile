import React, { useState, useEffect } from "react";
import { ScrollView, StyleSheet, View, Alert } from "react-native";
import AppText from "../../../components/Text";
import AppTextInput from "../../../components/TextInput";

import colors from "../../../config/colors";
import { LinearGradient } from "expo-linear-gradient";
import {
  DatePickerField,
  PersianDatePicker,
} from "../../../components/PersianDatePicker";
import IconButton from "../../../components/IconButton";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { AppNavigationProp } from "../../../StackNavigator";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import IconButtonSquare from "../../../components/IconButtonSquare";
import SelectionDialog from "../../../components/SelectionDialog";
import AppModal from "../../../components/AppModal";
import ScreenHeader from "../../../components/ScreenHeader";

export const InputContainer: React.FC<{
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
      <View style={styles.gridContainer}>{children.map((item) => item)}</View>
    </View>
  );
};

// Define the route params type
type AddNewShopRouteParams = {
  recordings?: { uri: string; duration: number }[];
};

const AddNewShop = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const route =
    useRoute<RouteProp<Record<string, AddNewShopRouteParams>, string>>();
  const [birthDateShow, setBirthDateShow] = useState<boolean>(false);
  const [recordings, setRecordings] = useState<
    { uri: string; duration: number }[]
  >([]);
  const [marriagShow, setMarriageShow] = useState<boolean>(true);
  const [textNoteShow, setTextShowNote] = useState<boolean>(false);

  useEffect(() => {
    // Check if we have recordings from the route params
    if (route.params?.recordings) {
      setRecordings(route.params.recordings);
      // Optionally show a success message or indicator
    }
  }, [route.params]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <>
      <ScreenHeader title="ثبت فروشگاه جدید" />
      <View style={styles.container}>
        <ScrollView>
          {/* All the previous input containers remain the same */}
          <InputContainer title="مشخصات فردی">
            <AppTextInput
              autoCapitalize="none"
              icon="person"
              autoCorrect={false}
              keyboardType="default"
              placeholder="نام و نام خانوادگی"
              onChangeText={() => { }}
            ></AppTextInput>
            <AppTextInput
              autoCapitalize="none"
              icon="person-4"
              autoCorrect={false}
              keyboardType="default"
              placeholder="نام پدر"
              onChangeText={() => { }}
            ></AppTextInput>
            <AppTextInput
              autoCapitalize="none"
              icon="location-on"
              autoCorrect={false}
              keyboardType="default"
              placeholder="محل تولد"
              onChangeText={() => { }}
            ></AppTextInput>

            <DatePickerField
              label="تاریخ تولد"
              onDateChange={(date) => { }}
              date="1400/01/01"
            />

            <AppTextInput
              autoCapitalize="none"
              icon="numbers"
              autoCorrect={false}
              keyboardType="number-pad"
              placeholder="کد ملی"
              onChangeText={() => { }}
            ></AppTextInput>
            <AppTextInput
              autoCapitalize="none"
              icon="phone-android"
              autoCorrect={false}
              keyboardType="number-pad"
              placeholder="شماره موبایل"
              onChangeText={() => { }}
            ></AppTextInput>
            <AppTextInput
              autoCapitalize="none"
              icon="local-phone"
              autoCorrect={false}
              keyboardType="number-pad"
              placeholder="شماره تلفن"
              onChangeText={() => { }}
            ></AppTextInput>
          </InputContainer>

          {/* Other input containers remain the same */}
          <InputContainer title="وضعیت تاهل">
            <SelectionDialog
              placeholderText="وضعیت تاهل"
              title="وضعیت تاهل"
              options={["متاهل", "مجرد"]}
              onSelect={(value) => { }}
              iconName="person"
            />
            <View></View>
          </InputContainer>

          <InputContainer title="مشخصات فروشگاه">
            <AppTextInput
              autoCapitalize="none"
              icon="shopping-bag"
              autoCorrect={false}
              keyboardType="default"
              placeholder="نام فروشگاه"
              onChangeText={() => { }}
            ></AppTextInput>
            <AppTextInput
              autoCapitalize="none"
              icon="shop"
              autoCorrect={false}
              keyboardType="default"
              placeholder="آدرس فروشگاه"
              onChangeText={() => { }}
            ></AppTextInput>
            <AppTextInput
              autoCapitalize="none"
              icon="shop"
              autoCorrect={false}
              keyboardType="default"
              placeholder="متراژ فروشگاه"
              onChangeText={() => { }}
            ></AppTextInput>
            <AppTextInput
              autoCapitalize="none"
              icon="shop"
              autoCorrect={false}
              keyboardType="default"
              placeholder="مدت زمان فعالیت (سال)"
              onChangeText={() => { }}
            ></AppTextInput>
            <AppTextInput
              autoCapitalize="none"
              icon="shop"
              autoCorrect={false}
              keyboardType="default"
              placeholder="مالکیت فروشگاه"
              onChangeText={() => { }}
            ></AppTextInput>
            <SelectionDialog
              placeholderText="پانل ریلی دارد یا خیر"
              title="پانل ریلی دارد یا خیر"
              options={["بله", "خیر"]}
              onSelect={(value) => { }}
              iconName="shop"
            />
            <AppTextInput
              autoCapitalize="none"
              icon="shop"
              autoCorrect={false}
              keyboardType="default"
              placeholder="تعداد دکور زنده"
              onChangeText={() => { }}
            ></AppTextInput>
            <AppTextInput
              autoCapitalize="none"
              icon="shop"
              autoCorrect={false}
              keyboardType="default"
              placeholder="ثبت عکس های فروشگاه"
              onChangeText={() => { }}
            ></AppTextInput>
          </InputContainer>
          <InputContainer title="مشخصات انبار">
            <AppTextInput
              autoCapitalize="none"
              icon="shop"
              autoCorrect={false}
              keyboardType="default"
              placeholder="آدرس انبار"
              onChangeText={() => { }}
            ></AppTextInput>
            <AppTextInput
              autoCapitalize="none"
              icon="shop"
              autoCorrect={false}
              keyboardType="default"
              placeholder="متراژ انبار"
              onChangeText={() => { }}
            ></AppTextInput>
            <AppTextInput
              autoCapitalize="none"
              icon="shop"
              autoCorrect={false}
              keyboardType="default"
              placeholder="تعداد لیفتراک"
              onChangeText={() => { }}
            ></AppTextInput>
            <AppTextInput
              autoCapitalize="none"
              icon="shop"
              autoCorrect={false}
              keyboardType="default"
              placeholder="متراژ دپویی"
              onChangeText={() => { }}
            ></AppTextInput>
            <AppTextInput
              autoCapitalize="none"
              icon="shop"
              autoCorrect={false}
              keyboardType="default"
              placeholder="مالکیت انبار"
              onChangeText={() => { }}
            ></AppTextInput>
            <AppTextInput
              autoCapitalize="none"
              icon="shop"
              autoCorrect={false}
              keyboardType="default"
              placeholder="ثبت عکس های انبار"
              onChangeText={() => { }}
            ></AppTextInput>
          </InputContainer>
          <InputContainer title="زمینه فعالیت فروشگاه">
            <SelectionDialog
              placeholderText="شبکه فروش دارد یا خیر"
              title="شبکه فروش دارد یا خیر"
              iconName="cell-tower"
              options={["بله", "خیر"]}
              onSelect={(value) => { }}
            />
            <SelectionDialog
              placeholderText="شریک دارد یا خیر"
              title="شریک دارد یا خیر"
              iconName="group"
              options={["بله", "خیر"]}
              onSelect={(value) => { }}
            />

            <AppTextInput
              autoCapitalize="none"
              icon="currency-exchange"
              autoCorrect={false}
              keyboardType="default"
              placeholder="سیستم مالی"
              onChangeText={() => { }}
            ></AppTextInput>
            <AppTextInput
              autoCapitalize="none"
              icon="pin-drop"
              autoCorrect={false}
              keyboardType="default"
              placeholder="ثبت موقعیت جغرافیایی"
              onChangeText={() => { }}
            ></AppTextInput>
          </InputContainer>

          <InputContainer title="خلاصه مذاکرات انجام شده">
            <View style={styles.recordingsWrapper}>
              <IconButton
                text="ضبط صدا"
                iconName="record-voice-over"
                backgroundColor={colors.primaryLight}
                onPress={() => navigation.navigate("VoiceRecording")}
              //   gradient={true}
              //   iconSize={28}
              //   style={styles.voiceButton}
              />

              {recordings.length > 0 && (
                <View style={styles.recordingsList}>
                  <AppText style={styles.recordingsTitle}>
                    صداهای ضبط شده ({recordings.length})
                  </AppText>

                  {recordings.map((item, index) => (
                    <View key={index} style={styles.recordingItem}>
                      <FontAwesome5
                        name="file-audio"
                        size={18}
                        color={colors.primary}
                      />
                      <AppText style={styles.recordingText}>
                        ضبط {index + 1} - {formatTime(item.duration)}
                      </AppText>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={{ marginVertical: 7 }}></View>
            <AppTextInput
              autoCorrect={false}
              placeholder="یادداشت متنی"
              keyboardType="default"
              multiline
              numberOfLines={10}
              height={200}
            />

            {/* <IconButton
            text="یادداشت متنی"
            iconName="text-snippet"
            backgroundColor={colors.primaryLight}
            onPress={() => setTextShowNote(true)}
            // gradient={true}
            // style={styles.textButton}
          /> */}
          </InputContainer>
          {/* <AppModal
          visible={textNoteShow}
          onClose={() => setTextShowNote(false)}
          onConfirm={() => setTextShowNote(false)}
          insideElement={
            <AppTextInput
              autoCorrect={false}
              placeholder="یادداشت خود را بنویسید..."
              keyboardType="default"
              multiline
              numberOfLines={10}
              height={200}
            />
          }
        /> */}

          <IconButton
            text="ثبت اطلاعات"
            iconName="done"
            onPress={() => {
              Alert.alert("موفق", "اطلاعات با موفقیت ثبت شد");
            }}
            backgroundColor={colors.success}
            flex={1}
            style={styles.submitButton}
          />
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 12,
    borderColor: colors.dark,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 1,
    backgroundColor: "#fff",
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
  voiceButton: {
    height: 60,
    marginVertical: 10,
  },
  textButton: {
    height: 60,
    marginVertical: 10,
  },
  submitButton: {
    height: 50,
    marginTop: 10,
    marginBottom: 30,
  },
  recordingsWrapper: {
    width: "100%",
  },
  recordingsList: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  recordingsTitle: {
    fontFamily: "Yekan_Bakh_Bold",
    fontSize: 16,
    color: colors.dark,
    marginBottom: 8,
  },
  recordingItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  recordingText: {
    fontFamily: "Yekan_Bakh_Regular",
    fontSize: 14,
    color: colors.dark,
    marginRight: 10,
  },
});

export default AddNewShop;
