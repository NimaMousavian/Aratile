import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  StyleSheet,
  TouchableOpacity,
  View,
  Modal,
} from "react-native";
import { IForm, IFormField, IFormItem, IFormStep } from "../../config/types";
import { Formik, FormikProps } from "formik";
import * as Yup from "yup";
import AppText from "../../components/Text";
import { ScrollView } from "react-native-gesture-handler";
import AppTextInput from "../../components/TextInput";
import AppButton from "../../components/Button";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import colors from "../../config/colors";
import ScreenHeader from "../../components/ScreenHeader";
import axios from "axios";
import appConfig from "../../../config";
import { InputContainer } from "../FieldMarketer/B2BFieldMarketer/AddNewShop";
import IconButton from "../../components/IconButton";
import DynamicSelectionBottomSheet from "../../components/DynamicSelectionBottomSheet";
import { DatePickerField } from "../../components/PersianDatePicker";
import { AppNavigationProp } from "../../StackNavigator";
import Toast from "../../components/Toast";
import ProductSearchDrawer from "../IssuingNewInvoice/ProductSearchDrawer";
import useProductScanner from "../../Hooks/useProductScanner";
import ColleagueBottomSheet from "../IssuingNewInvoice/ColleagueSearchModal";
import { toPersianDigits } from "../../utils/converters";
import { Product } from "../IssuingNewInvoice/IssuingNewInvoice";

// Interfaces for TypeScript
interface Field {
  name: string;
  label: string;
  type: string;
  validation: {
    required?: boolean;
    min?: number;
    max?: number;
    email?: boolean;
  };
}

interface Step {
  title: string;
  fields: Field[];
  icon: React.ComponentProps<typeof MaterialIcons>["name"];
}

interface FormValues {
  [key: string]: string;
}

// Simulated API call to fetch steps and form fields
const fetchStepsFromAPI = async (): Promise<Step[]> => {
  return [
    {
      title: "سبد خرید",
      icon: "shopping-cart",
      fields: [
        {
          name: "itemCount",
          label: "تعداد اقلام",
          type: "text",
          validation: { required: true },
        },
      ],
    },
    {
      title: "آدرس",
      icon: "person",
      fields: [
        {
          name: "street",
          label: "خیابان",
          type: "text",
          validation: { required: true },
        },
        {
          name: "city",
          label: "شهر",
          type: "text",
          validation: { required: true },
        },
      ],
    },
    {
      title: "تحویل",
      icon: "local-shipping",
      fields: [
        {
          name: "deliveryMethod",
          label: "روش تحویل",
          type: "text",
          validation: { required: true },
        },
      ],
    },
    {
      title: "سفارش",
      icon: "check-circle",
      fields: [
        {
          name: "confirmation",
          label: "تأیید سفارش",
          type: "text",
          validation: { required: true },
        },
      ],
    },
  ];
};

// Fix 1: Update the createValidationSchema function
const createValidationSchema = (fields: IFormField[]) => {
  const shape: { [key: string]: Yup.StringSchema } = {};
  fields.forEach((field) => {
    let schema = Yup.string();

    // Fix: Make sure required validation is applied first
    if (field.IsRequired) {
      schema = schema.required(`${field.FieldName} الزامی است`);
    }

    if (field.MinValue) {
      schema = schema.min(
        Number(field.MinValue),
        `${field.FieldName} باید حداقل ${field.MinValue} کاراکتر باشد`
      );
    }
    if (field.MaxValue) {
      schema = schema.max(
        Number(field.MaxValue),
        `${field.FieldName} باید حداکثر ${field.MaxValue} کاراکتر باشد`
      );
    }
    if (field.FieldType === 5) {
      schema = schema.email(`ایمیل نامعتبر است`);
    }

    // Use consistent field name format
    shape[`custom-${field.FormFieldId}`] = schema;
  });
  return Yup.object().shape(shape);
};

// Stepper Header Component
interface StepperHeaderProps {
  steps: IFormStep[];
  currentStep: number;
  onPrevious: (() => void) | null;
  onNext: () => void;
  isLastStep: boolean;
}

