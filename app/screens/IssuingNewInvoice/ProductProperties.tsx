import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Animated,
  Dimensions,
  Keyboard,
  Modal,
  Easing,
  Platform,
  Clipboard,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
} from "react-native";
import UnsavedChangesModal from "./UnsavedChangesModal";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import colors from "../../config/colors";
import {
  toPersianDigits,
  toEnglishDigits,
} from "../../utils/numberConversions";
import AppText from "../../components/Text";
import AppButton from "../../components/Button";
import AppTextInput from "../../components/TextInput";
import Checkbox from "../../components/CheckBox";
import Toast from "../../components/Toast";
import { Product } from "./IssuingNewInvoice";

const { height, width } = Dimensions.get("window");

interface ProductPropertiesDrawerProps {
  visible: boolean;
  onClose: () => void;
  product: Product | null;
  onSave: (
    product: Product,
    quantity: string,
    note: string,
    manualCalculation: boolean,
    boxCount?: number
  ) => boolean;
  onError?: (
    message: string,
    type: "success" | "error" | "warning" | "info"
  ) => void;
  isEditing?: boolean; // اضافه کردن پراپ جدید برای مشخص کردن حالت ویرایش
}

const ProductPropertiesDrawer: React.FC<ProductPropertiesDrawerProps> = ({
  visible,
  onClose,
  product,
  onSave,
  onError,
  isEditing = false, // مقدار پیش‌فرض false
}) => {
  console.log(
    "ProductPropertiesDrawer - product:",
    product,
    "isEditing:",
    isEditing
  );

  const [quantity, setQuantity] = useState<string>("1");
  const [displayQuantity, setDisplayQuantity] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [manualCalculation, setManualCalculation] = useState<boolean>(false);
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [boxCount, setBoxCount] = useState<number | null>(null);
  const [availableStock, setAvailableStock] = useState<number>(0);
  const [rectifiedValue, setRectifiedValue] = useState<number>(1.44); // مقدار پیش‌فرض

  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<
    "success" | "error" | "warning" | "info"
  >("error");

  const slideAnimation = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (product && visible) {
      // تنظیم مقادیر اولیه با توجه به وضعیت ویرایش یا اضافه کردن
      if (isEditing) {
        // در حالت ویرایش، مقادیر موجود محصول را استفاده می‌کنیم
        setQuantity(product.quantity || "1");
        setDisplayQuantity(toPersianDigits(product.quantity || ""));
        setNote(product.note || "");
        setManualCalculation(product.manualCalculation || false);

        // اگر محصول دارای تعداد کارتن است، آن را تنظیم می‌کنیم
        if (product.boxCount !== undefined && product.boxCount > 0) {
          setBoxCount(product.boxCount);
        } else {
          setBoxCount(null);
        }
      } else {
        // در حالت افزودن، مقادیر پیش‌فرض را تنظیم می‌کنیم
        // setQuantity("1");
        // setDisplayQuantity("۱");
        setNote(product.note || "");
        setManualCalculation(product.manualCalculation || false);
        setBoxCount(null);
      }

      // پارس کردن مقدار موجودی قابل تعهد
      if (product.propertyValue) {
        const stockValue = parseFloat(product.propertyValue);
        if (!isNaN(stockValue)) {
          setAvailableStock(stockValue);
        } else {
          setAvailableStock(0);
        }
      } else {
        setAvailableStock(0);
      }

      // پارس کردن مقدار رکتیفای
      if (product.rectifiedValue) {
        const rectValue = parseFloat(product.rectifiedValue);
        if (!isNaN(rectValue) && rectValue > 0) {
          setRectifiedValue(rectValue);
        }
      }

      console.log(
        "Rectified Value:",
        product.rectifiedValue,
        "Parsed:",
        rectifiedValue
      );
    }
  }, [product, visible, isEditing]);

  useEffect(() => {
    return () => {};
  }, []);

  useEffect(() => {
    if (visible) {
      slideAnimation.setValue(0);
      backdropOpacity.setValue(0);

      Animated.parallel([
        Animated.timing(slideAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnimation, backdropOpacity]);

  const showToast = (
    message: string,
    type: "success" | "error" | "warning" | "info" = "error"
  ) => {
    if (onError) {
      onError(message, type);
    } else {
      setToastMessage(message);
      setToastType(type);
      setToastVisible(true);

      setTimeout(() => {
        setToastVisible(false);
      }, 3000);
    }
  };

  const [unsavedChangesModalVisible, setUnsavedChangesModalVisible] =
    useState<boolean>(false);

  const closeDrawer = () => {
    if (
      product &&
      (quantity !== product.quantity ||
        note !== product.note ||
        manualCalculation !== (product.manualCalculation || false))
    ) {
      setUnsavedChangesModalVisible(true);
    } else {
      performClose();
    }
  };

  const performClose = () => {
    Animated.parallel([
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease),
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const validateInput = (): boolean => {
    if (!quantity || quantity.trim() === "") {
      showToast("لطفاً مقدار را وارد کنید", "warning");
      return false;
    }

    const qtyNum = parseFloat(quantity);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      showToast("لطفاً مقدار معتبر وارد کنید", "error");
      return false;
    }

    // چک کردن مقدار درخواستی با موجودی قابل تعهد
    // در حالت ویرایش، اگر مقدار بیشتر از قبل نشده باشد، این چک را نادیده می‌گیریم
    if (!isEditing && qtyNum > availableStock) {
      showToast(
        `مقدار وارد شده بیشتر از موجودی قابل تعهد (${toPersianDigits(
          availableStock.toString()
        )}) است`,
        "error"
      );
      return false;
    } else if (isEditing && product && qtyNum > availableStock) {
      // در حالت ویرایش، فقط اگر مقدار جدید از مقدار قبلی و موجودی بیشتر باشد خطا می‌دهیم
      const oldQty = parseFloat(product.quantity || "0");
      if (qtyNum > oldQty && qtyNum > availableStock + oldQty) {
        showToast(
          `مقدار وارد شده بیشتر از موجودی قابل تعهد (با احتساب سفارش فعلی) است`,
          "error"
        );
        return false;
      }
    }

    return true;
  };

  const calculateBoxCount = (amount: number): number => {
    // اگر محصول دارای ویژگی رکتیفای باشد، آن را استفاده می‌کنیم
    if (product && product.rectifiedValue) {
      try {
        const rectValue = parseFloat(product.rectifiedValue);
        if (!isNaN(rectValue) && rectValue > 0) {
          // مقدار را بر اساس مقدار رکتیفای محاسبه می‌کنیم (تعداد متر مربع در هر کارتن)
          return Math.ceil(amount / rectValue);
        } else {
          // اگر مقدار رکتیفای معتبر نباشد، از مقدار پیش‌فرض استفاده می‌کنیم
          return Math.ceil(amount / rectifiedValue);
        }
      } catch (error) {
        console.error("Error calculating box count:", error);
        return Math.ceil(amount / rectifiedValue); // مقدار پیش‌فرض در صورت خطا
      }
    }

    // اگر ویژگی مشخص نباشد، از مقدار پیش‌فرض استفاده می‌کنیم
    return Math.ceil(amount / rectifiedValue);
  };

  const handleCalculate = () => {
    if (!product) return;

    if (!validateInput()) {
      return;
    }

    setIsCalculating(true);

    setTimeout(() => {
      const qtyNum = parseFloat(quantity);
      if (!isNaN(qtyNum)) {
        const boxes = calculateBoxCount(qtyNum);
        setBoxCount(boxes);
      }

      setIsCalculating(false);
      // showToast("محاسبه با موفقیت انجام شد", "success");
    }, 800);
  };

  const handleSave = () => {
    if (!product) return;

    if (!validateInput()) {
      return;
    }

    // اگر کاربر محاسبه نکرده باشد، محاسبه کنید
    let currentBoxCount = boxCount;
    if (currentBoxCount === null) {
      const qtyNum = parseFloat(quantity);
      if (!isNaN(qtyNum)) {
        currentBoxCount = calculateBoxCount(qtyNum);
      }
    }

    // محاسبه متراژ کل
    let totalArea = null;
    if (currentBoxCount && product.rectifiedValue) {
      const rectValue = parseFloat(product.rectifiedValue);
      if (!isNaN(rectValue)) {
        totalArea = currentBoxCount * rectValue;
      }
    }

    // اطلاعات محاسبه شده را در محصول ذخیره می‌کنیم
    const updatedProduct = {
      ...product,
      quantity: quantity,
      note: note,
      manualCalculation: manualCalculation,
      boxCount: currentBoxCount,
      totalArea: totalArea,
    };

    console.log("Saving product with isEditing:", isEditing);
    console.log("Updated product:", updatedProduct);

    const saveSuccessful = onSave(
      updatedProduct,
      quantity,
      note,
      manualCalculation,
      currentBoxCount || undefined
    );

    if (saveSuccessful) {
      performClose();
    }
  };

  const handleQuantityChange = (text: string) => {
    const cleanedText = text.replace(/[^0-9.]/g, "");
    setDisplayQuantity(toPersianDigits(cleanedText));
    setQuantity(toEnglishDigits(cleanedText));

    // هر بار که مقدار تغییر می‌کند، boxCount را ریست کنید
    setBoxCount(null);
  };

  const copyProductCode = () => {
    if (product && product.code) {
      Clipboard.setString(product.code);
      showToast("کد محصول کپی شد", "success");
    }
  };

  const animatedStyle = {
    transform: [
      {
        translateY: slideAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [height, 0],
        }),
      },
    ],
  };

  const backdropStyle = {
    opacity: backdropOpacity,
  };

  if (!product || !visible) return null;

  const displayStockQuantity = product.propertyValue
    ? toPersianDigits(product.propertyValue)
    : "نامشخص";
  const displayRectifiedValue = product.rectifiedValue
    ? toPersianDigits(product.rectifiedValue)
    : "۱.۴۴";

  const buttonAreaHeight = 100;

  return (
    <>
      <UnsavedChangesModal
        visible={unsavedChangesModalVisible}
        onClose={() => setUnsavedChangesModalVisible(false)}
        onConfirm={() => {
          setUnsavedChangesModalVisible(false);
          performClose();
        }}
      />

      <Modal
        visible={visible}
        transparent={true}
        animationType="none"
        onRequestClose={closeDrawer}
        statusBarTranslucent={true}
        presentationStyle="overFullScreen" // افزودن این ویژگی برای iOS
      >
        <Toast
          visible={toastVisible}
          message={toastMessage}
          type={toastType}
          onDismiss={() => setToastVisible(false)}
        />

        <View style={styles.modalContainer}>
          <Animated.View style={[styles.backdrop, backdropStyle]}>
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
            enabled={Platform.OS === "ios"}
          >
            <Animated.View
              style={[
                styles.drawerContainer,
                animatedStyle,
                {
                  height: Platform.OS === "ios" ? height * 0.8 : "80%", // بازگشت به ارتفاع 80%
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
                  <Text style={styles.headerTitle}>
                    {isEditing
                      ? "ویرایش محصول در سفارش"
                      : "افزودن محصول به سفارش"}
                  </Text>
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
                  <View style={styles.productContainer}>
                    <AppText style={styles.productTitle}>
                      {product.title}
                    </AppText>
                    <View style={styles.divider}></View>

                    {product.code ? (
                      <TouchableOpacity
                        onPress={copyProductCode}
                        style={styles.copyableProperty}
                      >
                        <View style={styles.properties}>
                          <AppText style={styles.propertyLabel}>
                            کد محصول:
                          </AppText>
                          <View style={styles.codeContainer}>
                            <AppText>{toPersianDigits(product.code)}</AppText>
                            <MaterialIcons
                              name="content-copy"
                              size={18}
                              color={colors.medium}
                              style={{ marginRight: 5 }}
                            />
                          </View>
                        </View>
                      </TouchableOpacity>
                    ) : null}

                    {product.price ? (
                      <View style={styles.properties}>
                        <AppText style={styles.propertyLabel}>قیمت:</AppText>
                        <AppText>
                          {toPersianDigits(product.price.toLocaleString())} ریال
                        </AppText>
                      </View>
                    ) : null}

                    <View style={[styles.properties, styles.stockProperty]}>
                      <AppText style={styles.propertyLabel}>
                        موجودی قابل تعهد:
                      </AppText>
                      <AppText style={styles.stockValue}>
                        {toPersianDigits(availableStock.toString())}{" "}
                        {product.measurementUnitName || ""}
                      </AppText>
                    </View>

                    {/* <View style={styles.properties}>
                      <AppText style={styles.propertyLabel}>
                        متراژ هر کارتن:
                      </AppText>
                      <AppText>
                        {displayRectifiedValue} {product.measurementUnitName || ""}
                      </AppText>
                    </View> */}
                  </View>

                  <View style={styles.inputsContainer}>
                    <AppTextInput
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="number-pad"
                      icon="straighten"
                      placeholder={
                        product.measurementUnitName
                          ? `مقدار سفارش (${product.measurementUnitName})`
                          : "مقدار سفارش"
                      }
                      value={displayQuantity}
                      onChangeText={handleQuantityChange}
                    />

                    <Checkbox
                      label="محاسبه به صورت دستی انجام شود"
                      checked={manualCalculation}
                      onPress={() => setManualCalculation(!manualCalculation)}
                    />

                    <AppButton
                      title={isCalculating ? "در حال محاسبه..." : "محاسبه کن"}
                      onPress={handleCalculate}
                      color="secondary"
                      disabled={isCalculating}
                    />

                    {/* نمایش اطلاعات تعداد کارتن - تغییر یافته */}
                    {boxCount !== null && (
                      <View style={styles.boxCountContainer}>
                        <View style={styles.boxCountTextContainer}>
                          <View style={styles.calculationRow}>
                            <View style={styles.labelContainer}>
                              <MaterialIcons
                                name="shopping-bag"
                                size={20}
                                color={colors.secondary}
                              />
                              <Text style={styles.calculationLabel}>
                                تعداد کارتن:
                              </Text>
                            </View>
                            <Text style={styles.calculationValue}>
                              {toPersianDigits(boxCount.toString())} عدد
                            </Text>
                          </View>

                          {product.rectifiedValue && (
                            <View style={styles.calculationRow}>
                              <View style={styles.labelContainer}>
                                <MaterialIcons
                                  name="calculate"
                                  size={20}
                                  color={colors.secondary}
                                />
                                <Text style={styles.calculationLabel}>
                                  متراژ کل:
                                </Text>
                              </View>
                              <Text style={styles.calculationValue}>
                                {toPersianDigits(
                                  (
                                    boxCount *
                                    parseFloat(product.rectifiedValue || "1.44")
                                  ).toFixed(2)
                                )}{" "}
                                {product.measurementUnitName || ""}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    )}
                  </View>

                  <AppTextInput
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="default"
                    icon="text-snippet"
                    placeholder="توضیحات"
                    value={note}
                    onChangeText={setNote}
                    multiline
                    numberOfLines={5}
                    height={150}
                    textAlign="right"
                    isLargeInput={true}
                  />

                  <View style={{ height: buttonAreaHeight }} />
                </ScrollView>

                <View style={styles.buttonContainer}>
                  <AppButton
                    title={isEditing ? "ذخیره تغییرات" : "ثبت کالا"}
                    onPress={handleSave}
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
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    zIndex: 9999, // 使用较高的zIndex确保它覆盖其他元素
  },
  keyboardAvoidingContainer: {
    flex: 1,
    justifyContent: "flex-end",
    zIndex: 10000, // zIndex بزرگتر از modalContainer
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 9998,
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
    zIndex: 10000, // افزایش zIndex به عدد بزرگتر
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        zIndex: 10001, // مقدار بالاتر برای iOS
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
  stockProperty: {
    marginTop: 5,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: colors.light,
  },
  stockValue: {
    fontFamily: "Yekan_Bakh_Bold",
    color: colors.success,
  },
  boxCountContainer: {
    backgroundColor: colors.light,
    padding: 15,
    borderRadius: 10,
    marginTop: 15, // فاصله بیشتر از دکمه محاسبه کن
  },
  boxCountTextContainer: {
    width: "100%",
  },
  calculationRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between", // برای قرار دادن مقدار در سمت چپ
    marginVertical: 5,
  },
  labelContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  calculationLabel: {
    fontFamily: "Yekan_Bakh_Bold",
    fontSize: 16,
    color: colors.secondary,
    marginRight: 8,
  },
  calculationValue: {
    fontFamily: "Yekan_Bakh_Bold",
    fontSize: 16,
    color: colors.dark,
    textAlign: "left",
  },
});

export default ProductPropertiesDrawer;
