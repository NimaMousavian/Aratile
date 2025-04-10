import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Animated,
  Dimensions,
  FlatList,
  Keyboard,
  Modal,
  ActivityIndicator,
  Easing,
  Platform,
  TextInput,
  ListRenderItemInfo,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Feather } from "@expo/vector-icons";
import colors from "../../config/colors";
import ProductCard from "../../components/ProductCard";
import Toast from "../../components/Toast";
import {
  toPersianDigits,
  toEnglishDigits,
} from "../../utils/numberConversions";
import { Product } from "./IssuingNewInvoice";

const { height } = Dimensions.get("window");

interface APIProduct {
  ProductId: number;
  ProductName: string;
  SKU: string;
  Price: number;
  Active: boolean;
  ActiveStr: string;
  Quantity?: string;
}

interface ProductSearchDrawerProps {
  visible: boolean;
  onClose: () => void;
  onProductSelect: (product: Product) => void;
  searchProduct: (query: string) => Promise<APIProduct[]>;
  onError?: (
    message: string,
    type: "success" | "error" | "warning" | "info"
  ) => void;
}

const ProductSearchDrawer: React.FC<ProductSearchDrawerProps> = ({
  visible,
  onClose,
  onProductSelect,
  searchProduct,
  onError,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [displaySearchQuery, setDisplaySearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<APIProduct[]>([]);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [searching, setSearching] = useState<boolean>(false);
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);

  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<
    "success" | "error" | "warning" | "info"
  >("error");

  const slideAnimation = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

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

  useEffect(() => {
    if (visible) {
      setSearchQuery("");
      setDisplaySearchQuery("");
      setSearchResults([]);
      setHasSearched(false);
    }
  }, [visible]);

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardHeight(0)
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  useEffect(() => {
    if (visible) {
      slideAnimation.setValue(0);
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

  const closeDrawer = () => {
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
      setSearchQuery("");
      setDisplaySearchQuery("");
      setSearchResults([]);
      setHasSearched(false);
    });
  };

  const handleTextChange = (text: string) => {
    setDisplaySearchQuery(toPersianDigits(text));
    setSearchQuery(text);
  };

  const handleSearch = async () => {
    if (searchQuery.trim().length >= 3) {
      setSearching(true);

      try {
        const englishQuery = toEnglishDigits(searchQuery);
        const results = await searchProduct(englishQuery);

        setSearchResults(results || []);
        setHasSearched(true);

        if (!results || results.length === 0) {
          showToast("محصولی با این مشخصات یافت نشد", "info");
        }
      } catch (error) {
        showToast("خطا در جستجوی محصول", "error");
      } finally {
        setSearching(false);
      }

      Keyboard.dismiss();
    } else if (searchQuery.trim().length > 0) {
      showToast("لطفاً حداقل ۳ کاراکتر وارد کنید", "warning");
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setDisplaySearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
  };

  const handleProductSelect = (item: APIProduct) => {
    const product: Product = {
      id: item.ProductId,
      title: item.ProductName,
      code: item.SKU,
      quantity: item.Quantity || "1",
      price: item.Price !== null ? item.Price : 0,
      hasColorSpectrum: false,
      note: "",
    };

    onProductSelect(product);
    // Close the search drawer immediately after selection
    closeDrawer();
  };

  const renderProductItem = ({ item }: ListRenderItemInfo<APIProduct>) => (
    <ProductCard
      title={toPersianDigits(item.ProductName)}
      onPress={() => handleProductSelect(item)}
      fields={[
        {
          icon: "qr-code",
          iconColor: colors.secondary,
          label: "کد محصول:",
          value: toPersianDigits(item.SKU),
        },
        {
          icon: "attach-money",
          iconColor: colors.secondary,
          label: "قیمت:",
          value:
            item.Price !== null
              ? toPersianDigits(item.Price.toLocaleString()) + " ریال"
              : "0 ریال",
        },
        {
          icon: "check-circle",
          iconColor: colors.secondary,
          label: "وضعیت:",
          value: item.ActiveStr,
          valueColor: item.Active ? colors.success : colors.danger,
        },
      ]}
      qrConfig={{
        show: true,
        icon: "qr-code-2",
        iconSize: 36,
        iconColor: colors.secondary,
      }}
      containerStyle={styles.productCard}
    />
  );

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

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={closeDrawer}
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

        <Animated.View
          style={[
            styles.drawerContainer,
            animatedStyle,
            {
              paddingBottom: keyboardHeight > 0 ? keyboardHeight : 20,
              height: "80%",
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
              <MaterialIcons
                name="search"
                size={24}
                color="white"
                style={styles.headerIcon}
              />
              <Text style={styles.headerTitle}>جستجوی محصول</Text>
            </View>
            <TouchableOpacity onPress={closeDrawer} style={styles.closeButton}>
              <MaterialIcons
                name="close"
                size={32}
                color="white"
                style={{ marginLeft: -4 }}
              />
            </TouchableOpacity>
          </LinearGradient>

          <View style={styles.body}>
            <View style={styles.searchContainer}>
              <View style={styles.searchInputWrapper}>
                <View style={styles.textInputContainer}>
                  <TextInput
                    autoFocus={true}
                    style={styles.searchInput}
                    placeholder="جستجوی نام یا کد محصول"
                    placeholderTextColor="#999"
                    value={displaySearchQuery}
                    onChangeText={handleTextChange}
                    textAlign="right"
                    allowFontScaling={false}
                    autoCapitalize="none"
                    autoCorrect={false}
                    onSubmitEditing={handleSearch}
                  />

                  <TouchableOpacity
                    onPress={handleClearSearch}
                    style={styles.clearButton}
                  >
                    {searchQuery ? (
                      <Feather name="x" size={20} color="#999" />
                    ) : null}
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.searchButton}
                  onPress={handleSearch}
                >
                  <Feather name="search" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            {searching ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>در حال جستجو...</Text>
              </View>
            ) : searchResults.length > 0 ? (
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.ProductId.toString()}
                renderItem={renderProductItem}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={true}
              />
            ) : (
              <View style={styles.centerContainer}>
                <Text style={styles.emptyResultText}>
                  {hasSearched
                    ? "محصولی با این مشخصات یافت نشد"
                    : "برای یافتن محصول، عبارت جستجو را وارد کنید و دکمه جستجو را فشار دهید"}
                </Text>
                {hasSearched && searchQuery.length > 0 && (
                  <View style={styles.searchTipsContainer}>
                    <Text style={styles.searchTipsTitle}>راهنمای جستجو:</Text>
                    <Text style={styles.searchTipText}>
                      - نام محصول را به صورت کامل وارد کنید
                    </Text>
                    <Text style={styles.searchTipText}>
                      - کد محصول را به صورت دقیق وارد کنید
                    </Text>
                    <Text style={styles.searchTipText}>
                      - از کلمات کلیدی استفاده کنید
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    zIndex: 1000,
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
  headerIcon: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    fontSize: 18,
    color: colors.white,
    marginRight: 8,
    fontFamily: "Yekan_Bakh_Bold",
  },
  closeButton: {
    padding: 0,
  },
  body: {
    padding: 16,
    flex: 1,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInputWrapper: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  textInputContainer: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    fontFamily: "Yekan_Bakh_Regular",
    fontSize: 14,
    padding: 8,
    height: 40,
    textAlign: "right",
  },
  clearButton: {
    padding: 5,
  },
  searchButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    width: 40,
    height: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: colors.medium,
  },
  emptyResultText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: colors.medium,
    textAlign: "center",
    marginTop: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  productCard: {
    marginBottom: 10,
  },
  searchTipsContainer: {
    marginTop: 20,
    alignItems: "center",
    width: "100%",
    padding: 10,
  },
  searchTipsTitle: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: colors.secondary,
    marginBottom: 8,
  },
  searchTipText: {
    fontSize: 13,
    fontFamily: "Yekan_Bakh_Regular",
    color: colors.medium,
    marginBottom: 4,
    textAlign: "center",
  },
});

export default ProductSearchDrawer;
