import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Platform,
  ViewStyle,
  Linking,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import colors from "../../config/colors";
import SearchInput from "../../components/SearchInput";
import ScreenHeader from "../../components/ScreenHeader";

type FontWeight = "700" | "600" | "500" | "bold" | "semi-bold" | string;
type StatusType = "تایید نهایی" | "تعلیق" | "بسته شده" | "لغو شده";

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
}

const getFontFamily = (baseFont: string, weight: FontWeight): string => {
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
  if (!text) return "";
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(text).replace(
    /[0-9]/g,
    (digit) => persianDigits[parseInt(digit)]
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
      case "تایید نهایی":
        return colors.success || "#4CAF50";
      case "تعلیق":
        return colors.warning || "#FFA500";
      case "بسته شده":
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
          {date && (
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
          )}

          <View style={styles.divider} />

          <View style={styles.purchaseRow}>
            <View style={styles.purchaseItem}>
              <MaterialIcons
                name="person"
                size={18}
                color={colors.secondary || "#6c5ce7"}
              />
              <View style={styles.purchaseTextContainer}>
                <Text style={styles.secondaryLabel}>خریدار:</Text>
                <Text style={styles.secondaryValue}>{buyer.name}</Text>
              </View>
            </View>
            {buyer.phone && (
              <TouchableOpacity
                style={styles.callButtonCircle}
                onPress={() => handlePhoneCall(buyer.phone)}
              >
                <MaterialIcons
                  name="call"
                  size={25}
                  color={colors.success || "#4CAF50"}
                />
              </TouchableOpacity>
            )}
          </View>

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

          {note && (
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

const StatusFilterScreen: React.FC = () => {
  const [items, setItems] = useState<InspectionItem[]>([
    {
      id: "1",
      buyerName: "جناب آقای سهرابی",
      buyerPhone: "09171274963",
      invoiceNumber: "25758",
      date: "1403/8/22",
      sellerName: "مهدی رزاق پور",
      sellerPhone: "09123583467",
      status: "تایید نهایی",
      description: "فاکتور به درخواست مشتری لغو شده است",
    },
    {
      id: "2",
      buyerName: "آقای اصغر باقری",
      buyerPhone: "09123165352",
      invoiceNumber: "76609",
      date: "1403/8/22",
      sellerName: "دنیا ناصری",
      sellerPhone: "09139386498",
      description:
        "توضیحات: سفارش از پکیج کارا ۱۴ بابت ۱۱۲۸/۶۴ بابت اعتباری خواهه متری ۳۵۲ سفارش از کارخانه استیل ۳۵ بابت با مولد (شش ماهه متری ۲۵۰ اسفارش از کارخانه اترانزیت درجه دو بابت با مقدار ۲۲۷/۵۶ متری ۱۵۰ اترانزیت نرده کامفیل متری ۳۰۰ بابت سه پایل ۱۹۴/۹۲",
      status: "تعلیق",
    },
    {
      id: "3",
      buyerName: "آقای محمد حیدری",
      buyerPhone: "09198045870",
      invoiceNumber: "78317",
      date: "1403/8/19",
      sellerName: "محمدرضا نکونام",
      sellerPhone: "09304052520",
      status: "بسته شده",
      description: "فاکتور به درخواست مشتری لغو شده است",
    },
    {
      id: "4",
      buyerName: "خانم زهرا محمدی",
      buyerPhone: "09122348765",
      invoiceNumber: "89725",
      date: "1403/8/25",
      sellerName: "علی حسینی",
      sellerPhone: "09361237890",
      description: "فاکتور به درخواست مشتری لغو شده است",
      status: "لغو شده",
    },
  ]);

  const [searchText, setSearchText] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("all");

  const handleSearch = () => {
    console.log("Search button pressed with text:", searchText);
  };

  const getFilteredItems = () => {
    let filtered = items;

    if (activeTab === "confirmed") {
      filtered = items.filter((item) => item.status === "تایید نهایی");
    } else if (activeTab === "pending") {
      filtered = items.filter((item) => item.status === "تعلیق");
    } else if (activeTab === "closed") {
      filtered = items.filter((item) => item.status === "بسته شده");
    } else if (activeTab === "canceled") {
      filtered = items.filter((item) => item.status === "لغو شده");
    }

    if (searchText) {
      filtered = filtered.filter(
        (item) =>
          item.buyerName.includes(searchText) ||
          item.sellerName.includes(searchText) ||
          item.invoiceNumber.includes(searchText)
      );
    }

    return filtered;
  };

  const getCountByStatus = (status: StatusType | null) => {
    if (status === null) {
      return items.length;
    }
    return items.filter((item) => item.status === status).length;
  };

  const getColorsByStatus = (status?: StatusType): string[] => {
    switch (status) {
      case "تایید نهایی":
        return ["#4CAF50", "#2E7D32"];
      case "تعلیق":
        return ["#FFA726", "#EF6C00"];
      case "بسته شده":
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
        gradientColors={getColorsByStatus(item.status)}
        onPress={() => console.log(`Card ${item.id} pressed`)}
      />
    );
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
          />
        </View>

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
              {convertToPersianNumbers(getCountByStatus("لغو شده"))}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "pending" && styles.pendingActiveTab,
            ]}
            onPress={() => setActiveTab("pending")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "pending" && styles.activeTabText,
              ]}
            >
              تعلیق
            </Text>
            <Text
              style={[
                styles.countText,
                activeTab === "pending" && styles.activeCountText,
                { color: "#FFA500" },
              ]}
            >
              {convertToPersianNumbers(getCountByStatus("تعلیق"))}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "confirmed" && styles.confirmedActiveTab,
            ]}
            onPress={() => setActiveTab("confirmed")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "confirmed" && styles.activeTabText,
              ]}
            >
              تایید نهایی
            </Text>
            <Text
              style={[
                styles.countText,
                activeTab === "confirmed" && styles.activeCountText,
                { color: "#4CAF50" },
              ]}
            >
              {convertToPersianNumbers(getCountByStatus("تایید نهایی"))}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "closed" && styles.closedActiveTab,
            ]}
            onPress={() => setActiveTab("closed")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "closed" && styles.activeTabText,
              ]}
            >
              بسته شده
            </Text>
            <Text
              style={[
                styles.countText,
                activeTab === "closed" && styles.activeCountText,
                { color: "#3498db" },
              ]}
            >
              {convertToPersianNumbers(getCountByStatus("بسته شده"))}
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

        {/* Content */}
        <View style={styles.listContainer}>
          {getFilteredItems().length > 0 ? (
            <FlatList
              data={getFilteredItems()}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 10 }}
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
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
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
  // Replace the old search styles with a container for our new component
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
  pendingActiveTab: {
    backgroundColor: "#FFF3E0",
  },
  confirmedActiveTab: {
    backgroundColor: "#E8F5E9",
  },
  closedActiveTab: {
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

  purchaseCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 16,
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
    marginLeft: 8,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    borderColor: "#4CAF50",
    borderWidth: 2,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
});

export default StatusFilterScreen;
