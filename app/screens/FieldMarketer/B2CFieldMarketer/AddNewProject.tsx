import React, { useState, useEffect } from "react";
import { ScrollView, StyleSheet, View, Platform, TouchableOpacity } from "react-native";
import { InputContainer } from "../B2BFieldMarketer/AddNewShop";
import AppTextInput from "../../../components/TextInput";
import SelectionBottomSheet from "../../../components/SelectionDialog";
import IconButton from "../../../components/IconButton";
import colors from "../../../config/colors";
import { useNavigation } from "@react-navigation/native";
import { AppNavigationProp } from "../../../StackNavigator";
import ScreenHeader from "../../../components/ScreenHeader";
import LocationService from "../../IssuingNewInvoice/api/LocationService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ILoginResponse } from "../../../config/types";
import Toast from "../../../components/Toast";
import axios from "axios";
import appConfig from "../../../../config";
import { MaterialIcons } from "@expo/vector-icons";
import ColleagueBottomSheet, { Colleague } from "../../IssuingNewInvoice/ColleagueSearchModal";
import Text from "../../../components/Text";

const getFontFamily = (baseFont: string, weight: string): string => {
  if (Platform.OS === "android") {
    switch (weight) {
      case "700":
      case "bold":
        return "Yekan_Bakh_Bold";
      case "500":
      case "600":
      case "semi-bold":
        return "Yekan_Bakh_Bold";
      default:
        return "Yekan_Bakh_Regular";
    }
  }
  return baseFont;
};

const getLoginResponse = async (): Promise<ILoginResponse | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem("loginResponse");
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error("Error retrieving login response:", error);
    return null;
  }
};

