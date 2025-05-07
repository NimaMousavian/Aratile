import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import ScreenHeader from "../components/ScreenHeader";
import colors from "../config/colors";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import AppText from "../components/Text";
import ColleagueBottomSheet, {
  Colleague,
} from "./IssuingNewInvoice/ColleagueSearchModal";
import { AppNavigationProp } from "../StackNavigator";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { toPersianDigits } from "../utils/converters";
import Toast from "../components/Toast";
import { IVisitItem } from "./Visits";
import AppTextInput from "../components/TextInput";
import SelectionBottomSheet from "../components/SelectionDialog";
import { TimePickerField } from "../components/PersianTimePicker";
import AppButton from "../components/Button";
import {
  groupBy,
  InputContainer,
} from "./FieldMarketer/B2BFieldMarketer/AddNewShop";
import IconButton from "../components/IconButton";
import {
  IShowRoomVisitCustomField,
  IShowRoomVisitItem,
  IVisitResult,
} from "../config/types";
import axios, { AxiosError } from "axios";
import appConfig from "../../config";
import * as Yup from "yup";
import { Formik, FormikProps } from "formik";
import DynamicSelectionBottomSheet from "../components/DynamicSelectionBottomSheet";

// Form values interface
interface FormValues {
  fromTime: string;
  toTime: string;
  resultString: string;
  description: string;
  [key: string]: string; // For dynamic custom fields
}

type VisitDetailRouteParams = {
  VisitDetail: {
    visitItem: IShowRoomVisitItem;
  };
};

