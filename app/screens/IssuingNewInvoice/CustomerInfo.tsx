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
  [key: string]: string;
}

interface Province {
  ProvinceId: number;
  ProvinceName: string;
  CityCount: number;
  Active: boolean;
  ActiveStr: string;
}

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

  [...customFieldType1, ...customFieldType2, ...customFieldType3].forEach(
    (field) => {
      initialValues[`custom_${field.PersonCustomFieldId}`] = "";
    }
  );

  return initialValues;
};

const generateValidationSchema = (
  customFieldType1: IPersonCustomField[],
  customFieldType2: IPersonCustomField[],
  customFieldType3: IPersonCustomField[]
) => {
  const shape: { [key: string]: any } = {
    firstName: Yup.string().required("لطفاً نام را وارد کنید"),
    lastName: Yup.string().required("لطفاً نام خانوادگی را وارد کنید"),
    mobile: Yup.string()
      .matches(/^09\d{9}$/, "شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود")
      .required("لطفاً شماره موبایل را وارد کنید"),
    alias: Yup.string(),
    customerType: Yup.string(),
    customerJob: Yup.string(),
    province: Yup.string(),
    city: Yup.string(),
    address: Yup.string(),
    description: Yup.string(),
    colleague: Yup.object().shape({
      id: Yup.string(),
      name: Yup.string(),
      phone: Yup.string(),
    }),
  };

  [...customFieldType1, ...customFieldType2, ...customFieldType3].forEach(
    (field) => {
      if (field.IsRequired) {
        if (field.FieldType === 2 || field.FieldType === 5) {
          shape[`custom_${field.PersonCustomFieldId}`] = Yup.string()
            .matches(/^\d+$/, `${field.FieldName} باید عدد باشد`)
            .required(`${field.FieldName} الزامی است`);
        } else if (field.FieldType === 3) {
          shape[`custom_${field.PersonCustomFieldId}`] = Yup.string().required(
            `${field.FieldName} الزامی است`
          );
        } else {
          shape[`custom_${field.PersonCustomFieldId}`] = Yup.string().required(
            `${field.FieldName} الزامی است`
          );
        }
      }
    }
  );

  return Yup.object().shape(shape);
};

const renderInput = (
  customField: IPersonCustomField,
  formikProps: FormikProps<FormValues>
) => {
  const fieldName = `custom_${customField.PersonCustomFieldId}`;
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
          onChangeText={formikProps.handleChange(fieldName)}
          value={formikProps.values[fieldName]}
        />
      );
    case 2:
    case 5:
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
        />
      );
    case 3:
      return (
        <DatePickerField
          date={formikProps.values[fieldName] || ""}
          label={customField.FieldName}
          onDateChange={(value) => formikProps.setFieldValue(fieldName, value)}
        />
      );
    case 4:
      return (
        <DynamicSelectionBottomSheet
          customFieldId={customField.PersonCustomFieldId}
          customFieldName={customField.FieldName}
          customIconName={customField.IconName}
          url={`${appConfig.mobileApi}PersonCustomFieldSelectiveValue/GetAll?customFieldId=${customField.PersonCustomFieldId}&page=1&pageSize=1000`}
          formikProps={formikProps}
        />
      );
    case 6:
      return (
        <IconButton
          text="موقعیت جغرافیایی"
          iconName="location-pin"
          onPress={() => { }}
          backgroundColor={colors.primary}
          flex={1}
        />
      );
    case 7:
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
        />
      );
  }
};

