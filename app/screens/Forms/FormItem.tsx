import { RouteProp, useRoute } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { IForm, IFormField, IFormItem, IFormStep } from "../../config/types";
import { Formik, FormikProps } from "formik";
import * as Yup from "yup";
import AppText from "../../components/Text";
import { ScrollView } from "react-native-gesture-handler";
import AppTextInput from "../../components/TextInput";
import AppButton from "../../components/Button";
import { MaterialIcons } from "@expo/vector-icons";
import colors from "../../config/colors";
import ScreenHeader from "../../components/ScreenHeader";
import axios from "axios";
import appConfig from "../../../config";
import { InputContainer } from "../FieldMarketer/B2BFieldMarketer/AddNewShop";
import IconButton from "../../components/IconButton";
import DynamicSelectionBottomSheet from "../../components/DynamicSelectionBottomSheet";
import { DatePickerField } from "../../components/PersianDatePicker";

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

// Create dynamic Yup validation schema based on fields
const createValidationSchema = (fields: IFormField[]) => {
  const shape: { [key: string]: Yup.StringSchema } = {};
  fields.forEach((field) => {
    let schema = Yup.string();
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
  const nextStepIcon = !isLastStep ? steps[currentStep + 1].IconName : null;
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
            onPress={onPrevious || undefined}
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
            name={currentStepData.IconName}
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
            name={nextStepIcon}
            size={30}
            color={isLastStep ? "#E0E0E0" : "#999"}
            onPress={isLastStep ? undefined : onNext}
            style={styles.navIcon}
          />
        </View>
      ) : (
        <View style={{ width: 50 }}></View>
      )}
    </View>
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
    case 3:
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
    case 4:
      return (
        //   <DynamicSelectionBottomSheet<FormValues>
        //     customFieldId={customField.ShopCustomFieldId}
        //     customFieldName={customField.FieldName}
        //     customIconName={customField.IconName}
        //     url={`${appConfig.mobileApi}ShopCustomFieldSelectiveValue/GetAll?customFieldId=${customField.ShopCustomFieldId}&page=1&pageSize=1000`}
        //     formikProps={formikProps}
        //   />
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
    //   <DynamicSelectionBottomSheet<FormValues>
    //     customFieldId={customField.ShopCustomFieldId}
    //     customFieldName={customField.FieldName}
    //     customIconName={customField.IconName}
    //     url={`${appConfig.mobileApi}ShopCustomFieldSelectiveValue/GetAll?customFieldId=${customField.ShopCustomFieldId}&page=1&pageSize=1000`}
    //     formikProps={formikProps}
    //   />
    case 10:
      return (
        <IconButton
          text="موقعیت جغرافیایی"
          iconName="location-pin"
          onPress={() => {}}
          backgroundColor={colors.primary}
          flex={1}
        />
      );
    case 11:
    case 12:
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

// Step Screen Component
interface StepScreenProps {
  step: IFormStep;
  onNext: (values: { [key: string]: string }) => void;
  onPrevious: (() => void) | null;
  isLastStep: boolean;
  slideAnim: Animated.Value;
}

const StepScreen: React.FC<StepScreenProps> = ({
  step,
  onNext,
  onPrevious,
  isLastStep,
  slideAnim,
}) => {
  let fields: IFormField[] = [];
  step.StepSectionList.forEach((section) =>
    section.FormFieldList.forEach((formField) => fields.push(formField))
  );
  console.log("fields", fields);

  const initialValues = fields.reduce((acc, field) => {
    acc[field.FieldName] = "";
    return acc;
  }, {} as { [key: string]: string });

  const validationSchema = createValidationSchema(fields);

  return (
    <Animated.View
      style={[styles.stepContainer, { transform: [{ translateX: slideAnim }] }]}
    >
      <ScrollView>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={(values) => onNext(values)}
        >
          {(FormikProps) => (
            <View>
              {step.StepSectionList.map((section) => (
                <InputContainer title={section.Title}>
                  {section.FormFieldList.map((formField) =>
                    renderInput(formField, FormikProps)
                  )}
                </InputContainer>
              ))}
              {/* {step.fields.map((field) => (
                <View key={field.name} style={styles.inputContainer}>
                  <AppText style={styles.label}>{field.label}</AppText>
                  <AppTextInput
                    style={styles.input}
                    onChangeText={handleChange(field.name)}
                    onBlur={handleBlur(field.name)}
                    value={values[field.name]}
                    placeholder={`وارد کنید ${field.label}`}
                    textAlign="right"
                  />
                  {touched[field.name] && errors[field.name] && (
                    <AppText style={styles.error}>{errors[field.name]}</AppText>
                  )}
                </View>
              ))} */}
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
                  title={isLastStep ? "ارسال" : "بعدی"}
                  onPress={FormikProps.handleSubmit}
                  disabled={Object.keys(FormikProps.errors).length > 0}
                  style={{ width: "48%" }}
                  color="success"
                />
              </View>
            </View>
          )}
        </Formik>
      </ScrollView>
    </Animated.View>
  );
};

// Main Stepper Component
const FormItem: React.FC = () => {
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
  const slideAnim = useRef(new Animated.Value(0)).current;
  const directionRef = useRef<"next" | "prev" | null>(null);

  const getFormItem = async () => {
    try {
      const response = await axios.get<IFormItem>(
        `${appConfig.mobileApi}Form/Get?id=${formItem.FormId}`
      );
      setSteps(response.data.FormStepList);
    } catch (error) {}
  };

  useEffect(() => {
    getFormItem();
  }, []);

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
    setFormData((prev) => ({
      ...prev,
      [currentStep]: values,
    }));
    if (currentStep < steps.length - 1) {
      animateTransition("next", () => {
        setCurrentStep(currentStep + 1);
      });
    } else {
      console.log("داده‌های نهایی فرم:", formData);
      alert("فرم با موفقیت ارسال شد!");
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      animateTransition("prev", () => {
        setCurrentStep(currentStep - 1);
      });
    }
  };

  if (steps.length === 0) {
    return <AppText>در حال بارگذاری...</AppText>;
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title={formItem.FormName} />
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
      <StepScreen
        step={steps[currentStep]}
        onNext={handleNext}
        onPrevious={currentStep > 0 ? handlePrevious : null}
        isLastStep={currentStep === steps.length - 1}
        slideAnim={slideAnim}
      />
    </View>
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
    gap: 10,
    marginTop: 20,
  },
});

export default FormItem;