const AddNewProject = () => {
  const navigation = useNavigation<AppNavigationProp>();

  const [customerFirstName, setCustomerFirstName] = useState("");
  const [customerLastName, setCustomerLastName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [isColleagueSheetVisible, setIsColleagueSheetVisible] = useState(false);

  const [projectTitle, setProjectTitle] = useState("");
  const [address, setAddress] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const [provinces, setProvinces] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);
  const [defaultProvinceId, setDefaultProvinceId] = useState<number | null>(null);
  const [defaultCityId, setDefaultCityId] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "warning" | "info">("error");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [textNote, setTextNote] = useState("");

  // Add a state to track if customer info is filled
  const hasCustomerInfo = customerFirstName && customerLastName && customerPhone;

  const showToast = (message: string, type: "success" | "error" | "warning" | "info" = "error"): void => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const hideToast = (): void => {
    setToastVisible(false);
  };

  useEffect(() => {
    const loadDefaultLocation = async () => {
      try {
        const loginResponse = await getLoginResponse();
        if (loginResponse) {
          const provinceId = loginResponse.ProvinceId;
          const cityId = loginResponse.CityId;
          const provinceName = loginResponse.ProvinceName;
          const cityName = loginResponse.CityName;

          // Set userId from login response
          setUserId(loginResponse.UserId);

          if (provinceId && provinceName) {
            setDefaultProvinceId(provinceId);
            setSelectedProvince(provinceName);
          }

          if (cityId && cityName) {
            setDefaultCityId(cityId);
            setSelectedCity(cityName);
          }

          if (provinceName) {
            fetchCitiesByProvince(provinceName);
          }
        }
      } catch (error) {
        console.error("خطا در دریافت مقادیر پیش‌فرض:", error);
      }
    };

    loadDefaultLocation();
  }, [provinces.length]);

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

    fetchProvinces();
  }, []);

  const fetchCitiesByProvince = async (provinceName: string) => {
    if (!provinceName) return;

    setLoadingCities(true);
    setCities([]);

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

  const handleAddIconPress = (): void => {
    setIsColleagueSheetVisible(true);
  };

  // Add a handler for clearing customer info
  const handleClearCustomerInfo = (): void => {
    setCustomerFirstName("");
    setCustomerLastName("");
    setCustomerPhone("");
    setCustomerId(null);
  };

  const handleSelectColleague = (colleague: Colleague): void => {
    // Extract first name and last name from the full name
    const nameParts = colleague.name.split(' ');
    let firstName = '';
    let lastName = '';

    if (nameParts.length >= 2) {
      firstName = nameParts[0];
      lastName = nameParts.slice(1).join(' ');
    } else if (nameParts.length === 1) {
      firstName = nameParts[0];
    }

    // Update the customer information fields
    setCustomerFirstName(firstName);
    setCustomerLastName(lastName);
    setCustomerPhone(colleague.phone);

    // If you have a customerId, set it
    if (colleague.id) {
      setCustomerId(parseInt(colleague.id, 10));
    }

    // Close the colleague selection sheet
    setIsColleagueSheetVisible(false);
  };

  const getProvinceIdByName = async (provinceName: string): Promise<number | null> => {
    try {
      const provinceId = await LocationService.getProvinceIdByName(provinceName);
      return provinceId;
    } catch (error) {
      console.error("Error getting province ID:", error);
      return defaultProvinceId;
    }
  };

  const getCityIdByName = async (cityName: string, provinceName: string): Promise<number | null> => {
    try {
      const provinces = await LocationService.getAllProvinces();
      const province = provinces.find(p => p.ProvinceName === provinceName);

      if (!province) {
        console.error(`Province not found: ${provinceName}`);
        return defaultCityId;
      }

      const cities = await LocationService.getCitiesByProvinceId(province.ProvinceId);
      const city = cities.find(c => c.CityName === cityName);

      return city ? city.CityId : defaultCityId;
    } catch (error) {
      console.error("Error getting city ID:", error);
      return defaultCityId;
    }
  };

  const handleSubmit = async () => {
    if (!customerFirstName.trim() || !customerLastName.trim() || !customerPhone.trim()) {
      showToast("لطفاً مشخصات کارفرما را کامل کنید", "error");
      return;
    }

    if (!projectTitle.trim()) {
      showToast("لطفاً عنوان پروژه را وارد کنید", "error");
      return;
    }

    if (!selectedProvince || !selectedCity) {
      showToast("لطفاً استان و شهرستان را انتخاب کنید", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const provinceId = await getProvinceIdByName(selectedProvince) || defaultProvinceId;
      const cityId = await getCityIdByName(selectedCity, selectedProvince) || defaultCityId;

      if (!provinceId || !cityId) {
        showToast("خطا در دریافت اطلاعات استان و شهر", "error");
        setIsSubmitting(false);
        return;
      }

      const personFullName = `${customerFirstName} ${customerLastName}`;
      const currentDate = new Date().toISOString();

      const projectData = {
        PersonProjectId: 0,
        PersonId: customerId,
        PersonFullName: personFullName,
        CityId: cityId,
        CityName: selectedCity,
        ProvinceId: provinceId,
        ProvinceName: selectedProvince,
        ProjectName: projectTitle,
        ApplicationUserId: userId || 0,
        ApplicationUserName: null,
        Description: textNote || address || '',
        InsertDate: currentDate,
        LastUpdateDate: null,
        PersonProjectCustomFieldList: null
      };

      console.log("Submitting project data:", JSON.stringify(projectData));

      const token = (await getLoginResponse())?.Token;
      if (!token) {
        showToast("خطا در دریافت توکن احراز هویت", "error");
        setIsSubmitting(false);
        return;
      }

      const response = await axios.post(
        `${appConfig.mobileApi}PersonProject/Add`,
        projectData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200 || response.status === 201) {
        showToast("پروژه با موفقیت ثبت شد", "success");

        setTimeout(() => {
          navigation.goBack();
        }, 1500);
      } else {
        showToast("خطا در ثبت پروژه", "error");
      }
    } catch (error) {
      console.error("Error submitting project:", error);

      if (error.response && error.response.data) {
        if (error.response.data.message) {
          showToast(error.response.data.message, "error");
        } else {
          showToast("خطا در ثبت پروژه", "error");
        }
      } else {
        showToast("خطا در ارتباط با سرور", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCustomerFirstName("");
    setCustomerLastName("");
    setCustomerPhone("");
    setProjectTitle("");
    setAddress("");
    setTextNote("");
  };

  // Render input fields for customer information that are not editable when populated
  const renderCustomerInputs = () => {
    return (
      <>
        <AppTextInput
          autoCapitalize="none"
          icon="person"
          autoCorrect={false}
          keyboardType="default"
          placeholder="نام"
          value={customerFirstName}
          onChangeText={customerFirstName ? undefined : setCustomerFirstName} // Disable editing if value exists
          editable={!customerFirstName} // Disable editing if value exists
          style={customerFirstName ? styles.disabledInput : {}}
        />
        <AppTextInput
          autoCapitalize="none"
          icon="person"
          autoCorrect={false}
          keyboardType="default"
          placeholder="نام خانوادگی"
          value={customerLastName}
          onChangeText={customerLastName ? undefined : setCustomerLastName} // Disable editing if value exists
          editable={!customerLastName} // Disable editing if value exists
          style={customerLastName ? styles.disabledInput : {}}
        />
        <AppTextInput
          autoCapitalize="none"
          icon="phone-android"
          autoCorrect={false}
          keyboardType="number-pad"
          placeholder="شماره تماس"
          value={customerPhone}
          onChangeText={customerPhone ? undefined : setCustomerPhone} // Disable editing if value exists
          editable={!customerPhone} // Disable editing if value exists
          style={customerPhone ? styles.disabledInput : {}}
        />
      </>
    );
  };

  return (
    <>
      <ScreenHeader title="ثبت پروژه جدید" />

      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onDismiss={hideToast}
      />

      <View style={styles.container}>
        <ScrollView>
          <InputContainer title="مشخصات پروژه">
            <AppTextInput
              autoCapitalize="none"
              icon="business"
              autoCorrect={false}
              keyboardType="default"
              placeholder="عنوان پروژه"
              onChangeText={setProjectTitle}
              value={projectTitle}
            />

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
              icon="location-on"
              autoCorrect={false}
              keyboardType="default"
              placeholder="آدرس"
              onChangeText={setAddress}
              value={address}
              multiline
              numberOfLines={5}
              height={150}
              textAlign="right"
              isLargeInput={true}
            />
          </InputContainer>

          <InputContainer
            title="مشخصات کارفرما"
            showAddIcon={!hasCustomerInfo}  // Show search icon only if there's no info
            showClearIcon={hasCustomerInfo}  // Show clear icon when there's customer info
            onAddIconPress={handleAddIconPress}
            onClearIconPress={handleClearCustomerInfo}
          >
            {renderCustomerInputs()}
          </InputContainer>

          <InputContainer title="خلاصه مذاکرات انجام شده">
            <View style={{ marginVertical: 7 }}></View>
            <AppTextInput
              autoCorrect={false}
              placeholder="یادداشت متنی"
              keyboardType="default"
              multiline
              numberOfLines={5}
              height={150}
              textAlign="right"
              isLargeInput={true}
              onChangeText={setTextNote}
              value={textNote}
              icon="text-snippet"
            />
          </InputContainer>

          <IconButton
            text={isSubmitting ? "در حال ثبت..." : "ثبت اطلاعات"}
            iconName="done"
            onPress={handleSubmit}
            backgroundColor={colors.success}
            flex={1}
            style={styles.submitButton}
            textStyle={styles.submitButtonText}
            disabled={isSubmitting}
          />
        </ScrollView>
      </View>

      {/* ColleagueBottomSheet for customer selection */}
      <ColleagueBottomSheet
        visible={isColleagueSheetVisible}
        onClose={() => setIsColleagueSheetVisible(false)}
        onSelectColleague={handleSelectColleague}
        title="انتخاب کارفرما"
        isCustomer={false} // Set to false to hide the "Add Customer" button
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background
  },
  submitButton: {
    height: 50,
    marginTop: 10,
  },
  submitButtonText: {
    fontSize: 18,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "500"),
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  halfWidth: {
    width: "48%",
  },
  disabledInput: {
    backgroundColor: "#f5f5f5",
    opacity: 0.8,
  },
  noResultsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 16,
    color: colors.medium,
    marginTop: 12,
    fontFamily: "Yekan_Bakh_Regular",
  }
});

export default AddNewProject;