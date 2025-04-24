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

type FontWeight = "700" | "600" | "500" | "bold" | "semi-bold" | string;
type StatusType = "صادر شده" | "ارجاع از صندوق" | "پیش فاکتور" | "لغو شده";

// API response interface based on the JSON file
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

// New interface for the count API response
interface InvoiceCountItem {
  State: number;
  StateName: string;
  InvoiceCount: number;
}

// Mapping payment types and states to human-readable values
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

const convertToPersianNumbers = (text: string | number): string => {
  if (!text && text !== 0) return "";
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(text).replace(
    /[0-9]/g,
    (digit) => persianDigits[parseInt(digit)]
  );
};

// Format currency in Toman with Persian digits
const formatCurrency = (amount: number): string => {
  return convertToPersianNumbers(
    amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  );
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
          // @ts-ignore: type issues with LinearGradient colors prop
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
            <Text style={styles.purchaseHeaderText}>{headerTitle}</Text>
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
          {/* Invoice Number Section */}
          {/* {invoiceNumber && (
            <View style={styles.purchaseRow}>
              <View style={styles.purchaseItem}>
                <MaterialIcons
                  name="receipt"
                  size={18}
                  color={colors.secondary || "#6c5ce7"}
                />
                <View style={styles.purchaseTextContainer}>
                  <Text style={styles.secondaryLabel}>شماره:</Text>
                  <Text style={styles.secondaryValue}>{convertToPersianNumbers(invoiceNumber)}</Text>
                </View>
              </View>
            </View>
          )} */}

          <View style={styles.purchaseRow}>
            <View style={styles.purchaseItem}>
              <MaterialIcons
                name="person"
                size={18}
                color={colors.secondary || "#6c5ce7"}
              />
              <View style={styles.purchaseTextContainer}>
                <Text style={styles.secondaryLabel}>خریدار:</Text>
                <Text style={styles.secondaryValue}>
                  {buyer.name || "نامشخص"}
                </Text>
              </View>
            </View>
            {buyer.phone && (
              <TouchableOpacity
                style={styles.callButtonCircle}
                onPress={() => handlePhoneCall(buyer.phone)}
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

          {/* Date Section on a separate row */}
          {date && (
            <>
              {/* <View style={styles.divider} /> */}
              <View style={styles.purchaseRow}>
                <View style={styles.purchaseItem}>
                  <MaterialIcons
                    name="event"
                    size={18}
                    color={colors.secondary || "#6c5ce7"}
                  />
                  <View style={styles.purchaseTextContainer}>
                    <Text style={styles.secondaryLabel}>تاریخ:</Text>
                    <Text style={styles.secondaryValue}>
                      {convertToPersianNumbers(date)}
                    </Text>
                  </View>
                </View>
              </View>
            </>
          )}

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
                <Text style={styles.secondaryValue}>{seller.name}</Text>
              </View>
            </View>
            {seller.phone && (
              <TouchableOpacity
                style={styles.callButtonCircle}
                onPress={() => handlePhoneCall(seller.phone)}
              >
                <MaterialIcons
                  name="call"
                  size={25}
                  color={colors.success || "#4CAF50"}
                />
              </TouchableOpacity>
            )}
          </View>

          {amount > 0 && (
            <>
              <View style={styles.divider} />
              <View style={styles.purchaseRow}>
                <View style={styles.purchaseItem}>
                  <MaterialIcons
                    name="attach-money"
                    size={18}
                    color={colors.secondary || "#6c5ce7"}
                  />
                  <View style={styles.purchaseTextContainer}>
                    <Text style={styles.secondaryLabel}>مبلغ کل:</Text>
                    <Text style={styles.secondaryValue}>
                      {formatCurrency(amount)} ریال
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

          {note && note.trim() !== "" && (
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
                  <Text style={styles.noteContent}>{note}</Text>
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

  const [items, setItems] = useState<InspectionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  // New state for storing tab counts
  const [statusCounts, setStatusCounts] = useState<Record<number, number>>({
    1: 0, // پیش فاکتور
    2: 0, // صادر شده
    3: 0, // ارجاع از صندوق
    4: 0, // لغو شده
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

  useEffect(() => {
    fetchInvoices();
    fetchInvoiceCounts();
  }, [currentPage]);

  // New function to fetch invoice counts
  const fetchInvoiceCounts = async () => {
    try {
      const response = await fetch(`${appConfig.mobileApi}Invoice/GetCount`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data: InvoiceCountItem[] = await response.json();

      // Convert the array to a record for easier access
      const countsRecord: Record<number, number> = {};
      data.forEach((item) => {
        countsRecord[item.State] = item.InvoiceCount;
      });

      setStatusCounts(countsRecord);
    } catch (error) {
      console.error("Error fetching invoice counts:", error);
    }
  };

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${appConfig.mobileApi}Invoice/GetAll?page=${currentPage}&pageSize=20`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data: InvoiceApiResponse = await response.json();

      // Map API data to our component's format
      const mappedItems: InspectionItem[] = data.Items.map((item) => ({
        id: item.InvoiceId.toString(),
        buyerName: item.PersonFullName.trim() || "مشتری",
        buyerPhone: item.PersonMobile,
        invoiceNumber: item.InvoiceId.toString(),
        date: item.ShamsiInvoiceDate,
        sellerName: item.ApplicationUserName,
        sellerPhone: "", // API doesn't provide seller phone
        description: item.Description,
        status: stateMap[item.State] || "صادر شده",
        amount: item.TotalAmount,
      }));

      setItems(mappedItems);
      setTotalPages(data.TotalPages);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      Alert.alert(
        "خطا",
        "مشکلی در دریافت اطلاعات فاکتورها رخ داده است. لطفا دوباره تلاش کنید."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getInvoicesWithFilter = async () => {
    setLoading(true);
    try {
      console.log("filterParams:", filterParams);

      // Initialize query string with required parameters
      let queryString = "page=1&pageSize=1000";

      // Add filterParams if they exist
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
        `${appConfig.mobileApi}Invoice/GetAll?${queryString}`
      );

      const data = response.data;
      console.log("datas", data);

      if (data) {
        const mappedItems: InspectionItem[] = data.Items.map((item: any) => ({
          id: item.InvoiceId.toString(),
          buyerName: item.PersonFullName.trim() || "مشتری",
          buyerPhone: item.PersonMobile,
          invoiceNumber: item.InvoiceId.toString(),
          date: item.ShamsiInvoiceDate,
          sellerName: item.ApplicationUserName,
          sellerPhone: "", // API doesn't provide seller phone
          description: item.Description,
          status: stateMap[item.State] || "صادر شده",
          amount: item.TotalAmount,
        }));

        setItems(mappedItems);
      }
    } catch (error) {
      console.log(error);
      showToast("خطا در دریافت اطلاعات فاکتور ها", "error");
    } finally {
      setLoading(false);
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
    let filtered = items;

    if (activeTab === "issued") {
      filtered = items.filter((item) => item.status === "صادر شده");
    } else if (activeTab === "referred") {
      filtered = items.filter((item) => item.status === "ارجاع از صندوق");
    } else if (activeTab === "quote") {
      filtered = items.filter((item) => item.status === "پیش فاکتور");
    } else if (activeTab === "canceled") {
      filtered = items.filter((item) => item.status === "لغو شده");
    }

    if (searchText) {
      filtered = filtered.filter(
        (item) =>
          (item.buyerName && item.buyerName.includes(searchText)) ||
          (item.sellerName && item.sellerName.includes(searchText)) ||
          (item.invoiceNumber && item.invoiceNumber.includes(searchText))
      );
    }

    return filtered;
  };

  // Modified function to get count by status using the API data
  const getCountByStatus = (status: StatusType | null) => {
    if (status === null) {
      // Sum all counts for "all" tab
      return Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
    }

    // Find the state number for this status name
    const stateNumber = Object.entries(stateMap).find(
      ([_, stateName]) => stateName === status
    )?.[0];

    return stateNumber ? statusCounts[Number(stateNumber)] || 0 : 0;
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

  const renderItem = ({ item }: { item: InspectionItem }) => {
    return (
      <PurchaseInfoCard
        headerTitle={`فاکتور ${convertToPersianNumbers(item.invoiceNumber)}`}
        headerIcon="receipt"
        buyer={{ name: item.buyerName, phone: item.buyerPhone }}
        seller={{ name: item.sellerName, phone: item.sellerPhone }}
        invoiceNumber={item.invoiceNumber}
        date={item.date}
        note={item.description}
        status={item.status}
        amount={item.amount}
        gradientColors={getColorsByStatus(item.status)}
        onPress={() =>
          navigation.navigate("ReceiveNewInvoice", {
            invoicId: Number(item.id),
          })
        }
      />
    );
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
                  onPress={() => getInvoicesWithFilter()}
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
          isCustomer
          title="انتخاب خریدار"
        />

        <View style={styles.tabContainer}>
          {/* Updated tab for "لغو شده" (Canceled) instead of "درحال ویرایش" (Editing) */}
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
              {convertToPersianNumbers(getCountByStatus("لغو شده"))}
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
              {convertToPersianNumbers(getCountByStatus("ارجاع از صندوق"))}
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
              {convertToPersianNumbers(getCountByStatus("صادر شده"))}
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
              {convertToPersianNumbers(getCountByStatus("پیش فاکتور"))}
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
              {convertToPersianNumbers(getCountByStatus(null))}
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
    backgroundColor: "#f5f5f5",
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
    margin: 15,
    marginBottom: 5,
  },

  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    marginHorizontal: 15,
    marginTop: 5,
    marginBottom: 5,
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
  },
});

export default IssuedInvoices;
