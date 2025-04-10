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
    manualCalculation: boolean
  ) => boolean;
  onError?: (
    message: string,
    type: "success" | "error" | "warning" | "info"
  ) => void;
}

const ProductPropertiesDrawer: React.FC<ProductPropertiesDrawerProps> = ({
  visible,
  onClose,
  product,
  onSave,
  onError,
}) => {
  const [quantity, setQuantity] = useState<string>("1");
  const [displayQuantity, setDisplayQuantity] = useState<string>("۱");
  const [note, setNote] = useState<string>("");
  const [manualCalculation, setManualCalculation] = useState<boolean>(false);
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<
    "success" | "error" | "warning" | "info"
  >("error");

  const slideAnimation = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const defaultQuantity = "5000";

  useEffect(() => {
    if (product && visible) {
      setQuantity("");
      setDisplayQuantity("");
      setNote(product.note || "");
      setManualCalculation(product.manualCalculation || false);
    }
  }, [product, visible]);

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

    return true;
  };

  const handleCalculate = () => {
    if (!product) return;

    if (!validateInput()) {
      return;
    }

    setIsCalculating(true);

    setTimeout(() => {
      setIsCalculating(false);
      showToast("محاسبه با موفقیت انجام شد", "success");
    }, 1000);
  };

  const handleSave = () => {
    if (!product) return;

    if (!validateInput()) {
      return;
    }

    const saveSuccessful = onSave(product, quantity, note, manualCalculation);

    if (saveSuccessful) {
      performClose();
    }
  };

  const handleQuantityChange = (text: string) => {
    const cleanedText = text.replace(/[^0-9.]/g, "");
    setDisplayQuantity(toPersianDigits(cleanedText));
    setQuantity(toEnglishDigits(cleanedText));
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

  const displayStockQuantity = toPersianDigits(defaultQuantity);

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
            enabled={false}
          >
            <Animated.View
              style={[
                styles.drawerContainer,
                animatedStyle,
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
                  <Text style={styles.headerTitle}>مشخصات محصول</Text>
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

                    <View style={styles.properties}>
                      <AppText style={styles.propertyLabel}>
                        موجودی قابل تعهد:
                      </AppText>
                      <AppText>{displayStockQuantity}</AppText>
                    </View>

                    <View style={styles.properties}>
                      <AppText style={styles.propertyLabel}>طیف:</AppText>
                      <AppText>
                        {product.hasColorSpectrum ? "دارد" : "ندارد"}
                      </AppText>
                    </View>

                    {product.price ? (
                      <View style={styles.properties}>
                        <AppText style={styles.propertyLabel}>قیمت:</AppText>
                        <AppText>
                          {toPersianDigits(product.price.toLocaleString())} ریال
                        </AppText>
                      </View>
                    ) : null}

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
                  </View>

                  <View style={styles.inputsContainer}>
                    <AppTextInput
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="number-pad"
                      icon="straighten"
                      placeholder="تعداد سفارش خریدار (متر مربع)"
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
                    title="ثبت کالا"
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

export default ProductPropertiesDrawer;
