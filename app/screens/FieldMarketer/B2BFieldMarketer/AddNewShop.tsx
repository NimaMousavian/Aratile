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
import SelectionBottomSheet from "../../components/SelectionDialog";
import LocationService from "../IssuingNewInvoice/api/LocationService";
import Toast from "../../components/Toast";
import { IShopCustomField } from "../../config/types";
import axios from "axios";
import appConfig from "../../../config";

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

  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<
    "success" | "error" | "warning" | "info"
  >("error");

  const showToast = (
    message: string,
    type: "success" | "error" | "warning" | "info" = "error"
  ) => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [provinces, setProvinces] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);

  const [shopCustomeField, setShopCustomeField] = useState<IShopCustomField[]>(
    []
  );
  const [customFieldType1, setCustomFieldType1] = useState<IShopCustomField[]>(
    []
  );
  const [customFieldType2, setCustomFieldType2] = useState<IShopCustomField[]>(
    []
  );
  const [customFieldType3, setCustomFieldType3] = useState<IShopCustomField[]>(
    []
  );
  const [customFieldOtherTypes, setCustomFieldOtherTypes] = useState<
    IShopCustomField[]
  >([]);

  useEffect(() => {
    const fetchProvinces = async () => {
      setLoadingProvinces(true);
      try {
        const provinceNames = await LocationService.getProvinceNames();
        setProvinces(provinceNames);
      } catch (error) {
        console.error("خطا در دریافت لیست استان‌ها:", error);
        showToast("خطا در دریافت لیست استان‌ها", "error");
      } finally {
        setLoadingProvinces(false);
      }
    };

    const fetchShopCustomField = async () => {
      try {
        const response = await axios.get<IShopCustomField[]>(
          `${appConfig.mobileApi}ShopCustomField/GetAll`
        );
        const type1 = response.data
          .filter((customField) => customField.ShopCustomFieldGroupId === 1)
          .sort((customField) => customField.Form_ShowOrder);
        const type2 = response.data.filter(
          (customField) => customField.ShopCustomFieldGroupId === 2
        );
        const type3 = response.data.filter(
          (customField) => customField.ShopCustomFieldGroupId === 3
        );

        setCustomFieldType1(type1);
        setCustomFieldType2(type2);
        setCustomFieldType3(type3);

        setShopCustomeField(response.data);
        console.log(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchProvinces();
    fetchShopCustomField();
  }, []);

  const fetchCitiesByProvince = async (provinceName: string) => {
    if (!provinceName) return;

    setLoadingCities(true);
    setCities([]);
    setSelectedCity("");

    try {
      const cityNames = await LocationService.getCityNamesByProvinceName(
        provinceName
      );

      if (cityNames.length === 0) {
        setCities(["خطا در دریافت شهرها، لطفاً دوباره تلاش کنید"]);
        showToast("شهری برای این استان یافت نشد", "warning");
      } else {
        setCities(cityNames);
      }
    } catch (error) {
      console.error(`خطا در دریافت شهرهای استان ${provinceName}:`, error);
      setCities(["خطا در دریافت شهرها، لطفاً دوباره تلاش کنید"]);
      showToast("خطا در دریافت شهرها", "error");
    } finally {
      setLoadingCities(false);
    }
  };

  const handleProvinceSelection = (value: string[]): void => {
    if (value && value.length > 0) {
      const provinceName = value[0];
      setSelectedProvince(provinceName);
      setSelectedCity("");
      fetchCitiesByProvince(provinceName);
    }
  };

  const handleCitySelection = (value: string[]): void => {
    if (value && value.length > 0) {
      setSelectedCity(value[0]);
    }
  };

  const handleCityClick = (): void => {
    showToast("لطفاً ابتدا استان را انتخاب کنید", "error");
  };

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

  const renderInput = (customField: IShopCustomField): React.ReactNode => {
    switch (customField.FieldType) {
      case 1:
        return (
          <AppTextInput
            autoCapitalize="none"
            icon={
              customField.IconName as React.ComponentProps<
                typeof MaterialIcons
              >["name"]
            }
            autoCorrect={false}
            keyboardType="default"
            placeholder={customField.FieldName}
            onChangeText={() => {}}
          ></AppTextInput>
        );
      case 2:
        return;
      case 3:
        return;
      case 4:
        return;
      case 5:
        return;
      case 6:
        return;
      case 7:
        return;

      default:
        break;
    }
  };

  return (
    <>
      <ScreenHeader title="ثبت فروشگاه جدید" />
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onDismiss={() => setToastVisible(false)}
      />
      <View style={styles.container}>
        <ScrollView>
          {/* All the previous input containers remain the same */}
          <InputContainer title="مشخصات فروشگاه">
            <AppTextInput
              autoCapitalize="none"
              icon="shopping-bag"
              autoCorrect={false}
              keyboardType="default"
              placeholder="نام فروشگاه"
              onChangeText={() => {}}
            ></AppTextInput>
            <View style={styles.rowContainer}>
              <View style={styles.halfWidth}>
                <SelectionBottomSheet
                  key={`city-${selectedProvince}`}
                  placeholderText={selectedCity || "شهرستان"}
                  title="شهرستان"
                  iconName="apartment"
                  options={selectedProvince ? cities : []}
                  onSelect={handleCitySelection}
                  loading={loadingCities}
                  onPress={selectedProvince ? undefined : handleCityClick}
                />
              </View>
              <View style={styles.halfWidth}>
                <SelectionBottomSheet
                  placeholderText={selectedProvince || "استان"}
                  title="استان"
                  iconName="map"
                  options={provinces}
                  onSelect={handleProvinceSelection}
                  loading={loadingProvinces}
                />
              </View>
            </View>
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
              placeholder="نوع مالکیت فروشگاه"
              onChangeText={() => {}}
            ></AppTextInput>
          </InputContainer>
          <InputContainer title="مشخصات فردی">
            <AppTextInput
              autoCapitalize="none"
              icon="person"
              autoCorrect={false}
              keyboardType="default"
              placeholder="نام"
              onChangeText={() => {}}
            ></AppTextInput>
            <AppTextInput
              autoCapitalize="none"
              icon="person"
              autoCorrect={false}
              keyboardType="default"
              placeholder="نام خانوادگی"
              onChangeText={() => {}}
            ></AppTextInput>
            {/* <AppTextInput
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
              onChangeText={() => {}}
            ></AppTextInput> */}
            <AppTextInput
              autoCapitalize="none"
              icon="phone-android"
              autoCorrect={false}
              keyboardType="number-pad"
              placeholder="شماره موبایل"
              onChangeText={() => { }}
            ></AppTextInput>
            {/* <AppTextInput
              autoCapitalize="none"
              icon="local-phone"
              autoCorrect={false}
              keyboardType="number-pad"
              placeholder="شماره تلفن"
              onChangeText={() => {}}
            ></AppTextInput> */}
          </InputContainer>

          {/* Other input containers remain the same */}
          {/* <InputContainer title="وضعیت تاهل">
            <SelectionDialog
              placeholderText="وضعیت تاهل"
              title="وضعیت تاهل"
              options={["متاهل", "مجرد"]}
              onSelect={(value) => { }}
              iconName="person"
            />
            <View></View>
          </InputContainer> */}

          <InputContainer title="مشخصات انبار">
            <SelectionDialog
              placeholderText="انبار دارد یا ندارد"
              title="انبار دارد یا ندارد"
              iconName="cell-tower"
              options={["بله", "خیر"]}
              onSelect={(value) => {}}
            />
            <AppTextInput
              autoCapitalize="none"
              icon="shop"
              autoCorrect={false}
              keyboardType="default"
              placeholder="نوع مالکیت انبار"
              onChangeText={() => {}}
            ></AppTextInput>
            <AppTextInput
              autoCapitalize="none"
              icon="shop"
              autoCorrect={false}
              keyboardType="default"
              placeholder="متراژ انبار"
              onChangeText={() => { }}
            ></AppTextInput>
            {/* <AppTextInput
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
              onChangeText={() => {}}
            ></AppTextInput> */}
            {/* <AppTextInput
              autoCapitalize="none"
              icon="shop"
              autoCorrect={false}
              keyboardType="default"
              placeholder="ثبت عکس های انبار"
              onChangeText={() => {}}
            ></AppTextInput> */}
          </InputContainer>

          {/* <InputContainer title="زمینه فعالیت فروشگاه">
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
          </InputContainer> */}

          <InputContainer title="خلاصه مذاکرات انجام شده">
            <View style={styles.recordingsWrapper}>
              {/* <IconButton
                text="ضبط صدا"
                iconName="record-voice-over"
                backgroundColor={colors.primaryLight}
                onPress={() => navigation.navigate("VoiceRecording")}
                //   gradient={true}
                //   iconSize={28}
                //   style={styles.voiceButton}
              /> */}

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
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  halfWidth: {
    width: "48%",
  },
});

export default AddNewShop;
