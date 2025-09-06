import React, { useState, useEffect } from "react";
import appConfig from "../../config";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Platform,
  ViewStyle,
  Linking,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import colors from "../config/colors";
import ScreenHeader from "../components/ScreenHeader";
import SearchInput from "../components/SearchInput";
import { DatePickerField } from "../components/PersianDatePicker";
import { useNavigation } from "@react-navigation/native";
import { AppNavigationProp } from "../StackNavigator";
import AppButton from "../components/Button";
import ColleagueBottomSheet, {
  Colleague,
} from "./IssuingNewInvoice/ColleagueSearchModal";
import AppText from "../components/Text";
import axios from "axios";
import Toast from "../components/Toast";
import { useAuth } from "../screens/AuthContext";

type FontWeight = "700" | "600" | "500" | "bold" | "semi-bold" | string;
type StatusType = "صادر شده" | "ارجاع از صندوق" | "پیش فاکتور" | "لغو شده";

interface InvoiceApiResponse {
  Items: InvoiceItem[];
  Page: number;
  PageSize: number;
  TotalCount: number;
  TotalPages: number;
}

interface InvoiceItem {
  InvoiceId: number;
  PersonId: number;
  PersonFullName: string;
  PersonMobile: string;
  ApplicationUserId: number;
  ApplicationUserName: string;
  InvoiceDate: string;
  ShamsiInvoiceDate: string;
  PaymentType: number;
  State: number;
  TotalAmount: number;
  Description: string;
  InsertDate: string;
}

interface InvoiceCountItem {
  State: number;
  StateName: string;
  InvoiceCount: number;
}

const paymentTypeMap: Record<number, string> = {
  1: "نقدی",
  2: "اعتباری",
  3: "چک",
};

const stateMap: Record<number, StatusType> = {
  1: "پیش فاکتور",
  2: "صادر شده",
  3: "ارجاع از صندوق",
  4: "لغو شده",
};

interface InspectionItem {
  id: string;
  buyerName: string;
  buyerPhone: string;
  invoiceNumber: string;
  date: string;
  sellerName: string;
  sellerPhone: string;
  description?: string;
  status?: StatusType;
  amount?: number;
  applicationUserId: number;
}

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

// تابع کاملاً امن برای تبدیل اعداد انگلیسی به فارسی
const toPersianDigits = (input: any): string => {
  // بررسی کامل همه حالات ممکن
  if (input === null || input === undefined) {
    return "";
  }

  if (input === 0) {
    return "۰";
  }

  if (input === "") {
    return "";
  }

  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

  try {
    // تبدیل به string به صورت امن
    let stringValue = "";

    if (typeof input === 'number') {
      if (isNaN(input) || !isFinite(input)) {
        return "";
      }
      stringValue = input.toString();
    } else if (typeof input === 'string') {
      stringValue = input;
    } else if (typeof input === 'boolean') {
      stringValue = input.toString();
    } else {
      // برای سایر انواع، سعی کن تبدیل کن
      try {
        stringValue = String(input);
      } catch (e) {
        return "";
      }
    }

    // تبدیل اعداد انگلیسی به فارسی
    return stringValue.replace(/[0-9]/g, (digit) => {
      const digitIndex = parseInt(digit);
      return persianDigits[digitIndex] || digit;
    });

  } catch (error) {
    console.error("Error in toPersianDigits:", error, "Input:", input);
    return "";
  }
};

// تابع امن برای فرمت کردن ارز
const formatCurrency = (amount: any): string => {
  if (amount === null || amount === undefined) {
    return "۰";
  }

  let numericAmount = 0;

  if (typeof amount === 'string') {
    numericAmount = parseFloat(amount);
  } else if (typeof amount === 'number') {
    numericAmount = amount;
  } else {
    return "۰";
  }

  if (isNaN(numericAmount) || !isFinite(numericAmount)) {
    return "۰";
  }

  try {
    const formattedAmount = Math.floor(numericAmount)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return toPersianDigits(formattedAmount);
  } catch (error) {
    console.error("Error in formatCurrency:", error, "Input:", amount);
    return "۰";
  }
};

interface Person {
  name: string;
  phone: string;
}

