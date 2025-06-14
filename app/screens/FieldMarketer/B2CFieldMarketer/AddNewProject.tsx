import React, { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { groupBy, InputContainer } from "../B2BFieldMarketer/AddNewShop";
import AppTextInput from "../../../components/TextInput";
import SelectionBottomSheet from "../../../components/SelectionDialog";
import IconButton from "../../../components/IconButton";
import colors from "../../../config/colors";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { AppNavigationProp } from "../../../StackNavigator";
import ScreenHeader from "../../../components/ScreenHeader";
import LocationService from "../../IssuingNewInvoice/api/LocationService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ILoginResponse,
  IProjectCustomField,
  IProjectItem,
} from "../../../config/types";
import Toast from "../../../components/Toast";
import axios, { AxiosError } from "axios";
import appConfig from "../../../../config";
import { MaterialIcons } from "@expo/vector-icons";
import ColleagueBottomSheet, {
  Colleague,
} from "../../IssuingNewInvoice/ColleagueSearchModal";
import Text from "../../../components/Text";
import * as Yup from "yup";
import { DatePickerField } from "../../../components/PersianDatePicker";
import DynamicSelectionBottomSheet from "../../../components/DynamicSelectionBottomSheet";
import { Formik, FormikProps } from "formik";
import AppText from "../../../components/Text";

// Form values interface
interface FormValues {
  projectTitle: string;
  province: string;
  city: string;
  address: string;
  customerFirstName: string;
  customerLastName: string;
  customerPhone: string;
  textNote: string;
  [key: string]: string; // For dynamic custom fields
}

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

type AddNewProjectRouteParams = {
  project?: IProjectItem;
};