const StepperHeader: React.FC<StepperHeaderProps> = ({
  steps,
  currentStep,
  onPrevious,
  onNext,
  isLastStep,
}) => {
  const currentStepData = steps[currentStep];
  const prevStepIcon = currentStep > 0 ? steps[currentStep - 1].IconName : null;
  const nextStepIcon = !isLastStep
    ? steps[currentStep + 1].IconName || "person"
    : null;
  //   const prevStepIcon = "person";
  //   const nextStepIcon = "person";

  return (
    <View style={styles.stepperHeader}>
      {prevStepIcon ? (
        <View style={styles.stepWrapper}>
          <MaterialIcons
            name={prevStepIcon}
            size={30}
            color={onPrevious ? "#999" : "#E0E0E0"}
            // onPress={onPrevious || undefined}
            style={styles.navIcon}
          />
        </View>
      ) : (
        <View style={{ width: 50 }}></View>
      )}
      {!isLastStep && (
        <View
          style={[
            {
              position: "absolute",
              height: 2,
              width: "20%", // Adjust to fit between icons
              top: "45%",
              left: "15%",
              transform: [{ translateY: -1 }],
              zIndex: 99,
            },
            currentStep > 0
              ? styles.completedConnector
              : styles.inactiveConnector,
          ]}
        />
      )}
      <View style={styles.currentStepContainer}>
        <View style={styles.stepIcon}>
          <MaterialIcons
            name={currentStepData.IconName || "person"}
            size={40}
            color="#fff"
          />
        </View>
        <AppText style={styles.stepLabel}>{currentStepData.Title}</AppText>
      </View>
      {currentStep > 0 && (
        <View
          style={[
            styles.connector,
            !isLastStep ? styles.completedConnector : styles.inactiveConnector,
          ]}
        />
      )}
      {nextStepIcon ? (
        <View style={styles.stepWrapper}>
          <MaterialIcons
            name={nextStepIcon || "person"}
            size={30}
            color={isLastStep ? "#E0E0E0" : "#999"}
            // onPress={isLastStep ? undefined : onNext}
            style={styles.navIcon}
          />
        </View>
      ) : (
        <View style={{ width: 50 }}></View>
      )}
    </View>
  );
};

const ProductInputField: React.FC<{
  customField: IFormField;
  formikProps: FormikProps<FormValues>;
}> = ({ customField, formikProps }) => {
  const navigation = useNavigation<AppNavigationProp>();
  const fieldName = `custom-${customField.FormFieldId}`;
  const [showProductSearchDrawer, setShowProductSearchDrawer] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const { searchProduct } = useProductScanner();

  return (
    <>
      <View
        style={[
          styles.customerContainer,
          { marginBottom: formikProps.errors[fieldName] ? 0 : 15 },
        ]}
      >
        <View style={styles.customerGradient}>
          <View style={styles.customerRow}>
            <View style={styles.customerField}>
              <AppText style={styles.customerLabel}>
                {customField.FieldName}
              </AppText>
            </View>
            <View style={styles.customerButtonsContainer}>
              {/* {selectedColleague && (
                <TouchableOpacity
                  style={[
                    styles.iconCircleSmall,
                    { backgroundColor: "#fef2e0" },
                  ]}
                  onPress={() =>
                    navigation.navigate("CustomerInfo", {
                      customer: selectedColleague,
                    })
                  }
                >
                  <MaterialIcons name="edit" size={22} color={colors.warning} />
                </TouchableOpacity>
              )} */}
              {/* <TouchableOpacity
                style={[styles.iconCircleSmall, { backgroundColor: "#e5f9ec" }]}
                onPress={() => navigation.navigate("CustomerInfo")}
              >
                <MaterialIcons name="add" size={22} color={colors.success} />
              </TouchableOpacity> */}
              <TouchableOpacity
                style={[styles.iconCircleSmall]}
                onPress={() => {
                  navigation.navigate("BarCodeScanner", {
                    onReturn: (scannedProduct: Product) => {
                      if (scannedProduct) {
                        setSelectedProduct(scannedProduct.title);
                        formikProps.setFieldValue(fieldName, scannedProduct.id);
                      }
                    },
                  });
                }}
              >
                <MaterialIcons
                  name="camera-alt"
                  size={22}
                  color={colors.white}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconCircleSmall]}
                onPress={() => setShowProductSearchDrawer(true)}
              >
                <MaterialIcons name="search" size={22} color={colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.selectedCustomerContainer}>
          {selectedProduct ? (
            <AppText style={styles.selectedCustomerName}>
              {toPersianDigits(selectedProduct)}
            </AppText>
          ) : (
            <AppText style={styles.noCustomerText}>
              {`${customField.FieldName} انتخاب نشده است`}
            </AppText>
          )}
        </View>
      </View>
      {formikProps.errors[fieldName] && (
        <AppText style={styles.errorText}>
          {formikProps.errors[fieldName]}
        </AppText>
      )}
      <ProductSearchDrawer
        visible={showProductSearchDrawer}
        onClose={() => setShowProductSearchDrawer(false)}
        onProductSelect={(value) => {
          formikProps.setFieldValue(fieldName, value.id);
          setSelectedProduct(value.title);
        }}
        searchProduct={searchProduct}
      />
    </>
  );
};

