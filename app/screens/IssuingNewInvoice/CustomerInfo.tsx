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
import {
  groupBy,
  InputContainer,
} from "../FieldMarketer/B2BFieldMarketer/AddNewShop";
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
  customFields: IPersonCustomField[]
) => {
  console.log("person in generate:", person);

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

  customFields.forEach((field) => {
    initialValues[`custom_${field.PersonCustomFieldId}`] = "";
  });

  return initialValues;
};

const generateValidationSchema = (customFields: IPersonCustomField[]) => {
  const shape: { [key: string]: any } = {
    firstName: Yup.string().required("لطفاً نام را وارد کنید"),
    lastName: Yup.string().required("لطفاً نام خانوادگی را وارد کنید"),
    alias: Yup.string(),
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

  customFields.forEach((field) => {
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
  });

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
          error={
            formikProps.touched[fieldName] && formikProps.errors[fieldName]
              ? formikProps.errors[fieldName]
              : undefined
          }
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
          error={
            formikProps.touched[fieldName] && formikProps.errors[fieldName]
              ? formikProps.errors[fieldName]
              : undefined
          }
        />
      );
    case 3:
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
  const [personCustomField, setPersonCustomField] = useState<
    IPersonCustomField[]
  >([]);
  const [customFieldType1, setCustomFieldType1] = useState<
    IPersonCustomField[]
  >([]);
  const [customFieldType2, setCustomFieldType2] = useState<
    IPersonCustomField[]
  >([]);
  const [customFieldOtherTypes, setCustomFieldOtherTypes] = useState<
    Record<string, IPersonCustomField[]>
  >({});

  const fetchPersonCustomField = async () => {
    setIsLoadingForm(true);
    try {
      const response = await axios.get<{ Items: IPersonCustomField[] }>(
        `${appConfig.mobileApi}PersonCustomField/GetAllActive`
      );
      const type1 = response.data.Items.filter(
        (customField) => customField.PersonCustomFieldGroupId === 1
      ).sort((a, b) => a.Form_ShowOrder - b.Form_ShowOrder);
      const type2 = response.data.Items.filter(
        (customField) => customField.PersonCustomFieldGroupId === 2
      ).sort((a, b) => a.Form_ShowOrder - b.Form_ShowOrder);

      const otherTypes = response.data.Items.filter(
        (customField) =>
          customField.PersonCustomFieldGroupId !== 1 &&
          customField.PersonCustomFieldGroupId !== 2
      );
      const groupedFields = groupBy(otherTypes, "PersonCustomFieldGroupId");
      setCustomFieldType1(type1);
      setCustomFieldType2(type2);
      setCustomFieldOtherTypes(groupedFields);
      setPersonCustomField(response.data.Items);
      console.log(groupedFields);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoadingForm(false);
    }
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

    if (!customerID) {
      loadDefaultLocation();
    }
  }, [provinces.length]);

  useEffect(() => {
    fetchPersonCustomField();
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

      if (person.ProvinceName) {
        fetchCitiesByProvince(person.ProvinceName);
      }
    } catch (error) { }
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
    const customerTypesString = selectedTypes.join(", ");
    setSelectedCustomerJobString(customerTypesString);
  };

  const handleCityClick = (): void => {
    showToast("لطفاً ابتدا استان را انتخاب کنید", "error");
  };

  const handleSelectColleague = (colleague: Colleague): void => {
    setSelectedColleague(colleague);
  };

  const handleSubmit = async (data: FormValues): Promise<void> => {
    if (customerID) {
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

        const personToEdit: IPersonToEdit = {
          PersonId: Number(customerID),
          FirstName: data.firstName,
          LastName: data.lastName,
          NickName: data.alias,
          Mobile: data.mobile,
          ProvinceId: provinceId,
          CityId: cityId,
          PersonJobId:
            customerJobs.find(
              (customer: any) => customer.label === selectedCustomerJobString
            )?.value || 0,
          MarketingChannelId: null,
          IntroducerPersonId: Number(selectedColleague.id),
          Address: data.address,
          Description: data.description,
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
      setIsSubmitting(true);

      try {
        const provinceId = await LocationService.getProvinceIdByName(
          data.province
        );
        if (!provinceId) {
          showToast("خطا در دریافت شناسه استان", "error");
          setIsSubmitting(false);
          return;
        }

        const cityId = await PersonManagementService.getCityIdByName(
          data.city,
          data.province
        );
        if (!cityId) {
          showToast("خطا در دریافت شناسه شهر", "error");
          setIsSubmitting(false);
          return;
        }

        let personGroupIds: number[] = [];
        if (data.customerType) {
          personGroupIds =
            await PersonManagementService.getPersonGroupIdsByNames([
              data.customerType,
            ]);
          if (personGroupIds.length === 0 && data.customerType) {
            showToast("خطا در دریافت شناسه‌های گروه مشتری", "warning");
          }
        }

        const customFields: CreatePersonDTO["PersonCustomFieldList"] =
          personCustomField
            .filter((cf) => data[`custom_${cf.PersonCustomFieldId}`])
            .map((customField) => {
              return {
                PersonId: 0,
                PersonCustomFieldId: customField.PersonCustomFieldId,
                Value:
                  data[`custom_${customField.PersonCustomFieldId}`].toString(),
                InsertDate: new Date().toISOString(),
              };
            });

        const personData: CreatePersonDTO = {
          PersonId: 0,
          FirstName: data.firstName,
          LastName: data.lastName,
          Mobile: data.mobile,
          ProvinceId: provinceId,
          CityId: cityId,
          MarketingChannelId: null,
          Address: data.address,
          PersonGroupIdList: personGroupIds,
          PersonCustomFieldList: customFields,
        };

        console.log(personData);

        const newPersonId = await PersonManagementService.createPerson(
          personData
        );

        showToast(`مشتری با موفقیت ثبت شد.`, "success");

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
        title={
          customerID
            ? "ویرایش خریدار"
            : mode === "visitor"
              ? "اطلاعات بازدید کننده"
              : "ثبت خریدار جدید"
        }
      />
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onDismiss={hideToast}
      />
      <Formik
        initialValues={generateInitialValues(person, personCustomField)}
        validationSchema={generateValidationSchema(personCustomField)}
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
                      placeholderText="گروه مشتری"
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
                      initialValues={
                        formikProps.values.customerType && formikProps.values.customerType.trim() !== ""
                          ? [formikProps.values.customerType]
                          : []
                      }
                      error={
                        formikProps.touched.customerType &&
                          formikProps.errors.customerType
                          ? formikProps.errors.customerType
                          : undefined
                      }
                    />

                    <SelectionBottomSheet
                      placeholderText="شغل"
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
                      initialValues={
                        formikProps.values.customerJob && formikProps.values.customerJob.trim() !== ""
                          ? [formikProps.values.customerJob]
                          : []
                      }
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
                          placeholderText="شهرستان"
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
                          initialValues={
                            formikProps.values.city && formikProps.values.city.trim() !== ""
                              ? [formikProps.values.city]
                              : []
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
                          placeholderText="استان"
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
                          initialValues={
                            formikProps.values.province && formikProps.values.province.trim() !== ""
                              ? [formikProps.values.province]
                              : []
                          }
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
                      <View key={customField.PersonCustomFieldId}>
                        {renderInput(customField, formikProps)}
                      </View>
                    )}
                  </InputContainer>
                  {Object.entries(customFieldOtherTypes).map(
                    ([groupId, fields]) => (
                      <InputContainer
                        key={groupId}
                        title={fields[0].PersonCustomFieldGroupName}
                      >
                        {fields.map((customField) => (
                          <View key={customField.PersonCustomFieldId}>
                            {renderInput(customField, formikProps)}
                          </View>
                        ))}
                      </InputContainer>
                    )
                  )}
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

                  <IconButton
                    text={isSubmitting ? "در حال ثبت..." : customerID ? "ویرایش" : "ثبت"}
                    onPress={formikProps.handleSubmit}
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
});

export default CustomerInfo;