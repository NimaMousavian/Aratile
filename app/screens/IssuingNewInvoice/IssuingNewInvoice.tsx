import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation, useRoute } from "@react-navigation/native";
import ProductSearchDrawer from "./ProductSearchDrawer";

import ColleagueBottomSheet from "../IssuingNewInvoice/ColleagueSearchModal";
import ProductCard from "../../components/ProductCard";
import ScreenHeader from "../../components/ScreenHeader";
import AppTextInput from "../../components/TextInput";
import Toast from "../../components/Toast";
import ProductPropertiesDrawer from "./ProductProperties";
import InvoiceTotalCalculator from "./InvoiceTotalCalculator";
import InvoiceService from "./api/InvoiceService";
import ReusableModal from "../../components/Modal";

import colors from "../../config/colors";
import { toPersianDigits } from "../../utils/numberConversions";
import useProductScanner from "../../Hooks/useProductScanner";
import { useAuth } from "../AuthContext";

export interface Product {
  id: number;
  title: string;
  code?: string;
  quantity: string;
  price?: number;
  note?: string;
  manualCalculation?: boolean;
  hasColorSpectrum?: boolean;
  measurementUnitName?: string;
  propertyValue?: string;
  rectifiedValue?: string;
  boxCount?: number;
  totalArea?: number;
  selectedVariation?: {
    id: number;
    [key: string]: any;
  };
}

interface Colleague {
  id: string;
  name: string;
}

interface AppNavigationProp {
  navigate: (screen: string, params?: any) => void;
  setParams: (params: any) => void;
}

interface ModalConfig {
  visible: boolean;
  headerConfig: {
    title: string;
    icon: React.ComponentProps<typeof MaterialIcons>["name"];
    colors: string[];
  };
  messages: Array<{
    text: string;
    icon?: React.ComponentProps<typeof MaterialIcons>["name"];
    iconColor?: string;
  }>;
  buttons: Array<{
    id: string;
    text: string;
    color: string;
    icon?: React.ComponentProps<typeof MaterialIcons>["name"];
    onPress: (inputValues: Record<string, string>) => void;
  }>;
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

const IssuingNewInvoice: React.FC = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const route = useRoute();
  const navigation = useNavigation<AppNavigationProp>();

  const {
    isLoading,
    selectedProducts,
    searchProduct,
    removeProduct,
    addProduct,
    showRemoveConfirmation,
    editProduct,
  } = useProductScanner();

  const [showProductSearchDrawer, setShowProductSearchDrawer] =
    useState<boolean>(false);
  const [showProductProperties, setShowProductProperties] =
    useState<boolean>(false);
  const [productToShow, setProductToShow] = useState<Product | null>(null);
  const [selectedColleague, setSelectedColleague] = useState<Colleague | null>(
    null
  );
  const [showColleagueSheet, setShowColleagueSheet] = useState<boolean>(false);
  const [invoiceNote, setInvoiceNote] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Modal state
  const [modalConfig, setModalConfig] = useState<ModalConfig>({
    visible: false,
    headerConfig: {
      title: "",
      icon: "info",
      colors: [colors.primary, colors.secondary],
    },
    messages: [],
    buttons: [],
  });
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

  // Generic modal function
  const showModal = (
    title: string,
    message: string,
    icon: React.ComponentProps<typeof MaterialIcons>["name"] = "info",
    headerColors: string[] = [colors.primary, colors.secondary],
    buttonColor: string = colors.primary
  ) => {
    setModalConfig({
      visible: true,
      headerConfig: {
        title,
        icon,
        colors: headerColors,
      },
      messages: [{ text: message }],
      buttons: [
        {
          id: "ok",
          text: "تأیید",
          color: buttonColor,
          onPress: () =>
            setModalConfig((prev) => ({ ...prev, visible: false })),
        },
      ],
    });
  };

  // Success modal with green header
  const showSuccessModal = (title: string, message: string) => {
    setModalConfig({
      visible: true,
      headerConfig: {
        title,
        icon: "check-circle",
        colors: [colors.success, "#4ade80"], // Green gradient
      },
      messages: [
        {
          text: message,
          icon: "check-circle",
          iconColor: colors.success,
        },
      ],
      buttons: [
        {
          id: "ok",
          text: "تأیید",
          color: colors.success,
          onPress: () =>
            setModalConfig((prev) => ({ ...prev, visible: false })),
        },
      ],
    });
  };