// Modified PersonInputField component with correct modal positioning
const PersonInputField: React.FC<{
  customField: IFormField;
  formikProps: FormikProps<FormValues>;
}> = ({ customField, formikProps }) => {
  const fieldName = `custom-${customField.FormFieldId}`;
  const [showColleagueSheet, setShowColleagueSheet] = useState<boolean>(false);
  const [selectedColleague, setSelectedColleague] = useState("");
  const { searchProduct } = useProductScanner();

  return (
    <>
      <View
        style={[
          styles.customerContainer,
          { marginBottom: formikProps.errors[fieldName] ? 0 : 15 },
        ]}
      >
        <View style={styles.customerGradient}>
          <View style={styles.customerRow}>
            <View style={styles.customerField}>
              <AppText style={styles.customerLabel}>
                {customField.FieldName}
              </AppText>
            </View>
            <View style={styles.customerButtonsContainer}>
              <TouchableOpacity
                style={[styles.iconCircleSmall]}
                onPress={() => setShowColleagueSheet(true)}
              >
                <MaterialIcons name="search" size={22} color={colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.selectedCustomerContainer}>
          {selectedColleague ? (
            <AppText style={styles.selectedCustomerName}>
              {toPersianDigits(selectedColleague)}
            </AppText>
          ) : (
            <AppText style={styles.noCustomerText}>
              {`${customField.FieldName} انتخاب نشده است`}
            </AppText>
          )}
        </View>
      </View>
      {formikProps.errors[fieldName] && (
        <AppText style={styles.errorText}>
          {formikProps.errors[fieldName]}
        </AppText>
      )}

      <Modal
        transparent={true}
        visible={showColleagueSheet}
        animationType="slide"
        onRequestClose={() => setShowColleagueSheet(false)}
      >
        <ColleagueBottomSheet
          title="انتخاب مشتری"
          visible={showColleagueSheet}
          onClose={() => setShowColleagueSheet(false)}
          onSelectColleague={(colleague) => {
            formikProps.setFieldValue(fieldName, colleague.id);
            setSelectedColleague(colleague.name);
            setShowColleagueSheet(false);
          }}
        />
      </Modal>
    </>
  );
};

