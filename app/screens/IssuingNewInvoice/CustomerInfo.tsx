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
import PersonGroupService, { PersonGroup } from "./api/PersonGroupService";
import PersonManagementService, {
  CreatePersonDTO,
} from "./api/PersonManagementService";
import { InputContainer } from "../FieldMarketer/B2BFieldMarketer/AddNewShop";
import axios from "axios";
import appConfig from "../../../config";
import { RouteProp, useRoute } from "@react-navigation/native";
import {
  IPerson,
  IPersonToEdit,
  ILoginResponse,
  IPersonCustomField,
} from "../../config/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import IconButton from "../../components/IconButton";
import * as Yup from "yup";
import DynamicSelectionBottomSheet from "../../components/DynamicSelectionBottomSheet";
import { DatePickerField } from "../../components/PersianDatePicker";
import { Formik, FormikProps } from "formik";
import { MaterialIcons } from "@expo/vector-icons";
import AppText from "../../components/Text";

type ToastType = "success" | "error" | "warning" | "info";

interface FormValues {
  firstName: string;
  lastName: string;
  alias: string;
  mobile: string;
  customerType: string;
  customerJob: string;
  province: string;
  city: string;
  address: string;
  description: string;
  colleague: {
    id: string;
    name: string;
    phone: string;
  };
  [key: string]: string; // Support dynamic custom fields and colleague object
}

interface Province {
  ProvinceId: number;
  ProvinceName: string;
  CityCount: number;
  Active: boolean;
  ActiveStr: string;
}

// تابع دریافت اطلاعات ورود کاربر از AsyncStorage
const getLoginResponse = async (): Promise<ILoginResponse | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem("loginResponse");
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error("Error retrieving login response:", error);
    return null;
  }
};

type CustomerInfoRouteParams = {
  customerInfo: {
    customer?: Colleague;
    mode?: "customer" | "colleague" | "visitor";
  };
};

// Generate initial values for Formik
const generateInitialValues = (
  person: IPerson | undefined,
  customFieldType1: IPersonCustomField[],
  customFieldType2: IPersonCustomField[],
  customFieldType3: IPersonCustomField[]
) => {
  const initialValues: FormValues = {
    firstName: person?.FirstName || "",
    lastName: person?.LastName || "",
    alias: person?.NickName || "",
    mobile: person?.Mobile || "",
    customerType: person?.Person_PersonGroup_List[0]?.PersonGroupName || "",
    customerJob: person?.PersonJobName || "",
    province: person?.ProvinceName || "",
    city: person?.CityName || "",
    address: person?.Address || "",
    description: person?.Description || "",
    colleague: {
      id: person?.IntroducerPersonId?.toString() || "",
      name: person?.IntroducerPersonFullName || "",
      phone: person?.IntroducerPersonMobile || "",
    },
  };

  // Add dynamic fields for customFieldType1, customFieldType2, customFieldType3
  [...customFieldType1, ...customFieldType2, ...customFieldType3].forEach(
    (field) => {
      initialValues[`custom_${field.PersonCustomFieldId}`] = "";
    }
  );

  return initialValues;
};

