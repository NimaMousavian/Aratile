import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Animated,
  Dimensions,
  Keyboard,
  Platform,
  ActivityIndicator,
  Easing
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import colors from "../../../config/colors";
import PersonService from "./api/PersonService";
import { toPersianDigits, toEnglishDigits, NumberConverterInput } from "../../../utils/numberConversions";

// تعریف تایپ‌های مورد نیاز
export interface Colleague {
  id: string;
  name: string;
  phone: string;
  groups?: string[];
  introducingCode?: string;
}

interface ColleagueBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectColleague: (colleague: Colleague) => void;
  title?: string; // افزودن prop جدید برای تغییر عنوان
}

const { height } = Dimensions.get("window");

/**
 * کامپوننت دراپ داون باتم شیت برای انتخاب همکار
 */
const ColleagueBottomSheet: React.FC<ColleagueBottomSheetProps> = ({
  visible,
  onClose,
  onSelectColleague,
  title = "انتخاب شخص معرف" // مقدار پیش‌فرض برای عنوان
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [colleagues, setColleagues] = useState<Colleague[]>([]);
  const [filteredColleagues, setFilteredColleagues] = useState<Colleague[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const loadingAnimation = useRef(new Animated.Value(0)).current;

  // انیمیشن باتم شیت
  const translateY = useRef(new Animated.Value(height)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // مدیریت نمایش و مخفی کردن باتم شیت
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // بارگیری داده‌ها زمانی که باتم شیت باز می‌شود
      resetAndFetch();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: height,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // انیمیشن لودینگ
  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(loadingAnimation, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(loadingAnimation, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ])
      ).start();
    } else {
      loadingAnimation.setValue(0);
    }
  }, [loading, loadingAnimation]);

  // مدیریت کیبورد در iOS
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      e => setKeyboardHeight(e.endCoordinates.height)
    );
    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardHeight(0)
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  // ریست کردن داده‌ها و شروع مجدد
  const resetAndFetch = () => {
    setColleagues([]);
    setFilteredColleagues([]);
    setCurrentPage(1);
    setHasMore(true);
    fetchColleagues("", 1, true);
  };

  // دریافت اطلاعات همکاران از API
  const fetchColleagues = async (searchTerm = "", page = 1, isReset = false) => {
    if (page === 1) {
      setLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const response = await PersonService.searchPersonByMobileOrFullName(searchTerm, page);

      const { Items, TotalPages, TotalCount } = response;
      setTotalPages(TotalPages);
      setHasMore(page < TotalPages);

      console.log(`تعداد کل آیتم‌ها: ${toPersianDigits(TotalCount)}, صفحه: ${toPersianDigits(page)}/${toPersianDigits(TotalPages)}`);

      // تبدیل داده‌های دریافتی به فرمت مورد نیاز
      const transformedData: Colleague[] = Items.map(item => ({
        id: item.PersonId.toString(),
        name: toPersianDigits(item.FullName), // Convert any numbers in names to Persian
        phone: toPersianDigits(item.Mobile) || "",
        groups: item.PersonGroupsStr ? item.PersonGroupsStr.split("، ") : [],
        introducingCode: item.IntroducingCode ? toPersianDigits(item.IntroducingCode) : ""
      }));

      // حذف آیتم‌های تکراری با استفاده از Map
      const uniqueItems = Array.from(
        new Map(transformedData.map(item => [item.id, item])).values()
      );

      console.log(`تعداد آیتم‌های یکتا: ${toPersianDigits(uniqueItems.length)}`);

      // اگر صفحه اول است یا ریست شده، جایگزین شود. در غیر این صورت به اطلاعات موجود اضافه شود
      if (page === 1 || isReset) {
        setColleagues(uniqueItems);
        setFilteredColleagues(uniqueItems);
      } else {
        // اضافه کردن آیتم‌های جدید و حذف تکراری‌ها
        const newItems = [...colleagues, ...uniqueItems];
        const uniqueNewItems = Array.from(
          new Map(newItems.map(item => [item.id, item])).values()
        );

        setColleagues(uniqueNewItems);
        setFilteredColleagues(uniqueNewItems);
      }

      setCurrentPage(page);
    } catch (error) {
      console.error("خطا در دریافت اطلاعات همکاران:", error);
      setHasMore(false);
    } finally {
      if (page === 1) {
        setLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  };

  // جستجو بر اساس عبارت وارد شده
  const handleSearch = () => {
    const trimmedQuery = searchQuery.trim();
    setCurrentPage(1);
    setHasMore(true);
    fetchColleagues(trimmedQuery, 1, true);

    // اسکرول به بالای لیست
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  };

  // بارگذاری صفحات بیشتر در هنگام اسکرول
  const handleLoadMore = () => {
    if (!loading && !isLoadingMore && hasMore) {
      const nextPage = currentPage + 1;
      console.log(`بارگذاری صفحه بعدی: ${toPersianDigits(nextPage)}`);
      fetchColleagues(searchQuery.trim(), nextPage);
    }
  };

  // انتخاب همکار از لیست
  const handleSelectColleague = (colleague: Colleague): void => {
    onSelectColleague({
      ...colleague,
      phone: toPersianDigits(colleague.phone),
      introducingCode: colleague.introducingCode ? toPersianDigits(colleague.introducingCode) : ""
    });
    onClose();
  };

  // پاک کردن عبارت جستجو
  const handleClearSearch = () => {
    setSearchQuery("");
    resetAndFetch();
  };

  // نمایش فوتر لیست با وضعیت بارگذاری
  const renderFooter = () => {
    if (isLoadingMore) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      );
    }

    return null;
  };

  // انیمیشن پالس برای لودینگ
  const pulseAnimation = {
    opacity: loadingAnimation,
    transform: [
      {
        scale: loadingAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0.95, 1.05],
        }),
      },
    ],
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.backdrop,
          { opacity: backdropOpacity }
        ]}
      >
        <TouchableOpacity
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={onClose}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.bottomSheet,
          {
            transform: [{ translateY }],
            paddingBottom: keyboardHeight > 0 ? keyboardHeight : 20,
            height: filteredColleagues.length > 4 ? "80%" : "auto",
          }
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
              name="person-search"
              size={24}
              color="white"
            />
            <Text style={styles.headerTitle}>{title}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={28} color="white" />
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.body}>
          <View style={styles.searchContainer}>
            <NumberConverterInput
              style={styles.searchInput}
              placeholder="نام یا شماره تماس را وارد کنید"
              value={searchQuery}
              onChangeText={(value) => setSearchQuery(value)}
              convertTo="persian"
              onSubmitEditing={handleSearch}
              textAlign="right"
              placeholderTextColor={colors.medium}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
                <MaterialIcons name="close" size={20} color={colors.medium} />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
              <MaterialIcons name="search" size={20} color={colors.medium} />
            </TouchableOpacity>
          </View>

          {/* لیست نتایج */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color={colors.secondary}
                style={styles.spinner}
              />
            </View>
          ) : filteredColleagues.length > 0 ? (
            <FlatList
              ref={flatListRef}
              showsVerticalScrollIndicator={false}
              data={filteredColleagues}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              style={styles.resultList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.resultItem}
                  onPress={() => handleSelectColleague(item)}
                >
                  <View style={styles.resultItemContent}>
                    <View style={styles.nameSection}>
                      <Text style={styles.resultName}>{toPersianDigits(item.name)}</Text>
                      <View style={styles.groupContainer}>
                        <MaterialIcons name="person" size={18} color="#bfbfbf" style={styles.personIcon} />
                        {item.groups && item.groups.length > 0
                          // && item.groups[0] !== "-"
                          && (
                            <Text style={styles.resultGroups}>
                              {toPersianDigits(item.groups[0])}
                            </Text>
                          )}
                      </View>
                    </View>
                    <View style={styles.phoneSection}>
                      <MaterialIcons name="smartphone" size={18} color="#bfbfbf" style={styles.phoneIcon} />
                      <Text style={styles.resultPhone}>{toPersianDigits(item.phone)}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.5}
              ListFooterComponent={renderFooter}
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={10}
            />
          ) : (
            <View style={styles.noResultsContainer}>
              <MaterialIcons name="search-off" size={48} color={colors.medium} />
              <Text style={styles.noResultsText}>نتیجه‌ای یافت نشد</Text>
            </View>
          )}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  bottomSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: "auto",
    maxHeight: "80%",
    minHeight: "60%",
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
  headerTitle: {
    fontSize: 18,
    color: colors.white,
    marginRight: 8,
    fontFamily: "Yekan_Bakh_Bold",
  },
  closeButton: {
    padding: 8,
    position: "absolute",
    left: 5,
  },
  body: {
    padding: 16,
    flex: 1,
    minHeight: 300,
  },
  searchContainer: {
    flexDirection: "row-reverse",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.dark,
    fontFamily: "Yekan_Bakh_Regular",
    textAlign: "right",
    paddingVertical: 4,
    borderWidth: 0,
  },
  searchIcon: {
    marginLeft: 8,
  },
  searchButton: {
    marginLeft: 8,
    padding: 4,
  },
  clearButton: {
    padding: 4,
  },
  resultList: {
    flex: 1,
    minHeight: 300,
  },
  resultItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  resultItemContent: {
    flex: 1,
  },
  nameSection: {
    marginBottom: 4,
  },
  resultName: {
    fontSize: 19,
    color: colors.dark,
    fontFamily: "Yekan_Bakh_Bold",
    textAlign: "right",
  },
  groupContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginTop: 3,
  },
  resultGroups: {
    fontSize: 15,
    color: colors.medium,
    fontFamily: "Yekan_Bakh_Regular",
    textAlign: "right",
    marginRight: 4,
  },
  personIcon: {
    marginTop: 0,
  },
  phoneSection: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  resultPhone: {
    fontSize: 15,
    color: colors.medium,
    fontFamily: "Yekan_Bakh_Regular",
    textAlign: "right",
    marginRight: 4,
    marginTop: 4,
  },
  phoneIcon: {
    marginTop: 0,
  },
  noResultsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 16,
    color: colors.medium,
    marginTop: 12,
    fontFamily: "Yekan_Bakh_Regular",
  },
  loaderContainer: {
    paddingVertical: 20,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  loadingMoreText: {
    fontSize: 14,
    color: colors.medium,
    marginLeft: 8,
    fontFamily: "Yekan_Bakh_Regular",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    minHeight: 250,
    borderRadius: 8,
    margin: 20,
    flex: 1,
  },
  spinner: {
    transform: [{ scale: 1.5 }],
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 18,
    color: colors.secondary,
    marginTop: 12,
    fontFamily: "Yekan_Bakh_Regular",
    textAlign: "center",
  },
});

export default ColleagueBottomSheet;