const renderInput = (
  customField: IFormField,
  formikProps: FormikProps<FormValues>
) => {
  const fieldName = `custom-${customField.FormFieldId}`;

  switch (customField.FieldType) {
    case 1:
      return (
        <AppTextInput
          key={customField.FormFieldId}
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
          key={customField.FormFieldId}
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
    case 3:
      return (
        <AppTextInput
          key={customField.FormFieldId}
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
    case 4:
      return (
        <AppTextInput
          key={customField.FormFieldId}
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
    case 5:
      return (
        <AppTextInput
          key={customField.FormFieldId}
          autoCapitalize="none"
          icon={
            customField.IconName as React.ComponentProps<
              typeof MaterialIcons
            >["name"]
          }
          autoCorrect={false}
          keyboardType="email-address"
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
        <AppTextInput
          key={customField.FormFieldId}
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
    case 7:
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
    case 8:
      return <View></View>;
    case 9:
      return (
        <DynamicSelectionBottomSheet<FormValues>
          customFieldId={customField.FormFieldId}
          customFieldName={customField.FieldName}
          customIconName={customField.IconName}
          url={`${appConfig.mobileApi}Form/GetSelectiveValues?formFieldId=${customField.FormFieldId}&page=1&pageSize=1000`}
          formikProps={formikProps}
          fieldName_={`custom-${customField.FormFieldId}`}
        />
      );

    case 11:
      return (
        <PersonInputField customField={customField} formikProps={formikProps} />
      );
    case 12:
      return (
        <ProductInputField
          customField={customField}
          formikProps={formikProps}
        />
      );
    default:
      return (
        <AppTextInput
          key={customField.FormFieldId}
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

// Step Screen Component
interface StepScreenProps {
  step: IFormStep;
  onNext: (values: { [key: string]: string }) => void;
  onPrevious: (() => void) | null;
  isLastStep: boolean;
  slideAnim: Animated.Value;
  isSubmitting?: boolean;
  isSingleStep?: boolean;
}

// Fix the StepScreen component to ensure validation works properly on all steps
const StepScreen: React.FC<StepScreenProps> = ({
  step,
  onNext,
  onPrevious,
  isLastStep,
  slideAnim,
  isSubmitting = false,
  isSingleStep = false,
}) => {
  const { searchProduct } = useProductScanner();
  const [showProductSearchDrawer, setShowProductSearchDrawer] =
    useState<boolean>(false);

  let fields: IFormField[] = [];
  step.StepSectionList.forEach((section) =>
    section.FormFieldList.forEach((formField) => fields.push(formField))
  );

  // Initialize values with the correct field key format
  const initialValues = fields.reduce((acc, field) => {
    acc[`custom-${field.FormFieldId}`] = "";
    return acc;
  }, {} as { [key: string]: string });

  const validationSchema = createValidationSchema(fields);

  const log = (msg: any) => {
    console.log(msg);
    return <View></View>;
  };

  return (
    <View style={[styles.stepContainer]}>
      <ScrollView>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          validateOnMount={true} // Enable validation on mount
          validateOnChange={true} // Ensure validation runs on every change
          validateOnBlur={true} // Ensure validation runs on blur
          onSubmit={(values) => onNext(values)}
        >
          {(FormikProps) => (
            <View>
              {log(FormikProps.errors)}

              {step.StepSectionList.map((section) => (
                <InputContainer key={section.Title} title={section.Title}>
                  {section.FormFieldList.map((formField) =>
                    renderInput(formField, FormikProps)
                  )}
                </InputContainer>
              ))}
              <View style={styles.buttonContainer}>
                {onPrevious ? (
                  <AppButton
                    title="قبلی"
                    onPress={onPrevious}
                    style={{ width: "48%" }}
                  />
                ) : (
                  <View></View>
                )}
                <AppButton
                  title={
                    isLastStep
                      ? isSubmitting
                        ? "در حال ارسال"
                        : "ارسال"
                      : "بعدی"
                  }
                  onPress={() => {
                    // Force validation before submission
                    FormikProps.validateForm().then((errors) => {
                      // If there are errors, touch all fields to show error messages
                      if (Object.keys(errors).length > 0) {
                        const touchedFields = fields.reduce((acc, field) => {
                          acc[`custom-${field.FormFieldId}`] = true;
                          return acc;
                        }, {} as { [key: string]: boolean });

                        FormikProps.setTouched(touchedFields);
                      } else {
                        FormikProps.handleSubmit();
                      }
                    });
                  }}
                  style={{ width: isSingleStep ? "100%" : "48%" }}
                  color="success"
                />
              </View>
            </View>
          )}
        </Formik>
      </ScrollView>
    </View>
  );
};

// Main Stepper Component
const FormItem: React.FC = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const route =
    useRoute<
      RouteProp<{ formItemProps: { formItem: IForm } }, "formItemProps">
    >();
  const formItem = route.params.formItem;
  const [steps, setSteps] = useState<IFormStep[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [formData, setFormData] = useState<{
    [key: number]: { [key: string]: string };
  }>({});
  const [isSuccessfulSubmit, setIsSuccessfulSubmit] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const directionRef = useRef<"next" | "prev" | null>(null);

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

  const getFormItem = async () => {
    setLoading(true);
    try {
      const response = await axios.get<IFormItem>(
        `${appConfig.mobileApi}Form/Get?id=${formItem.FormId}`
      );
      if (response.data.FormStepList) setSteps(response.data.FormStepList);
    } catch (error) {
      console.log(error);
      showToast("خطا در دریافت اطلاعات", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getFormItem();
  }, []);

  const postFormData = async (data: any) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `${appConfig.mobileApi}Form/SubmitForm`,
        data
      );
      if (response.status === 200) {
        setIsSuccessfulSubmit(true);
      }
    } catch (error) {
      console.log(error);
      showToast("خطا در ثبت محصول", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const animateTransition = (
    direction: "next" | "prev",
    callback: () => void
  ) => {
    directionRef.current = direction;
    const startValue = direction === "next" ? 300 : -300; // RTL: Slide from right for next, left for prev
    const endValue = 0;

    slideAnim.setValue(startValue);
    Animated.timing(slideAnim, {
      toValue: endValue,
      duration: 300,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(callback);
  };

  const handleNext = (values: { [key: string]: string }) => {
    // Store the current step's data
    setFormData((prev) => ({
      ...prev,
      [currentStep]: values,
    }));

    if (currentStep < steps.length - 1) {
      animateTransition("next", () => {
        setCurrentStep(currentStep + 1);
      });
    } else {
      // Combine all step data for final submission
      const finalFormData = { ...formData, [currentStep]: values };
      console.log("داده‌های نهایی فرم:", finalFormData);
      const objToPost = {
        FormId: formItem.FormId,
        SubmittedData: Object.entries(values).map(([key, value]) => {
          // Extract the number from keys like "custom-1"
          const keyNumber = parseInt(key.split("-")[1]);
          return {
            key: keyNumber,
            value: value,
          };
        }),
      };
      console.log(objToPost);
      // Here you would typically submit the data to your API
      postFormData(objToPost);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      animateTransition("prev", () => {
        setCurrentStep(currentStep - 1);
      });
    }
  };

  // if (steps?.length === 0) {
  //   return (
  //     <View style={styles.emptyContainer}>
  //       <Feather name="clipboard" size={64} color="#9CA3AF" />
  //       <AppText style={styles.emptyText}>موردی یافت نشد</AppText>
  //     </View>
  //   );
  // }

  const SuccessfulSubmitScreen = () => {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <View
          style={[
            styles.stepIcon,
            { backgroundColor: colors.success, marginBottom: 30 },
          ]}
        >
          <MaterialIcons name={"check-circle"} size={40} color="#fff" />
        </View>
        <AppText
          style={{
            fontSize: 28,
            fontFamily: "Yekan_Bakh_Bold",
            marginBottom: 50,
          }}
        >
          اطلاعات با موفقیت ثبت شد
        </AppText>
        <AppButton
          title="بازگشت به لیست فرم ها"
          onPress={() => navigation.goBack()}
          style={{ width: "100%" }}
        />
      </View>
    );
  };

  return (
    <>
      <ScreenHeader title={formItem.FormName} />
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onDismiss={() => setToastVisible(false)}
      />
      {isSuccessfulSubmit ? (
        <SuccessfulSubmitScreen />
      ) : (
        <View style={styles.container}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <AppText style={styles.loadingText}>
                در حال دریافت اطلاعات...
              </AppText>
            </View>
          ) : steps.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="clipboard" size={64} color="#9CA3AF" />
              <AppText style={styles.emptyText}>موردی یافت نشد</AppText>
            </View>
          ) : (
            <>
              {steps.length !== 1 && (
                <StepperHeader
                  steps={steps}
                  currentStep={currentStep}
                  onPrevious={currentStep > 0 ? handlePrevious : null}
                  onNext={() => {
                    // Trigger next step only if form is valid (handled in StepScreen)
                    const formikSubmitButton = document.querySelector(
                      'button[type="submit"]'
                    ) as HTMLButtonElement;
                    if (formikSubmitButton) formikSubmitButton.click();
                  }}
                  isLastStep={currentStep === steps.length - 1}
                />
              )}
              <StepScreen
                step={steps[currentStep]}
                onNext={handleNext}
                onPrevious={currentStep > 0 ? handlePrevious : null}
                isLastStep={currentStep === steps.length - 1}
                slideAnim={slideAnim}
                isSubmitting={isSubmitting}
                isSingleStep={steps.length === 1}
              />
            </>
          )}
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  stepperHeader: {
    flexDirection: "row-reverse", // RTL support
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
  },
  stepWrapper: {
    alignItems: "center",
  },
  currentStepContainer: {
    alignItems: "center",
  },
  customerContainerDropDown: {
    justifyContent: "flex-end",
  },
  stepIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  navIcon: {
    padding: 10,
  },
  connector: {
    position: "absolute",
    height: 2,
    width: "20%", // Adjust to fit between icons
    top: "45%",
    right: "15%",
    transform: [{ translateY: -1 }],
    zIndex: 99,
  },
  completedConnector: {
    backgroundColor: colors.secondary,
  },
  inactiveConnector: {
    backgroundColor: "#E0E0E0",
  },
  stepLabel: {
    fontSize: 20,
    marginTop: 5,
    color: colors.primary,
    fontFamily: "Yekan_Bakh_Bold",
    textAlign: "center",
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "right",
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: "right",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    textAlign: "right",
  },
  error: {
    color: "red",
    fontSize: 14,
    marginTop: 5,
    textAlign: "right",
  },
  buttonContainer: {
    flexDirection: "row-reverse", // RTL support
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 12,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 12,
  },
  customerContainer: {
    flexDirection: "column",
    marginBottom: 0,
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: "hidden",

    borderWidth: 1,
    borderColor: colors.gray,
  },
  customerGradient: {
    padding: 12,
    backgroundColor: colors.gray,
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
    color: colors.dark,
  },
  customerIcon: {},
  customerButtonsContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  iconCircleSmall: {
    width: 40,
    height: 40,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: colors.warning,
  },
  selectedCustomerContainer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray,
    backgroundColor: colors.white,
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
  errorText: {
    /* Added error text style */ color: colors.danger,
    fontSize: 12,
    marginTop: 5,
    marginBottom: 15,
    textAlign: "right",
    fontFamily: "Yekan_Bakh_Regular",
  },
});

export default FormItem;
