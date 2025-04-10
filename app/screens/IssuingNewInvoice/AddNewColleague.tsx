import React, { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import AppTextInput from "../../components/TextInput";
import AppButton from "../../components/Button";
import SelectionBottomSheet from "../../components/SelectionDialog";
import ScreenHeader from "../../components/ScreenHeader";

import ColleagueBottomSheet, { Colleague } from "./ColleagueSearchModal";
import Toast from "../../components/Toast";
import colors from "../../config/colors";
import LocationService from "./api/LocationService";
import PersonGroupService from "./api/PersonGroupService";
import PersonManagementService, {
  CreatePersonDTO,
} from "./api/PersonManagementService";
import { InputContainer } from "../B2BFieldMarketer/AddNewShop";
import axios from "axios";
import appConfig from "../../../config";

type ToastType = "success" | "error" | "warning" | "info";

interface Province {
  ProvinceId: number;
  ProvinceName: string;
  CityCount: number;
  Active: boolean;
  ActiveStr: string;
}

const AddNewColleague = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobile, setMobile] = useState("");
  const [alias, setAlias] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedCustomerTypes, setSelectedCustomerTypes] = useState<string[]>(
    []
  );
  const [selectedCustomerTypesString, setSelectedCustomerTypesString] =
    useState("");
  const [selectedCustomerJobString, setSelectedCustomerJobString] =
    useState("");
  const [selectedColleague, setSelectedColleague] = useState<Colleague>({
    id: "",
    name: "",
    phone: "",
  });
  const [isColleagueBottomSheetVisible, setIsColleagueBottomSheetVisible] =
    useState(false);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<ToastType>("error");

  const [provinces, setProvinces] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [customerTypes, setCustomerTypes] = useState<string[]>([]);
  const [customerJobs, setCustomerJobs] = useState<string[]>([]);

  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingCustomerTypes, setLoadingCustomerTypes] = useState(true);
  const [loadingCustomerJob, setLoadingCustomerJob] = useState(true);

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

    const fetchCustomerTypes = async () => {
      setLoadingCustomerTypes(true);
      try {
        const personGroupNames = await PersonGroupService.getPersonGroupNames();
        setCustomerTypes(personGroupNames);
      } catch (error) {
        console.error("خطا در دریافت لیست گروه‌های مشتری:", error);
        showToast("خطا در دریافت لیست گروه‌های مشتری", "error");
      } finally {
        setLoadingCustomerTypes(false);
      }
    };
    const fetchCustomerJobs = async () => {
      setLoadingCustomerJob(true);
      try {
        const response = await axios.get(
          `${appConfig.mobileApi}PersonJob/GetAllActive?page=1&pageSize=1000`
        );
        const personJobs = response.data.Items.map((job: any) => job.Name);
        setCustomerJobs(personJobs);
      } catch (error) {
        console.error("خطا در دریافت لیست شغل های مشتری:", error);
        showToast("خطا در دریافت لیست شغل های مشتری", "error");
      } finally {
        setLoadingCustomerJob(false);
      }
    };

    fetchProvinces();
    fetchCustomerTypes();
    fetchCustomerJobs();
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

  const showToast = (message: string, type: ToastType = "error"): void => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const hideToast = (): void => {
    setToastVisible(false);
  };

  const handleCustomerTypeSelection = (selectedTypes: string[]): void => {
    setSelectedCustomerTypes(selectedTypes);
    const customerTypesString = selectedTypes.join(", ");
    setSelectedCustomerTypesString(customerTypesString);
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

  const handleCustomerJobSelection = (selectedTypes: string[]): void => {
    // setSelectedCustomerTypes(selectedTypes);
    const customerTypesString = selectedTypes.join(", ");
    setSelectedCustomerJobString(customerTypesString);
  };

  const handleCityClick = (): void => {
    showToast("لطفاً ابتدا استان را انتخاب کنید", "error");
  };

  const handleSelectColleague = (colleague: Colleague): void => {
    setSelectedColleague(colleague);
  };

  const validateForm = (): boolean => {
    if (!firstName.trim()) {
      showToast("لطفاً نام را وارد کنید", "error");
      return false;
    }

    if (!lastName.trim()) {
      showToast("لطفاً نام خانوادگی را وارد کنید", "error");
      return false;
    }
    if (!alias.trim()) {
      showToast("لطفاً نام مستعار را وارد کنید", "error");
      return false;
    }

    if (!mobile.trim()) {
      showToast("لطفاً شماره موبایل را وارد کنید", "error");
      return false;
    }
    if (!selectedCustomerTypesString.trim()) {
      showToast("لطفاً گروه مشتری را انتخاب کنید", "error");
      return false;
    }
    if (!selectedCustomerJobString.trim()) {
      showToast("لطفاً شغل مشتری را انتخاب کنید", "error");
      return false;
    }

    const mobileRegex = /^09\d{9}$/;
    if (!mobileRegex.test(mobile)) {
      showToast("شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود", "error");
      return false;
    }

    if (!selectedProvince) {
      showToast("لطفاً استان را انتخاب کنید", "error");
      return false;
    }

    if (!selectedCity) {
      showToast("لطفاً شهر را انتخاب کنید", "error");
      return false;
    }

    return true;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const provinceId = await LocationService.getProvinceIdByName(
        selectedProvince
      );
      if (!provinceId) {
        showToast("خطا در دریافت شناسه استان", "error");
        setIsSubmitting(false);
        return;
      }

      const cityId = await PersonManagementService.getCityIdByName(
        selectedCity,
        selectedProvince
      );
      if (!cityId) {
        showToast("خطا در دریافت شناسه شهر", "error");
        setIsSubmitting(false);
        return;
      }

      let personGroupIds: number[] = [];
      if (selectedCustomerTypes.length > 0) {
        personGroupIds = await PersonManagementService.getPersonGroupIdsByNames(
          selectedCustomerTypes
        );
        if (personGroupIds.length === 0 && selectedCustomerTypes.length > 0) {
          showToast("خطا در دریافت شناسه‌های گروه مشتری", "warning");
        }
      }

      const personData: CreatePersonDTO = {
        PersonId: 0,
        FirstName: firstName,
        LastName: lastName,
        Mobile: mobile,
        ProvinceId: provinceId,
        CityId: cityId,
        MarketingChannelId: "",
        Address: address,
        PersonGroupIdList: personGroupIds,
      };

      const newPersonId = await PersonManagementService.createPerson(
        personData
      );

      showToast(`مشتری با موفقیت ثبت شد.`, "success");

      setFirstName("");
      setLastName("");
      setMobile("");
      setAlias("");
      setAddress("");
      setDescription("");
      setSelectedProvince("");
      setSelectedCity("");
      setSelectedCustomerTypes([]);
      setSelectedCustomerTypesString("");
      setSelectedColleague({ id: "", name: "", phone: "" });
      setCities([]);
    } catch (error) {
      console.error("خطا در ثبت مشتری:", error);
      showToast("خطا در ثبت مشتری. لطفاً دوباره تلاش کنید", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <ScreenHeader title="ثبت معرف جدید" />

      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onDismiss={hideToast}
      />

      <View style={styles.container}>
        <ScrollView>
          <InputContainer title="اطلاعات مشتری">
            <AppTextInput
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="default"
              icon="person"
              placeholder="نام"
              value={firstName}
              onChangeText={setFirstName}
            />
            <AppTextInput
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="default"
              icon="person"
              placeholder="نام خانوادگی"
              value={lastName}
              onChangeText={setLastName}
            />
            <AppTextInput
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="default"
              icon="person-4"
              placeholder="نام مستعار/ جایگزین"
              value={alias}
              onChangeText={setAlias}
            />
            <AppTextInput
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="number-pad"
              icon="phone-android"
              placeholder="شماره موبایل "
              value={mobile}
              onChangeText={setMobile}
            />

            <SelectionBottomSheet
              placeholderText={
                selectedCustomerTypesString
                  ? selectedCustomerTypesString
                  : "گروه مشتری"
              }
              title="گروه مشتری "
              iconName="group"
              options={customerTypes}
              onSelect={handleCustomerTypeSelection}
              multiSelect={false}
              loading={loadingCustomerTypes}
            />
            <SelectionBottomSheet
              placeholderText={
                selectedCustomerJobString ? selectedCustomerJobString : "شغل"
              }
              title="شغل"
              iconName="work"
              options={customerJobs}
              onSelect={handleCustomerJobSelection}
              multiSelect={false}
              loading={loadingCustomerJob}
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
              autoCorrect={false}
              keyboardType="default"
              icon="location-pin"
              placeholder="آدرس مشتری"
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={5}
              height={150}
              textAlign="right"
              isLargeInput={true}
            />
          </InputContainer>

          <InputContainer title="سایر اطلاعات">
            <AppTextInput
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="default"
              icon="text-snippet"
              placeholder="توضیحات"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={5}
              height={150}
              textAlign="right"
              isLargeInput={true}
            />
            <View style={{ height: 0 }} />
          </InputContainer>

          <AppButton
            title={isSubmitting ? "در حال ثبت..." : "ثبت"}
            onPress={handleSubmit}
            style={{ width: "100%" }}
            color="success"
            disabled={isSubmitting}
          />
          {isSubmitting && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingBottom: 15,
    backgroundColor: colors.background,
  },
  rightAlignedInput: {
    textAlign: "right",
    textAlignVertical: "top",
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  halfWidth: {
    width: "48%",
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default AddNewColleague;