  // Error modal with red header
  const showErrorModal = (title: string, message: string) => {
    setModalConfig({
      visible: true,
      headerConfig: {
        title,
        icon: "error",
        colors: [colors.danger, "#ef4444"], // Red gradient
      },
      messages: [
        {
          text: message,
          icon: "error",
          iconColor: colors.danger,
        },
      ],
      buttons: [
        {
          id: "ok",
          text: "تأیید",
          color: colors.danger,
          onPress: () =>
            setModalConfig((prev) => ({ ...prev, visible: false })),
        },
      ],
    });
  };

  // Confirmation modal
  const showConfirmationModal = (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => {
    setModalConfig({
      visible: true,
      headerConfig: {
        title,
        icon: "help",
        colors: [colors.warning, "#f59e0b"], // Orange gradient
      },
      messages: [
        {
          text: message,
          icon: "help",
          iconColor: colors.warning,
        },
      ],
      buttons: [
        {
          id: "cancel",
          text: "انصراف",
          color: colors.medium,
          onPress: () => {
            setModalConfig((prev) => ({ ...prev, visible: false }));
            if (onCancel) onCancel();
          },
        },
        {
          id: "confirm",
          text: "تأیید",
          color: colors.warning,
          onPress: () => {
            setModalConfig((prev) => ({ ...prev, visible: false }));
            onConfirm();
          },
        },
      ],
    });
  };

  const handleProductSelected = (product: Product) => {
    setShowProductSearchDrawer(false);

    setTimeout(() => {
      setProductToShow(product);
      setIsEditing(false);
      setShowProductProperties(true);
    }, 300);
  };

  const handleEditProduct = (productId: number) => {
    const productToEdit = selectedProducts.find(
      (prod) => prod.id === productId
    );
    if (productToEdit) {
      editProduct(productId);
      setProductToShow(productToEdit);
      setIsEditing(true);
      setShowProductProperties(true);
    }
  };

  const handleAddProduct = (
    product: Product,
    quantity: string,
    note: string,
    manualCalculation: boolean,
    boxCount?: number
  ) => {
    // بررسی قیمت محصول - اگر صفر یا تعریف نشده باشد
    if (!product.price || product.price === 0) {
      showToast("قیمت محصول باید بیشتر از صفر باشد", "warning");
      return false;
    }

    let totalArea = product.totalArea;
    if (boxCount && !totalArea && product.rectifiedValue) {
      const rectifiedValue = parseFloat(product.rectifiedValue);
      if (!isNaN(rectifiedValue)) {
        totalArea = boxCount * rectifiedValue;
      }
    }

    const productWithProps = {
      ...product,
      quantity: quantity,
      note: note,
      manualCalculation: manualCalculation,
      boxCount: boxCount,
      totalArea: totalArea,
    };

    if (addProduct(productWithProps)) {
      showToast(
        isEditing ? "محصول با موفقیت ویرایش شد" : "محصول با موفقیت اضافه شد",
        "success"
      );
      return true;
    } else {
      return false;
    }
  };

  const handleCloseProductProperties = () => {
    setShowProductProperties(false);

    setTimeout(() => {
      setProductToShow(null);
      setIsEditing(false);
    }, 500);
  };

  const handleRemoveProduct = (productId: number) => {
    showConfirmationModal(
      "حذف محصول",
      "آیا از حذف این محصول از فاکتور اطمینان دارید؟",
      () => {
        removeProduct(productId);
        showToast("محصول با موفقیت حذف شد", "info");
      }
    );
  };

  const submitInvoice = async () => {
    if (!selectedColleague) {
      showToast("لطفاً ابتدا مشتری را انتخاب کنید", "warning");
      return;
    }

    if (selectedProducts.length === 0) {
      showToast("لطفاً حداقل یک محصول به فاکتور اضافه کنید", "warning");
      return;
    }

    // شروع فرآیند ارسال
    setIsSubmitting(true);

    try {
      // آماده‌سازی داده‌های فاکتور
      const invoiceData = {
        ApplicationUserId: user?.UserId || 0,
        personId: parseInt(selectedColleague.id),
        discount: 0, // در صورت نیاز، تخفیف را از کامپوننت InvoiceTotalCalculator دریافت کنید
        extra: 0, // در صورت نیاز، هزینه اضافی را از کامپوننت InvoiceTotalCalculator دریافت کنید
        description: invoiceNote,
        items: selectedProducts.map((product) => ({
          id: product.id,
          variationId: product.hasColorSpectrum
            ? product.selectedVariation?.id
            : 0,
          quantity: product.quantity,
          note: product.note,
          discount: 0,
          extra: 0,
        })),
      };

      // ارسال فاکتور به سرور
      const result = await InvoiceService.submitInvoice(invoiceData);

      setIsSubmitting(false);

      if (result.success) {
        // نمایش پیام موفقیت با مدال سبز
        showSuccessModal("موفقیت", "فاکتور با موفقیت ثبت شد.");

        // بازگشت به صفحه قبل پس از چند ثانیه
        setTimeout(() => {
          navigation.navigate("IssuedInvoices", { refresh: true });
        }, 2000);
      } else {
        // نمایش پیام خطا با مدال قرمز
        showErrorModal("خطا در ثبت فاکتور", result.error || "خطای نامشخص");
      }
    } catch (error) {
      setIsSubmitting(false);
      showErrorModal(
        "خطا",
        "خطایی در فرآیند ثبت فاکتور رخ داد. لطفاً دوباره تلاش کنید."
      );
      console.error("خطا در ارسال فاکتور:", error);
    }
  };

  useEffect(() => {
    if (showProductSearchDrawer && showProductProperties) {
      setShowProductProperties(false);
    }
  }, [showProductSearchDrawer]);

  const getProductFields = (product: Product) => {
    const fields = [
      {
        icon: "qr-code",
        iconColor: colors.secondary,
        label: "کد:",
        value: toPersianDigits(product.code || ""),
      },
      {
        icon: "straighten",
        iconColor: colors.secondary,
        label: "مقدار:",
        value:
          toPersianDigits(product.quantity) +
          (product.measurementUnitName
            ? ` ${product.measurementUnitName}`
            : ""),
      },
      {
        icon: "attach-money",
        iconColor: colors.secondary,
        label: "قیمت هر واحد:",
        value: toPersianDigits((product.price || 0).toLocaleString()) + " ریال",
      },
    ];

    if (product.boxCount !== undefined && product.boxCount > 0) {
      let totalAreaText = "";
      if (product.rectifiedValue) {
        const rectifiedValue = parseFloat(product.rectifiedValue);
        if (!isNaN(rectifiedValue) && rectifiedValue > 0) {
          const totalArea =
            product.totalArea || product.boxCount * rectifiedValue;
          totalAreaText = ` (${toPersianDigits(totalArea.toFixed(2))}${
            product.measurementUnitName ? ` ${product.measurementUnitName}` : ""
          })`;
        }
      }

      fields.push({
        icon: "shopping-bag",
        iconColor: colors.secondary,
        label: "تعداد کارتن:",
        value:
          toPersianDigits(product.boxCount.toString()) + " عدد" + totalAreaText,
      });

      // اصلاح محاسبه قیمت نهایی
      let finalPrice = 0;
      if (product.totalArea && product.price) {
        finalPrice = product.price * product.totalArea;
      } else {
        finalPrice = (product.price || 0) * parseFloat(product.quantity || "0");
      }

      fields.push({
        icon: "monetization-on",
        iconColor: colors.secondary,
        label: "قیمت نهایی:",
        value: toPersianDigits(finalPrice.toLocaleString()) + " ریال",
        valueStyle: {
          fontFamily: getFontFamily("Yekan_Bakh_Bold", "600"),
          fontSize: 18,
          color: colors.primary,
        },
        isPriceField: true,
      });
    }

    return fields;
  };

  return (
    <>
      <ScreenHeader title="صدور فاکتور جدید" />

      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onDismiss={() => setToastVisible(false)}
      />

      {/* Reusable Modal */}
      <ReusableModal
        visible={modalConfig.visible}
        onClose={() => setModalConfig((prev) => ({ ...prev, visible: false }))}
        headerConfig={modalConfig.headerConfig}
        messages={modalConfig.messages}
        buttons={modalConfig.buttons}
      />

      <View style={styles.container}>
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
                <Text style={styles.customerLabel}>مشتری</Text>
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
                <TouchableOpacity
                  style={[
                    styles.iconCircleSmall,
                    { backgroundColor: "#e5f9ec" },
                  ]}
                  onPress={() => navigation.navigate("CustomerInfo")}
                >
                  <MaterialIcons name="add" size={22} color={colors.success} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.iconCircleSmall,
                    { backgroundColor: "#e4edf8" },
                  ]}
                  onPress={() => setShowColleagueSheet(true)}
                >
                  <MaterialIcons
                    name="search"
                    size={22}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.selectedCustomerContainer}>
            {selectedColleague ? (
              <Text style={styles.selectedCustomerName}>
                {toPersianDigits(selectedColleague.name)}
              </Text>
            ) : (
              <Text style={styles.noCustomerText}>مشتری انتخاب نشده است.</Text>
            )}
          </View>
        </View>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>
              در حال بارگذاری اطلاعات محصول...
            </Text>
          </View>
        )}

        <ScrollView style={styles.scrollableContent} ref={scrollViewRef}>
          <View style={styles.productsSection}>
            {selectedProducts.map((product) => (
              <ProductCard
                key={product.id}
                title={toPersianDigits(product.title)}
                fields={getProductFields(product)}
                note={product.note ? toPersianDigits(product.note) : ""}
                noteConfig={{
                  show: !!product.note && product.note !== "-",
                  icon: "notes",
                  iconColor: colors.secondary,
                  label: "توضیحات:",
                }}
                qrConfig={{
                  show: true,
                  icon: "camera", // تغییر آیکون به دوربین/عکس
                  iconSize: 36,
                  iconColor: colors.secondary,
                }}
                editIcon={{
                  name: "edit",
                  size: 22,
                  color: colors.warning,
                  onPress: () => handleEditProduct(product.id),
                  containerStyle: styles.iconCircleSmall, // اضافه کردن استایل دایره
                }}
                deleteIcon={{
                  name: "delete",
                  size: 22,
                  color: colors.danger,
                  onPress: () => handleRemoveProduct(product.id),
                  containerStyle: styles.iconCircleSmall, // اضافه کردن استایل دایره
                }}
                containerStyle={
                  Platform.OS === "android" ? styles.androidCardAdjustment : {}
                }
                onLongPress={() => handleRemoveProduct(product.id)}
              />
            ))}

            {selectedProducts.length === 0 && (
              <View style={styles.emptyProductsContainer}>
                <MaterialIcons
                  name="shopping-cart"
                  size={50}
                  color={colors.medium}
                />
                <Text style={styles.emptyProductsText}>
                  محصولی به فاکتور اضافه نشده است
                </Text>
                <Text style={styles.emptyProductsSubText}>
                  برای افزودن محصول، از دکمه + یا اسکن بارکد استفاده کنید
                </Text>
              </View>
            )}
          </View>

          {selectedProducts.length > 0 && (
            <View style={styles.invoiceTotalContainer}>
              <InvoiceTotalCalculator
                products={selectedProducts}
                showOnlyTotal={true} // فقط قیمت نهایی را نشان بده
                includeTax={false} // مالیات را در جمع لحاظ نکن
              />
            </View>
          )}

          {selectedProducts.length > 0 && (
            <View style={styles.notesInputContainer}>
              <AppTextInput
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="default"
                icon="text-snippet"
                placeholder="توضیحات"
                onChangeText={(text) => setInvoiceNote(text)}
                value={invoiceNote}
                multiline
                numberOfLines={3}
                height={100}
                textAlign="right"
                isLargeInput={true}
              />
            </View>
          )}
        </ScrollView>

        <View style={styles.bottomFixedContainer}>
          <View style={styles.actionButtonsContainer}>
            <View style={styles.iconButtonsContainer}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => {
                  if (showProductProperties) {
                    setShowProductProperties(false);
                    setTimeout(() => {
                      setShowProductSearchDrawer(true);
                    }, 300);
                  } else {
                    setShowProductSearchDrawer(true);
                  }
                }}
              >
                <View
                  style={[
                    styles.iconCircle,
                    {
                      backgroundColor: "#FFFFFF",
                      borderColor: `${colors.success}40`,
                    },
                  ]}
                >
                  <MaterialIcons name="add" size={30} color={colors.success} />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => {
                  navigation.navigate("BarCodeScanner", {
                    onReturn: (scannedProduct: Product) => {
                      if (scannedProduct) {
                        // بررسی قیمت محصول اسکن شده
                        if (
                          !scannedProduct.price ||
                          scannedProduct.price === 0
                        ) {
                          showToast(
                            "قیمت محصول باید بیشتر از صفر باشد",
                            "warning"
                          );
                          return;
                        }

                        // افزودن محصول اسکن شده به لیست محصولات
                        const success = addProduct(scannedProduct);
                        if (success) {
                          showToast(
                            `محصول "${scannedProduct.title}" با موفقیت به فاکتور اضافه شد`,
                            "success"
                          );

                          // اسکرول به پایین برای نمایش محصول جدید
                          setTimeout(() => {
                            if (scrollViewRef.current) {
                              scrollViewRef.current.scrollToEnd({
                                animated: true,
                              });
                            }
                          }, 500);
                        }
                      }
                    },
                  });
                }}
              >
                <View
                  style={[
                    styles.iconCircle,
                    {
                      backgroundColor: "#FFFFFF",
                      borderColor: `${colors.secondary}40`,
                    },
                  ]}
                >
                  <MaterialIcons
                    name="camera-alt"
                    size={30}
                    color={colors.secondary}
                  />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.submitButtonContainer}>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={submitInvoice}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <MaterialIcons name="done" size={28} color="#FFFFFF" />
                    <Text style={styles.submitButtonText}>ثبت</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <ProductSearchDrawer
          visible={showProductSearchDrawer}
          onClose={() => setShowProductSearchDrawer(false)}
          onProductSelect={handleProductSelected}
          searchProduct={searchProduct}
          onError={showToast}
        />

        {productToShow && (
          <ProductPropertiesDrawer
            visible={showProductProperties}
            onClose={handleCloseProductProperties}
            product={productToShow}
            onSave={handleAddProduct}
            onError={showToast}
            isEditing={isEditing}
          />
        )}
      </View>

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
    </>
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
  scrollableContent: {
    flex: 1,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: colors.medium,
  },
  productsSection: {
    marginBottom: 5,
  },
  androidCardAdjustment: {
    borderWidth: 3,
    borderColor: "#e0e0e0",
    marginVertical: 8,
  },
  emptyProductsContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyProductsText: {
    fontSize: 18,
    fontFamily: "Yekan_Bakh_Bold",
    color: colors.medium,
    marginTop: 10,
  },
  emptyProductsSubText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: colors.medium,
    marginTop: 5,
    textAlign: "center",
  },
  bottomFixedContainer: {
    backgroundColor: colors.light,
    width: "100%",
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: colors.gray,
  },
  notesInputContainer: {
    paddingHorizontal: 0,
    paddingVertical: 10,
    marginTop: 5,
    marginBottom: 10,
  },
  invoiceTotalContainer: {
    marginTop: 0,
    marginBottom: 0,
    paddingHorizontal: 2,
  },
  actionButtonsContainer: {
    marginTop: 5,
  },
  iconButtonsContainer: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    marginVertical: 10,
  },
  iconButton: {
    marginHorizontal: 20,
  },
  iconCircle: {
    width: 55,
    height: 55,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  submitButtonContainer: {
    marginTop: 0,
    marginBottom: 30,
  },
  submitButton: {
    backgroundColor: colors.success,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
    padding: 10,
    height: 56,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 20,
    marginRight: 8,
    marginTop: 5,
    fontFamily: "Yekan_Bakh_Bold",
  },
});

export default IssuingNewInvoice;
