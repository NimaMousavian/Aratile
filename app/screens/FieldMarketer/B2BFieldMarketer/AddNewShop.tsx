import React, { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
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
import SelectionBottomSheet from "../../../components/SelectionDialog";
import LocationService from "../../IssuingNewInvoice/api/LocationService";
import Toast from "../../../components/Toast";
import { IShopCustomField, IShopItem } from "../../../config/types";
import axios from "axios";
import appConfig from "../../../../config";
import { Formik, FormikProps } from "formik";
import * as Yup from "yup";
import AppButton from "../../../components/Button";
import PersonManagementService from "../../IssuingNewInvoice/api/PersonManagementService";
import { useAuth } from "../../AuthContext";
import DynamicSelectionBottomSheet from "../../../components/DynamicSelectionBottomSheet";

interface IInputContainerProps {
  title: string;
  children: React.ReactNode;
  showAddIcon?: boolean;
  onAddIconPress?: () => void;
  showClearIcon?: boolean;
  onClearIconPress?: () => void;
  headerIcon?: string;
  showFilterIcon?: boolean;
  onFilterIconPress?: () => void;
  isGradient?: boolean;
  headerColor?: string;
  filterIconName?: string;
  showCameraIcon?: boolean;
  onCameraIconPress?: () => void;
}

export const InputContainer: React.FC<IInputContainerProps> = ({
  title,
  children,
  showAddIcon = false,
  onAddIconPress,
  showClearIcon = false,
  onClearIconPress,
  headerIcon,
  isGradient = true,
  showFilterIcon = false,
  onFilterIconPress,
  headerColor = colors.secondaryDark,
  filterIconName = "edit-note",
  showCameraIcon = false,
  onCameraIconPress,
}) => {
  return (
    <View style={styles.inputContainer}>
      <View style={styles.titleContainer}>
        <LinearGradient
          colors={
            isGradient
              ? [colors.secondary, colors.primary]
              : [headerColor, headerColor]
          }
          style={styles.inputHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {(showAddIcon || showClearIcon) && (
            <TouchableOpacity
              style={styles.headerIconContainer}
              onPress={showClearIcon ? onClearIconPress : onAddIconPress}
            >
              <MaterialIcons
                name={showClearIcon ? "clear" : "search"}
                size={22}
                color={colors.primary}
              />
            </TouchableOpacity>
          )}
          {showCameraIcon && (
            <TouchableOpacity
              style={{
                backgroundColor: "#e4edf8",
                width: 36,
                height: 36,
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 18,
                position: "absolute",
                left: 58,
                zIndex: 1,
              }}
              onPress={onCameraIconPress}
            >
              <MaterialIcons
                name={"camera-alt"}
                size={22}
                color={colors.primary}
              />
            </TouchableOpacity>
          )}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              flex: 1,
            }}
          >
            <AppText style={styles.title}>{title}</AppText>
            <View style={styles.rightIconsContainer}>
              {showFilterIcon && (
                <TouchableOpacity onPress={onFilterIconPress}>
                  <MaterialIcons
                    name={filterIconName} // Use the dynamic filter icon name
                    size={22}
                    color={colors.white}
                  />
                </TouchableOpacity>
              )}
              {headerIcon && (
                <MaterialIcons
                  name={headerIcon}
                  size={22}
                  color={colors.white}
                />
              )}
            </View>
          </View>
        </LinearGradient>
      </View>
      <View style={styles.gridContainer}>
        {React.Children.map(children, (child, index) =>
          child ? <React.Fragment key={index}>{child}</React.Fragment> : null
        )}
      </View>
    </View>
  );
};

type AddNewShopRouteParams = {
  recordings?: { uri: string; duration: number }[];
  shop?: IShopItem;
};

interface FormValues {
  shopName: string;
  province: string;
  city: string;
  shopAddress: string;
  shopArea: string;
  shopOwnershipType: string;
  shopHistoryInYears: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  hasWarehouse: string;
  warehouseOwnershipType: string;
  warehouseArea: string;
  notes: string;
  [key: string]: string; // For dynamic custom fields
}

export function groupBy<T, K extends keyof T>(
  array: T[],
  key: K
): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]); // Convert key to string for Record
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

