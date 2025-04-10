import React from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { InputContainer } from "../B2BFieldMarketer/AddNewShop";
import AppTextInput from "../../../components/TextInput";
import SelectionDialog from "../../../components/SelectionDialog";
import AppButton from "../../../components/Button";
import IconButton from "../../../components/IconButton";
import colors from "../../../config/colors";
import { useNavigation } from "@react-navigation/native";
import { AppNavigationProp } from "../../../StackNavigator";
import ScreenHeader from "../../../components/ScreenHeader";

const AddNewProject = () => {
  const navigation = useNavigation<AppNavigationProp>();
  return (
    <>
      <ScreenHeader title="ثبت پروژه جدید" />
      <View style={styles.container}>
        <ScrollView>
          <InputContainer title="مشخصات فردی">
            <AppTextInput
              autoCapitalize="none"
              icon="person"
              autoCorrect={false}
              keyboardType="default"
              placeholder="عنوان پروژه"
              onChangeText={() => {}}
            ></AppTextInput>
            <AppTextInput
              autoCapitalize="none"
              icon="person-4"
              autoCorrect={false}
              keyboardType="default"
              placeholder="نام و نام خانوادگی کارفرما"
              onChangeText={() => {}}
            ></AppTextInput>

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
            <AppTextInput
              autoCapitalize="none"
              icon="location-on"
              autoCorrect={false}
              keyboardType="default"
              placeholder="آدرس"
              onChangeText={() => {}}
            ></AppTextInput>

            <AppTextInput
              autoCapitalize="none"
              icon="numbers"
              autoCorrect={false}
              keyboardType="number-pad"
              placeholder="متراژ زیربنا"
              onChangeText={() => {}}
            ></AppTextInput>
            <AppTextInput
              autoCapitalize="none"
              icon="pin"
              autoCorrect={false}
              keyboardType="number-pad"
              placeholder="تعداد طبقات"
              onChangeText={() => {}}
            ></AppTextInput>
          </InputContainer>
          <InputContainer title="مرحله ی ساخت">
            <SelectionDialog
              placeholderText="وضعیت ساخت"
              title="مرحله ی ساخت در چه وضعیتی است؟"
              iconName="build"
              options={[
                "فنداسیون",
                "اسکلت",
                "سفت کاری",
                "نماکاری",
                "تاسیسات",
                "کاشی شده",
              ]}
              onSelect={(value) => {}}
            />
            <AppButton
              title="ثبت عکس های پروژه"
              onPress={() => {}}
              color="primaryLight"
            />
          </InputContainer>
          <InputContainer title="سطح محصول مورد نظر">
            <SelectionDialog
              placeholderText="وضعیت ساخت"
              title="مرحله ی ساخت در چه وضعیتی است؟"
              iconName="high-quality"
              options={["A", "B", "C"]}
              onSelect={(value) => {}}
            />
            <AppButton
              title="ثبت موقعیت جفرافیایی"
              onPress={() => {}}
              color="primaryLight"
            />
          </InputContainer>
          <InputContainer title="خلاصه مذاکرات انجام شده">
            <View style={{ width: "100%" }}>
              <IconButton
                text="ضبط صدا"
                iconName="record-voice-over"
                backgroundColor={colors.primaryLight}
                onPress={() => navigation.navigate("VoiceRecording")}
                //   gradient={true}
                //   iconSize={28}
                //   style={styles.voiceButton}
              />

              {/* {recordings.length > 0 && (
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
            )} */}
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
  submitButton: {
    height: 50,
    marginTop: 10,
  },
});

export default AddNewProject;
