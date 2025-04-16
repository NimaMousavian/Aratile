import React, { useState } from "react";
import {
  Animated,
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Dimensions,
} from "react-native";
import colors from "../config/colors";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AppTextInput from "../components/TextInput";
import AppButton from "../components/Button";
import { Product } from "./IssuingNewInvoice/IssuingNewInvoice";
import * as Yup from "yup";
import { Formik } from "formik";
import axios from "axios";
import appConfig from "../../config";
import Toast from "../components/Toast";

interface ISupplyRequestToPost {
  ProductSupplyRequestId: number;
  ApplicationUserId: 1;
  ApplicationUserName: null;
  ProductId: number;
  ProductName: null;
  ProductVariationId: null;
  ProductVariationName: null;
  RequestedValue: number;
  RequestState: 1;
  RequestStateStr: null;
  Description: string;
  InsertDate: "2025-04-14T15:41:13.631Z";
}

const { height, width } = Dimensions.get("window");

const validationSchema = Yup.object().shape({
  reqestedValue: Yup.string(),
  description: Yup.string(),
});

interface IProps {
  visible: boolean;
  closeDrawer: () => void;
  product: Product;
  getAllSupplyRequest: () => void;
}

const SupplyRequestForm: React.FC<IProps> = ({
  visible,
  closeDrawer,
  product,
  getAllSupplyRequest,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

  const postSupplyRequest = async (reqValu: string, desc: string) => {
    setIsLoading(true);
    try {
      const supReqToPost: ISupplyRequestToPost = {
        ProductSupplyRequestId: 0,
        ApplicationUserId: 1,
        ApplicationUserName: null,
        ProductId: product.id,
        ProductName: null,
        ProductVariationId: null,
        ProductVariationName: null,
        RequestedValue: Number(reqValu),
        RequestState: 1,
        RequestStateStr: null,
        Description: desc,
        InsertDate: "2025-04-14T15:41:13.631Z",
      };

      console.log(supReqToPost);

      const response = await axios.post(
        `${appConfig.mobileApi}ProductSupplyRequest/Add`,
        supReqToPost
      );

      if (response.status === 200) {
        showToast("درخواست با موفقیت ثبت شد", "success");
        getAllSupplyRequest();
        closeDrawer();
      }
    } catch (error) {
      console.log(error);
      showToast("خطا در ثبت درخواست", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={closeDrawer}
      statusBarTranslucent={true}
    >
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onDismiss={() => setToastVisible(false)}
      />
      <View style={styles.modalContainer}>
        <Animated.View style={[styles.backdrop]}>
          <TouchableOpacity
            style={styles.backdropTouchable}
            activeOpacity={1}
            onPress={closeDrawer}
          />
        </Animated.View>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "position" : undefined}
          style={styles.keyboardAvoidingContainer}
          pointerEvents="box-none"
          keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
          enabled={false}
        >
          <Animated.View
            style={[
              styles.drawerContainer,
              {
                height: Platform.OS === "ios" ? height * 0.8 : "80%",
                width: Platform.OS === "ios" ? width : "100%",
              },
            ]}
          >
            <LinearGradient
              colors={[colors.secondary, colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.header}
            >
              <View style={styles.headerContent}>
                <MaterialIcons name="shopping-cart" size={24} color="white" />
                <Text style={styles.headerTitle}>درخواست تامین</Text>
              </View>
              <TouchableOpacity
                onPress={closeDrawer}
                style={styles.closeButton}
              >
                <MaterialIcons
                  name="close"
                  size={32}
                  color="white"
                  style={{ marginLeft: -4 }}
                />
              </TouchableOpacity>
            </LinearGradient>
            <View style={styles.contentContainer}>
              <Formik
                initialValues={{ requestedValue: "", description: "" }}
                onSubmit={(values) => {
                  console.log("values: ", values);
                  postSupplyRequest(values.requestedValue, values.description);
                }}
                validationSchema={validationSchema}
              >
                {({ handleChange, handleSubmit, errors }) => (
                  <>
                    <ScrollView
                      style={styles.scrollView}
                      showsVerticalScrollIndicator={false}
                      contentContainerStyle={styles.scrollViewContent}
                    >
                      <View style={styles.productContainer}>
                        <Text style={styles.productTitle}>{product.title}</Text>
                      </View>
                      <View style={styles.productContainer}>
                        {/* <AppTextInput
                          autoCapitalize="none"
                          autoCorrect={false}
                          keyboardType="default"
                          placeholder="تنوع محصول"
                          onChangeText={() => {}}
                        ></AppTextInput> */}
                        <AppTextInput
                          autoCapitalize="none"
                          autoCorrect={false}
                          keyboardType="number-pad"
                          icon="10k"
                          placeholder={`مقدار مورد درخواست ${
                            product.ProductMeasurementUnitName || ""
                          }`}
                          onChangeText={handleChange("requestedValue")}
                        ></AppTextInput>
                        <AppTextInput
                          autoCapitalize="none"
                          autoCorrect={false}
                          keyboardType="default"
                          icon="text-snippet"
                          placeholder="توضیحات"
                          onChangeText={handleChange("description")}
                          multiline
                          numberOfLines={5}
                          height={150}
                          textAlign="right"
                          isLargeInput={true}
                        ></AppTextInput>
                      </View>
                    </ScrollView>
                    <View style={styles.buttonContainer}>
                      <AppButton
                        title={isLoading ? "در حال ارسال" : "ثبت درخواست"}
                        onPress={handleSubmit}
                        color="success"
                        style={styles.actionButton}
                      />
                      <AppButton
                        title="انصراف"
                        onPress={closeDrawer}
                        color="danger"
                        style={styles.actionButton}
                      />
                    </View>
                  </>
                )}
              </Formik>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    zIndex: 9999,
  },
  keyboardAvoidingContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  backdropTouchable: {
    flex: 1,
  },
  drawerContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
    }),
  },
  header: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    height: 65,
  },
  headerContent: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    color: colors.white,
    marginRight: 8,
    fontFamily: "Yekan_Bakh_Bold",
  },
  closeButton: {
    padding: 4,
  },
  contentContainer: {
    flex: 1,
    position: "relative",
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: 0,
  },
  productContainer: {
    borderWidth: 1,
    borderRadius: 15,
    borderColor: colors.primary,
    padding: 15,
    marginBottom: 15,
    backgroundColor: colors.white,
  },
  productTitle: {
    fontSize: 18,
    fontFamily: "Yekan_Bakh_Bold",
    color: colors.dark,
    textAlign: "center",
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: colors.dark,
    marginVertical: 10,
  },
  properties: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginVertical: 5,
  },
  propertyLabel: {
    fontFamily: "Yekan_Bakh_Bold",
    color: colors.secondary,
  },
  copyableProperty: {
    marginVertical: 5,
  },
  codeContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  inputsContainer: {
    borderWidth: 1,
    borderRadius: 15,
    borderColor: colors.primary,
    padding: 15,
    marginBottom: 15,
    backgroundColor: colors.white,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    gap: 15,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.gray,
  },
  actionButton: {
    flex: 1,
  },
});

export default SupplyRequestForm;
