import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  SafeAreaView,
  StatusBar,
  Linking,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../StackNavigator";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import colors from "../../config/colors";
import IconButtonSquare from "../../components/IconButtonSquare";
import ProductCard from "../../components/ProductCard";
import DynamicModal from "../../components/DynamicModal";
import IconButton from "../../components/IconButton";
import PurchaseInfoCard from "../../components/PurchaseInfoCard";
import ScreenHeader from "../../components/ScreenHeader";
import InvoiceDetailsSummary from "./InvoiceDetailsSummary";
import axios from "axios";
import appConfig from "../../../config";
import { IInvoic } from "../../config/types";
import { toPersianDigits } from "../../utils/converters";
import { useAuth } from "../AuthContext";

type ReceiveNewInvoiceNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

type FontWeight = "700" | "600" | "500" | "bold" | "semi-bold" | string;

export const getFontFamily = (baseFont: string, weight: FontWeight): string => {
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

enum ModalType {
  None,
  Confirm,
  Suspend,
  Refer,
  Cancel,
}

const ReceiveNewInvoiceScreen: React.FC = () => {
  const navigation = useNavigation<ReceiveNewInvoiceNavigationProp>();
  const route = useRoute();
  const params = route.params as { invoicId: number };
  const invoicId = params.invoicId;
  const { user } = useAuth();

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalType, setModalType] = useState<ModalType>(ModalType.None);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  const [modalData, setModalData] = useState<{
    title: string;
    message: string;
    icon: React.ComponentProps<typeof MaterialIcons>["name"];
    colors: string[];
  }>({
    title: "",
    message: "",
    icon: "check-circle",
    colors: [colors.success, colors.success],
  });
  const [invoic, setInvoic] = useState<IInvoic>();
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

  const getInvoic = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get<IInvoic>(
        `${appConfig.mobileApi}Invoice/Get?id=${invoicId}`
      );
      setInvoic(response.data);
    } catch (error) {
      showToast("خطا در دریافت اطلاعات فاکتور", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const isCurrentUserSeller = () => {
    if (!invoic || !user?.UserId) return false;
    return invoic.ApplicationUserId === user.UserId;
  };

  // تابع جدید برای هدایت به صفحه ویرایش فاکتور
  const handleEditInvoice = () => {
    if (!invoic) return;

    // تبدیل اطلاعات فاکتور به فرمت مورد نیاز صفحه صدور فاکتور
    const editData = {
      isEditing: true,
      invoiceId: invoic.InvoiceId,
      customer: {
        id: invoic.PersonId?.toString() || "",
        name: invoic.PersonFullName,
      },
      products: invoic.InvoiceItemList.map((item) => ({
        id: item.ProductId,
        title: item.ProductName,
        code: item.ProductSKU,
        quantity: item.ProductQuantity.toString(),
        price: item.PerPackagePrice,
        note: item.Description || "",
        measurementUnitName: item.ProductMeasurementUnitName,
        boxCount: item.PackagingQuantity,
        selectedVariation: item.ProductVariationId ? {
          id: item.ProductVariationId
        } : undefined,
      })),
      invoiceNote: invoic.Description || "",
    };

    // هدایت به صفحه صدور فاکتور با داده‌های ویرایش
    navigation.navigate("IssuingNewInvoice", editData);
  };

  const handleEditToggle = () => {
    setIsEditMode(!isEditMode);
  };

  useEffect(() => {
    getInvoic();
  }, []);

  const handlePhoneCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleConfirmation = (inputValues: Record<string, string>) => {
    console.log("فاکتور با موفقیت تایید شد");
    console.log("شماره سفارش:", inputValues.orderNumber);
    console.log("نام شخص:", inputValues.personName);

    if (!inputValues.orderNumber || !inputValues.personName) {
      return;
    }

    setModalVisible(false);
  };

  const handleSuspension = (inputValues: Record<string, string>) => {
    console.log("فاکتور به حالت تعلیق درآمد");
    console.log("دلیل تعلیق:", inputValues.suspendReason);

    if (!inputValues.suspendReason) {
      return;
    }

    setModalVisible(false);
  };

  const handleReferral = (inputValues: Record<string, string>) => {
    console.log("فاکتور ارجاع داده شد");
    console.log("ارجاع به:", inputValues.referTo);
    console.log("توضیحات ارجاع:", inputValues.referNote);

    if (!inputValues.referTo) {
      return;
    }

    setModalVisible(false);
  };

  const handleCancellation = (inputValues: Record<string, string>) => {
    console.log("فاکتور لغو شد");
    console.log("دلیل لغو:", inputValues.cancelReason);

    if (!inputValues.cancelReason) {
      return;
    }

    setModalVisible(false);
  };

  const showConfirmModal = () => {
    setModalType(ModalType.Confirm);
    setModalData({
      title: "تایید نهایی فاکتور",
      message: "فاکتور ثبت نهایی شود؟",
      icon: "done-all",
      colors: [colors.success, colors.success],
    });
    setModalVisible(true);
  };

  const showSuspendModal = () => {
    setModalType(ModalType.Suspend);
    setModalData({
      title: "تعلیق فاکتور",
      message: "آیا می‌خواهید این فاکتور را به حالت تعلیق درآورید؟",
      icon: "pause-circle-outline",
      colors: ["#F39C12", "#E67E22"],
    });
    setModalVisible(true);
  };

  const showReferModal = () => {
    setModalType(ModalType.Refer);
    setModalData({
      title: "ارجاع فاکتور به فروشنده",
      message: "آیا می‌خواهید این فاکتور را به فروشنده ارجاع دهید؟",
      icon: "send",
      colors: [colors.secondary, colors.primary],
    });
    setModalVisible(true);
  };

  const showCancelModal = () => {
    setModalType(ModalType.Cancel);
    setModalData({
      title: "لغو فاکتور",
      message: "فاکتور لغو شود؟",
      icon: "close",
      colors: [colors.danger, "#D32F2F"],
    });
    setModalVisible(true);
  };

  const getModalContent = () => {
    switch (modalType) {
      case ModalType.Confirm:
        return (
          <DynamicModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            headerConfig={{
              title: modalData.title,
              icon: modalData.icon,
              colors: modalData.colors,
            }}
            messages={[
              {
                text: modalData.message,
                icon: "info-outline",
                iconColor: colors.info,
              },
            ]}
            inputs={[
              {
                id: "orderNumber",
                label: "شماره سفارش را وارد کنید",
                placeholder: "شماره سفارش را وارد کنید",
                show: true,
              },
              {
                id: "personName",
                label: "فاکتور به اسم چه شخصی ثبت شود؟",
                placeholder: "نام شخص را وارد کنید",
                show: true,
              },
            ]}
            buttons={[
              {
                id: "confirm",
                text: "تایید",
                color: colors.success,
                icon: "done-all",
                onPress: handleConfirmation,
              },
              {
                id: "cancel",
                text: "انصراف",
                color: colors.danger,
                icon: "close",
                onPress: () => setModalVisible(false),
              },
            ]}
          />
        );
      case ModalType.Refer:
        return (
          <DynamicModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            headerConfig={{
              title: modalData.title,
              icon: modalData.icon,
              colors: modalData.colors,
            }}
            messages={[
              {
                text: modalData.message,
                icon: "info-outline",
                iconColor: colors.info,
              },
              {
                text: "پس از ارجاع، فروشنده می‌تواند فاکتور را اصلاح کند.",
                icon: "send",
                iconColor: colors.secondary,
              },
            ]}
            buttons={[
              {
                id: "confirm",
                text: "ارجاع به فروشنده",
                color: colors.secondary,
                icon: "send",
                onPress: handleReferral,
              },
              {
                id: "cancel",
                text: "انصراف",
                color: colors.danger,
                icon: "close",
                onPress: () => setModalVisible(false),
              },
            ]}
          />
        );

      case ModalType.Suspend:
        return (
          <DynamicModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            headerConfig={{
              title: modalData.title,
              icon: modalData.icon,
              colors: modalData.colors,
            }}
            messages={[
              {
                text: modalData.message,
                icon: "info-outline",
                iconColor: colors.info,
              },
            ]}
            buttons={[
              {
                id: "confirm",
                text: "تعلیق",
                color: "#F39C12",
                icon: "pause-circle-outline",
                onPress: handleSuspension,
              },
              {
                id: "cancel",
                text: "انصراف",
                color: colors.danger,
                icon: "close",
                onPress: () => setModalVisible(false),
              },
            ]}
          />
        );

      case ModalType.Cancel:
        return (
          <DynamicModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            headerConfig={{
              title: modalData.title,
              icon: modalData.icon,
              colors: modalData.colors,
            }}
            messages={[
              {
                text: modalData.message,
                icon: "warning",
                iconColor: colors.danger,
              },
              {
                text: "پس از لغو امکان اسکن گزینه ها وجود ندارد.",
                icon: "error-outline",
                iconColor: colors.danger,
              },
            ]}
            inputs={[
              {
                id: "cancelReason",
                label: "مشتری به چه دلیل منصرف شده است؟",
                placeholder: "دلیل لغو فاکتور را وارد کنید",
                show: true,
              },
            ]}
            buttons={[
              {
                id: "confirm",
                text: "لغو فاکتور",
                color: colors.danger,
                icon: "delete",
                onPress: handleCancellation,
              },
              {
                id: "cancel",
                text: "انصراف",
                color: colors.medium,
                icon: "close",
                onPress: () => setModalVisible(false),
              },
            ]}
          />
        );

      default:
        return null;
    }
  };

  // تغییر دکمه ویرایش برای هدایت به صفحه صدور فاکتور
  const editButton = (
    <TouchableOpacity
      style={styles.editButton}
      onPress={handleEditInvoice}
    >
      <MaterialIcons
        name="edit"
        size={24}
        color={colors.background}
      />
    </TouchableOpacity>
  );

  return (
    <>
      <ScreenHeader
        title="جزئیات فاکتور"
        rightComponent={editButton}
      />

      <SafeAreaView style={styles.safeAreaBottom}>
        <View style={styles.container}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>در حال دریافت فاکتور...</Text>
            </View>
          ) : (
            invoic && (
              <ScrollView
                style={[
                  styles.content,
                  Platform.OS === "android" && styles.androidContentAdjustment,
                ]}
                showsVerticalScrollIndicator={false}
              >
                <View
                  style={[
                    styles.card,
                    Platform.OS === "android" && styles.androidCardAdjustment,
                  ]}
                >
                  <View style={styles.cardHeaderSection}>
                    <View style={styles.invoiceNumberBadge}>
                      <Text style={styles.invoiceNumberLabel}>
                        شماره فاکتور:
                      </Text>
                      <Text style={styles.invoiceNumberValue}>
                        {toPersianDigits(invoic?.InvoiceId?.toString())}
                      </Text>
                    </View>
                    <View style={styles.invoiceDate}>
                      <MaterialIcons
                        name="event"
                        size={16}
                        color={colors.medium}
                      />
                      <Text style={styles.dateValue}>
                        {toPersianDigits(invoic.ShamsiInvoiceDate)}
                      </Text>
                    </View>
                  </View>
                </View>

                {!isCurrentUserSeller() && (
                  <PurchaseInfoCard
                    headerTitle="اطلاعات خرید"
                    headerIcon="person"
                    buyer={{
                      name: invoic.PersonFullName,
                      phone: invoic.PersonMobile,
                    }}
                    seller={{ name: invoic.ApplicationUserName, phone: "" }}
                    address={""}
                    note={invoic.Description}
                    gradientColors={[colors.secondary, colors.primary]}
                    isEditMode={isEditMode}
                  />
                )}

                {isCurrentUserSeller() && (
                  <PurchaseInfoCard
                    headerTitle="اطلاعات خریدار"
                    headerIcon="person"
                    buyer={{
                      name: invoic.PersonFullName,
                      phone: invoic.PersonMobile,
                    }}
                    address={""}
                    note={invoic.Description}
                    gradientColors={[colors.secondary, colors.primary]}
                    isEditMode={isEditMode}
                  />
                )}

                <View style={styles.productsSection}>
                  <View style={styles.sectionHeader}>
                    <MaterialIcons
                      name="shopping-bag"
                      size={18}
                      color={colors.primary}
                    />
                    <Text style={styles.sectionHeaderText}>
                      اطلاعات محصولات
                    </Text>
                  </View>

                  {invoic.InvoiceItemList.map((invoicItem) => (
                    <ProductCard
                      key={invoicItem.InvoiceItemId}
                      title={invoicItem.ProductName}
                      fields={[
                        {
                          icon: "qr-code",
                          iconColor: colors.secondary,
                          label: "کد:",
                          value: invoicItem.ProductSKU,
                        },
                        {
                          icon: "straighten",
                          iconColor: colors.secondary,
                          label: "مقدار:",
                          value: `${invoicItem.ProductQuantity.toFixed(
                            2
                          ).toString()} ${invoicItem.ProductMeasurementUnitName
                            }`,
                        },
                        {
                          icon: "shopping-bag",
                          label: `تعداد ${invoicItem.ProductPackaginName}:`,
                          value: toPersianDigits(
                            invoicItem.PackagingQuantity?.toString()
                          ),
                        },
                        {
                          icon: "attach-money",
                          label: "مبلغ:",
                          value: toPersianDigits(
                            (
                              invoicItem.PackagingQuantity *
                              invoicItem.PerPackagePrice
                            ).toLocaleString() + " ریال"
                          ),
                          isPriceField: true,
                          containerStyle: { marginVertical: 7 },
                        },
                      ]}
                      note={invoicItem.Description}
                      qrConfig={{
                        show: true,
                        icon: "qr-code-2",
                        iconSize: 36,
                        iconColor: colors.secondary,
                      }}
                      containerStyle={
                        Platform.OS === "android"
                          ? styles.androidCardAdjustment
                          : {}
                      }
                      isEditMode={isEditMode}
                    />
                  ))}
                </View>

                {invoic && (
                  <InvoiceDetailsSummary
                    invoic={invoic}
                    containerStyle={
                      Platform.OS === "android"
                        ? styles.androidCardAdjustment
                        : {}
                    }
                    isEditMode={isEditMode}
                  />
                )}

                <View style={styles.bottomSpacer} />
              </ScrollView>
            )
          )}

          {getModalContent()}
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeAreaTop: {
    flex: 0,
    backgroundColor: colors.background,
  },
  safeAreaBottom: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingBottom: 0,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
  },
  androidContentAdjustment: {
    marginTop: 0,
  },
  androidCardAdjustment: {
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    marginVertical: 8,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "#e1e1e1",
  },
  cardHeaderSection: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  invoiceNumberBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#EBF5FB",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9,
  },
  invoiceNumberLabel: {
    fontSize: 15,
    color: colors.info,
    fontFamily: getFontFamily("Yekan_Bakh_Regular", "normal"),
    marginLeft: 6,
  },
  invoiceNumberValue: {
    fontSize: 15,
    color: colors.info,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "700"),
  },
  invoiceDate: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  dateValue: {
    fontSize: 15,
    marginRight: 6,
    color: colors.medium,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "700"),
  },
  productsSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionHeaderText: {
    fontSize: 16,
    marginRight: 8,
    color: colors.primary,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "600"),
  },
  bottomSpacer: {
    height: 200,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontFamily: getFontFamily("Yekan_Bakh_Regular", "normal"),
    fontSize: 16,
    color: "#6B7280",
    marginTop: 12,
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.secondary,
  },
});

export default ReceiveNewInvoiceScreen;