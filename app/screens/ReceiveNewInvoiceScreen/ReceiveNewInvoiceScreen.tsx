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
import axios from "axios";
import appConfig from "../../../config";
import { IInvoic } from "../../config/types";
import { toPersianDigits } from "../../utils/converters";
interface PurchaseData {
  buyer: {
    name: string;
    phone: string;
  };
  seller: {
    name: string;
    phone: string;
  };
  address: string;
  note: string;
}

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
const purchaseData: PurchaseData = {
  buyer: {
    name: "نمت",
    phone: "09353130587",
  },
  seller: {
    name: "زهره نورانی",
    phone: "09137305578",
  },
  address: "ایران، تهران",
  note: "لطفا فاکتور صادر نشود",
};

export const productData = [
  {
    id: 1,
    title: "پرسلان نگار رافیا استخوانی مات ۶۰×۱۳۰ (کد:۱/۴۴)",
    quantity: "۵.۷۶ متر مربع",
    note: "-",
    code: "١٣١٢٧٧٩١٣٠٦٠٢١٢٠١٥١٤٣٠١",
    hasColorSpectrum: true,
  },
  {
    id: 2,
    title: "کاشی دیواری سرامیک البرز طرح پالیزاندو ۳۰×۱۰۰ (کد:۲/۵۸)",
    quantity: "۸.۸۰ متر مربع",
    note: "نصب در اتاق خواب",
    code: "١٤٣٧٨٢١٣٩٦١٨٠٩٢١٣٤٣٥٩١",
    hasColorSpectrum: false,
  },
  {
    id: 3,
    title: "سرامیک کف گرانیتی مرجان طرح لوشان ۶۰×۶۰ (کد:۳/۲۱)",
    quantity: "۱۶.۲۰ متر مربع",
    note: "ارسال به آدرس مشتری",
    code: "١١٨٥٤٣٢٧١٣٦٥٤٠٩٧٦٢٧٩٠١",
    hasColorSpectrum: true,
  },
  {
    id: 4,
    title: "موزاییک طرح سنگ ایرانی ۳۰×۳۰ (کد:۵/۷۷)",
    quantity: "۴.۵۰ متر مربع",
    note: "نصب در حیاط خلوت",
    code: "١٥٨٦٧٩٤٣١٤٧٨٢٣٤٥٦٧١٨٢٣",
    hasColorSpectrum: false,
  },
];

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

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalType, setModalType] = useState<ModalType>(ModalType.None);

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
    } finally {
      setIsLoading(false);
    }
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
            // inputs={[
            //   {
            //     id: "suspendReason",
            //     label: "دلیل تعلیق",
            //     placeholder: "دلیل تعلیق فاکتور را وارد کنید",
            //     show: true,
            //   },
            // ]}
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

  return (
    <>
      <ScreenHeader title="ثبت فاکتور جدید" />

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
                        {toPersianDigits(invoic?.InvoiceId.toString())}
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
                />

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
                      // titleIcon={{
                      //   name: "inventory",
                      //   color: colors.primary,
                      // }}
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
                          ).toString()} ${
                            invoicItem.ProductMeasurementUnitName
                          }`,
                        },
                        {
                          icon: "shopping-bag",
                          label: `تعداد ${invoicItem.ProductPackaginName}:`,
                          value: toPersianDigits(
                            invoicItem.PackagingQuantity.toString()
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
                      noteConfig={{
                        show: true,
                        icon: "notes",
                        iconColor: colors.secondary,
                        label: "توضیحات:",
                      }}
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
                    />
                  ))}
                </View>

                {/* <View
              style={[
                styles.sellerCard,
                Platform.OS === "android" && styles.androidCardAdjustment,
              ]}
            >
              <Text style={styles.sellerLabel}>نام فروشنده</Text>

              <View style={styles.qrPlaceholder}>
                <View style={styles.qrCodeRectangle}>
                  <MaterialIcons
                    name="qr-code-2"
                    size={100}
                    color={colors.gray}
                  />
                </View>
              </View>
            </View> */}

                <View style={styles.bottomSpacer} />
              </ScrollView>
            )
          )}

          <View style={styles.actionsContainer}>
            <View style={styles.actionButtonsRow}>
              <IconButtonSquare
                text="تایید نهایی"
                iconName="done-all"
                backgroundColor={colors.success}
                onPress={showConfirmModal}
              />

              <IconButtonSquare
                text="تعلیق"
                iconName="pause-circle-outline"
                backgroundColor={"#F39C12"}
                onPress={showSuspendModal}
              />

              <IconButtonSquare
                text="ارجاع"
                iconName="send"
                backgroundColor={colors.secondary}
                onPress={showReferModal}
              />

              <IconButtonSquare
                text="لغو"
                iconName="close"
                backgroundColor={colors.danger}
                onPress={showCancelModal}
              />
            </View>
          </View>

          {getModalContent()}
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeAreaTop: {
    flex: 0,
    backgroundColor: colors.light,
  },
  safeAreaBottom: {
    flex: 1,
    backgroundColor: colors.light,
  },
  container: {
    flex: 1,
    paddingBottom: 0,
    backgroundColor: colors.light,
  },
  content: {
    flex: 1,
    padding: 16,
    // paddingTop: Platform.OS === "android" ? 60 : 20,
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
    marginBottom: 16,
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
    fontWeight: "bold",
    color: colors.info,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "bold"),
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

  callButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderColor: colors.success,
    borderWidth: 2,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
  },

  purchasesecondaryCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,

    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e1e1e1",
  },
  purchasesecondaryHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    padding: 16,
  },
  purchasesecondaryHeaderText: {
    fontSize: 16,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "600"),
    color: colors.white,
    marginRight: 8,
  },
  purchasesecondaryContent: {
    padding: 16,
  },
  purchasesecondaryRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  purchasesecondaryItem: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  purchasesecondaryTextContainer: {
    flexDirection: "row-reverse",
    marginRight: 8,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.light,
    marginVertical: 12,
  },
  addressContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  secondaryLabel: {
    fontSize: 15,
    color: colors.medium,
    fontFamily: getFontFamily("Yekan_Bakh_Regular", "normal"),
    marginLeft: 8,
  },
  secondaryValue: {
    fontSize: 15,
    color: colors.dark,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "500"),
  },
  addressValue: {
    fontSize: 15,
    color: colors.dark,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "500"),
  },
  noteContainer: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
  },
  noteTextContainer: {
    flexDirection: "row-reverse",
    flex: 1,
    marginRight: 8,
  },
  iconTextSpacing: {
    marginRight: 10,
  },
  noteLabel: {
    fontSize: 15,
    // color: colors.danger,
    fontFamily: getFontFamily("Yekan_Bakh_Regular", "normal"),
    marginLeft: 8,
  },
  noteContent: {
    fontSize: 15,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "500"),
    // color: colors.danger,
    flex: 1,
    textAlign: "right",
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

  productCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // elevation: 2,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e1e1e1",
  },
  productTitleContainer: {
    padding: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e1e1",
    // borderRightWidth: 3,
    // borderRightColor: colors.secondary,
  },
  productTitleRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productTitle: {
    fontSize: 18,
    color: colors.primary,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "600"),
    textAlign: "right",
    flex: 1,
    marginLeft: 8,
  },
  productDetailsContainer: {
    padding: 12,
  },
  infoWithImageContainer: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoSection: {
    flex: 1,
  },
  quantityContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 12,
  },
  quantityValue: {
    fontSize: 15,
    color: colors.dark,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "500"),
  },
  colorSpectrumContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 16,
  },
  productImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: colors.light,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  spectrumValueHas: {
    fontSize: 15,
    color: colors.success,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "500"),
  },
  spectrumValueHasNot: {
    fontSize: 15,
    color: colors.danger,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "500"),
  },
  productNoteContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 12,
  },
  regularNoteContent: {
    fontSize: 15,
    color: colors.dark,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "500"),
  },
  spectrumOptionContainer: {
    flexDirection: "row-reverse",
  },
  spectrumOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
    borderWidth: 1,
  },
  spectrumOptionHas: {
    backgroundColor: "#E8F5E9",
    borderColor: colors.success,
  },
  spectrumOptionHasNot: {
    backgroundColor: "#FFEBEE",
    borderColor: colors.danger,
  },
  spectrumOptionText: {
    fontSize: 12,
    fontFamily: getFontFamily("Yekan_Bakh_Regular", "normal"),
  },
  spectrumOptionTextHas: {
    color: colors.success,
  },
  spectrumOptionTextHasNot: {
    color: colors.danger,
  },
  productCodeContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingRight: 0,
    padding: 12,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: "#e1e1e1",
  },
  productCodeLabel: {
    fontSize: 15,
    color: colors.medium,
    fontFamily: getFontFamily("Yekan_Bakh_Regular", "normal"),
    marginRight: 8,
    marginLeft: 8,
  },
  productCode: {
    fontSize: 15,
    color: colors.dark,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "500"),
    letterSpacing: 1,
  },

  sellerCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,

    borderWidth: 1,
    borderColor: "#e1e1e1",
  },
  sellerLabel: {
    fontSize: 16,
    color: colors.primary,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "600"),
    marginBottom: 16,
  },
  qrPlaceholder: {
    width: 150,
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },
  qrCodeRectangle: {
    width: 150,
    height: 150,
    backgroundColor: colors.white,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e1e1e1",
  },
  imagePlaceholder: {
    width: 30,
    height: 30,
    backgroundColor: colors.light,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  spacer: {
    flex: 1,
  },
  bottomSpacer: {
    height: 200,
  },
  actionsContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    padding: 5,
    borderTopWidth: 1,
    borderTopColor: "#e1e1e1",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButtonsRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  actionBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
    padding: 12,
    flex: 0.49,
  },
  actionBtnText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "600"),
    marginRight: 8,
  },
  scanBtn: {
    backgroundColor: colors.success,
  },
  notScanBtn: {
    backgroundColor: colors.gray,
  },
  finalizeBtn: {
    backgroundColor: colors.success,
  },
  suspendBtn: {
    backgroundColor: "#F39C12",
  },
  referBtn: {
    backgroundColor: colors.secondary,
  },
  cancelBtn: {
    backgroundColor: colors.danger,
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
});

export default ReceiveNewInvoiceScreen;
