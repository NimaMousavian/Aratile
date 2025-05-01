import React, { useEffect, useState } from "react";
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
import { ISupplyRequest } from "../config/types";
import { ActivityIndicator } from "react-native-paper";
import AppText from "../components/Text";

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
  product?: Product;
  requestedValue_?: number;
  description_?: string;
  getAllSupplyRequest: () => void;
  supplyRequestId?: number;
  mode: "add" | "edit";
}

const SupplyRequestForm: React.FC<IProps> = ({
  visible,
  closeDrawer,
  product,
  requestedValue_,
  description_,
  getAllSupplyRequest,
  supplyRequestId,
  mode,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [supplyRequest, setSupplyRequest] = useState<ISupplyRequest | null>(
    null
  );

  const [productName, setProductName] = useState<string>(product?.title || "");
  const [requestedValue, setRequestedValue] = useState<number | undefined>(
    requestedValue_
  );
  const [description, setDescription] = useState<string | undefined>(
    description_
  );

  const [screenLoading, setScreenLoading] = useState<boolean>(false);

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

  useEffect(() => {
    console.log(mode);

    if (mode === "edit" && supplyRequestId) {
      getSupplyRequest(supplyRequestId);
    }
    if (mode === "add" && product) {
      setProductName(product.title);
      setRequestedValue(undefined);
      setDescription("");
      console.log("here");
    }

    if (visible === false) {
      setProductName("");
      setRequestedValue(undefined);
      setDescription("");
    }
  }, [visible]);

  const validateForm = () => {
    if (!requestedValue) {
      showToast("مقدار مورد درخواست وارد نشده است", "error");
      return false;
    } else {
      return true;
    }
  };

  const getSupplyRequest = async (SId: number) => {
    setScreenLoading(true);
    try {
      const response = await axios.get<ISupplyRequest>(
        `${appConfig.mobileApi}ProductSupplyRequest/Get?id=${SId}`
      );
      console.log("supply", response.data);

      setSupplyRequest(response.data);
      setProductName(response.data.ProductName);
      setRequestedValue(response.data.RequestedValue);
      setDescription(response.data.Description);
    } catch (error) {
    } finally {
      setScreenLoading(false);
    }
  };

  const postSupplyRequest = async () => {
    if (!validateForm()) {
      return;
    }
    setIsLoading(true);
    try {
      const supReqToPost: ISupplyRequestToPost = {
        ProductSupplyRequestId: 0,
        ApplicationUserId: 1,
        ApplicationUserName: null,
        ProductId: product?.id || supplyRequest?.ProductId || 0,
        ProductName: null,
        ProductVariationId: null,
        ProductVariationName: null,
        RequestedValue: Number(requestedValue),
        RequestState: 1,
        RequestStateStr: null,
        Description: description || "",
        InsertDate: "2025-04-14T15:41:13.631Z",
      };

      console.log(supReqToPost);

      const response = await axios.post(
        `${appConfig.mobileApi}ProductSupplyRequest/Add`,
        supReqToPost
      );

      if (response.status === 200) {
        showToast("درخواست با موفقیت ثبت شد", "success");
        setProductName("");
        setRequestedValue(undefined);
        setDescription("");
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
  const editSupplyRequest = async () => {
    setIsLoading(true);
    try {
      const supReqToPost: ISupplyRequestToPost = {
        ProductSupplyRequestId: 0,
        ApplicationUserId: 1,
        ApplicationUserName: null,
        ProductId: product?.id || supplyRequest?.ProductId || 0,
        ProductName: null,
        ProductVariationId: null,
        ProductVariationName: null,
        RequestedValue: Number(requestedValue),
        RequestState: 1,
        RequestStateStr: null,
        Description: description || "",
        InsertDate: "2025-04-14T15:41:13.631Z",
      };

      console.log(supReqToPost);

      const response = await axios.post(
        `${appConfig.mobileApi}ProductSupplyRequest/Edit`,
        supReqToPost
      );

      if (response.status === 200) {
        showToast("ویرایش با موفقیت انجام شد", "success");
        getAllSupplyRequest();
        closeDrawer();
      }
    } catch (error) {
      console.log(error);
      showToast("خطا در ویرایش اطلاعات", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    if (mode === "edit") {
      editSupplyRequest();
    } else {
      postSupplyRequest();
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
              <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollViewContent}
              >
                {screenLoading ? (
                  <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <AppText
                      style={{
                        marginTop: 15,
                        fontSize: 20,
                        color: colors.primary,
                      }}
                    >
                      در حال بارگذاری اطلاعات
                    </AppText>
                  </View>
                ) : (
                  <>
                    <View style={styles.productContainer}>
                      <Text style={styles.productTitle}>{productName}</Text>
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
                        placeholder={`مقدار مورد درخواست ${""}`}
                        onChangeText={(val) => setRequestedValue(Number(val))}
                        value={requestedValue ? requestedValue?.toString() : ""}
                      ></AppTextInput>
                      <AppTextInput
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType="default"
                        icon="text-snippet"
                        placeholder="توضیحات"
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={5}
                        height={150}
                        textAlign="right"
                        isLargeInput={true}
                        value={description}
                      ></AppTextInput>
                    </View>
                  </>
                )}
              </ScrollView>
              <View style={styles.buttonContainer}>
                <AppButton
                  title={
                    isLoading
                      ? "در حال ارسال"
                      : mode === "edit"
                      ? "ویرایش"
                      : "ثبت درخواست"
                  }
                  onPress={handleSubmit}
                  color={mode === "edit" ? "warning" : "success"}
                  style={styles.actionButton}
                />
                <AppButton
                  title="انصراف"
                  onPress={closeDrawer}
                  color="danger"
                  style={styles.actionButton}
                />
              </View>
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
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
});

export default SupplyRequestForm;