interface PurchaseInfoCardProps {
  headerTitle?: string;
  headerIcon?: keyof typeof MaterialIcons.glyphMap;
  buyer?: Person;
  seller?: Person;
  invoiceNumber?: string;
  date?: string;
  address?: string;
  note?: string;
  amount?: number;
  gradientColors?: string[];
  containerStyle?: ViewStyle;
  status?: StatusType;
  onPress?: () => void;
  isCurrentUserSeller?: boolean;
}

const PurchaseInfoCard: React.FC<PurchaseInfoCardProps> = ({
  headerTitle = "اطلاعات خرید",
  headerIcon = "receipt",
  buyer = { name: "", phone: "" },
  seller = { name: "", phone: "" },
  invoiceNumber = "",
  date = "",
  address = "",
  note = "",
  amount = 0,
  gradientColors = [colors.secondary, colors.primary],
  containerStyle,
  status,
  onPress,
  isCurrentUserSeller = false,
}) => {
  const handlePhoneCall = (phoneNumber: string): void => {
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  const getStatusColor = (): string => {
    switch (status) {
      case "صادر شده":
        return colors.success || "#4CAF50";
      case "ارجاع از صندوق":
        return colors.warning || "#FFA500";
      case "پیش فاکتور":
        return colors.info || "#3498db";
      case "لغو شده":
        return colors.danger || "#FF0000";
      default:
        return colors.medium || "#9e9e9e";
    }
  };

  // بررسی و تمیز کردن مقادیر قبل از نمایش
  const safeInvoiceNumber = invoiceNumber || "0";
  const safeBuyerName = buyer?.name || "نامشخص";
  const safeSellerName = seller?.name || "نامشخص";
  const safeDate = date || "";
  const safeNote = note || "";
  const safeAmount = typeof amount === 'number' ? amount : 0;
  const safeBuyerPhone = buyer?.phone || "";
  const safeSellerPhone = seller?.phone || "";

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={{ marginHorizontal: 10 }}
    >
      <View
        style={[
          styles.purchaseCard,
          Platform.OS === "android" && styles.androidCardAdjustment,
          containerStyle,
        ]}
      >
        <LinearGradient
          colors={gradientColors}
          style={styles.purchaseHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.headerTitleContainer}>
            <MaterialIcons
              name={headerIcon}
              size={22}
              color={colors.white || "#fff"}
            />
            <Text style={styles.purchaseHeaderText}>
              {isCurrentUserSeller
                ? `فاکتور ${toPersianDigits(safeInvoiceNumber)}`
                : headerTitle}
            </Text>
          </View>

          {status && (
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor() },
              ]}
            >
              <Text style={styles.statusText}>{status}</Text>
            </View>
          )}
        </LinearGradient>

        <View style={styles.purchaseContent}>
          <View style={styles.purchaseRow}>
            <View style={styles.purchaseItem}>
              <MaterialIcons name="person" size={18} color={colors.blueIcon} />
              <View style={styles.purchaseTextContainer}>
                <Text style={styles.secondaryLabel}>
                  {isCurrentUserSeller ? "خریدار:" : "خریدار:"}
                </Text>
                <Text style={styles.secondaryValue}>
                  {safeBuyerName}
                </Text>
              </View>
            </View>
            {safeBuyerPhone && (
              <TouchableOpacity
                style={styles.callButtonCircle}
                onPress={() => handlePhoneCall(safeBuyerPhone)}
              >
                <MaterialIcons
                  name="call"
                  size={21}
                  color={colors.success || "#4CAF50"}
                />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.divider} />

          {safeDate && (
            <>
              <View style={styles.purchaseRow}>
                <View style={styles.purchaseItem}>
                  <MaterialIcons
                    name="event"
                    size={18}
                    color={colors.greenIcon}
                  />
                  <View style={styles.purchaseTextContainer}>
                    <Text style={styles.secondaryLabel}>تاریخ:</Text>
                    <Text style={styles.secondaryValue}>
                      {toPersianDigits(safeDate)}
                    </Text>
                  </View>
                </View>
              </View>
            </>
          )}

          {!isCurrentUserSeller && (
            <>
              <View style={styles.divider} />
              <View style={styles.purchaseRow}>
                <View style={styles.purchaseItem}>
                  <MaterialIcons
                    name="store"
                    size={18}
                    color={colors.secondary || "#6c5ce7"}
                  />
                  <View style={styles.purchaseTextContainer}>
                    <Text style={styles.secondaryLabel}>فروشنده:</Text>
                    <Text style={styles.secondaryValue}>{safeSellerName}</Text>
                  </View>
                </View>
                {safeSellerPhone && (
                  <TouchableOpacity
                    style={styles.callButtonCircle}
                    onPress={() => handlePhoneCall(safeSellerPhone)}
                  >
                    <MaterialIcons
                      name="call"
                      size={25}
                      color={colors.success || "#4CAF50"}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}

          {safeAmount > 0 && (
            <>
              <View style={styles.divider} />
              <View style={styles.purchaseRow}>
                <View style={styles.purchaseItem}>
                  <MaterialIcons
                    name="attach-money"
                    size={18}
                    color={colors.orangeIcon}
                  />
                  <View style={styles.purchaseTextContainer}>
                    <Text style={styles.secondaryLabel}>مبلغ کل:</Text>
                    <Text style={styles.secondaryValue}>
                      {formatCurrency(safeAmount)} ریال
                    </Text>
                  </View>
                </View>
              </View>
            </>
          )}

          {address && (
            <>
              <View style={styles.divider} />
              <View style={styles.addressContainer}>
                <MaterialIcons
                  name="location-on"
                  size={18}
                  color={colors.secondary || "#6c5ce7"}
                />
                <View style={styles.purchaseTextContainer}>
                  <Text style={styles.secondaryLabel}>آدرس:</Text>
                  <Text style={styles.addressValue}>{address}</Text>
                </View>
              </View>
            </>
          )}

          {safeNote && safeNote.trim() !== "" && (
            <>
              <View style={styles.divider} />
              <View style={styles.noteContainer}>
                <MaterialIcons
                  name="error-outline"
                  size={18}
                  color={colors.secondary || "#6c5ce7"}
                />
                <View style={styles.noteTextContainer}>
                  <Text style={styles.noteLabel}>توضیحات:</Text>
                  <Text style={styles.noteContent}>{safeNote}</Text>
                </View>
              </View>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const IssuedInvoices: React.FC = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const { user } = useAuth();

  const [items, setItems] = useState<InspectionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [statusCounts, setStatusCounts] = useState<Record<number, number>>({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
  });

  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const [isColleagueBottomSheetVisible, setIsColleagueBottomSheetVisible] =
    useState<boolean>(false);
  const [selectedColleague, setSelectedColleague] = useState<Colleague>();
  const [filterParams, setFilterParams] = useState<any>();

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

  const isCurrentUserSeller = (applicationUserId: number) => {
    return user?.UserId === applicationUserId;
  };

  useEffect(() => {
    fetchInvoices();
    fetchInvoiceCounts();
  }, [currentPage]);

  const fetchInvoiceCounts = async () => {
    try {
      const response = await fetch(
        `${appConfig.mobileApi}Invoice/GetCount?filterApplicationUserId=${user?.UserId || 0
        }`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data: InvoiceCountItem[] = await response.json();

      const countsRecord: Record<number, number> = {};
      if (Array.isArray(data)) {
        data.forEach((item) => {
          if (item && typeof item.State === 'number' && typeof item.InvoiceCount === 'number') {
            countsRecord[item.State] = item.InvoiceCount;
          }
        });
      }

      setStatusCounts(countsRecord);
    } catch (error) {
      console.error("Error fetching invoice counts:", error);
    }
  };

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${appConfig.mobileApi}Invoice/GetAll?filterApplicationUserId=${user?.UserId || 0
        }&page=${currentPage}&pageSize=20`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data: InvoiceApiResponse = await response.json();

      // بررسی دقیق‌تر و امن‌تر داده‌ها
      if (!data) {
        console.warn('No data received from API');
        setItems([]);
        return;
      }

      // بررسی که Items موجود و آرایه باشد
      if (!data.Items || !Array.isArray(data.Items)) {
        console.warn('Invalid Items array in API response');
        setItems([]);
        return;
      }

      const mappedItems: InspectionItem[] = data.Items
        .filter((item): item is InvoiceItem => {
          // فیلتر قوی‌تر برای حذف موارد نامعتبر
          return item &&
            typeof item === 'object' &&
            item.InvoiceId !== null &&
            item.InvoiceId !== undefined &&
            typeof item.InvoiceId === 'number';
        })
        .map((item, index) => {
          try {
            return {
              id: String(item.InvoiceId),
              buyerName: (item.PersonFullName && typeof item.PersonFullName === 'string')
                ? item.PersonFullName.trim() || "نامشخص"
                : "نامشخص",
              buyerPhone: (item.PersonMobile && typeof item.PersonMobile === 'string')
                ? item.PersonMobile.trim()
                : "",
              invoiceNumber: String(item.InvoiceId),
              date: (item.ShamsiInvoiceDate && typeof item.ShamsiInvoiceDate === 'string')
                ? item.ShamsiInvoiceDate
                : "",
              sellerName: (item.ApplicationUserName && typeof item.ApplicationUserName === 'string')
                ? item.ApplicationUserName.trim() || "نامشخص"
                : "نامشخص",
              sellerPhone: "",
              description: (item.Description && typeof item.Description === 'string')
                ? item.Description
                : "",
              status: (item.State && typeof item.State === 'number' && stateMap[item.State])
                ? stateMap[item.State]
                : "صادر شده",
              amount: (item.TotalAmount && typeof item.TotalAmount === 'number')
                ? item.TotalAmount
                : 0,
              applicationUserId: (item.ApplicationUserId && typeof item.ApplicationUserId === 'number')
                ? item.ApplicationUserId
                : 0,
            };
          } catch (mappingError) {
            console.error(`Error mapping item at index ${index}:`, mappingError);
            // برگرداندن یک آیتم پیش‌فرض در صورت خطا
            return {
              id: `error_${index}_${Date.now()}`,
              buyerName: "خطا در دریافت اطلاعات",
              buyerPhone: "",
              invoiceNumber: "0",
              date: "",
              sellerName: "نامشخص",
              sellerPhone: "",
              description: "",
              status: "صادر شده" as StatusType,
              amount: 0,
              applicationUserId: 0,
            };
          }
        });

      setItems(mappedItems);

    } catch (error) {
      console.error("Error fetching invoices:", error);
      setItems([]);
      showToast("خطا در دریافت اطلاعات فاکتورها", "error");
    } finally {
      setLoading(false);
    }
  };

  const getInvoicesWithFilter = async () => {
    setLoading(true);
    try {
      console.log("filterParams:", filterParams);

      let queryString = `filterApplicationUserId=${user?.UserId || 0}`;

      if (filterParams) {
        if (filterParams.filterPersonId) {
          queryString += `&filterPersonId=${encodeURIComponent(
            filterParams.filterPersonId
          )}`;
        }
        if (filterParams.filterInvoiceDateFrom) {
          queryString += `&filterInvoiceDateFrom=${encodeURIComponent(
            filterParams.filterInvoiceDateFrom
          )}`;
        }
        if (filterParams.filterInvoiceDateTo) {
          queryString += `&filterInvoiceDateTo=${encodeURIComponent(
            filterParams.filterInvoiceDateTo
          )}`;
        }
      }

      queryString += "&page=1&pageSize=1000";

      console.log("Query String:", queryString);

      const response = await axios.get(
        `${appConfig.mobileApi}Invoice/GetAll?${queryString}`
      );

      const data = response.data;
      console.log("datas", data);

      if (response.status === 200) {
        // بررسی امن‌تر داده‌های فیلتر شده
        if (!data) {
          setItems([]);
          return;
        }

        if (!data.Items || !Array.isArray(data.Items)) {
          setItems([]);
          return;
        }

        if (data.Items.length === 0) {
          setItems([]);
          return;
        }

        const mappedItems: InspectionItem[] = data.Items
          .filter((item: any): item is InvoiceItem => {
            return item &&
              typeof item === 'object' &&
              item.InvoiceId !== null &&
              item.InvoiceId !== undefined;
          })
          .map((item: any, index: number) => {
            try {
              return {
                id: item?.InvoiceId ? String(item.InvoiceId) : `unknown_${index}_${Date.now()}`,
                buyerName: (item?.PersonFullName && typeof item.PersonFullName === 'string')
                  ? item.PersonFullName.trim() || "مشتری"
                  : "مشتری",
                buyerPhone: (item?.PersonMobile && typeof item.PersonMobile === 'string')
                  ? item.PersonMobile.trim()
                  : "",
                invoiceNumber: item?.InvoiceId ? String(item.InvoiceId) : "0",
                date: (item?.ShamsiInvoiceDate && typeof item.ShamsiInvoiceDate === 'string')
                  ? item.ShamsiInvoiceDate
                  : "",
                sellerName: (item?.ApplicationUserName && typeof item.ApplicationUserName === 'string')
                  ? item.ApplicationUserName.trim() || "نامشخص"
                  : "نامشخص",
                sellerPhone: "",
                description: (item?.Description && typeof item.Description === 'string')
                  ? item.Description
                  : "",
                status: (item?.State && typeof item.State === 'number' && stateMap[item.State])
                  ? stateMap[item.State]
                  : "صادر شده" as StatusType,
                amount: (item?.TotalAmount && typeof item.TotalAmount === 'number')
                  ? item.TotalAmount
                  : 0,
                applicationUserId: (item?.ApplicationUserId && typeof item.ApplicationUserId === 'number')
                  ? item.ApplicationUserId
                  : 0,
              };
            } catch (error) {
              console.error(`Error mapping filtered item ${index}:`, error);
              return {
                id: `error_${index}_${Date.now()}`,
                buyerName: "خطا در دریافت اطلاعات",
                buyerPhone: "",
                invoiceNumber: "0",
                date: "",
                sellerName: "نامشخص",
                sellerPhone: "",
                description: "",
                status: "صادر شده" as StatusType,
                amount: 0,
                applicationUserId: 0,
              };
            }
          });

        setItems(mappedItems);
      }
    } catch (error) {
      console.log(error);
      showToast("خطا در دریافت اطلاعات فاکتور ها", "error");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const getInvoiceCountWithFilter = async () => {
    try {
      let queryString = `filterApplicationUserId=${user?.UserId || 0}`;

      if (filterParams) {
        if (filterParams.filterPersonId) {
          queryString += `&filterPersonId=${encodeURIComponent(
            filterParams.filterPersonId
          )}`;
        }
        if (filterParams.filterInvoiceDateFrom) {
          queryString += `&filterInvoiceDateFrom=${encodeURIComponent(
            filterParams.filterInvoiceDateFrom
          )}`;
        }
        if (filterParams.filterInvoiceDateTo) {
          queryString += `&filterInvoiceDateTo=${encodeURIComponent(
            filterParams.filterInvoiceDateTo
          )}`;
        }
      }
      console.log("Query String:", queryString);

      const response = await axios.get(
        `${appConfig.mobileApi}Invoice/GetCount?${queryString}`
      );

      if (response.status !== 200) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data: InvoiceCountItem[] = response.data;
      console.log("data", data);

      const countsRecord: Record<number, number> = {};
      if (Array.isArray(data)) {
        data.forEach((item) => {
          if (item && typeof item.State === 'number' && typeof item.InvoiceCount === 'number') {
            countsRecord[item.State] = item.InvoiceCount;
          }
        });
      }

      setStatusCounts(countsRecord);
    } catch (error) {
      console.error("Error fetching invoice counts:", error);
      showToast("خطا در دریافت اطلاعات فاکتور ها", "error");
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    fetchInvoices();
    fetchInvoiceCounts();
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages && !loading) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleSearch = () => {
    fetchInvoices();
  };

  const getFilteredItems = () => {
    // بررسی امن آرایه
    if (!Array.isArray(items)) {
      return [];
    }

    let filtered = items;

    if (activeTab === "issued") {
      filtered = items.filter((item) => item && item.status === "صادر شده");
    } else if (activeTab === "referred") {
      filtered = items.filter((item) => item && item.status === "ارجاع از صندوق");
    } else if (activeTab === "quote") {
      filtered = items.filter((item) => item && item.status === "پیش فاکتور");
    } else if (activeTab === "canceled") {
      filtered = items.filter((item) => item && item.status === "لغو شده");
    }

    if (searchText && searchText.trim() !== "") {
      filtered = filtered.filter((item) => {
        if (!item) return false;

        const searchLower = searchText.toLowerCase();
        return (
          (item.buyerName && item.buyerName.toLowerCase().includes(searchLower)) ||
          (item.sellerName && item.sellerName.toLowerCase().includes(searchLower)) ||
          (item.invoiceNumber && item.invoiceNumber.includes(searchText))
        );
      });
    }

    return filtered;
  };

  // تابع کاملاً امن برای گرفتن تعداد بر اساس وضعیت
  const getCountByStatus = (status: StatusType | null): number => {
    try {
      if (status === null) {
        const counts = Object.values(statusCounts || {});
        return counts.reduce((sum, count) => {
          const safeCount = (typeof count === 'number' && !isNaN(count)) ? count : 0;
          return sum + safeCount;
        }, 0);
      }

      const stateNumber = Object.entries(stateMap).find(
        ([_, stateName]) => stateName === status
      )?.[0];

      if (!stateNumber) return 0;

      const count = statusCounts[Number(stateNumber)];
      return (typeof count === 'number' && !isNaN(count)) ? count : 0;

    } catch (error) {
      console.error("Error in getCountByStatus:", error, "Status:", status);
      return 0;
    }
  };

  const getColorsByStatus = (status?: StatusType): string[] => {
    switch (status) {
      case "صادر شده":
        return ["#4CAF50", "#2E7D32"];
      case "ارجاع از صندوق":
        return ["#FFA726", "#EF6C00"];
      case "پیش فاکتور":
        return ["#42A5F5", "#1565C0"];
      case "لغو شده":
        return ["#EF5350", "#C62828"];
      default:
        return ["#9E9E9E", "#616161"];
    }
  };

  const renderItem = ({ item, index }: { item: InspectionItem; index: number }) => {
    try {
      // بررسی اولیه که item موجود است
      if (!item || !item.id) {
        console.warn(`Item at index ${index} is null or undefined`);
        return (
          <View style={{ padding: 10, margin: 5, backgroundColor: '#ffcccc' }}>
            <Text>خطا در نمایش فاکتور</Text>
          </View>
        );
      }

      const isSeller = isCurrentUserSeller(item.applicationUserId || 0);

      // بررسی مقادیر قبل از ارسال به کامپوننت
      const safeItem = {
        ...item,
        buyerName: item.buyerName || "نامشخص",
        sellerName: item.sellerName || "نامشخص",
        invoiceNumber: item.invoiceNumber || "0",
        date: item.date || "",
        description: item.description || "",
        amount: typeof item.amount === 'number' ? item.amount : 0,
        buyerPhone: item.buyerPhone || "",
        sellerPhone: item.sellerPhone || "",
        status: item.status || "صادر شده" as StatusType,
        id: item.id || `unknown-${index}`,
      };

      return (
        <PurchaseInfoCard
          headerTitle={`فاکتور ${toPersianDigits(safeItem.invoiceNumber)}`}
          headerIcon="receipt"
          buyer={{ name: safeItem.buyerName, phone: safeItem.buyerPhone }}
          seller={{ name: safeItem.sellerName, phone: safeItem.sellerPhone }}
          invoiceNumber={safeItem.invoiceNumber}
          date={safeItem.date}
          note={safeItem.description}
          status={safeItem.status}
          amount={safeItem.amount}
          gradientColors={getColorsByStatus(safeItem.status)}
          isCurrentUserSeller={isSeller}
          onPress={() =>
            navigation.navigate("ReceiveNewInvoice", {
              invoicId: Number(safeItem.id) || 0,
            })
          }
        />
      );
    } catch (error) {
      console.error("Error rendering item:", error, item);

      return (
        <View style={{ padding: 10, margin: 5, backgroundColor: '#ffcccc' }}>
          <Text>خطا در نمایش فاکتور</Text>
        </View>
      );
    }
  };

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  };

  const handleSelectColleague = (colleague: Colleague) => {
    setSelectedColleague(colleague);
    setFilterParams((prev: any) => {
      return {
        ...prev,
        filterPersonId: colleague.id.toString(),
      };
    });
    console.log(colleague.id);
  };

  return (
    <>
      <ScreenHeader title="فاکتورها" />
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onDismiss={() => setToastVisible(false)}
      />
      <View style={styles.container}>
        <View style={styles.searchOuterContainer}>
          <SearchInput
            placeholder="جستجو در فاکتورها..."
            value={searchText}
            onChangeText={setSearchText}
            onSearch={handleSearch}
            hasFilter
            filterItems={
              <>
                <View style={{ flexDirection: "row-reverse", gap: 10 }}>
                  <DatePickerField
                    date={fromDate}
                    label="از تاریخ"
                    onDateChange={(value) => {
                      setFromDate(value);
                      setFilterParams((prev: any) => {
                        return {
                          ...prev,
                          filterInvoiceDateFrom: value,
                        };
                      });
                    }}
                    customStyles={{ infoItem: { width: "50%" } }}
                  />
                  <DatePickerField
                    date={toDate}
                    label="تا تاریخ"
                    onDateChange={(value) => {
                      setToDate(value);
                      setFilterParams((prev: any) => {
                        return {
                          ...prev,
                          filterInvoiceDateTo: value,
                        };
                      });
                    }}
                  />
                </View>
                <TouchableOpacity
                  onPress={() => setIsColleagueBottomSheetVisible(true)}
                  style={styles.selectColleague}
                >
                  <MaterialIcons
                    name="person"
                    size={24}
                    color={colors.medium}
                  />
                  <AppText
                    style={{
                      color: colors.medium,
                      fontSize: 15,
                      marginRight: 10,
                    }}
                  >
                    {selectedColleague?.name || "خریدار"}
                  </AppText>
                </TouchableOpacity>
                <AppButton
                  title="فیلتر"
                  onPress={() => {
                    getInvoicesWithFilter();
                    getInvoiceCountWithFilter();
                  }}
                  color="primary"
                />
              </>
            }
          />
        </View>

        <ColleagueBottomSheet
          visible={isColleagueBottomSheetVisible}
          onClose={() => setIsColleagueBottomSheetVisible(false)}
          onSelectColleague={handleSelectColleague}
          title="انتخاب خریدار"
        />

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "canceled" && styles.canceledActiveTab,
            ]}
            onPress={() => setActiveTab("canceled")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "canceled" && styles.activeTabText,
              ]}
            >
              لغو شده
            </Text>
            <Text
              style={[
                styles.countText,
                activeTab === "canceled" && styles.activeCountText,
                { color: "#EF5350" },
              ]}
            >
              {(() => {
                try {
                  const count = getCountByStatus("لغو شده");
                  return toPersianDigits(count);
                } catch (error) {
                  console.error("Error converting canceled count:", error);
                  return "۰";
                }
              })()}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "referred" && styles.referredActiveTab,
            ]}
            onPress={() => setActiveTab("referred")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "referred" && styles.activeTabText,
              ]}
            >
              ارجاع از صندوق
            </Text>
            <Text
              style={[
                styles.countText,
                activeTab === "referred" && styles.activeCountText,
                { color: "#FFA500" },
              ]}
            >
              {(() => {
                try {
                  const count = getCountByStatus("ارجاع از صندوق");
                  return toPersianDigits(count);
                } catch (error) {
                  console.error("Error converting referred count:", error);
                  return "۰";
                }
              })()}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "issued" && styles.issuedActiveTab,
            ]}
            onPress={() => setActiveTab("issued")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "issued" && styles.activeTabText,
              ]}
            >
              صادر شده
            </Text>
            <Text
              style={[
                styles.countText,
                activeTab === "issued" && styles.activeCountText,
                { color: "#4CAF50" },
              ]}
            >
              {(() => {
                try {
                  const count = getCountByStatus("صادر شده");
                  return toPersianDigits(count);
                } catch (error) {
                  console.error("Error converting issued count:", error);
                  return "۰";
                }
              })()}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "quote" && styles.quoteActiveTab]}
            onPress={() => setActiveTab("quote")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "quote" && styles.activeTabText,
              ]}
            >
              پیش فاکتور
            </Text>
            <Text
              style={[
                styles.countText,
                activeTab === "quote" && styles.activeCountText,
                { color: "#3498db" },
              ]}
            >
              {(() => {
                try {
                  const count = getCountByStatus("پیش فاکتور");
                  return toPersianDigits(count);
                } catch (error) {
                  console.error("Error converting quote count:", error);
                  return "۰";
                }
              })()}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "all" && styles.allActiveTab]}
            onPress={() => setActiveTab("all")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "all" && styles.activeTabText,
              ]}
            >
              همه
            </Text>
            <Text
              style={[
                styles.countText,
                activeTab === "all" && styles.activeCountText,
                { color: "#6B7280" },
              ]}
            >
              {(() => {
                try {
                  const count = getCountByStatus(null);
                  return toPersianDigits(count);
                } catch (error) {
                  console.error("Error converting total count:", error);
                  return "۰";
                }
              })()}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listContainer}>
          {loading && items.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>در حال دریافت فاکتورها...</Text>
            </View>
          ) : getFilteredItems().length > 0 ? (
            <FlatList
              data={getFilteredItems()}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 10 }}
              onRefresh={handleRefresh}
              refreshing={refreshing}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.5}
              ListFooterComponent={renderFooter}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Feather name="clipboard" size={64} color="#9CA3AF" />
              <Text style={styles.emptyText}>موردی یافت نشد</Text>
            </View>
          )}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    height: 120,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 20,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 24,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "bold"),
  },

  searchOuterContainer: {
    margin: 20,
    marginTop: 0,
    marginBottom: 5,
  },

  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    marginHorizontal: 20,
    marginTop: 5,
    marginBottom: 0,
    padding: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
    justifyContent: "space-between",
  },
  tab: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 2,
  },
  referredActiveTab: {
    backgroundColor: "#FFF3E0",
  },
  issuedActiveTab: {
    backgroundColor: "#E8F5E9",
  },
  quoteActiveTab: {
    backgroundColor: "#E3F2FD",
  },
  canceledActiveTab: {
    backgroundColor: "#FFEBEE",
  },
  allActiveTab: {
    backgroundColor: "#ECEFF1",
  },
  tabText: {
    fontFamily: getFontFamily("Yekan_Bakh_Regular", "normal"),
    fontSize: 11,
    color: "#6B7280",
    textAlign: "center",
  },
  activeTabText: {
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "700"),
    color: "#1F2937",
  },
  countText: {
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "700"),
    fontSize: 15,
    marginTop: 4,
    textAlign: "center",
  },
  activeCountText: {
    color: "#1F2937",
  },
  listContainer: {
    flex: 1,
    paddingBottom: 10,
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
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontFamily: getFontFamily("Yekan_Bakh_Regular", "normal"),
    fontSize: 16,
    color: "#6B7280",
    marginTop: 12,
    textAlign: "center",
  },
  footer: {
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  purchaseCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e1e1e1",
  },
  androidCardAdjustment: {
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    marginVertical: 8,
  },
  purchaseHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    padding: 16,
    justifyContent: "space-between",
  },
  headerTitleContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  purchaseHeaderText: {
    fontSize: 16,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "600"),
    color: "#ffffff",
    marginRight: 8,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    color: "#ffffff",
    fontSize: 12,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "500"),
  },
  purchaseContent: {
    padding: 16,
  },
  purchaseRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    height: 25,
  },
  purchaseItem: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  purchaseTextContainer: {
    flexDirection: "row-reverse",
    marginRight: 8,
    flex: 1,
  },
  secondaryLabel: {
    fontSize: 15,
    color: "#757575",
    fontFamily: getFontFamily("Yekan_Bakh_Regular", "normal"),
    marginLeft: 8,
  },
  secondaryValue: {
    fontSize: 15,
    color: "#212121",
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "500"),
  },
  divider: {
    height: 1,
    backgroundColor: "#eeeeee",
    marginVertical: 12,
  },
  addressContainer: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
  },
  addressValue: {
    fontSize: 15,
    color: "#212121",
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "500"),
  },
  noteContainer: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    width: "100%",
  },
  noteTextContainer: {
    flexDirection: "column",
    flex: 1,
    marginRight: 8,
    alignItems: "flex-start",
  },
  noteLabel: {
    fontSize: 15,
    fontFamily: getFontFamily("Yekan_Bakh_Regular", "normal"),
    color: "#757575",
    marginBottom: 4,
    alignSelf: "flex-end",
  },
  noteContent: {
    fontSize: 15,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "500"),
    flex: 1,
    textAlign: "right",
    color: "#212121",
    width: "100%",
  },
  callButtonCircle: {
    width: 35,
    height: 35,
    borderRadius: 20,
    borderColor: "#4CAF50",
    borderWidth: 2,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  selectColleague: {
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: 8,
    padding: 10,
    flexDirection: "row-reverse",
    marginBottom: 10,
    alignItems: "center",
  },
});

export default IssuedInvoices;