const VisitDetail = () => {
  const route = useRoute<RouteProp<VisitDetailRouteParams, "VisitDetail">>();
  const visitItem = route.params?.visitItem;

  const navigation = useNavigation<AppNavigationProp>();

  const [fromTime, setFromTime] = useState(
    visitItem.StartTime.slice(0, 5) || ""
  );
  const [toTime, setToTime] = useState(visitItem.FinishTime.slice(0, 5) || "");
  const [resultString, setResultString] = useState<string>(
    visitItem.ShowroomVisitResultTitle || ""
  );
  const [description, setDescription] = useState<string>("");

  const [selectedColleague, setSelectedColleague] = useState<Colleague | null>({
    id: visitItem.ShowroomVisitId.toString(),
    name: visitItem.PersonList[0].PersonFullName,
    phone: "",
  });
  const [showColleagueSheet, setShowColleagueSheet] = useState<boolean>(false);
  const [showRoomVisitResults, setShowRoomVisitResult] = useState<
    IVisitResult[]
  >([]);
  const [visitResultsLoading, setVisitResultLoading] = useState<boolean>(false);
  const [isLoadingForm, setIsLoadingForm] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Custom field states
  const [visitCustomFields, setVisitCustomFields] = useState<
    IShowRoomVisitCustomField[]
  >([]);
  const [customFieldType1, setCustomFieldType1] = useState<
    IShowRoomVisitCustomField[]
  >([]);
  const [customFieldType2, setCustomFieldType2] = useState<
    IShowRoomVisitCustomField[]
  >([]);
  const [customFieldOtherTypes, setCustomFieldOtherTypes] = useState<
    Record<string, IShowRoomVisitCustomField[]>
  >({});

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
  const validateForm = () => {
    if (fromTime === "") {
      showToast("ساعت شروع انتخاب نشده است", "error");
      return false;
    }
    if (toTime === "") {
      showToast("ساعت پایان انتخاب نشده است", "error");
      return false;
    }
    return true;
  };
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    } else {
      try {
        const objToEdit = {
          ShowroomVisitId: visitItem.ShowroomVisitId,
          ShowroomVisitResultId:
            showRoomVisitResults.find(
              (visitResult) => visitResult.Title === resultString
            )?.ShowroomVisitResultId || 0,
          Description: description,
          VisitDate: visitItem.VisitDate,
          StartTime: fromTime,
          FinishTime: toTime,
          PersonIdList: visitItem.PersonList.map((person) => person.PersonId),
        };

        console.log("objToEdit", objToEdit);

        const response = await axios.put(
          `${appConfig.mobileApi}ShowroomVisit/Edit`,
          objToEdit
        );

        if (response.status === 200) {
          showToast("بازدید با موفقیت ثبت شد", "success");
        }
      } catch (error) {
        console.log(error);

        showToast("خطا در ثبت بازدید");
      }
    }
  };

  const getVisitResults = async () => {
    setVisitResultLoading(true);
    try {
      const response = await axios.get<{ Items: IVisitResult[] }>(
        `${appConfig.mobileApi}ShowroomVisitResult/GetAllActive?page=1&pageSize=1000`
      );
      setShowRoomVisitResult(response.data.Items);
    } catch (error) {
      console.log(error);
    } finally {
      setVisitResultLoading(false);
    }
  };
  const fetchVisitCustomFields = async () => {
    setIsLoadingForm(true);
    try {
      const response = await axios.get<IShowRoomVisitCustomField[]>(
        `${appConfig.mobileApi}ShowroomVisitCustomField/GetAll`
      );
      const type1 = response.data
        .filter(
          (customField) => customField.ShowroomVisitCustomFieldGroupId === 1
        )
        .sort((a, b) => a.Form_ShowOrder - b.Form_ShowOrder);
      const type2 = response.data
        .filter(
          (customField) => customField.ShowroomVisitCustomFieldGroupId === 2
        )
        .sort((a, b) => a.Form_ShowOrder - b.Form_ShowOrder);

      const otherTypes = response.data.filter(
        (customField) =>
          customField.ShowroomVisitCustomFieldGroupId !== 1 &&
          customField.ShowroomVisitCustomFieldGroupId !== 2
      );
      const groupedFields = groupBy(
        otherTypes,
        "ShowroomVisitCustomFieldGroupId"
      );

      setCustomFieldType1(type1);
      setCustomFieldType2(type2);
      setCustomFieldOtherTypes(groupedFields);
      setVisitCustomFields(response.data);
    } catch (error) {
      console.error("Error fetching custom fields:", error);
      showToast("خطا در دریافت فیلدهای سفارشی", "error");
    } finally {
      setIsLoadingForm(false);
    }
  };

  useEffect(() => {
    getVisitResults();
    // fetchVisitCustomFields();
  }, []);

  // Generate initial form values
  const generateInitialValues = () => {
    const initialValues: FormValues = {
      fromTime: visitItem.StartTime.slice(0, 5) || "",
      toTime: visitItem.FinishTime.slice(0, 5) || "",
      resultString: visitItem.ShowroomVisitResultTitle || "",
      description: "",
    };

    [...customFieldType1, ...customFieldType2].forEach((field) => {
      initialValues[`custom_${field.ShowroomVisitCustomFieldId}`] = "";
    });

    return initialValues;
  };

  // Generate validation schema
  const generateValidationSchema = () => {
    const shape: { [key: string]: any } = {
      fromTime: Yup.string().required("ساعت شروع الزامی است"),
      toTime: Yup.string().required("ساعت پایان الزامی است"),
      resultString: Yup.string().required("نتیجه بازدید الزامی است"),
      description: Yup.string(),
    };

    [...customFieldType1, ...customFieldType2].forEach((field) => {
      if (field.IsRequired) {
        if (field.FieldType === 2) {
          shape[`custom_${field.ShowroomVisitCustomFieldId}`] = Yup.string()
            .matches(/^\d+$/, `${field.FieldName} باید عدد باشد`)
            .required(`${field.FieldName} الزامی است`);
        } else if (field.FieldType === 3) {
          shape[`custom_${field.ShowroomVisitCustomFieldId}`] =
            Yup.string().required(`${field.FieldName} الزامی است`);
        } else {
          shape[`custom_${field.ShowroomVisitCustomFieldId}`] =
            Yup.string().required(`${field.FieldName} الزامی است`);
        }
      }
    });

    return Yup.object().shape(shape);
  };

  // Render dynamic input fields
  const renderInput = (
    customField: IShowRoomVisitCustomField,
    formikProps: FormikProps<FormValues>
  ) => {
    const fieldName = `custom_${customField.ShowroomVisitCustomFieldId}`;
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
          <TimePickerField
            label={customField.FieldName}
            time={formikProps.values[fieldName] || ""}
            onTimeChange={(value) =>
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
            customFieldId={customField.ShowroomVisitCustomFieldId}
            customFieldName={customField.FieldName}
            customIconName={customField.IconName}
            url={`${appConfig.mobileApi}ShowroomVisitCustomFieldSelectiveValue/GetAll?customFieldId=${customField.ShowroomVisitCustomFieldId}&page=1&pageSize=1000`}
            formikProps={formikProps}
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
      const objToEdit = {
        ShowroomVisitId: visitItem.ShowroomVisitId,
        ShowroomVisitResultId:
          showRoomVisitResults.find(
            (visitResult) => visitResult.Title === values.resultString
          )?.ShowroomVisitResultId || 0,
        Description: values.description,
        VisitDate: visitItem.VisitDate,
        StartTime: values.fromTime,
        FinishTime: values.toTime,
        PersonIdList: visitItem.PersonList.map((person) => person.PersonId),
        ShowroomVisitCustomFieldList: visitCustomFields
          .filter((cf) => values[`custom_${cf.ShowroomVisitCustomFieldId}`])
          .map((customField) => ({
            ShowroomVisitId: visitItem.ShowroomVisitId,
            ShowroomVisitCustomFieldId: customField.ShowroomVisitCustomFieldId,
            ShowroomVisitCustomFieldSelectiveValueId: 0,
            Value:
              values[
                `custom_${customField.ShowroomVisitCustomFieldId}`
              ].toString(),
          })),
      };

      const response = await axios.put(
        `${appConfig.mobileApi}ShowroomVisit/Edit`,
        objToEdit
      );

      if (response.status === 200) {
        showToast("بازدید با موفقیت ثبت شد", "success");
        setTimeout(() => navigation.goBack(), 1500);
      } else {
        showToast("خطا در ثبت بازدید", "error");
      }
    } catch (error) {
      const er = error as AxiosError;
      console.error("Error submitting visit:", er);
      showToast(er.message || "خطا در ثبت بازدید", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Formik<FormValues>
      initialValues={generateInitialValues()}
      validationSchema={generateValidationSchema()}
      onSubmit={postFormData}
      enableReinitialize
    >
      {(formikProps) => (
        <View style={styles.container}>
          <ScreenHeader title="جزئیات بازدید" />
          <Toast
            visible={toastVisible}
            message={toastMessage}
            type={toastType}
            onDismiss={() => setToastVisible(false)}
          />
          <View style={styles.customerContainer}>
            <LinearGradient
              colors={[colors.secondary, colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.customerGradient}
            >
              <View style={styles.customerRow}>
                <View style={styles.customerField}>
                  <MaterialIcons
                    name="person"
                    size={24}
                    color="white"
                    style={styles.customerIcon}
                  />
                  <AppText style={styles.customerLabel}>بازدید کننده</AppText>
                </View>
                <View style={styles.customerButtonsContainer}>
                  {selectedColleague && (
                    <TouchableOpacity
                      style={[
                        styles.iconCircleSmall,
                        { backgroundColor: "#fef2e0" },
                      ]}
                      onPress={() =>
                        navigation.navigate("CustomerInfo", {
                          customer: selectedColleague,
                          mode: "visitor",
                        })
                      }
                    >
                      <MaterialIcons
                        name="edit"
                        size={22}
                        color={colors.warning}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </LinearGradient>
            <View style={styles.selectedCustomerContainer}>
              {selectedColleague ? (
                <AppText style={styles.selectedCustomerName}>
                  {visitItem.PersonList.map(
                    (person) => person.PersonFullName
                  ).join("، ")}
                </AppText>
              ) : (
                <AppText style={styles.noCustomerText}>
                  مشتری انتخاب نشده است.
                </AppText>
              )}
            </View>
          </View>
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
              <InputContainer title="اطلاعات بازدید">
                <View
                  style={{
                    flexDirection: "row-reverse",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <TimePickerField
                    label="ساعت شروع"
                    time={formikProps.values.fromTime}
                    onTimeChange={(value) =>
                      formikProps.setFieldValue("fromTime", value)
                    }
                    customStyles={{ infoItem: { width: "48%" } }}
                    error={
                      formikProps.touched.fromTime &&
                      formikProps.errors.fromTime
                        ? formikProps.errors.fromTime
                        : undefined
                    }
                  />
                  <TimePickerField
                    label="ساعت پایان"
                    time={formikProps.values.toTime}
                    onTimeChange={(value) =>
                      formikProps.setFieldValue("toTime", value)
                    }
                    customStyles={{ infoItem: { width: "48%" } }}
                    error={
                      formikProps.touched.toTime && formikProps.errors.toTime
                        ? formikProps.errors.toTime
                        : undefined
                    }
                  />
                </View>
                <SelectionBottomSheet
                  placeholderText={formikProps.values.resultString || "نتیجه"}
                  title="نتیجه"
                  iconName="question-mark"
                  options={showRoomVisitResults.map(
                    (visitResult) => visitResult.Title
                  )}
                  onSelect={(value) =>
                    formikProps.setFieldValue("resultString", value[0])
                  }
                  loading={visitResultsLoading}
                  initialValues={[visitItem.ShowroomVisitResultTitle]}
                  error={
                    formikProps.touched.resultString &&
                    formikProps.errors.resultString
                      ? formikProps.errors.resultString
                      : undefined
                  }
                />
                {customFieldType1.map((customField) =>
                  renderInput(customField, formikProps)
                )}
              </InputContainer>
              <InputContainer title="شرح بازدید">
                <AppTextInput
                  autoCorrect={false}
                  placeholder="توضیحات"
                  keyboardType="default"
                  icon="notes"
                  multiline
                  numberOfLines={10}
                  height={200}
                  textAlign="right"
                  isLargeInput={true}
                  onChangeText={formikProps.handleChange("description")}
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
              {Object.entries(customFieldOtherTypes).map(
                ([groupId, fields]) => (
                  <InputContainer
                    key={groupId}
                    title={fields[0].ShowroomVisitCustomFieldGroupName}
                  >
                    {fields.map((customField) =>
                      renderInput(customField, formikProps)
                    )}
                  </InputContainer>
                )
              )}
              <IconButton
                text={isSubmitting ? "در حال ثبت..." : "ثبت"}
                onPress={formikProps.handleSubmit}
                iconName="done"
                iconSize={28}
                backgroundColor={colors.success}
                style={styles.submitButton}
                disabled={isSubmitting}
              />
            </>
          )}
          <ColleagueBottomSheet
            title="انتخاب مشتری"
            visible={showColleagueSheet}
            onClose={() => setShowColleagueSheet(false)}
            onSelectColleague={(colleague) => {
              setSelectedColleague(colleague);
              setShowColleagueSheet(false);
              showToast(`مشتری ${colleague.name} انتخاب شد`, "success");
            }}
          />
        </View>
      )}
    </Formik>
  );

  // return (
  //   <View style={styles.container}>
  //     <ScreenHeader title="جزئیات بازدید" />

  //     <Toast
  //       visible={toastVisible}
  //       message={toastMessage}
  //       type={toastType}
  //       onDismiss={() => setToastVisible(false)}
  //     />
  //     <View style={styles.customerContainer}>
  //       <LinearGradient
  //         colors={[colors.secondary, colors.primary]}
  //         start={{ x: 0, y: 0 }}
  //         end={{ x: 1, y: 0 }}
  //         style={styles.customerGradient}
  //       >
  //         <View style={styles.customerRow}>
  //           <View style={styles.customerField}>
  //             <MaterialIcons
  //               name="person"
  //               size={24}
  //               color="white"
  //               style={styles.customerIcon}
  //             />
  //             <AppText style={styles.customerLabel}>بازدید کننده</AppText>
  //           </View>
  //           <View style={styles.customerButtonsContainer}>
  //             {selectedColleague && (
  //               <TouchableOpacity
  //                 style={[
  //                   styles.iconCircleSmall,
  //                   { backgroundColor: "#fef2e0" },
  //                 ]}
  //                 onPress={() =>
  //                   navigation.navigate("CustomerInfo", {
  //                     customer: selectedColleague,
  //                     mode: "visitor",
  //                   })
  //                 }
  //               >
  //                 <MaterialIcons name="edit" size={22} color={colors.warning} />
  //               </TouchableOpacity>
  //             )}
  //           </View>
  //         </View>
  //       </LinearGradient>

  //       <View style={styles.selectedCustomerContainer}>
  //         {selectedColleague ? (
  //           <AppText style={styles.selectedCustomerName}>
  //             {visitItem.PersonList.map((person) => person.PersonFullName).join(
  //               "، "
  //             )}
  //           </AppText>
  //         ) : (
  //           <AppText style={styles.noCustomerText}>
  //             مشتری انتخاب نشده است.
  //           </AppText>
  //         )}
  //       </View>
  //     </View>

  //     <InputContainer title={"اطلاعات بازدید"}>
  //       <View
  //         style={{
  //           flexDirection: "row-reverse",
  //           justifyContent: "space-between",
  //           gap: 10,
  //         }}
  //       >
  //         <TimePickerField
  //           label="ساعت شروع"
  //           time={fromTime}
  //           onTimeChange={setFromTime}
  //           customStyles={{ infoItem: { width: "48%" } }}
  //         />
  //         <TimePickerField
  //           label="ساعت پایان"
  //           time={toTime}
  //           onTimeChange={setToTime}
  //           customStyles={{ infoItem: { width: "48%" } }}
  //         />
  //       </View>
  //       <SelectionBottomSheet
  //         placeholderText={resultString === "" ? "نتیجه" : resultString}
  //         title="نتیجه"
  //         iconName="question-mark"
  //         options={showRoomVisitResults.map((visitResult) => visitResult.Title)}
  //         onSelect={(value) => setResultString(value[0])}
  //         loading={visitResultsLoading}
  //         initialValues={[visitItem.ShowroomVisitResultTitle]}
  //       />
  //     </InputContainer>
  //     <InputContainer title="شرح بازدید">
  //       <AppTextInput
  //         autoCorrect={false}
  //         placeholder="توضیحات"
  //         keyboardType="default"
  //         icon="notes"
  //         multiline
  //         numberOfLines={10}
  //         height={200}
  //         textAlign="right"
  //         isLargeInput={true}
  //         onChangeText={setDescription}
  //         value={description}
  //       />
  //       <View></View>
  //     </InputContainer>

  //     <ColleagueBottomSheet
  //       title="انتخاب مشتری"
  //       visible={showColleagueSheet}
  //       onClose={() => setShowColleagueSheet(false)}
  //       onSelectColleague={(colleague) => {
  //         setSelectedColleague(colleague);
  //         setShowColleagueSheet(false);
  //         showToast(`مشتری ${colleague.name} انتخاب شد`, "success");
  //       }}
  //     />
  //     <IconButton
  //       text="ثبت"
  //       onPress={handleSubmit}
  //       iconName="done"
  //       iconSize={28}
  //       backgroundColor={colors.success}
  //       style={styles.submitButton}
  //     />
  //   </View>
  // );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingBottom: 0,
    paddingTop: 5,
    backgroundColor: colors.background,
    display: "flex",
    flexDirection: "column",
  },
  customerContainer: {
    flexDirection: "column",
    marginBottom: 15,
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    borderWidth: 2,
    borderColor: colors.gray,
  },
  customerGradient: {
    padding: 12,
  },
  customerRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  customerField: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  customerLabel: {
    fontSize: 16,
    marginRight: 4,
    fontFamily: "Yekan_Bakh_Bold",
    color: "white",
  },
  customerIcon: {},
  customerButtonsContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  iconCircleSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "white",
  },
  selectedCustomerContainer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray,
    backgroundColor: colors.light,
  },
  selectedCustomerName: {
    fontSize: 16,
    color: colors.dark,
    fontFamily: "Yekan_Bakh_Bold",
    textAlign: "center",
  },
  noCustomerText: {
    fontSize: 14,
    color: colors.medium,
    fontFamily: "Yekan_Bakh_Bold",
    textAlign: "center",
  },
  mainContent: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray,
    padding: 10,
  },
  submitButton: {
    position: "absolute",
    bottom: 10,
    right: 0,
    left: 0,
    marginHorizontal: 15,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
});

export default VisitDetail;