// Generate Yup validation schema
const generateValidationSchema = (
  customFieldType1: IPersonCustomField[],
  customFieldType2: IPersonCustomField[],
  customFieldType3: IPersonCustomField[]
) => {
  const shape: { [key: string]: any } = {
    firstName: Yup.string().required("لطفاً نام را وارد کنید"),
    lastName: Yup.string().required("لطفاً نام خانوادگی را وارد کنید"),
    alias: Yup.string().required("لطفاً نام مستعار را وارد کنید"),
    mobile: Yup.string()
      .matches(/^09\d{9}$/, "شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود")
      .required("لطفاً شماره موبایل را وارد کنید"),
    customerType: Yup.string().required("لطفاً گروه مشتری را انتخاب کنید"),
    customerJob: Yup.string().required("لطفاً شغل مشتری را انتخاب کنید"),
    province: Yup.string().required("لطفاً استان را انتخاب کنید"),
    city: Yup.string().required("لطفاً شهر را انتخاب کنید"),
    address: Yup.string(),
    description: Yup.string(),
    colleague: Yup.object().shape({
      id: Yup.string(),
      name: Yup.string(),
      phone: Yup.string(),
    }),
  };

  // Add validation for dynamic fields
  [...customFieldType1, ...customFieldType2, ...customFieldType3].forEach(
    (field) => {
      if (field.IsRequired) {
        if (field.FieldType === 2 || field.FieldType === 5) {
          // Numeric field
          shape[`custom_${field.PersonCustomFieldId}`] = Yup.string()
            .matches(/^\d+$/, `${field.FieldName} باید عدد باشد`)
            .required(`${field.FieldName} الزامی است`);
        } else if (field.FieldType === 3) {
          // Date field
          shape[`custom_${field.PersonCustomFieldId}`] = Yup.string().required(
            `${field.FieldName} الزامی است`
          );
        } else {
          // Text or multi-select field
          shape[`custom_${field.PersonCustomFieldId}`] = Yup.string().required(
            `${field.FieldName} الزامی است`
          );
        }
      }
    }
  );

  return Yup.object().shape(shape);
};

// Render input based on FieldType
const renderInput = (
  customField: IPersonCustomField,
  formikProps: FormikProps<FormValues>
) => {
  const fieldName = `custom_${customField.PersonCustomFieldId}`;
  switch (customField.FieldType) {
    case 1: // Text
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
          onChangeText={formikProps.handleChange(fieldName)}
          value={formikProps.values[fieldName]}
          error={
            formikProps.touched[fieldName] && formikProps.errors[fieldName]
              ? formikProps.errors[fieldName]
              : undefined
          }
        />
      );
    case 2: // Number
    case 5: // Number
      return (
        <AppTextInput
          autoCapitalize="none"
          icon={
            customField.IconName as React.ComponentProps<
              typeof MaterialIcons
            >["name"]
          }
          autoCorrect={false}
          keyboardType="number-pad"
          placeholder={customField.FieldName}
          onChangeText={formikProps.handleChange(fieldName)}
          value={formikProps.values[fieldName]}
          error={
            formikProps.touched[fieldName] && formikProps.errors[fieldName]
              ? formikProps.errors[fieldName]
              : undefined
          }
        />
      );
    case 3: // Date
      return (
        <DatePickerField
          date={formikProps.values[fieldName] || ""}
          label={customField.FieldName}
          onDateChange={(value) => formikProps.setFieldValue(fieldName, value)}
          error={
            formikProps.touched[fieldName] && formikProps.errors[fieldName]
              ? formikProps.errors[fieldName]
              : undefined
          }
        />
      );
    case 4: // Multi-select
      return (
        <DynamicSelectionBottomSheet
          customFieldId={customField.PersonCustomFieldId}
          customFieldName={customField.FieldName}
          customIconName={customField.IconName}
          url={`${appConfig.mobileApi}PersonCustomFieldSelectiveValue/GetAll?customFieldId=${customField.PersonCustomFieldId}&page=1&pageSize=1000`}
          formikProps={formikProps}
        />
      );
    case 6: // Location
      return (
        <IconButton
          text="موقعیت جغرافیایی"
          iconName="location-pin"
          onPress={() => {}}
          backgroundColor={colors.primary}
          flex={1}
        />
      );
    case 7: // Multiline Text
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
          multiline
          numberOfLines={10}
          height={200}
          textAlign="right"
          isLargeInput={true}
          placeholder={customField.FieldName}
          onChangeText={formikProps.handleChange(fieldName)}
          value={formikProps.values[fieldName]}
          error={
            formikProps.touched[fieldName] && formikProps.errors[fieldName]
              ? formikProps.errors[fieldName]
              : undefined
          }
        />
      );
    default:
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
          onChangeText={formikProps.handleChange(fieldName)}
          value={formikProps.values[fieldName]}
          error={
            formikProps.touched[fieldName] && formikProps.errors[fieldName]
              ? formikProps.errors[fieldName]
              : undefined
          }
        />
      );
  }
};

