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
  KeyboardAvoidingView,
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
import axios from "axios";
import appConfig from "../../../config";

const API_BASE_URL = appConfig.mobileApi;
const { height } = Dimensions.get("window");

// Z-Index constants for better layering
const Z_INDEX = {
  MODAL_BACKDROP: 9999,
  MODAL_CONTENT: 10000,
  MODAL_HEADER: 10001,
  MODAL_BUTTONS: 10002,
  TOAST: 10100,
} as const;

interface APIProduct {
  ProductId: number;
  ProductName: string;
  SKU: string;
  Price: number;
  Active: boolean;
  ActiveStr: string;
  Quantity?: string;
  ProductMeasurementUnitName?: string;
  Inventory: number;
}

interface ProductSearchDrawerProps {
  visible: boolean;
  onClose: () => void;
  onProductSelect: (product: Product) => void;
  searchProduct: (
    query: string,
    page?: number,
    pageSize?: number
  ) => Promise<{
    items: APIProduct[];
    totalCount: number;
    hasMore: boolean;
  }>;
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
  const [keyboardOpen, setKeyboardOpen] = useState<boolean>(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMoreData, setHasMoreData] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);

  const pageSize = 20;
  const currentQuery = useRef<string>("");

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
      resetSearchState();
    }
  }, [visible]);

  const resetSearchState = () => {
    setSearchQuery("");
    setDisplaySearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
    setCurrentPage(1);
    setHasMoreData(false);
    setLoadingMore(false);
    setTotalCount(0);
    currentQuery.current = "";
  };

  // Monitor keyboard visibility
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => {
        setKeyboardOpen(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardOpen(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    if (visible) {
      slideAnimation.setValue(0);
      setTimeout(() => {
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
      }, 0);
    }
  }, [visible, slideAnimation, backdropOpacity]);

  const closeDrawer = () => {
    Keyboard.dismiss();
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
      resetSearchState();
    });
  };

  const handleTextChange = (text: string) => {
    setDisplaySearchQuery(toPersianDigits(text));
    setSearchQuery(text);
  };

  const handleSearch = async (isNewSearch: boolean = true) => {
    const query = searchQuery.trim();

    if (query.length < 3) {
      if (query.length > 0) {
        showToast("لطفاً حداقل ۳ کاراکتر وارد کنید", "warning");
      }
      return;
    }

    if (isNewSearch) {
      setSearching(true);
      setCurrentPage(1);
      setSearchResults([]);
      setHasMoreData(false);
      currentQuery.current = query;
    } else {
      setLoadingMore(true);
    }

    try {
      const englishQuery = toEnglishDigits(query);
      const page = isNewSearch ? 1 : currentPage;

      const result = await searchProduct(englishQuery, page, pageSize);

      if (result && result.items) {
        if (isNewSearch) {
          setSearchResults(result.items);
          setHasSearched(true);
          setTotalCount(result.totalCount || 0);
        } else {
          // Remove duplicates when adding new items
          setSearchResults((prevResults) => {
            const existingIds = new Set(
              prevResults.map((item) => item.ProductId)
            );
            const newUniqueItems = result.items.filter(
              (item) => !existingIds.has(item.ProductId)
            );
            return [...prevResults, ...newUniqueItems];
          });
        }

        setHasMoreData(result.hasMore || false);

        if (isNewSearch && result.items.length === 0) {
          showToast("محصولی با این مشخصات یافت نشد", "info");
        }
      } else {
        if (isNewSearch) {
          setSearchResults([]);
          setHasSearched(true);
          setTotalCount(0);
          showToast("محصولی با این مشخصات یافت نشد", "info");
        }
        setHasMoreData(false);
      }
    } catch (error) {
      showToast("خطا در جستجوی محصول", "error");
      console.log(error);
      setHasMoreData(false);
    } finally {
      if (isNewSearch) {
        setSearching(false);
      } else {
        setLoadingMore(false);
      }
    }

    Keyboard.dismiss();
  };

  const loadMoreThrottleRef = useRef<boolean>(false);

  const handleLoadMore = () => {
    if (
      loadMoreThrottleRef.current ||
      !hasMoreData ||
      loadingMore ||
      searching
    ) {
      return;
    }

    if (searchQuery.trim() === currentQuery.current) {
      loadMoreThrottleRef.current = true;

      setCurrentPage((prevPage) => {
        const nextPage = prevPage + 1;
        // Call handleSearch with the next page
        setTimeout(() => {
          handleSearch(false);
          // Reset throttle after a delay
          setTimeout(() => {
            loadMoreThrottleRef.current = false;
          }, 1000);
        }, 100);
        return nextPage;
      });
    }
  };

  const handleClearSearch = () => {
    resetSearchState();
  };

  const handleProductSelect = (item: APIProduct) => {
    // برای جستجو، نیاز داریم درخواست کامل را برای دریافت Product_ProductPropertyValue_List و موجودی ارسال کنیم
    const fetchCompleteProductData = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}Product/Get?id=${item.ProductId}`
        );

        let propertyValue = null;
        let rectifiedValue = null;
        let inventory = null;

        // دریافت مقدار رکتیفای از پاسخ API
        if (
          response.data &&
          response.data.Product_ProductPropertyValue_List &&
          response.data.Product_ProductPropertyValue_List.length > 0
        ) {
          // جستجو برای یافتن ویژگی رکتیفای
          const rectifiedProperty =
            response.data.Product_ProductPropertyValue_List.find(
              (prop: any) => prop.ProductPropertyName === "رکتیفای"
            );

          if (rectifiedProperty) {
            rectifiedValue = rectifiedProperty.Value;
            console.log("مقدار رکتیفای یافت شد:", rectifiedValue);
          } else {
            console.log(
              "ویژگی رکتیفای یافت نشد. استفاده از مقدار پیش‌فرض 1.44"
            );
            rectifiedValue = "1.44"; // مقدار پیش‌فرض اگر ویژگی رکتیفای یافت نشد
          }

          // برای سازگاری با کد قبلی، مقدار اولین ویژگی را هم ذخیره می‌کنیم
          propertyValue =
            response.data.Product_ProductPropertyValue_List[0].Value;
        } else {
          console.log(
            "هیچ ویژگی برای محصول یافت نشد. استفاده از مقدار پیش‌فرض 1.44"
          );
          rectifiedValue = "1.44"; // مقدار پیش‌فرض اگر هیچ ویژگی یافت نشد
        }

        // دریافت موجودی از پاسخ API
        if (response.data && response.data.Inventory !== undefined) {
          inventory = response.data.Inventory.toString();
          console.log("موجودی قابل تعهد یافت شد:", inventory);
        } else {
          console.log("موجودی قابل تعهد یافت نشد");
        }

        const product: Product = {
          id: item.ProductId,
          title: item.ProductName,
          code: item.SKU,
          quantity: item.Quantity || "1",
          price: item.Price !== null ? item.Price : 0,
          hasColorSpectrum: false,
          measurementUnitName:
            item.ProductMeasurementUnitName ||
            response.data?.MeasurementUnit?.MeasurementUnitName,
          propertyValue: inventory, // موجودی به عنوان مقدار اصلی
          rectifiedValue: rectifiedValue, // مقدار رکتیفای برای محاسبه تعداد کارتن
        };

        console.log("محصول ارسال شده به ProductPropertiesDrawer:", product);

        onProductSelect(product);
        closeDrawer();
      } catch (error) {
        console.error("Error fetching complete product data:", error);
        // در صورت خطا، بدون propertyValue ادامه می‌دهیم
        const product: Product = {
          id: item.ProductId,
          title: item.ProductName,
          code: item.SKU,
          quantity: item.Quantity || "1",
          price: item.Price !== null ? item.Price : 0,
          hasColorSpectrum: false,
          measurementUnitName: item.ProductMeasurementUnitName,
          rectifiedValue: "1.44", // مقدار پیش‌فرض در صورت خطا
        };

        onProductSelect(product);
        closeDrawer();
      }
    };

    fetchCompleteProductData();
  };

  const renderProductItem = React.useMemo(() =>
    ({ item, index }: ListRenderItemInfo<APIProduct>) => (
      <View style={styles.productItemWrapper}>
        <ProductCard
          key={`product-${item.ProductId}-${index}`}
          title={toPersianDigits(item.ProductName)}
          onPress={() => handleProductSelect(item)}
          showNotes={false}
          fields={[
            {
              icon: "qr-code",
              iconColor: colors.secondary,
              label: "کد:",
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

          ]}
          qrConfig={{
            show: true,
            icon: "image",
            iconSize: 36,
            iconColor: colors.secondary,
          }}
          containerStyle={styles.productCard}
        />
      </View>
    ), [colors]
  );

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  };

  const renderResultsHeader = () => {
    if (!hasSearched || searchResults.length === 0) return null;
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

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={closeDrawer}
      statusBarTranslucent={true}
      supportedOrientations={["portrait"]}
      presentationStyle="overFullScreen"
      hardwareAccelerated={true}
    >
      <View style={styles.modalContainer}>
        <Toast
          visible={toastVisible}
          message={toastMessage}
          type={toastType}
          onDismiss={() => setToastVisible(false)}
        />

        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <TouchableOpacity
            style={styles.backdropTouchable}
            activeOpacity={1}
            onPress={closeDrawer}
          />
        </Animated.View>

        <Animated.View style={[styles.drawerContainer, animatedStyle]}>
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
              <View
                style={[
                  styles.searchInputWrapper,
                  Platform.OS === "android" && keyboardOpen && { height: 56 },
                ]}
              >
                <View style={styles.textInputContainer}>
                  <TextInput
                    autoFocus={true}
                    style={[
                      styles.searchInput,
                      Platform.OS === "android" &&
                        keyboardOpen && { height: 40 },
                    ]}
                    placeholder="جستجوی نام یا کد محصول"
                    placeholderTextColor="#999"
                    value={displaySearchQuery}
                    onChangeText={handleTextChange}
                    textAlign="right"
                    allowFontScaling={false}
                    autoCapitalize="none"
                    autoCorrect={false}
                    onSubmitEditing={() => handleSearch(true)}
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
                  onPress={() => handleSearch(true)}
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
              <>
                {renderResultsHeader()}
                <FlatList
                  data={searchResults}
                  keyExtractor={(item, index) => `${item.ProductId}-${index}`}
                  renderItem={renderProductItem}
                  contentContainerStyle={styles.listContainer}
                  showsVerticalScrollIndicator={true}
                  keyboardShouldPersistTaps="handled"
                  onEndReached={handleLoadMore}
                  onEndReachedThreshold={0.3}
                  ListFooterComponent={renderFooter}
                  removeClippedSubviews={true}
                  maxToRenderPerBatch={10}
                  windowSize={10}
                  initialNumToRender={10}
                  getItemLayout={undefined}
                  style={styles.flatList}
                />
              </>
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
    zIndex: Z_INDEX.MODAL_BACKDROP,
    elevation: Platform.OS === "android" ? Z_INDEX.MODAL_BACKDROP / 100 : 0,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: Z_INDEX.MODAL_BACKDROP,
    elevation: Platform.OS === "android" ? Z_INDEX.MODAL_BACKDROP / 100 : 0,
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
    elevation: Platform.OS === 'android' ? Z_INDEX.MODAL_CONTENT / 100 : 16,
    height: height * 0.85,
    minHeight: height * 0.7,
    maxHeight: height * 0.9,
    paddingBottom: Platform.OS === "android" ? 20 : 0,
    zIndex: Z_INDEX.MODAL_CONTENT,
    position: "relative",
  },
  header: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    height: 65,
    zIndex: Z_INDEX.MODAL_HEADER,
    elevation: Platform.OS === "android" ? Z_INDEX.MODAL_HEADER / 100 : 0,
    position: "relative",
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
    zIndex: Z_INDEX.MODAL_BUTTONS,
    elevation: Platform.OS === "android" ? Z_INDEX.MODAL_BUTTONS / 100 : 0,
  },
  body: {
    padding: 16,
    flex: 1,
    zIndex: Z_INDEX.MODAL_CONTENT,
    elevation: Platform.OS === "android" ? Z_INDEX.MODAL_CONTENT / 100 : 0,
    position: "relative",
  },
  searchContainer: {
    marginBottom: 16,
    zIndex: Z_INDEX.MODAL_BUTTONS,
    elevation: Platform.OS === "android" ? Z_INDEX.MODAL_BUTTONS / 100 : 0,
    position: "relative",
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
    elevation: Platform.OS === "android" ? 5 : 1,
    height: 56,
    zIndex: Z_INDEX.MODAL_BUTTONS,
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
    height: Platform.OS === "android" ? 40 : 44,
    textAlign: "right",
    minHeight: 40,
  },
  clearButton: {
    padding: 5,
    zIndex: Z_INDEX.MODAL_BUTTONS,
    elevation: Platform.OS === "android" ? Z_INDEX.MODAL_BUTTONS / 100 : 0,
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
    zIndex: Z_INDEX.MODAL_BUTTONS,
    elevation: Platform.OS === "android" ? Z_INDEX.MODAL_BUTTONS / 100 : 0,
  },
  flatList: {
    flex: 1,
    zIndex: 1,
    elevation: Platform.OS === "android" ? 1 : 0,
  },
  productItemWrapper: {
    zIndex: 1,
    elevation: Platform.OS === "android" ? 1 : 0,
    position: "relative",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    zIndex: 1,
    elevation: Platform.OS === "android" ? 1 : 0,
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
    zIndex: 1,
    elevation: Platform.OS === "android" ? 1 : 0,
  },
  productCard: {
    marginBottom: 10,
    zIndex: 1,
    elevation: Platform.OS === "android" ? 2 : 0,
    position: "relative",
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
  resultsHeader: {
    backgroundColor: colors.light,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.primary + "20",
  },
  resultsText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: colors.primary,
    textAlign: "center",
  },
  moreResultsText: {
    fontSize: 12,
    fontFamily: "Yekan_Bakh_Regular",
    color: colors.medium,
    textAlign: "center",
    marginTop: 4,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    marginTop: 10,
    marginHorizontal: 5,
    zIndex: 1,
    elevation: Platform.OS === "android" ? 1 : 0,
  },
  footerLoaderText: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: colors.medium,
  },
});

export default ProductSearchDrawer;