const CustomerInfo: React.FC = () => {
  const route = useRoute<RouteProp<CustomerInfoRouteParams, "customerInfo">>();
  const customerID = route.params?.customer?.id;
  const mode = route.params?.mode;

  const [person, setPerson] = useState<IPerson>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isColleagueBottomSheetVisible, setIsColleagueBottomSheetVisible] = useState(false);

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

  useEffect(() => {
    const loadDefaultLocation = async () => {
      try {
        const loginResponse = await getLoginResponse();
        if (loginResponse) {
          const provinceName = loginResponse.ProvinceName;
          const cityName = loginResponse.CityName;

          if (provinceName) {
            fetchCitiesByProvince(provinceName);
          }
        }
      } catch (error) {
        console.error("خطا در دریافت مقادیر پیش‌فرض:", error);
      }
    };

    if (!customerID) {
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

      setPerson(person);

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

  const showFirstValidationError = (errors: any, touched: any) => {
    const fieldOrder = [
      'firstName',
      'lastName',
      'mobile',
      'customerType',
      'customerJob',
      'province',
      'city',
      'address',
      'description'
    ];

    for (const field of fieldOrder) {
      if (touched[field] && errors[field]) {
        showToast(errors[field], "error");
        return;
      }
    }

    for (const [key, error] of Object.entries(errors)) {
      if (key.startsWith('custom_') && touched[key] && error) {
        showToast(error as string, "error");
        return;
      }
    }
  };

  const handleSubmit = async (values: FormValues, formikBag: any): Promise<void> => {
    console.log("handleSubmit called with values:", values);

    // Check for validation errors
    const errors: any = {};

    if (!values.firstName.trim()) {
      errors.firstName = "لطفاً نام را وارد کنید";
    }

    if (!values.lastName.trim()) {
      errors.lastName = "لطفاً نام خانوادگی را وارد کنید";
    }

    if (!values.mobile.trim()) {
      errors.mobile = "لطفاً شماره موبایل را وارد کنید";
    } else if (!/^09\d{9}$/.test(values.mobile)) {
      errors.mobile = "شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود";
    }

    // Show first error as toast
    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0] as string;
      showToast(firstError, "error");
      return;
    }

    if (customerID) {
      setIsSubmitting(true);
      try {
        let provinceId = null;
        let cityId = null;

        if (values.province) {
          provinceId = await LocationService.getProvinceIdByName(values.province);
          if (!provinceId) {
            showToast("خطا در دریافت شناسه استان", "error");
            setIsSubmitting(false);
            return;
          }
        }

        if (values.city && values.province) {
          cityId = await PersonManagementService.getCityIdByName(values.city, values.province);
          if (!cityId) {
            showToast("خطا در دریافت شناسه شهر", "error");
            setIsSubmitting(false);
            return;
          }
        }

        let personGroupIds: number[] = [];
        if (values.customerType) {
          const foundType = customerTypes.find(type => type.PersonGroupName === values.customerType);
          if (foundType) personGroupIds = [foundType.PersonGroupId];
        }

        let personJobId = null;
        if (values.customerJob) {
          const foundJob = customerJobs.find(job => job.label === values.customerJob);
          personJobId = foundJob?.value || null;
        }

        const personToEdit: IPersonToEdit = {
          PersonId: Number(customerID),
          FirstName: values.firstName,
          LastName: values.lastName,
          NickName: values.alias,
          Mobile: values.mobile,
          ProvinceId: provinceId,
          CityId: cityId,
          PersonJobId: personJobId,
          MarketingChannelId: null,
          IntroducerPersonId: values.colleague.id ? Number(values.colleague.id) : null,
          Address: values.address,
          Description: values.description,
          PersonGroupIdList: personGroupIds,
        };

        const response = await axios.put(`${appConfig.mobileApi}Person/Edit`, personToEdit);
        if (response.status === 200) {
          showToast(`مشتری با موفقیت ویرایش شد.`, "success");
        }
      } catch (error) {
        showToast("خطا در ثبت مشتری. لطفاً دوباره تلاش کنید", "error");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(true);
      try {
        let provinceId = null;
        let cityId = null;

        if (values.province) {
          provinceId = await LocationService.getProvinceIdByName(values.province);
          if (!provinceId) {
            showToast("خطا در دریافت شناسه استان", "error");
            setIsSubmitting(false);
            return;
          }
        }

        if (values.city && values.province) {
          cityId = await PersonManagementService.getCityIdByName(values.city, values.province);
          if (!cityId) {
            showToast("خطا در دریافت شناسه شهر", "error");
            setIsSubmitting(false);
            return;
          }
        }

        let personGroupIds: number[] = [];
        if (values.customerType) {
          const foundType = customerTypes.find(type => type.PersonGroupName === values.customerType);
          if (foundType) personGroupIds = [foundType.PersonGroupId];
        }

        const personData: CreatePersonDTO = {
          PersonId: 0,
          FirstName: values.firstName,
          LastName: values.lastName,
          Mobile: values.mobile,
          ProvinceId: provinceId,
          CityId: cityId,
          MarketingChannelId: null,
          Address: values.address,
          PersonGroupIdList: personGroupIds,
        };

        await PersonManagementService.createPerson(personData);
        showToast(`مشتری با موفقیت ثبت شد.`, "success");

      } catch (error) {
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
        onSubmit={() => { }} // Empty since we handle submit manually
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
                      initialValues={[formikProps.values.customerType].filter(Boolean)}
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
                      initialValues={[formikProps.values.customerJob].filter(Boolean)}
                    />
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => {
                        setIsColleagueBottomSheetVisible(true);
                      }}
                      style={styles.colleagueBox}
                    >
                      <MaterialIcons
                        name="person-search"
                        size={20}
                        color={colors.medium}
                      ></MaterialIcons>
                      <AppText
                        style={{
                          color: colors.medium,
                          marginRight: 12,
                          fontSize: 15,
                        }}
                      >
                        {formikProps.values.colleague.name
                          ? `${formikProps.values.colleague.name} (${formikProps.values.colleague.phone})`
                          : "معرف"}
                      </AppText>
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
                    onPress={() => {
                      console.log("Submit button clicked!");
                      console.log("Form values:", formikProps.values);

                      // Manual validation and submission
                      const values = formikProps.values;

                      if (!values.firstName.trim()) {
                        showToast("لطفاً نام را وارد کنید", "error");
                        return;
                      }

                      if (!values.lastName.trim()) {
                        showToast("لطفاً نام خانوادگی را وارد کنید", "error");
                        return;
                      }

                      if (!values.mobile.trim()) {
                        showToast("لطفاً شماره موبایل را وارد کنید", "error");
                        return;
                      }

                      if (!/^09\d{9}$/.test(values.mobile)) {
                        showToast("شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود", "error");
                        return;
                      }

                      // If validation passes, call the actual submit function
                      handleSubmit(values, {});
                    }}
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
  colleagueBox: {
    flexDirection: "row-reverse",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: 8,
    backgroundColor: colors.white,
    padding: 10,
    marginBottom: 16,
  },
});

export default CustomerInfo;