const AddNewProject = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const route =
    useRoute<RouteProp<Record<string, AddNewProjectRouteParams>, string>>();
  const projectFromRoute = route.params?.project;
  console.log("project", projectFromRoute);

  const [project, setProject] = useState<IProjectItem>();
  // const [customerFirstName, setCustomerFirstName] = useState("");
  // const [customerLastName, setCustomerLastName] = useState("");
  // const [customerPhone, setCustomerPhone] = useState("");
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
  const [defaultProvinceId, setDefaultProvinceId] = useState<number | null>(
    null
  );
  const [defaultCityId, setDefaultCityId] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<
    "success" | "error" | "warning" | "info"
  >("error");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingForm, setIsLoadingForm] = useState(false);

  const [textNote, setTextNote] = useState("");

  const [hasCustomerInfo, setHasCustomerInfo] = useState(false);

  // Add a state to track if customer info is filled
  // const hasCustomerInfo =
  //   customerFirstName && customerLastName && customerPhone;

  // Custom field states
  const [projectCustomFields, setProjectCustomFields] = useState<
    IProjectCustomField[]
  >([]);
  const [customFieldType1, setCustomFieldType1] = useState<
    IProjectCustomField[]
  >([]);
  const [customFieldType2, setCustomFieldType2] = useState<
    IProjectCustomField[]
  >([]);
  const [customFieldType3, setCustomFieldType3] = useState<
    IProjectCustomField[]
  >([]);
  const [customFieldOtherTypes, setCustomFieldOtherTypes] = useState<
    Record<string, IProjectCustomField[]>
  >({});

  const showToast = (
    message: string,
    type: "success" | "error" | "warning" | "info" = "error"
  ): void => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const hideToast = (): void => {
    setToastVisible(false);
  };

  useEffect(() => {
    if (projectFromRoute) {
      getProjectById(projectFromRoute.PersonProjectId);
    }
  }, [projectFromRoute]);

  const fetchProjectCustomFields = async () => {
    setIsLoadingForm(true);
    try {
      const response = await axios.get<IProjectCustomField[]>(
        `${appConfig.mobileApi}PersonProjectCustomField/GetAll`
      );
      const type1 = response.data
        .filter((customField) => customField.ProjectCustomFieldGroupId === 1)
        .sort((a, b) => a.Form_ShowOrder - b.Form_ShowOrder);
      const type2 = response.data
        .filter((customField) => customField.ProjectCustomFieldGroupId === 2)
        .sort((a, b) => a.Form_ShowOrder - b.Form_ShowOrder);
      const type3 = response.data
        .filter((customField) => customField.ProjectCustomFieldGroupId === 3)
        .sort((a, b) => a.Form_ShowOrder - b.Form_ShowOrder);

      const otherTypes = response.data.filter(
        (customField) =>
          customField.ProjectCustomFieldGroupId !== 1 &&
          customField.ProjectCustomFieldGroupId !== 2 &&
          customField.ProjectCustomFieldGroupId !== 3
      );
      const groupedFields = groupBy(otherTypes, "ProjectCustomFieldGroupId");

      setCustomFieldType1(type1);
      setCustomFieldType2(type2);
      setCustomFieldType3(type3);
      setCustomFieldOtherTypes(groupedFields);
      setProjectCustomFields(response.data);
    } catch (error) {
      console.error("خطا در دریافت فیلدهای سفارشی:", error);
      showToast("خطا در دریافت فیلدهای سفارشی", "error");
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
    fetchProjectCustomFields();
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

  const handleProvinceSelection = (
    value: string[],
    setFieldValue: (field: string, value: any) => void
  ) => {
    if (value && value.length > 0) {
      const provinceName = value[0];
      setSelectedProvince(provinceName);
      setSelectedCity("");
      setFieldValue("province", provinceName);
      setFieldValue("city", "");
      fetchCitiesByProvince(provinceName);
    }
  };

  const handleCitySelection = (
    value: string[],
    setFieldValue: (field: string, value: any) => void
  ) => {
    if (value && value.length > 0) {
      setSelectedCity(value[0]);
      setFieldValue("city", value[0]);
    }
  };

  const handleCityClick = (): void => {
    showToast("لطفاً ابتدا استان را انتخاب کنید", "error");
  };

  const handleAddIconPress = (): void => {
    setIsColleagueSheetVisible(true);
  };

  const handleClearCustomerInfo = (
    setFieldValue: (field: string, value: any) => void
  ): void => {
    setCustomerId(null);
    setHasCustomerInfo(false);
    setFieldValue("customerFirstName", "");
    setFieldValue("customerLastName", "");
    setFieldValue("customerPhone", "");
  };

  const handleSelectColleague = (
    colleague: Colleague,
    setFieldValue: (field: string, value: any) => void
  ): void => {
    const nameParts = colleague.name.split(" ");
    let firstName = "";
    let lastName = "";

    if (nameParts.length >= 2) {
      firstName = nameParts[0];
      lastName = nameParts.slice(1).join(" ");
    } else if (nameParts.length === 1) {
      firstName = nameParts[0];
    }

    setFieldValue("customerFirstName", firstName);
    setFieldValue("customerLastName", lastName);
    setFieldValue("customerPhone", colleague.phone);
    setCustomerId(colleague.id ? parseInt(colleague.id, 10) : null);
    setHasCustomerInfo(true);
    setIsColleagueSheetVisible(false);
  };

  // const handleProvinceSelection = (value: string[]): void => {
  //   if (value && value.length > 0) {
  //     const provinceName = value[0];
  //     setSelectedProvince(provinceName);
  //     setSelectedCity("");
  //     fetchCitiesByProvince(provinceName);
  //   }
  // };

  // const handleCitySelection = (value: string[]): void => {
  //   if (value && value.length > 0) {
  //     setSelectedCity(value[0]);
  //   }
  // };

  // const handleCityClick = (): void => {
  //   showToast("لطفاً ابتدا استان را انتخاب کنید", "error");
  // };

  // const handleAddIconPress = (): void => {
  //   setIsColleagueSheetVisible(true);
  // };

  // // Add a handler for clearing customer info
  // const handleClearCustomerInfo = (): void => {
  //   setCustomerFirstName("");
  //   setCustomerLastName("");
  //   setCustomerPhone("");
  //   setCustomerId(null);
  // };

  // const handleSelectColleague = (colleague: Colleague): void => {
  //   // Extract first name and last name from the full name
  //   const nameParts = colleague.name.split(" ");
  //   let firstName = "";
  //   let lastName = "";

  //   if (nameParts.length >= 2) {
  //     firstName = nameParts[0];
  //     lastName = nameParts.slice(1).join(" ");
  //   } else if (nameParts.length === 1) {
  //     firstName = nameParts[0];
  //   }

  //   // Update the customer information fields
  //   setCustomerFirstName(firstName);
  //   setCustomerLastName(lastName);
  //   setCustomerPhone(colleague.phone);

  //   // If you have a customerId, set it
  //   if (colleague.id) {
  //     setCustomerId(parseInt(colleague.id, 10));
  //   }

  //   // Close the colleague selection sheet
  //   setIsColleagueSheetVisible(false);
  // };

  const getProjectById = async (id: number) => {
    setIsLoadingForm(true);
    try {
      const response = await axios.get<IProjectItem>(
        `${appConfig.mobileApi}PersonProject/Get?id=${id}`
      );
      setProject(response.data);
    } catch (error) {
    } finally {
      setIsLoadingForm(false);
    }
  };

  const getProvinceIdByName = async (
    provinceName: string
  ): Promise<number | null> => {
    try {
      const provinceId = await LocationService.getProvinceIdByName(
        provinceName
      );
      return provinceId;
    } catch (error) {
      console.error("Error getting province ID:", error);
      return defaultProvinceId;
    }
  };

  const getCityIdByName = async (
    cityName: string,
    provinceName: string
  ): Promise<number | null> => {
    try {
      const provinces = await LocationService.getAllProvinces();
      const province = provinces.find((p) => p.ProvinceName === provinceName);

      if (!province) {
        console.error(`Province not found: ${provinceName}`);
        return defaultCityId;
      }

      const cities = await LocationService.getCitiesByProvinceId(
        province.ProvinceId
      );
      const city = cities.find((c) => c.CityName === cityName);

      return city ? city.CityId : defaultCityId;
    } catch (error) {
      console.error("Error getting city ID:", error);
      return defaultCityId;
    }
  };

  // Generate initial form values
  const generateInitialValues = () => {
    const initialValues: FormValues = {
      projectTitle: project?.ProjectName || "",
      province: project?.ProvinceName || selectedProvince,
      city: project?.CityName || selectedCity,
      address: "",
      customerFirstName: project?.PersonFirstName || "",
      customerLastName: project?.PersonLastName || "",
      customerPhone: project?.PersonMobile || "",
      textNote: "",
    };

    [...customFieldType1, ...customFieldType2, ...customFieldType3].forEach(
      (field) => {
        initialValues[`custom_${field.ProjectCustomFieldId}`] = "";
      }
    );

    return initialValues;
  };

  // Generate validation schema
  const generateValidationSchema = () => {
    const shape: { [key: string]: any } = {
      projectTitle: Yup.string().required("عنوان پروژه الزامی است"),
      province: Yup.string().required("استان الزامی است"),
      city: Yup.string().required("شهرستان الزامی است"),
      address: Yup.string(),
      customerFirstName: Yup.string().when([], {
        is: () => !hasCustomerInfo,
        then: (schema) => schema.required("نام کارفرما الزامی است"),
        otherwise: (schema) => schema,
      }),
      customerLastName: Yup.string().when([], {
        is: () => !hasCustomerInfo,
        then: (schema) => schema.required("نام خانوادگی کارفرما الزامی است"),
        otherwise: (schema) => schema,
      }),
      customerPhone: Yup.string().required("شماره تماس الزامی است"),
      textNote: Yup.string(),
    };

    [...customFieldType1, ...customFieldType2, ...customFieldType3].forEach(
      (field) => {
        if (field.IsRequired) {
          if (field.FieldType === 2) {
            shape[`custom_${field.ProjectCustomFieldId}`] = Yup.string()
              .matches(/^\d+$/, `${field.FieldName} باید عدد باشد`)
              .required(`${field.FieldName} الزامی است`);
          } else if (field.FieldType === 3) {
            shape[`custom_${field.ProjectCustomFieldId}`] =
              Yup.string().required(`${field.FieldName} الزامی است`);
          } else {
            shape[`custom_${field.ProjectCustomFieldId}`] =
              Yup.string().required(`${field.FieldName} الزامی است`);
          }
        }
      }
    );

    return Yup.object().shape(shape);
  };

  // Render dynamic input fields
  const renderInput = (
    customField: IProjectCustomField,
    formikProps: FormikProps<FormValues>
  ) => {
    const fieldName = `custom_${customField.ProjectCustomFieldId}`;
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
            onDateChange={(value) =>
              formikProps.setFieldValue(fieldName, value)
            }
            error={
              formikProps.touched[fieldName] && formikProps.errors[fieldName]
                ? formikProps.errors[fieldName]
                : undefined
            }
          />
        );
      case 4:
        return (
          <DynamicSelectionBottomSheet<FormValues>
            customFieldId={customField.ProjectCustomFieldId}
            customFieldName={customField.FieldName}
            customIconName={customField.IconName}
            url={`${appConfig.mobileApi}ProjectCustomFieldSelectiveValue/GetAll?customFieldId=${customField.ProjectCustomFieldId}&page=1&pageSize=1000`}
            formikProps={formikProps}
          />
          // <View></View>
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
            numberOfLines={5}
            height={150}
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

  // Submit form data
  const postFormData = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const provinceId =
        (await getProvinceIdByName(values.province)) || defaultProvinceId;
      const cityId =
        (await getCityIdByName(values.city, values.province)) || defaultCityId;

      if (!provinceId || !cityId) {
        showToast("خطا در دریافت اطلاعات استان و شهر", "error");
        return;
      }

      const personFullName =
        `${values.customerFirstName} ${values.customerLastName}`.trim();
      const currentDate = new Date().toISOString();

      const projectData = {
        PersonProjectId: 0,
        PersonId: customerId,
        PersonFirstName: values.customerFirstName,
        PersonLastName: values.customerLastName,
        PersonFullName: personFullName,
        CityId: cityId,
        CityName: values.city,
        ProvinceId: provinceId,
        ProvinceName: values.province,
        ProjectName: values.projectTitle,
        ApplicationUserId: userId || 0,
        ApplicationUserName: null,
        Description: values.textNote || values.address || "",
        InsertDate: currentDate,
        LastUpdateDate: null,
        PersonProjectCustomFieldList: projectCustomFields
          .filter((cf) => values[`custom_${cf.ProjectCustomFieldId}`])
          .map((customField) => ({
            PersonProjectId: 0,
            ProjectCustomFieldId: customField.ProjectCustomFieldId,
            ProjectCustomFieldSelectiveValueId: 0,
            Value:
              values[`custom_${customField.ProjectCustomFieldId}`].toString(),
          })),
      };

      const token = (await getLoginResponse())?.Token;
      if (!token) {
        showToast("خطا در دریافت توکن احراز هویت", "error");
        return;
      }

      const response = await axios.post(
        `${appConfig.mobileApi}PersonProject/Add`,
        projectData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        showToast("پروژه با موفقیت ثبت شد", "success");
        setTimeout(() => navigation.goBack(), 1500);
      } else {
        showToast("خطا در ثبت پروژه", "error");
      }
    } catch (error) {
      const er = error as AxiosError;
      console.error("Error submitting project:", er);
      showToast(er.message || "خطا در ثبت پروژه", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const editFormData = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const provinceId =
        (await getProvinceIdByName(values.province)) || defaultProvinceId;
      const cityId =
        (await getCityIdByName(values.city, values.province)) || defaultCityId;

      if (!provinceId || !cityId) {
        showToast("خطا در دریافت اطلاعات استان و شهر", "error");
        return;
      }

      const personFullName =
        `${values.customerFirstName} ${values.customerLastName}`.trim();
      const currentDate = new Date().toISOString();

      const projectData = {
        PersonProjectId: project?.PersonProjectId || 0,
        PersonId: customerId,
        PersonFullName: personFullName,
        CityId: cityId,
        CityName: values.city,
        ProvinceId: provinceId,
        ProvinceName: values.province,
        ProjectName: values.projectTitle,
        ApplicationUserId: userId || 0,
        ApplicationUserName: null,
        Description: values.textNote || values.address || "",
        InsertDate: currentDate,
        LastUpdateDate: null,
        PersonProjectCustomFieldList: projectCustomFields
          .filter((cf) => values[`custom_${cf.ProjectCustomFieldId}`])
          .map((customField) => ({
            PersonProjectId: 0,
            ProjectCustomFieldId: customField.ProjectCustomFieldId,
            ProjectCustomFieldSelectiveValueId: 0,
            Value:
              values[`custom_${customField.ProjectCustomFieldId}`].toString(),
          })),
      };

      const token = (await getLoginResponse())?.Token;
      if (!token) {
        showToast("خطا در دریافت توکن احراز هویت", "error");
        return;
      }

      const response = await axios.put(
        `${appConfig.mobileApi}PersonProject/Edit`,
        projectData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        showToast("پروژه با موفقیت ویرایش شد", "success");
        setTimeout(() => navigation.goBack(), 1500);
      } else {
        showToast("خطا در ویرایش پروژه", "error");
      }
    } catch (error) {
      const er = error as AxiosError;
      console.error("Error submitting project:", er);
      showToast(er.message || "خطا در ویرایش پروژه", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // const handleSubmit = async () => {
  //   if (
  //     !customerFirstName.trim() ||
  //     !customerLastName.trim() ||
  //     !customerPhone.trim()
  //   ) {
  //     showToast("لطفاً مشخصات کارفرما را کامل کنید", "error");
  //     return;
  //   }

  //   if (!projectTitle.trim()) {
  //     showToast("لطفاً عنوان پروژه را وارد کنید", "error");
  //     return;
  //   }

  //   if (!selectedProvince || !selectedCity) {
  //     showToast("لطفاً استان و شهرستان را انتخاب کنید", "error");
  //     return;
  //   }

  //   setIsSubmitting(true);

  //   try {
  //     const provinceId =
  //       (await getProvinceIdByName(selectedProvince)) || defaultProvinceId;
  //     const cityId =
  //       (await getCityIdByName(selectedCity, selectedProvince)) ||
  //       defaultCityId;

  //     if (!provinceId || !cityId) {
  //       showToast("خطا در دریافت اطلاعات استان و شهر", "error");
  //       setIsSubmitting(false);
  //       return;
  //     }

  //     const personFullName = `${customerFirstName} ${customerLastName}`;
  //     const currentDate = new Date().toISOString();

  //     const projectData = {
  //       PersonProjectId: 0,
  //       PersonId: customerId,
  //       PersonFullName: personFullName,
  //       CityId: cityId,
  //       CityName: selectedCity,
  //       ProvinceId: provinceId,
  //       ProvinceName: selectedProvince,
  //       ProjectName: projectTitle,
  //       ApplicationUserId: userId || 0,
  //       ApplicationUserName: null,
  //       Description: textNote || address || "",
  //       InsertDate: currentDate,
  //       LastUpdateDate: null,
  //       PersonProjectCustomFieldList: null,
  //     };

  //     console.log("Submitting project data:", JSON.stringify(projectData));

  //     const token = (await getLoginResponse())?.Token;
  //     if (!token) {
  //       showToast("خطا در دریافت توکن احراز هویت", "error");
  //       setIsSubmitting(false);
  //       return;
  //     }

  //     const response = await axios.post(
  //       `${appConfig.mobileApi}PersonProject/Add`,
  //       projectData,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );

  //     if (response.status === 200 || response.status === 201) {
  //       showToast("پروژه با موفقیت ثبت شد", "success");

  //       setTimeout(() => {
  //         navigation.goBack();
  //       }, 1500);
  //     } else {
  //       showToast("خطا در ثبت پروژه", "error");
  //     }
  //   } catch (error) {
  //     console.error("Error submitting project:", error);

  //     if (error.response && error.response.data) {
  //       if (error.response.data.message) {
  //         showToast(error.response.data.message, "error");
  //       } else {
  //         showToast("خطا در ثبت پروژه", "error");
  //       }
  //     } else {
  //       showToast("خطا در ارتباط با سرور", "error");
  //     }
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  // const resetForm = () => {
  //   setCustomerFirstName("");
  //   setCustomerLastName("");
  //   setCustomerPhone("");
  //   setProjectTitle("");
  //   setAddress("");
  //   setTextNote("");
  // };

  // Render input fields for customer information that are not editable when populated
  // const renderCustomerInputs = () => {
  //   return (
  //     <>
  //       <AppTextInput
  //         autoCapitalize="none"
  //         icon="person"
  //         autoCorrect={false}
  //         keyboardType="default"
  //         placeholder="نام"
  //         value={customerFirstName}
  //         onChangeText={customerFirstName ? undefined : setCustomerFirstName} // Disable editing if value exists
  //         editable={!customerFirstName} // Disable editing if value exists
  //         style={customerFirstName ? styles.disabledInput : {}}
  //       />
  //       <AppTextInput
  //         autoCapitalize="none"
  //         icon="person"
  //         autoCorrect={false}
  //         keyboardType="default"
  //         placeholder="نام خانوادگی"
  //         value={customerLastName}
  //         onChangeText={customerLastName ? undefined : setCustomerLastName} // Disable editing if value exists
  //         editable={!customerLastName} // Disable editing if value exists
  //         style={customerLastName ? styles.disabledInput : {}}
  //       />
  //       <AppTextInput
  //         autoCapitalize="none"
  //         icon="phone-android"
  //         autoCorrect={false}
  //         keyboardType="number-pad"
  //         placeholder="شماره تماس"
  //         value={customerPhone}
  //         onChangeText={customerPhone ? undefined : setCustomerPhone} // Disable editing if value exists
  //         editable={!customerPhone} // Disable editing if value exists
  //         style={customerPhone ? styles.disabledInput : {}}
  //       />
  //     </>
  //   );
  // };

  return (
    <Formik<FormValues>
      initialValues={generateInitialValues()}
      validationSchema={generateValidationSchema()}
      onSubmit={(values) => {
        if (project) editFormData(values);
        else {
          postFormData(values);
        }
      }}
      enableReinitialize
    >
      {(formikProps) => (
        <>
          <ScreenHeader title={project ? "ویرایش پروژه" : "ثبت پروژه جدید"} />
          <Toast
            visible={toastVisible}
            message={toastMessage}
            type={toastType}
            onDismiss={hideToast}
          />
          <View style={styles.container}>
            <ScrollView
              contentContainerStyle={{ flexGrow: 1 }}
              showsVerticalScrollIndicator={false}
            >
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
                  <InputContainer title="مشخصات پروژه">
                    <AppTextInput
                      autoCapitalize="none"
                      icon="business"
                      autoCorrect={false}
                      keyboardType="default"
                      placeholder="عنوان پروژه"
                      onChangeText={formikProps.handleChange("projectTitle")}
                      value={formikProps.values.projectTitle}
                      error={
                        formikProps.touched.projectTitle &&
                        formikProps.errors.projectTitle
                          ? formikProps.errors.projectTitle
                          : undefined
                      }
                    />
                    <View style={styles.rowContainer}>
                      <View style={styles.halfWidth}>
                        <SelectionBottomSheet
                          key={`city-${selectedProvince}`}
                          placeholderText={selectedCity || "شهرستان"}
                          title="شهرستان"
                          iconName="apartment"
                          options={selectedProvince ? cities : []}
                          onSelect={(value) =>
                            handleCitySelection(
                              value,
                              formikProps.setFieldValue
                            )
                          }
                          loading={loadingCities}
                          onPress={
                            selectedProvince ? undefined : handleCityClick
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
                          placeholderText={selectedProvince || "استان"}
                          title="استان"
                          iconName="map"
                          options={provinces}
                          onSelect={(value) =>
                            handleProvinceSelection(
                              value,
                              formikProps.setFieldValue
                            )
                          }
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
                      autoCapitalize="none"
                      icon="location-on"
                      autoCorrect={false}
                      keyboardType="default"
                      placeholder="آدرس"
                      onChangeText={formikProps.handleChange("address")}
                      value={formikProps.values.address}
                      multiline
                      numberOfLines={5}
                      height={150}
                      textAlign="right"
                      isLargeInput={true}
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
                  <InputContainer
                    title="مشخصات کارفرما"
                    showAddIcon={!hasCustomerInfo}
                    showClearIcon={hasCustomerInfo}
                    onAddIconPress={handleAddIconPress}
                    onClearIconPress={() =>
                      handleClearCustomerInfo(formikProps.setFieldValue)
                    }
                  >
                    <AppTextInput
                      autoCapitalize="none"
                      icon="person"
                      autoCorrect={false}
                      keyboardType="default"
                      placeholder="نام"
                      onChangeText={formikProps.handleChange(
                        "customerFirstName"
                      )}
                      value={formikProps.values.customerFirstName}
                      editable={!hasCustomerInfo}
                      style={hasCustomerInfo ? styles.disabledInput : {}}
                      error={
                        formikProps.touched.customerFirstName &&
                        formikProps.errors.customerFirstName
                          ? formikProps.errors.customerFirstName
                          : undefined
                      }
                      readOnly={project ? true : false}
                    />
                    <AppTextInput
                      autoCapitalize="none"
                      icon="person"
                      autoCorrect={false}
                      keyboardType="default"
                      placeholder="نام خانوادگی"
                      onChangeText={formikProps.handleChange(
                        "customerLastName"
                      )}
                      value={formikProps.values.customerLastName}
                      editable={!hasCustomerInfo}
                      style={hasCustomerInfo ? styles.disabledInput : {}}
                      error={
                        formikProps.touched.customerLastName &&
                        formikProps.errors.customerLastName
                          ? formikProps.errors.customerLastName
                          : undefined
                      }
                      readOnly={project ? true : false}
                    />
                    <AppTextInput
                      autoCapitalize="none"
                      icon="phone-android"
                      autoCorrect={false}
                      keyboardType="number-pad"
                      placeholder="شماره تماس"
                      onChangeText={formikProps.handleChange("customerPhone")}
                      value={formikProps.values.customerPhone}
                      editable={!hasCustomerInfo}
                      style={hasCustomerInfo ? styles.disabledInput : {}}
                      error={
                        formikProps.touched.customerPhone &&
                        formikProps.errors.customerPhone
                          ? formikProps.errors.customerPhone
                          : undefined
                      }
                      readOnly={project ? true : false}
                    />
                    {customFieldType2.map((customField) =>
                      renderInput(customField, formikProps)
                    )}
                  </InputContainer>
                  <InputContainer title="خلاصه مذاکرات انجام شده">
                    <View style={{ marginVertical: 7 }} />
                    <AppTextInput
                      autoCorrect={false}
                      placeholder="یادداشت متنی"
                      keyboardType="default"
                      multiline
                      numberOfLines={5}
                      height={150}
                      textAlign="right"
                      isLargeInput={true}
                      onChangeText={formikProps.handleChange("textNote")}
                      value={formikProps.values.textNote}
                      icon="text-snippet"
                      error={
                        formikProps.touched.textNote &&
                        formikProps.errors.textNote
                          ? formikProps.errors.textNote
                          : undefined
                      }
                    />
                    {customFieldType3.map((customField) =>
                      renderInput(customField, formikProps)
                    )}
                  </InputContainer>
                  {Object.entries(customFieldOtherTypes).map(
                    ([groupId, fields]) => (
                      <InputContainer
                        key={groupId}
                        title={fields[0].ProjectCustomFieldGroupName}
                      >
                        {fields.map((customField) =>
                          renderInput(customField, formikProps)
                        )}
                      </InputContainer>
                    )
                  )}
                  <IconButton
                    text={isSubmitting ? "در حال ثبت..." : "ثبت اطلاعات"}
                    iconName="done"
                    onPress={formikProps.handleSubmit}
                    backgroundColor={colors.success}
                    flex={1}
                    style={styles.submitButton}
                    textStyle={styles.submitButtonText}
                    disabled={isSubmitting}
                  />
                </>
              )}
            </ScrollView>
          </View>
          <ColleagueBottomSheet
            visible={isColleagueSheetVisible}
            onClose={() => setIsColleagueSheetVisible(false)}
            onSelectColleague={(colleague) =>
              handleSelectColleague(colleague, formikProps.setFieldValue)
            }
            title="انتخاب کارفرما"
            isCustomer={false}
          />
        </>
      )}
    </Formik>
  );

  // return (
  //   <>
  //     <ScreenHeader title="ثبت پروژه جدید" />

  //     <Toast
  //       visible={toastVisible}
  //       message={toastMessage}
  //       type={toastType}
  //       onDismiss={hideToast}
  //     />

  //     <View style={styles.container}>
  //       <ScrollView>
  //         <InputContainer title="مشخصات پروژه">
  //           <AppTextInput
  //             autoCapitalize="none"
  //             icon="business"
  //             autoCorrect={false}
  //             keyboardType="default"
  //             placeholder="عنوان پروژه"
  //             onChangeText={setProjectTitle}
  //             value={projectTitle}
  //           />

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
  //             icon="location-on"
  //             autoCorrect={false}
  //             keyboardType="default"
  //             placeholder="آدرس"
  //             onChangeText={setAddress}
  //             value={address}
  //             multiline
  //             numberOfLines={5}
  //             height={150}
  //             textAlign="right"
  //             isLargeInput={true}
  //           />
  //         </InputContainer>

  //         <InputContainer
  //           title="مشخصات کارفرما"
  //           showAddIcon={!hasCustomerInfo} // Show search icon only if there's no info
  //           showClearIcon={!!hasCustomerInfo} // Show clear icon when there's customer info
  //           onAddIconPress={handleAddIconPress}
  //           onClearIconPress={handleClearCustomerInfo}
  //         >
  //           {renderCustomerInputs()}
  //         </InputContainer>

  //         <InputContainer title="خلاصه مذاکرات انجام شده">
  //           <View style={{ marginVertical: 7 }}></View>
  //           <AppTextInput
  //             autoCorrect={false}
  //             placeholder="یادداشت متنی"
  //             keyboardType="default"
  //             multiline
  //             numberOfLines={5}
  //             height={150}
  //             textAlign="right"
  //             isLargeInput={true}
  //             onChangeText={setTextNote}
  //             value={textNote}
  //             icon="text-snippet"
  //           />
  //         </InputContainer>

  //         <IconButton
  //           text={isSubmitting ? "در حال ثبت..." : "ثبت اطلاعات"}
  //           iconName="done"
  //           onPress={handleSubmit}
  //           backgroundColor={colors.success}
  //           flex={1}
  //           style={styles.submitButton}
  //           textStyle={styles.submitButtonText}
  //           disabled={isSubmitting}
  //         />
  //       </ScrollView>
  //     </View>

  //     {/* ColleagueBottomSheet for customer selection */}
  //     <ColleagueBottomSheet
  //       visible={isColleagueSheetVisible}
  //       onClose={() => setIsColleagueSheetVisible(false)}
  //       onSelectColleague={handleSelectColleague}
  //       title="انتخاب کارفرما"
  //       isCustomer={false} // Set to false to hide the "Add Customer" button
  //     />
  //   </>
  // );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
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
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
});

export default AddNewProject;