const CustomerInfo: React.FC = () => {
  const route = useRoute<RouteProp<CustomerInfoRouteParams, "customerInfo">>();
  const customerID = route.params?.customer?.id;
  const mode = route.params?.mode;

  const [person, setPerson] = useState<IPerson>();
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
  const [defaultProvinceId, setDefaultProvinceId] = useState<number | null>(
    null
  );
  const [defaultCityId, setDefaultCityId] = useState<number | null>(null);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<ToastType>("error");

  const [provinces, setProvinces] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [customerTypes, setCustomerTypes] = useState<PersonGroup[]>([]);
  const [customerJobs, setCustomerJobs] = useState<
    { value: number; label: string }[]
  >([]);

  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingCustomerTypes, setLoadingCustomerTypes] = useState(true);
  const [loadingCustomerJob, setLoadingCustomerJob] = useState(true);
  const [isLoadingForm, setIsLoadingForm] = useState<boolean>(false);
  const [customFieldType1, setCustomFieldType1] = useState<
    IPersonCustomField[]
  >([]);
  const [customFieldType2, setCustomFieldType2] = useState<
    IPersonCustomField[]
  >([]);
  const [customFieldType3, setCustomFieldType3] = useState<
    IPersonCustomField[]
  >([]);
  const [customFieldOtherTypes, setCustomFieldOtherTypes] = useState<
    Record<string, IPersonCustomField[]>
  >({});

  // دریافت مقادیر پیش‌فرض استان و شهر از اطلاعات ورود کاربر
  useEffect(() => {
    const loadDefaultLocation = async () => {
      try {
        const loginResponse = await getLoginResponse();
        if (loginResponse) {
          const provinceId = loginResponse.ProvinceId;
          const cityId = loginResponse.CityId;
          const provinceName = loginResponse.ProvinceName;
          const cityName = loginResponse.CityName;

          if (provinceId && provinceName) {
            setDefaultProvinceId(provinceId);
            setSelectedProvince(provinceName);
          }

          if (cityId && cityName) {
            setDefaultCityId(cityId);
            setSelectedCity(cityName);
          }

          // اگر استان انتخاب شده است، شهرهای مربوط به آن را بارگذاری کنید
          if (provinceName) {
            fetchCitiesByProvince(provinceName);
          }
        }
      } catch (error) {
        console.error("خطا در دریافت مقادیر پیش‌فرض:", error);
      }
    };

    if (!customerID) {
      // فقط در حالت اضافه کردن جدید، مقادیر پیش‌فرض را اعمال کنید
      loadDefaultLocation();
    }
  }, [provinces.length]);

  useEffect(() => {
    if (customerID) {
      getCustomer(Number(customerID));
    }
  }, []);

  const getCustomer = async (cID: number) => {
    try {
      const response = await axios.get<IPerson>(
        `${appConfig.mobileApi}Person/Get?id=${cID}`
      );
      const person = response.data;
      console.log("customer:", person);

      const provinceName = await LocationService.getProvinceNameByID(
        Number(person.ProvinceId)
      );

      setPerson(person);
      setFirstName(person.FirstName);
      setLastName(person.LastName);
      setMobile(person.Mobile);
      setAlias(person.NickName);
      setAddress(person.Address);
      setDescription(person.Description);
      setAddress(person.Address);
      // setSelectedColleague({
      //   id: person.Person_PersonGroup_List[0].PersonGroupId.toString(),
      //   name: person.Person_PersonGroup_List[0].PersonGroupName,
      //   phone: "",
      // });
      setSelectedProvince(person.ProvinceName);
      setSelectedCity(person.CityName);
      setSelectedCustomerTypesString(
        person.Person_PersonGroup_List[0].PersonGroupName
      );
      setSelectedCustomerJobString(person.PersonJobName);
      setSelectedColleague({
        id: "1",
        name: person.IntroducerPersonFullName,
        phone: person.IntroducerPersonMobile,
      });

      // بارگذاری شهرهای استان انتخاب شده
      if (person.ProvinceName) {
        fetchCitiesByProvince(person.ProvinceName);
      }
    } catch (error) {}
  };

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
        const personGroups = await PersonGroupService.getAllActive();
        setCustomerTypes(personGroups);
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
        const personJobs = response.data.Items.map((job: any) => {
          return { value: job.PersonJobId, label: job.Name };
        });
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
    if (customerID) {
      // handle edit mode
      console.log("in edit mode");
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

        let personGroupIds: number[] = [
          customerTypes.find(
            (customertype: PersonGroup) =>
              customertype.PersonGroupName === selectedCustomerTypesString
          )?.PersonGroupId || 0,
        ];
        // if (selectedCustomerTypes.length > 0) {
        //   personGroupIds =
        //     await PersonManagementService.getPersonGroupIdsByNames(
        //       selectedCustomerTypes
        //     );
        //   if (personGroupIds.length === 0 && selectedCustomerTypes.length > 0) {
        //     showToast("خطا در دریافت شناسه‌های گروه مشتری", "warning");
        //   }
        // }

        const personToEdit: IPersonToEdit = {
          PersonId: Number(customerID),
          FirstName: firstName,
          LastName: lastName,
          NickName: alias,
          Mobile: mobile,
          ProvinceId: provinceId,
          CityId: cityId,
          PersonJobId:
            customerJobs.find(
              (customer: any) => customer.label === selectedCustomerJobString
            )?.value || 0,
          MarketingChannelId: null,
          IntroducerPersonId: Number(selectedColleague.id),
          Address: address,
          Description: description,
          PersonGroupIdList: personGroupIds,
        };

        console.log("personToEdit", personToEdit);

        const response = await axios.put(
          `${appConfig.mobileApi}Person/Edit`,
          personToEdit
        );

        if (response.status === 200) {
          showToast(`مشتری با موفقیت ویرایش شد.`, "success");
        }
      } catch (error) {
        console.error("خطا در ثبت مشتری:", error);
        showToast("خطا در ثبت مشتری. لطفاً دوباره تلاش کنید", "error");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // in add mode
      if (!validateForm()) {
        console.log("form is not valid");

        return;
      }
      console.log("here");
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
          personGroupIds =
            await PersonManagementService.getPersonGroupIdsByNames(
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
          MarketingChannelId: null,
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

        // بعد از ثبت موفق، مقادیر پیش‌فرض استان و شهر دوباره تنظیم شوند
        const loginResponse = await getLoginResponse();
        if (loginResponse && loginResponse.ProvinceName) {
          setSelectedProvince(loginResponse.ProvinceName);
          if (loginResponse.CityName) {
            setSelectedCity(loginResponse.CityName);
          } else {
            setSelectedCity("");
          }
        } else {
          setSelectedProvince("");
          setSelectedCity("");
        }

        setSelectedCustomerTypes([]);
        setSelectedCustomerTypesString("");
        setSelectedColleague({ id: "", name: "", phone: "" });
      } catch (error) {
        console.error("خطا در ثبت مشتری:", error);
        showToast("خطا در ثبت مشتری. لطفاً دوباره تلاش کنید", "error");
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  return (
    <>
      <ScreenHeader
        title={mode === "visitor" ? "اطلاعات بازدید کننده" : "ثبت خریدار جدید"}
      />
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onDismiss={hideToast}
      />
      <Formik
        initialValues={generateInitialValues(
          person,
          customFieldType1,
          customFieldType2,
          customFieldType3
        )}
        validationSchema={generateValidationSchema(
          customFieldType1,
          customFieldType2,
          customFieldType3
        )}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {(formikProps) => (
          <View style={styles.container}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
              {isLoadingForm ? (
                <View style={styles.centerContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <AppText
                    style={{
                      marginTop: 15,
                      fontSize: 20,
                      color: colors.primary,
                    }}
                  >
                    در حال بارگذاری فرم
                  </AppText>
                </View>
              ) : (
                <>
                  <InputContainer title="اطلاعات مشتری">
                    <AppTextInput
                      placeholder="نام"
                      icon="person"
                      autoCapitalize="none"
                      autoCorrect={false}
                      onChangeText={formikProps.setFieldValue.bind(
                        null,
                        "firstName"
                      )}
                      value={formikProps.values.firstName}
                      error={
                        formikProps.touched.firstName &&
                        formikProps.errors.firstName
                          ? formikProps.errors.firstName
                          : undefined
                      }
                    />
                    <AppTextInput
                      placeholder="نام خانوادگی"
                      icon="person"
                      autoCapitalize="none"
                      autoCorrect={false}
                      onChangeText={formikProps.setFieldValue.bind(
                        null,
                        "lastName"
                      )}
                      value={formikProps.values.lastName}
                      error={
                        formikProps.touched.lastName &&
                        formikProps.errors.lastName
                          ? formikProps.errors.lastName
                          : undefined
                      }
                    />
                    <AppTextInput
                      placeholder="نام مستعار/ جایگزین"
                      icon="person-4"
                      autoCapitalize="none"
                      autoCorrect={false}
                      onChangeText={formikProps.setFieldValue.bind(
                        null,
                        "alias"
                      )}
                      value={formikProps.values.alias}
                      error={
                        formikProps.touched.alias && formikProps.errors.alias
                          ? formikProps.errors.alias
                          : undefined
                      }
                    />
                    <AppTextInput
                      placeholder="شماره موبایل"
                      icon="phone-android"
                      keyboardType="number-pad"
                      autoCapitalize="none"
                      autoCorrect={false}
                      onChangeText={formikProps.setFieldValue.bind(
                        null,
                        "mobile"
                      )}
                      value={formikProps.values.mobile}
                      error={
                        formikProps.touched.mobile && formikProps.errors.mobile
                          ? formikProps.errors.mobile
                          : undefined
                      }
                    />
                    <SelectionBottomSheet
                      placeholderText={
                        formikProps.values.customerType || "گروه مشتری"
                      }
                      title="گروه مشتری"
                      iconName="group"
                      options={customerTypes.map(
                        (group) => group.PersonGroupName
                      )}
                      onSelect={(selected) =>
                        formikProps.setFieldValue(
                          "customerType",
                          selected[0] || ""
                        )
                      }
                      multiSelect={false}
                      loading={loadingCustomerTypes}
                      initialValues={[formikProps.values.customerType]}
                      error={
                        formikProps.touched.customerType &&
                        formikProps.errors.customerType
                          ? formikProps.errors.customerType
                          : undefined
                      }
                    />
                    <SelectionBottomSheet
                      placeholderText={formikProps.values.customerJob || "شغل"}
                      title="شغل"
                      iconName="work"
                      options={customerJobs.map((job) => job.label)}
                      onSelect={(selected) =>
                        formikProps.setFieldValue(
                          "customerJob",
                          selected[0] || ""
                        )
                      }
                      multiSelect={false}
                      loading={loadingCustomerJob}
                      initialValues={[formikProps.values.customerJob]}
                      error={
                        formikProps.touched.customerJob &&
                        formikProps.errors.customerJob
                          ? formikProps.errors.customerJob
                          : undefined
                      }
                    />
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setIsColleagueBottomSheetVisible(true)}
                      style={{ width: "100%" }}
                    >
                      <AppTextInput
                        placeholder="معرف"
                        icon="person-search"
                        value={
                          formikProps.values.colleague.name
                            ? `${formikProps.values.colleague.name} (${formikProps.values.colleague.phone})`
                            : ""
                        }
                        editable={false}
                      />
                    </TouchableOpacity>
                    {mode === "visitor" && (
                      <SelectionBottomSheet
                        placeholderText="نحوه ی آشنایی با شرکت"
                        title="نحوه ی آشنایی با شرکت"
                        iconName="business"
                        options={customerJobs.map((job) => job.label)}
                        onSelect={(selected) =>
                          formikProps.setFieldValue(
                            "customerJob",
                            selected[0] || ""
                          )
                        }
                        multiSelect={false}
                        loading={loadingCustomerJob}
                      />
                    )}
                    <View style={styles.rowContainer}>
                      <View style={styles.halfWidth}>
                        <SelectionBottomSheet
                          key={`city-${formikProps.values.province}`}
                          placeholderText={formikProps.values.city || "شهرستان"}
                          title="شهرستان"
                          iconName="apartment"
                          options={formikProps.values.province ? cities : []}
                          onSelect={(selected) =>
                            formikProps.setFieldValue("city", selected[0] || "")
                          }
                          loading={loadingCities}
                          onPress={
                            formikProps.values.province
                              ? undefined
                              : () =>
                                  showToast(
                                    "لطفاً ابتدا استان را انتخاب کنید",
                                    "error"
                                  )
                          }
                          error={
                            formikProps.touched.city && formikProps.errors.city
                              ? formikProps.errors.city
                              : undefined
                          }
                        />
                      </View>
                      <View style={styles.halfWidth}>
                        <SelectionBottomSheet
                          placeholderText={
                            formikProps.values.province || "استان"
                          }
                          title="استان"
                          iconName="map"
                          options={provinces}
                          onSelect={(selected) => {
                            formikProps.setFieldValue(
                              "province",
                              selected[0] || ""
                            );
                            formikProps.setFieldValue("city", "");
                            fetchCitiesByProvince(selected[0] || "");
                          }}
                          loading={loadingProvinces}
                          error={
                            formikProps.touched.province &&
                            formikProps.errors.province
                              ? formikProps.errors.province
                              : undefined
                          }
                        />
                      </View>
                    </View>
                    <AppTextInput
                      placeholder="آدرس مشتری"
                      icon="location-pin"
                      multiline
                      numberOfLines={5}
                      height={150}
                      textAlign="right"
                      isLargeInput={true}
                      onChangeText={formikProps.setFieldValue.bind(
                        null,
                        "address"
                      )}
                      value={formikProps.values.address}
                      error={
                        formikProps.touched.address &&
                        formikProps.errors.address
                          ? formikProps.errors.address
                          : undefined
                      }
                    />
                    {customFieldType1.map((customField) =>
                      renderInput(customField, formikProps)
                    )}
                  </InputContainer>
                  <InputContainer title="سایر اطلاعات">
                    <AppTextInput
                      placeholder="توضیحات"
                      icon="text-snippet"
                      multiline
                      numberOfLines={5}
                      height={150}
                      textAlign="right"
                      isLargeInput={true}
                      onChangeText={formikProps.setFieldValue.bind(
                        null,
                        "description"
                      )}
                      value={formikProps.values.description}
                      error={
                        formikProps.touched.description &&
                        formikProps.errors.description
                          ? formikProps.errors.description
                          : undefined
                      }
                    />
                    {customFieldType2.map((customField) =>
                      renderInput(customField, formikProps)
                    )}
                  </InputContainer>
                  {customFieldType3.length > 0 && (
                    <InputContainer title="فیلدهای اضافی مشتری">
                      {customFieldType3.map((customField) =>
                        renderInput(customField, formikProps)
                      )}
                    </InputContainer>
                  )}
                  {Object.entries(customFieldOtherTypes).map(
                    ([groupId, fields]) => (
                      <InputContainer
                        key={groupId}
                        title={fields[0].PersonCustomFieldGroupName}
                      >
                        {fields.map((customField) =>
                          renderInput(customField, formikProps)
                        )}
                      </InputContainer>
                    )
                  )}
                  <IconButton
                    text={isSubmitting ? "در حال ثبت..." : "ثبت"}
                    onPress={handleSubmit}
                    iconName="done"
                    style={{ width: "100%", marginBottom: 30 }}
                    backgroundColor={colors.success}
                    disabled={isSubmitting}
                  />
                  {isSubmitting && (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                  )}
                </>
              )}
            </ScrollView>
            <ColleagueBottomSheet
              visible={isColleagueBottomSheetVisible}
              onClose={() => setIsColleagueBottomSheetVisible(false)}
              onSelectColleague={(colleague: Colleague) =>
                formikProps.setFieldValue("colleague", colleague)
              }
            />
          </View>
        )}
      </Formik>
    </>
  );

  // return (
  //   <>
  //     <ScreenHeader
  //       title={mode === "visitor" ? "اطلاعات بازدید کننده" : "ثبت خریدار جدید"}
  //     />

  //     <Toast
  //       visible={toastVisible}
  //       message={toastMessage}
  //       type={toastType}
  //       onDismiss={hideToast}
  //     />

  //     <View style={styles.container}>
  //       <ScrollView>
  //         <InputContainer title="اطلاعات مشتری">
  //           <AppTextInput
  //             autoCapitalize="none"
  //             autoCorrect={false}
  //             keyboardType="default"
  //             icon="person"
  //             placeholder="نام"
  //             value={firstName}
  //             onChangeText={setFirstName}
  //           />
  //           <AppTextInput
  //             autoCapitalize="none"
  //             autoCorrect={false}
  //             keyboardType="default"
  //             icon="person"
  //             placeholder="نام خانوادگی"
  //             value={lastName}
  //             onChangeText={setLastName}
  //           />
  //           <AppTextInput
  //             autoCapitalize="none"
  //             autoCorrect={false}
  //             keyboardType="default"
  //             icon="person-4"
  //             placeholder="نام مستعار/ جایگزین"
  //             value={alias}
  //             onChangeText={setAlias}
  //           />
  //           <AppTextInput
  //             autoCapitalize="none"
  //             autoCorrect={false}
  //             keyboardType="number-pad"
  //             icon="phone-android"
  //             placeholder="شماره موبایل "
  //             value={mobile}
  //             onChangeText={setMobile}
  //           />

  //           <SelectionBottomSheet
  //             placeholderText={
  //               selectedCustomerTypesString
  //                 ? selectedCustomerTypesString
  //                 : "گروه مشتری"
  //             }
  //             title="گروه مشتری "
  //             iconName="group"
  //             options={customerTypes.map(
  //               (group: PersonGroup) => group.PersonGroupName
  //             )}
  //             onSelect={handleCustomerTypeSelection}
  //             multiSelect={false}
  //             loading={loadingCustomerTypes}
  //             initialValues={customerTypes
  //               .map((group: PersonGroup) => group.PersonGroupName)
  //               .filter((customer) => customer === selectedCustomerTypesString)}
  //           />
  //           <SelectionBottomSheet
  //             placeholderText={
  //               selectedCustomerJobString ? selectedCustomerJobString : "شغل"
  //             }
  //             title="شغل"
  //             iconName="work"
  //             options={customerJobs.map((job: any) => job.label)}
  //             onSelect={handleCustomerJobSelection}
  //             multiSelect={false}
  //             loading={loadingCustomerJob}
  //             initialValues={customerJobs
  //               .map((job: any) => job.label)
  //               .filter((customer) => customer === selectedCustomerJobString)}
  //           />

  //           <TouchableOpacity
  //             activeOpacity={0.7}
  //             onPress={() => setIsColleagueBottomSheetVisible(true)}
  //             style={{ width: "100%" }}
  //           >
  //             <AppTextInput
  //               autoCapitalize="none"
  //               autoCorrect={false}
  //               keyboardType="default"
  //               icon="person-search"
  //               placeholder="معرف"
  //               value={
  //                 selectedColleague.name
  //                   ? `${selectedColleague.name} (${selectedColleague.phone})`
  //                   : ""
  //               }
  //               onChangeText={() => {}}
  //               editable={false}
  //             />
  //           </TouchableOpacity>

  //           {mode === "visitor" && (
  //             <SelectionBottomSheet
  //               placeholderText={"نحوه ی آشنایی با شرکت"}
  //               title="نحوه ی آشنایی با شرکت"
  //               iconName="business"
  //               options={customerJobs.map((job: any) => job.label)}
  //               onSelect={handleCustomerJobSelection}
  //               multiSelect={false}
  //               loading={loadingCustomerJob}
  //             />
  //           )}

  //           <View style={styles.rowContainer}>
  //             <View style={styles.halfWidth}>
  //               <SelectionBottomSheet
  //                 key={`city-${selectedProvince}`}
  //                 placeholderText={selectedCity || "شهرستان"}
  //                 title="شهرستان"
  //                 iconName="apartment"
  //                 options={selectedProvince ? cities : []}
  //                 onSelect={handleCitySelection}
  //                 loading={loadingCities}
  //                 onPress={selectedProvince ? undefined : handleCityClick}
  //               />
  //             </View>
  //             <View style={styles.halfWidth}>
  //               <SelectionBottomSheet
  //                 placeholderText={selectedProvince || "استان"}
  //                 title="استان"
  //                 iconName="map"
  //                 options={provinces}
  //                 onSelect={handleProvinceSelection}
  //                 loading={loadingProvinces}
  //               />
  //             </View>
  //           </View>
  //           <AppTextInput
  //             autoCapitalize="none"
  //             autoCorrect={false}
  //             keyboardType="default"
  //             icon="location-pin"
  //             placeholder="آدرس مشتری"
  //             value={address}
  //             onChangeText={setAddress}
  //             multiline
  //             numberOfLines={5}
  //             height={150}
  //             textAlign="right"
  //             isLargeInput={true}
  //           />
  //         </InputContainer>

  //         <InputContainer title="سایر اطلاعات">
  //           <AppTextInput
  //             autoCapitalize="none"
  //             autoCorrect={false}
  //             keyboardType="default"
  //             icon="text-snippet"
  //             placeholder="توضیحات"
  //             value={description}
  //             onChangeText={setDescription}
  //             multiline
  //             numberOfLines={5}
  //             height={150}
  //             textAlign="right"
  //             isLargeInput={true}
  //           />
  //           <View style={{ height: 0 }} />
  //         </InputContainer>

  //         <IconButton
  //           text={isSubmitting ? "در حال ثبت..." : "ثبت"}
  //           onPress={handleSubmit}
  //           iconName="done"
  //           style={{ width: "100%" }}
  //           backgroundColor={colors.success}
  //           disabled={isSubmitting}
  //         />
  //         {isSubmitting && (
  //           <View style={styles.loadingContainer}>
  //             <ActivityIndicator size="large" color={colors.primary} />
  //           </View>
  //         )}
  //       </ScrollView>
  //     </View>

  //     <ColleagueBottomSheet
  //       visible={isColleagueBottomSheetVisible}
  //       onClose={() => setIsColleagueBottomSheetVisible(false)}
  //       onSelectColleague={handleSelectColleague}
  //       // isCustomer={false}
  //     />
  //   </>
  // );
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
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
});

export default CustomerInfo;
