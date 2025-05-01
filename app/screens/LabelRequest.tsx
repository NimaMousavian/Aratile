import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import colors from "../config/colors";
import ScreenHeader from "../components/ScreenHeader";
import Toast from "../components/Toast";
import { InputContainer } from "./FieldMarketer/B2BFieldMarketer/AddNewShop";
import AppText from "../components/Text";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AppTextInput from "../components/TextInput";
import ProductSearchDrawer from "./IssuingNewInvoice/ProductSearchDrawer";
import { Product } from "./IssuingNewInvoice/IssuingNewInvoice";
import useProductScanner from "../Hooks/useProductScanner";
import AppButton from "../components/Button";
import { getFontFamily } from "./IssuedInvoices";
import IconButton from "../components/IconButton";
import { useAuth } from "./AuthContext";
import axios from "axios";
import appConfig from "../../config";

const LabelRequest = () => {
  const [selectedProduct, setSelecteProduct] = useState<Product>();
  const [showProductSearchDrawer, setShowProductSearchDrawer] =
    useState<boolean>(false);

  const [description, setDescription] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { user } = useAuth();
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

  const {
    isLoading,
    selectedProducts,
    searchProduct,
    removeProduct,
    addProduct,
    renderModal,
    showModal,
    showRemoveConfirmation,
    editProduct,
  } = useProductScanner();

  const handleProductSelected = (product: Product) => {
    setSelecteProduct(product);
    setShowProductSearchDrawer(false);
  };
  const handleSubmit = async () => {
    if (!selectedProduct) {
      showToast("محصول انتخاب نشده است", "error");
      return;
    } else {
      setIsSubmitting(true);
      try {
        const objToPost = {
          ProductLabelRequestId: 0,
          ProductId: selectedProduct.id,
          ProductName: selectedProduct.title,
          ProductVariationId: null,
          ProductVariationName: null,
          ApplicationUserId: user?.UserId,
          ApplicationUserName: null,
          Description: description,
          CompanyBranchId: user?.CompanyBranchId,
          State: 0,
          StateStr: null,
          InsertDate: new Date().toISOString(),
          ShamsiInsertDate: null,
          LastUpdateDate: null,
        };
        console.log(objToPost);
        const response = await axios.post(
          `${appConfig.mobileApi}ProductLabelRequest/Add`,
          objToPost
        );
        if (response.status === 200) {
          showToast("درخواست با موفقیت ثبت شد", "success");
        }
      } catch (error) {
        showToast("خطا در ثبت درخواست", "error");
        console.log(error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="درخواست برچسب محصول" />
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onDismiss={() => setToastVisible(false)}
      />
      <InputContainer
        title="محصول"
        showAddIcon
        onAddIconPress={() => setShowProductSearchDrawer(true)}
      >
        {selectedProduct ? (
          <AppText
            style={{
              color: colors.dark,
              fontSize: 18,
              marginRight: 10,
              textAlign: "center",
              fontFamily: "Yekan_Bakh_Bold",
            }}
          >
            {selectedProduct?.title}
          </AppText>
        ) : (
          <AppText
            style={{
              color: colors.medium,
              fontSize: 15,
              marginRight: 10,
              textAlign: "center",
            }}
          >
            {"محصول انتخاب نشده است."}
          </AppText>
        )}
        <View></View>
      </InputContainer>
      <InputContainer title="سایر اطلاعات">
        <AppTextInput
          autoCorrect={false}
          placeholder="توضیحات"
          keyboardType="default"
          icon="notes"
          multiline
          numberOfLines={10}
          height={200}
          onChangeText={setDescription}
          value={description}
        />
        <View></View>
      </InputContainer>
      <ProductSearchDrawer
        visible={showProductSearchDrawer}
        onClose={() => setShowProductSearchDrawer(false)}
        onProductSelect={handleProductSelected}
        searchProduct={searchProduct}
        onError={showToast}
      />
      <IconButton
        text={isSubmitting ? "در حال ثبت..." : "ثبت"}
        onPress={handleSubmit}
        iconName="done"
        iconSize={28}
        backgroundColor={colors.success}
        style={styles.submitButton}
      />
    </View>
  );
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
  selectProduct: {
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: 8,
    padding: 10,
    paddingVertical: 20,
    flexDirection: "row-reverse",
    marginBottom: 10,
  },
  submitButton: {
    position: "absolute",
    bottom: 10,
    right: 0,
    left: 0,
    marginHorizontal: 15,
  },
});

export default LabelRequest;