const AddNewShop = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const route =
    useRoute<RouteProp<Record<string, AddNewShopRouteParams>, string>>();
  const shopFromRoute = route.params?.shop;

  const [shop, setShop] = useState<IShopItem>();
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
    Record<string, IShopCustomField[]>
  >({});

  const [isLoadingform, setIsLoadingForm] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { user } = useAuth();

  useEffect(() => {
    if (shopFromRoute) {
      getShopById(shopFromRoute.ShopId);
    }
  }, [shopFromRoute]);

  const getShopById = async (id: number) => {
    setIsLoadingForm(true);
    try {
      const response = await axios.get<IShopItem>(
        `${appConfig.mobileApi}Shop/Get?id=${id}`
      );
      console.log("shop", response.data);

      setShop(response.data);
    } catch (error) {
      console.log(error);
      showToast("خطا در دریافت فروشگاه", "error");
    } finally {
      setIsLoadingForm(false);
    }
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

    const fetchShopCustomField = async () => {
      setIsLoadingForm(true);
      try {
        const response = await axios.get<IShopCustomField[]>(
          `${appConfig.mobileApi}ShopCustomField/GetAll`
        );
        const type1 = response.data
          .filter((customField) => customField.ShopCustomFieldGroupId === 1)
          .sort((a, b) => a.Form_ShowOrder - b.Form_ShowOrder);
        const type2 = response.data
          .filter((customField) => customField.ShopCustomFieldGroupId === 2)
          .sort((a, b) => a.Form_ShowOrder - b.Form_ShowOrder);
        const type3 = response.data
          .filter((customField) => customField.ShopCustomFieldGroupId === 3)
          .sort((a, b) => a.Form_ShowOrder - b.Form_ShowOrder);

        const otherTypes = response.data.filter(
          (customField) =>
            customField.ShopCustomFieldGroupId !== 1 &&
            customField.ShopCustomFieldGroupId !== 2 &&
            customField.ShopCustomFieldGroupId !== 3
        );
        const groupedFields = groupBy(otherTypes, "ShopCustomFieldGroupId");
        setCustomFieldType1(type1);
        setCustomFieldType2(type2);
        setCustomFieldType3(type3);
        setCustomFieldOtherTypes(groupedFields);
        setShopCustomeField(response.data);
        console.log(groupedFields);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoadingForm(false);
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

  // Initialize dynamic initial values and validation schema
  const generateInitialValues = (shop: IShopItem | undefined) => {
    const initialValues: FormValues = {
      shopName: shop?.ShopName || "",
      province: shop?.ProvinceName || "",
      city: shop?.CityName || "",
      shopAddress: shop?.ShopAddress || "",
      shopArea: shop?.ShopAreaInMeters.toString() || "",
      shopOwnershipType: shop?.ShopOwnershipTypeStr || "",
      shopHistoryInYears: shop?.ShopHistoryInYears.toString() || "",
      firstName: shop?.OwnerFirstName || "",
      lastName: shop?.OwnerLastName || "",
      mobileNumber: shop?.OwnerMobile || "",
      hasWarehouse: shop?.HasWarehouseStr || "",
      warehouseOwnershipType: shop?.WarehouseOwnershipTypeStr || "",
      warehouseArea: shop?.WarehouseAreaInMeters.toString() || "",
      notes: shop?.Description || "",
    };

    // Add dynamic fields for customFieldType1, customFieldType2, customFieldType3
    [...customFieldType1, ...customFieldType2, ...customFieldType3].forEach(
      (field) => {
        initialValues[`custom_${field.ShopCustomFieldId}`] = "";
      }
    );

    shop?.ShopCustomFieldList.forEach((customField) => {
      initialValues[`custom_${customField.ShopCustomFieldId}`] =
        customField.Value;
    });

    return initialValues;
  };

  const generateValidationSchema = () => {
    const shape: { [key: string]: any } = {
      shopName: Yup.string().required("نام فروشگاه الزامی است"),
      province: Yup.string().required("استان الزامی است"),
      city: Yup.string().required("شهر الزامی است"),
      shopAddress: Yup.string().required("آدرس فروشگاه الزامی است"),
      shopArea: Yup.string()
        .matches(/^\d+$/, "متراژ باید عدد باشد")
        .required("متراژ فروشگاه الزامی است"),
      shopOwnershipType: Yup.string().required("نوع مالکیت فروشگاه الزامی است"),
      shopHistoryInYears: Yup.string().required("سابقه ی فروشگاه الزامی است"),
      firstName: Yup.string().required("نام الزامی است"),
      lastName: Yup.string().required("نام خانوادگی الزامی است"),
      mobileNumber: Yup.string()
        .matches(/^\d{10,11}$/, "شماره موبایل معتبر نیست")
        .required("شماره موبایل الزامی است"),
      hasWarehouse: Yup.string().required("وجود انبار مشخص نشده است"),
      warehouseOwnershipType: Yup.string().when(
        "hasWarehouse",
        (values, schema) => {
          return values[0] === "بله"
            ? schema.required("نوع مالکیت انبار الزامی است")
            : schema;
        }
      ),
      warehouseArea: Yup.string().when("hasWarehouse", (values, schema) => {
        return values[0] === "بله"
          ? schema
              .matches(/^\d+$/, "متراژ باید عدد باشد")
              .required("متراژ انبار الزامی است")
          : schema;
      }),
      notes: Yup.string(),
    };

    // Add validation for dynamic fields
    [...customFieldType1, ...customFieldType2, ...customFieldType3].forEach(
      (field) => {
        if (field.IsRequired) {
          if (field.FieldType === 2) {
            // Numeric field
            shape[`custom_${field.ShopCustomFieldId}`] = Yup.string()
              .matches(/^\d+$/, `${field.FieldName} باید عدد باشد`)
              .required(`${field.FieldName} الزامی است`);
          } else if (field.FieldType === 3) {
            // Date field
            shape[`custom_${field.ShopCustomFieldId}`] = Yup.string().required(
              `${field.FieldName} الزامی است`
            );
          } else {
            // Text field
            shape[`custom_${field.ShopCustomFieldId}`] = Yup.string().required(
              `${field.FieldName} الزامی است`
            );
          }
        }
      }
    );

    return Yup.object().shape(shape);
  };

  const getMultiSelectOptions = async (
    customFieldId: number
  ): Promise<{ item: string; value: string }[]> => {
    try {
      const response = await axios.get(
        `${appConfig.mobileApi}ShopCustomFieldSelectiveValue/GetAll?customFieldId=${customFieldId}&page=1&pageSize=100`
      );
      return response.data;
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  const renderInput = (
    customField: IShopCustomField,
    formikProps: FormikProps<FormValues>
  ) => {
    const fieldName = `custom_${customField.ShopCustomFieldId}`;
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
            customFieldId={customField.ShopCustomFieldId}
            customFieldName={customField.FieldName}
            customIconName={customField.IconName}
            url={`${appConfig.mobileApi}ShopCustomFieldSelectiveValue/GetAll?customFieldId=${customField.ShopCustomFieldId}&page=1&pageSize=1000`}
            formikProps={formikProps}
          />
        );
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
      case 6:
        return (
          <IconButton
            text="موقعیت جغرافیایی"
            iconName="location-pin"
            onPress={() => {}}
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

  const postFormData = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const provinceId = await LocationService.getProvinceIdByName(
        values.province
      );
      const cityId = await PersonManagementService.getCityIdByName(
        values.city,
        values.province
      );

      const dataToPost = {
        ShopId: 0,
        ShopName: values.shopName,
        CityId: cityId,
        CityName: values.city,
        ProvinceId: provinceId,
        ProvinceName: values.province,
        ShopAddress: values.shopAddress,
        ShopAreaInMeters: values.shopArea,
        ShopHistoryInYears: Number(values.shopHistoryInYears),
        ShopOwnershipType: values.shopOwnershipType === "تملیکی" ? 1 : 2,
        ShopOwnershipTypeStr: values.shopOwnershipType,
        OwnerFirstName: values.firstName,
        OwnerLastName: values.lastName,
        OwnerMobile: values.mobileNumber,
        HasWarehouse: values.hasWarehouse === "بله" ? true : false,
        HasWarehouseStr: values.hasWarehouse,
        WarehouseOwnershipType: 0,
        WarehouseOwnershipTypeStr: values.warehouseOwnershipType,
        WarehouseAreaInMeters: Number(values.warehouseArea),
        WarehouseAddress: "string",
        Description: values.notes,
        ApplicationUserId: user?.UserId,
        ApplicationUserName: user?.UserName,
        InsertDate: new Date().toISOString(),
        ShamsiInsertDate: null,
        LastUpdateDate: null,
        ShopCustomFieldList: shopCustomeField
          .filter((cf) => values[`custom_${cf.ShopCustomFieldId}`])
          .map((customField) => {
            if (values[`custom_${customField.ShopCustomFieldId}`]) {
              // if (customField.FieldType === 4) {
              //   return {
              //     ShopId: 0,
              //     ShopCustomFieldId: customField.ShopCustomFieldId,
              //     ShopCustomFieldSelectiveValueId:
              //       values[
              //         `custom_${customField.ShopCustomFieldId}`
              //       ].toString(),
              //     Value: 0,
              //   };
              // }
              return {
                ShopId: 0,
                ShopCustomFieldId: customField.ShopCustomFieldId,
                ShopCustomFieldSelectiveValueId: 0,
                Value:
                  values[`custom_${customField.ShopCustomFieldId}`].toString(),
              };
            }
          }),
      };

      console.log("dataToPost", dataToPost);

      const response = await axios.post(
        `${appConfig.mobileApi}Shop/Add`,
        dataToPost
      );
      if (response.status === 200) {
        showToast("فروشگاه با موفقیت ثبت شد", "success");
      }
    } catch (error) {
      showToast("خطا در ثبت فروشگاه", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const editFormData = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const provinceId = await LocationService.getProvinceIdByName(
        values.province
      );
      const cityId = await PersonManagementService.getCityIdByName(
        values.city,
        values.province
      );

      const dataToEdit = {
        ShopId: shop?.ShopId || 0,
        ShopName: values.shopName,
        CityId: cityId,
        CityName: values.city,
        ProvinceId: provinceId,
        ProvinceName: values.province,
        ShopAddress: values.shopAddress,
        ShopAreaInMeters: values.shopArea,
        ShopHistoryInYears: Number(values.shopHistoryInYears),
        ShopOwnershipType: values.shopOwnershipType === "تملیکی" ? 1 : 2,
        ShopOwnershipTypeStr: values.shopOwnershipType,
        OwnerFirstName: values.firstName,
        OwnerLastName: values.lastName,
        OwnerMobile: values.mobileNumber,
        HasWarehouse: values.hasWarehouse === "بله" ? true : false,
        HasWarehouseStr: values.hasWarehouse,
        WarehouseOwnershipType: 0,
        WarehouseOwnershipTypeStr: values.warehouseOwnershipType,
        WarehouseAreaInMeters: Number(values.warehouseArea),
        WarehouseAddress: "string",
        Description: values.notes,
        ApplicationUserId: user?.UserId,
        ApplicationUserName: user?.UserName,
        InsertDate: new Date().toISOString(),
        ShamsiInsertDate: null,
        LastUpdateDate: null,
        ShopCustomFieldList: shopCustomeField
          .filter((cf) => values[`custom_${cf.ShopCustomFieldId}`])
          .map((customField) => {
            if (values[`custom_${customField.ShopCustomFieldId}`]) {
              // if (customField.FieldType === 4) {
              //   return {
              //     ShopId: 0,
              //     ShopCustomFieldId: customField.ShopCustomFieldId,
              //     ShopCustomFieldSelectiveValueId:
              //       values[
              //         `custom_${customField.ShopCustomFieldId}`
              //       ].toString(),
              //     Value: 0,
              //   };
              // }
              return {
                ShopId: shop?.ShopId || 0,
                ShopCustomFieldId: customField.ShopCustomFieldId,
                ShopCustomFieldSelectiveValueId: 0,
                Value:
                  values[`custom_${customField.ShopCustomFieldId}`].toString(),
              };
            }
          }),
      };

      console.log("dataToEdit", dataToEdit);

      const response = await axios.put(
        `${appConfig.mobileApi}Shop/Edit`,
        dataToEdit
      );
      if (response.status === 200) {
        showToast("فروشگاه با موفقیت ویرایش شد", "success");
        setTimeout(() => {
          navigation.goBack();
        }, 1000);
      }
    } catch (error) {
      showToast("خطا در ویرایش فروشگاه", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Formik<FormValues>
      initialValues={generateInitialValues(shop)}
      validationSchema={generateValidationSchema()}
      onSubmit={(values) => {
        console.log("Form Values:", values);
        // Alert.alert("موفق", "اطلاعات با موفقیت ثبت شد");
        // Implement API call or other submission logic here
        if (shop) {
          editFormData(values);
        } else {
          postFormData(values);
        }
      }}
      enableReinitialize
    >
      {(formikProps) => (
        <>
          <ScreenHeader title={shop ? "ویرایش فروشگاه" : "ثبت فروشگاه جدید"} />
          <Toast
            visible={toastVisible}
            message={toastMessage}
            type={toastType}
            onDismiss={() => setToastVisible(false)}
          />
          <View style={styles.container}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
              {isLoadingform ? (
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
                  <InputContainer title="مشخصات فروشگاه">
                    <AppTextInput
                      autoCapitalize="none"
                      icon="shopping-bag"
                      autoCorrect={false}
                      keyboardType="default"
                      placeholder="نام فروشگاه"
                      onChangeText={formikProps.handleChange("shopName")}
                      value={formikProps.values.shopName}
                      error={
                        formikProps.touched.shopName &&
                        formikProps.errors.shopName
                          ? formikProps.errors.shopName
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
                          initialValues={[formikProps.values["city"]]}
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
                          initialValues={[formikProps.values["province"]]}
                        />
                      </View>
                    </View>
                    <AppTextInput
                      autoCapitalize="none"
                      icon="shop"
                      autoCorrect={false}
                      keyboardType="default"
                      placeholder="آدرس فروشگاه"
                      onChangeText={formikProps.handleChange("shopAddress")}
                      value={formikProps.values.shopAddress}
                      error={
                        formikProps.touched.shopAddress &&
                        formikProps.errors.shopAddress
                          ? formikProps.errors.shopAddress
                          : undefined
                      }
                    />
                    <AppTextInput
                      autoCapitalize="none"
                      icon="shop"
                      autoCorrect={false}
                      keyboardType="number-pad"
                      placeholder="متراژ فروشگاه"
                      onChangeText={formikProps.handleChange("shopArea")}
                      value={formikProps.values.shopArea}
                      error={
                        formikProps.touched.shopArea &&
                        formikProps.errors.shopArea
                          ? formikProps.errors.shopArea
                          : undefined
                      }
                    />
                    <SelectionBottomSheet
                      placeholderText={
                        formikProps.values.shopOwnershipType ||
                        "نوع مالکیت فروشگاه"
                      }
                      title="نوع مالکیت فروشگاه"
                      iconName="shop"
                      options={["تملیکی", "استیجاری"]}
                      onSelect={(value) =>
                        formikProps.setFieldValue("shopOwnershipType", value[0])
                      }
                      error={
                        formikProps.touched.shopOwnershipType &&
                        formikProps.errors.shopOwnershipType
                          ? formikProps.errors.shopOwnershipType
                          : undefined
                      }
                    />
                    <AppTextInput
                      autoCapitalize="none"
                      icon="shop"
                      autoCorrect={false}
                      keyboardType="number-pad"
                      placeholder="سابقه ی فروشگاه"
                      onChangeText={formikProps.handleChange(
                        "shopHistoryInYears"
                      )}
                      value={formikProps.values.shop}
                      error={
                        formikProps.touched.shopHistoryInYears &&
                        formikProps.errors.shopHistoryInYears
                          ? formikProps.errors.shopHistoryInYears
                          : undefined
                      }
                    />
                    {customFieldType1.map((customField) =>
                      renderInput(customField, formikProps)
                    )}
                  </InputContainer>
                  <InputContainer title="مشخصات فردی">
                    <AppTextInput
                      autoCapitalize="none"
                      icon="person"
                      autoCorrect={false}
                      keyboardType="default"
                      placeholder="نام"
                      onChangeText={formikProps.handleChange("firstName")}
                      value={formikProps.values.firstName}
                      error={
                        formikProps.touched.firstName &&
                        formikProps.errors.firstName
                          ? formikProps.errors.firstName
                          : undefined
                      }
                    />
                    <AppTextInput
                      autoCapitalize="none"
                      icon="person"
                      autoCorrect={false}
                      keyboardType="default"
                      placeholder="نام خانوادگی"
                      onChangeText={formikProps.handleChange("lastName")}
                      value={formikProps.values.lastName}
                      error={
                        formikProps.touched.lastName &&
                        formikProps.errors.lastName
                          ? formikProps.errors.lastName
                          : undefined
                      }
                    />
                    <AppTextInput
                      autoCapitalize="none"
                      icon="phone-android"
                      autoCorrect={false}
                      keyboardType="number-pad"
                      placeholder="شماره موبایل"
                      onChangeText={formikProps.handleChange("mobileNumber")}
                      value={formikProps.values.mobileNumber}
                      error={
                        formikProps.touched.mobileNumber &&
                        formikProps.errors.mobileNumber
                          ? formikProps.errors.mobileNumber
                          : undefined
                      }
                    />
                    {customFieldType3.map((customField) =>
                      renderInput(customField, formikProps)
                    )}
                  </InputContainer>
                  <InputContainer title="مشخصات انبار">
                    <SelectionDialog
                      placeholderText="انبار دارد یا ندارد"
                      title="انبار دارد یا ندارد"
                      iconName="shop"
                      options={["بله", "خیر"]}
                      onSelect={(value) =>
                        formikProps.setFieldValue("hasWarehouse", value[0])
                      }
                      error={
                        formikProps.touched.hasWarehouse &&
                        formikProps.errors.hasWarehouse
                          ? formikProps.errors.hasWarehouse
                          : undefined
                      }
                    />

                    <AppTextInput
                      autoCapitalize="none"
                      icon="shop"
                      autoCorrect={false}
                      keyboardType="default"
                      placeholder="نوع مالکیت انبار"
                      onChangeText={formikProps.handleChange(
                        "warehouseOwnershipType"
                      )}
                      value={formikProps.values.warehouseOwnershipType}
                      error={
                        formikProps.touched.warehouseOwnershipType &&
                        formikProps.errors.warehouseOwnershipType
                          ? formikProps.errors.warehouseOwnershipType
                          : undefined
                      }
                    />
                    <AppTextInput
                      autoCapitalize="none"
                      icon="shop"
                      autoCorrect={false}
                      keyboardType="number-pad"
                      placeholder="متراژ انبار"
                      onChangeText={formikProps.handleChange("warehouseArea")}
                      value={formikProps.values.warehouseArea}
                      error={
                        formikProps.touched.warehouseArea &&
                        formikProps.errors.warehouseArea
                          ? formikProps.errors.warehouseArea
                          : undefined
                      }
                    />
                    {customFieldType2.map((customField) =>
                      renderInput(customField, formikProps)
                    )}
                  </InputContainer>
                  <InputContainer title="سایر توضیحات">
                    <View style={styles.recordingsWrapper}>
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
                    <View style={{ marginVertical: 7 }} />
                    <AppTextInput
                      autoCorrect={false}
                      placeholder="یادداشت متنی"
                      keyboardType="default"
                      icon="notes"
                      multiline
                      numberOfLines={10}
                      height={200}
                      textAlign="right"
                      isLargeInput={true}
                      onChangeText={formikProps.handleChange("notes")}
                      value={formikProps.values.notes}
                      error={
                        formikProps.touched.notes && formikProps.errors.notes
                          ? formikProps.errors.notes
                          : undefined
                      }
                    />
                  </InputContainer>
                  {Object.entries(customFieldOtherTypes).map(
                    ([groupId, fields]) => (
                      <InputContainer
                        key={groupId}
                        title={fields[0].ShopCustomFieldGroupName}
                      >
                        {fields.map((customField) =>
                          renderInput(customField, formikProps)
                        )}
                      </InputContainer>
                    )
                  )}
                </>
              )}
              <IconButton
                text={isSubmitting ? "در حال ثبت..." : "ثبت اطلاعات"}
                iconName="done"
                onPress={formikProps.handleSubmit}
                backgroundColor={colors.success}
                flex={1}
                style={styles.submitButton}
              />
            </ScrollView>
          </View>
        </>
      )}
    </Formik>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.background },
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
    paddingBottom: 0,
  },
  titleContainer: {
    justifyContent: "center",
  },
  title: {
    fontFamily: "Yekan_Bakh_Bold",
    fontSize: 20,
    color: colors.white,
    marginRight: 2,
  },
  titleWithIconsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
  },
  inputHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    justifyContent: "center",
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    position: "relative",
  },
  rightIconsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  filterIconContainer: {
    marginRight: 8,
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
  headerIconContainer: {
    backgroundColor: "#e4edf8",
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 18,
    position: "absolute", // Position absolutely
    left: 12, // Place on the left side with some padding
    zIndex: 1, // Ensure it's above other elements
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    textAlign: "right",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
});
export default AddNewShop;
