import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Animated,
  Dimensions,
  Keyboard,
  Platform,
  ActivityIndicator,
  Easing,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import colors from "../../config/colors";
import PersonService from "./api/PersonService";
import {
  toPersianDigits,
  toEnglishDigits,
} from "../../utils/numberConversions";
import SearchInput from "../../components/SearchInput";
import AppButton from "../../components/Button";
import { useNavigation } from "@react-navigation/native";
import { AppNavigationProp } from "../../StackNavigator";

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
  title?: string;
  pageSize?: number;
  isCustomer?: boolean;
}

const { height } = Dimensions.get("window");

const DEFAULT_PAGE_SIZE = 20;

const ColleagueBottomSheet: React.FC<ColleagueBottomSheetProps> = ({
  visible,
  onClose,
  onSelectColleague,
  title = "انتخاب شخص معرف",
  pageSize = DEFAULT_PAGE_SIZE,
  isCustomer = false,
}) => {
  const navigation = useNavigation<AppNavigationProp>();

  const [searchQuery, setSearchQuery] = useState("");
  const [colleagues, setColleagues] = useState<Colleague[]>([]);
  const [filteredColleagues, setFilteredColleagues] = useState<Colleague[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const loadingAnimation = useRef(new Animated.Value(0)).current;

  const translateY = useRef(new Animated.Value(height)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

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

      setSearchQuery("");

      setColleagues([]);
      setFilteredColleagues([]);
      setCurrentPage(1);
      setHasMore(true);
      setLoading(false);
      setSearchPerformed(false);
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

  const convertToEnglishNumbers = (text: string) => {
    return toEnglishDigits(text);
  };

  const handleSearch = () => {
    // بستن کیبورد
    Keyboard.dismiss();

    const trimmedQuery = searchQuery.trim();
    const englishQuery = convertToEnglishNumbers(trimmedQuery);

    setCurrentPage(1);
    setHasMore(true);
    setSearchPerformed(true);
    fetchColleagues(englishQuery, 1, true);

    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  };

  const fetchColleagues = async (
    searchTerm = "",
    page = 1,
    isReset = false
  ) => {
    if (page === 1) {
      setLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const response = await PersonService.searchPersonByMobileOrFullName(
        searchTerm,
        page,
        pageSize
      );

      const { Items, TotalPages, TotalCount } = response;
      setTotalPages(TotalPages);
      setHasMore(page < TotalPages);

      console.log(
        `تعداد کل آیتم‌ها: ${toPersianDigits(
          TotalCount
        )}, صفحه: ${toPersianDigits(page)}/${toPersianDigits(
          TotalPages
        )}, تعداد در هر صفحه: ${toPersianDigits(pageSize)}`
      );

      const transformedData: Colleague[] = Items.map((item) => ({
        id: item.PersonId.toString(),
        name: toPersianDigits(item.FullName),
        phone: toPersianDigits(item.Mobile) || "",
        groups: item.PersonGroupsStr ? item.PersonGroupsStr.split("، ") : [],
        introducingCode: item.IntroducingCode
          ? toPersianDigits(item.IntroducingCode)
          : "",
      }));

      const uniqueItems = Array.from(
        new Map(transformedData.map((item) => [item.id, item])).values()
      );

      console.log(
        `تعداد آیتم‌های یکتا: ${toPersianDigits(uniqueItems.length)}`
      );

      if (page === 1 || isReset) {
        setColleagues(uniqueItems);
        setFilteredColleagues(uniqueItems);
      } else {
        const newItems = [...colleagues, ...uniqueItems];
        const uniqueNewItems = Array.from(
          new Map(newItems.map((item) => [item.id, item])).values()
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

  const handleLoadMore = () => {
    if (!loading && !isLoadingMore && hasMore) {
      const nextPage = currentPage + 1;
      console.log(`بارگذاری صفحه بعدی: ${toPersianDigits(nextPage)}`);
      const englishQuery = convertToEnglishNumbers(searchQuery.trim());
      fetchColleagues(englishQuery, nextPage);
    }
  };

  const handleSelectColleague = (colleague: Colleague): void => {
    onSelectColleague({
      ...colleague,
      phone: toPersianDigits(colleague.phone),
      introducingCode: colleague.introducingCode
        ? toPersianDigits(colleague.introducingCode)
        : "",
    });
    onClose();
  };

  const handleChangeText = (text: string) => {
    const persianText = toPersianDigits(text);
    setSearchQuery(persianText);
  };

  const renderFooter = () => {
    if (isLoadingMore) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />

        </View>
      );
    }

    return null;
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
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
              <MaterialIcons name="person-search" size={24} color="white" />
              <Text style={styles.headerTitle}>{title}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={28} color="white" />
            </TouchableOpacity>
          </LinearGradient>

          <View style={styles.body}>
            <SearchInput
              placeholder="نام یا شماره تماس را وارد کنید"
              value={searchQuery}
              onChangeText={handleChangeText}
              onSearch={handleSearch}
              containerStyle={styles.searchContainer}
            />

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator
                  size="large"
                  color={colors.secondary}
                  style={styles.spinner}
                />
                <Text style={styles.loadingText}>در حال بارگذاری...</Text>
              </View>
            ) : filteredColleagues.length > 0 ? (
              <FlatList
                ref={flatListRef}
                showsVerticalScrollIndicator={false}
                data={filteredColleagues}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                style={styles.resultList}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    key={`colleague-${item.id}-${index}`}
                    style={styles.resultItem}
                    onPress={() => handleSelectColleague(item)}
                  >
                    <View style={styles.resultItemContent}>
                      <View style={styles.nameSection}>
                        <Text style={styles.resultName}>
                          {toPersianDigits(item.name)}
                        </Text>
                        <View style={styles.groupContainer}>
                          <MaterialIcons
                            name="person"
                            size={18}
                            color="#bfbfbf"
                            style={styles.personIcon}
                          />
                          {item.groups && item.groups.length > 0 && (
                            <Text style={styles.resultGroups}>
                              {toPersianDigits(item.groups[0])}
                            </Text>
                          )}
                        </View>
                      </View>
                      <View style={styles.phoneSection}>
                        <MaterialIcons
                          name="smartphone"
                          size={18}
                          color="#bfbfbf"
                          style={styles.phoneIcon}
                        />
                        <Text style={styles.resultPhone}>
                          {toPersianDigits(item.phone)}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
                initialNumToRender={pageSize}
                maxToRenderPerBatch={pageSize / 2}
                windowSize={10}
              />
            ) : searchPerformed ? (
              <View style={styles.noResultsContainer}>
                <MaterialIcons
                  name="search-off"
                  size={48}
                  color={colors.medium}
                />
                <Text style={styles.noResultsText}>نتیجه‌ای یافت نشد</Text>
                {isCustomer && (
                  <AppButton
                    title="ثبت خریدار جدید"
                    onPress={() => navigation.navigate("CustomerInfo", {})}
                    color="success"
                    style={{ width: "100%", marginTop: 15 }}
                  />
                )}
              </View>
            ) : (
              <View style={styles.initialStateContainer}>
                <Text style={styles.initialStateText}>
                  برای جستجو، عبارت مورد نظر را وارد کنید و دکمه جستجو را بزنید
                </Text>
              </View>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
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
  bottomSheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: "80%",
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
  },
  searchContainer: {
    marginBottom: 16,
    width: "100%",
  },
  resultList: {
    flex: 1,
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
  initialStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    flex: 1,
  },
  initialStateText: {
    fontSize: 16,
    color: colors.medium,
    fontFamily: "Yekan_Bakh_Regular",
    textAlign: "center",
    paddingHorizontal: 20,
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
    marginRight: 8,
    fontFamily: "Yekan_Bakh_Regular",
    textAlign: "center",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
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