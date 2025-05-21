import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import colors from "../../config/colors";
import ScreenHeader from "../../components/ScreenHeader";
import { toJalali } from "../../components/PersianDatePicker";
import { toPersianDigits } from "../../utils/converters";
import axios from "axios";
import appConfig from "../../../config";
import { ITask } from "../../config/types";
import ProductCard from "../../components/ProductCard";
import AppText from "../../components/Text";
import { Feather, Ionicons } from "@expo/vector-icons";
import TaskDrawer from "../../components/TaskDrawer";

type FontWeight = "700" | "600" | "500" | "bold" | "semi-bold" | string;

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

const persianMonths: string[] = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

export const jalaliToGregorian = (
  jy: number,
  jm: number,
  jd: number
): [number, number, number] => {
  // Convert Jalali date to Gregorian
  // Algorithm based on the inverse of the Gregorian-to-Jalali conversion

  // Adjust Jalali year if month is in the new year but before Nowruz
  let gy = jy + 621;
  let leapDays = 0;

  // Check if the Jalali year is a leap year
  const jalaliLeapYears = [1, 5, 9, 13, 17, 22, 26, 30];
  const cycle = (jy - 1) % 33;
  const isLeap = jalaliLeapYears.includes(cycle);

  // Days passed in current Jalali year
  const jalaliDaysInMonth = [
    31,
    31,
    31,
    31,
    31,
    31,
    30,
    30,
    30,
    30,
    30,
    isLeap ? 30 : 29,
  ];
  let dayOfYear = jd;

  for (let i = 0; i < jm - 1; i++) {
    dayOfYear += jalaliDaysInMonth[i];
  }

  // Nowruz (March 21) in Gregorian
  const nowruzGregorian = new Date(gy, 2, 21);
  const nowruzDayOfYear =
    Math.floor(
      (nowruzGregorian.getTime() - new Date(gy, 0, 1).getTime()) / 86400000
    ) + 1;

  // Calculate Gregorian day of year
  let gregDayOfYear = dayOfYear + nowruzDayOfYear - 1;

  // Handle overflow into next Gregorian year
  const isGregorianLeap = (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0;
  const daysInGregorianYear = isGregorianLeap ? 366 : 365;

  if (gregDayOfYear > daysInGregorianYear) {
    gregDayOfYear -= daysInGregorianYear;
    gy += 1;
  }

  // Convert day of year back to month/day
  const gregDate = new Date(gy, 0, gregDayOfYear);
  return [gregDate.getFullYear(), gregDate.getMonth() + 1, gregDate.getDate()];
};

export const getJalaliDateRange = () => {
  const today = new Date();
  const currentJalali = toJalali(today);

  // Convert current Jalali date to days since epoch (simplified)
  const [jy, jm, jd] = currentJalali;
  let totalDays = jd;

  // Add days from previous months in the current year
  const jalaliDaysInMonth = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
  for (let i = 0; i < jm - 1; i++) {
    totalDays += jalaliDaysInMonth[i];
  }

  // Create array for 21 days (10 before, current, 10 after)
  const dates = [];
  for (let i = -10; i <= 10; i++) {
    let targetDays = totalDays + i;
    let year = jy;

    // Handle year overflow/underflow (simplified)
    if (targetDays < 1) {
      year--;
      targetDays += isJalaliLeap(year) ? 366 : 365;
    } else {
      const daysInYear = isJalaliLeap(year) ? 366 : 365;
      if (targetDays > daysInYear) {
        year++;
        targetDays -= daysInYear;
      }
    }

    // Convert days back to Jalali date
    const [month, day] = daysToJalaliMonthDay(year, targetDays);
    dates.push([year, month, day]);
  }

  return dates;
};

// Helper function to check if a Jalali year is leap
const isJalaliLeap = (year: number) => {
  // Jalali leap years follow a 33-year cycle with 8 leap years
  const cycle = (year - 1) % 33;
  const leapYears = [1, 5, 9, 13, 17, 22, 26, 30];
  return leapYears.includes(cycle);
};

// Helper function to convert day-of-year to month/day in Jalali
const daysToJalaliMonthDay = (year: number, dayOfYear: number) => {
  const jalaliDaysInMonth = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
  if (isJalaliLeap(year)) {
    jalaliDaysInMonth[11] = 30; // Esfand has 30 days in leap years
  }

  let remainingDays = dayOfYear;
  let month = 1;
  for (; month <= 12; month++) {
    if (remainingDays <= jalaliDaysInMonth[month - 1]) {
      break;
    }
    remainingDays -= jalaliDaysInMonth[month - 1];
  }

  return [month, remainingDays];
};

const TaskManagement: React.FC = () => {
  const navigation = useNavigation();
  const dateRange = getJalaliDateRange();
  const days = dateRange.map(([year, month, day]) => day);
  const months = dateRange.map(([year, month, day]) => month);
  const years = dateRange.map(([year, month, day]) => year);
  const [jyear, jmonth, jday] = toJalali(new Date());
  const gregorianDate = new Date(); // Current date
  const [taskDrawerVisible, setTaskDrawerVisible] = useState<boolean>(false);

  const [tasks, setTasks] = useState<ITask[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const getTasks = async () => {
    setLoading(true);
    // const year = gregorianDate.getFullYear(); // 4-digit year (e.g., 2023)
    // const month = gregorianDate.getMonth() + 1; // Month (1-12, since getMonth() returns 0-11)
    const [year, month, day] = jalaliToGregorian(
      jyear,
      jmonth,
      days[selectedDay]
    );
    try {
      const response = await axios.get(
        `${appConfig.mobileApi}Task/GetAllByDate?date=${year}%2F${month}%2F${day}&page=1&pageSize=1000`
      );
      setTasks(response.data.Items);
      console.log(response.data.Items);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Set the current day index (should be at position 10 since we have 10 days before and 10 days after)
  const currentDayIndex = 10;
  const [selectedDay, setSelectedDay] = useState(currentDayIndex);

  useEffect(() => {
    getTasks();
  }, [selectedDay]);

  // Create a ref for the ScrollView
  const scrollViewRef = useRef<ScrollView>(null);

  const screenWidth = Dimensions.get("window").width;
  // Calculate item width to display 3 items at a time with some spacing
  const dayItemWidth = (screenWidth - 200) / 3; // 48 accounts for padding and margins

  // Scroll to current day on initial render
  useEffect(() => {
    if (scrollViewRef.current) {
      const x =
        (days.length - 1 - selectedDay) * (dayItemWidth + 16) -
        (screenWidth - dayItemWidth) / 2;
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ x, animated: true });
      }, 100);
    }
  }, [selectedDay, dayItemWidth, screenWidth]);

  const scrollToIndex = (index: number) => {
    if (scrollViewRef.current) {
      const x =
        (days.length - 1 - index) * (dayItemWidth + 11) -
        (screenWidth - dayItemWidth) / 2;
      scrollViewRef.current.scrollTo({ x, animated: true });
    }
  };

  return (
    <>
      <ScreenHeader title="مدیریت وظایف" />
      <SafeAreaView style={styles.container}>
        <View style={styles.carouselContainer}>
          <TouchableOpacity
            style={styles.arrowButton}
            onPress={() => {
              if (selectedDay > 0) {
                const newIndex = selectedDay - 1;
                setSelectedDay(newIndex);
                scrollToIndex(newIndex);
              }
            }}
            disabled={selectedDay === 0}
          >
            <Ionicons
              name="chevron-forward"
              size={24}
              color={selectedDay === 0 ? colors.gray : colors.white}
            />
          </TouchableOpacity>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carousel}
            snapToInterval={dayItemWidth + 10} // Add margin to snap calculation
            decelerationRate="fast"
            snapToAlignment="center"
            contentInset={{ left: 0, right: 0 }}
          >
            {days.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayItem,
                  { width: dayItemWidth, height: dayItemWidth }, // Make width and height equal for square
                  selectedDay === index && styles.selectedDayItem,
                ]}
                onPress={() => setSelectedDay(index)}
              >
                <Text
                  style={[
                    styles.dayText,
                    selectedDay === index && styles.selectedDayText,
                  ]}
                >
                  {toPersianDigits(day.toString())}
                </Text>
                <AppText
                  style={[
                    { fontSize: 11, color: colors.primary },
                    selectedDay === index && styles.selectedDayText,
                  ]}
                >
                  {persianMonths[months[index] - 1]}
                </AppText>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.arrowButton}
            onPress={() => {
              if (selectedDay < days.length - 1) {
                const newIndex = selectedDay + 1;
                setSelectedDay(newIndex);
                scrollToIndex(newIndex);
              }
            }}
            disabled={selectedDay === days.length - 1}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={
                selectedDay === days.length - 1 ? colors.gray : colors.white
              }
            />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <AppText style={styles.loadingText}>
                در حال دریافت اطلاعات...
              </AppText>
            </View>
          ) : tasks.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="clipboard" size={64} color="#9CA3AF" />
              <AppText style={styles.emptyText}>موردی یافت نشد</AppText>
            </View>
          ) : (
            tasks.map((task) => (
              <>
                <ProductCard
                  key={task.TaskId}
                  title={toPersianDigits(task.TaskTitle)}
                  fields={[
                    {
                      icon: "person-4",
                      iconColor: colors.secondary,
                      label: "نوع:",
                      value: toPersianDigits(task.TaskTypeName),
                    },
                    {
                      icon: "calendar-month",
                      iconColor: colors.secondary,
                      label: "وضعیت:",
                      value: toPersianDigits(task.TaskStateStr),
                    },
                  ]}
                  note={""}
                  noteConfig={{
                    show: false,
                    icon: "notes",
                    iconColor: colors.secondary,
                    label: "توضیحات:",
                  }}
                  qrConfig={{
                    show: false,
                    icon: "camera", // تغییر آیکون به دوربین/عکس
                    iconSize: 36,
                    iconColor: colors.secondary,
                  }}
                  titleStyle={{ fontSize: 20 }}
                  //   editIcon={{
                  //     name: "edit",
                  //     size: 22,
                  //     color: colors.warning,
                  //     onPress: () => handleEditProduct(product.id),
                  //     containerStyle: styles.iconCircleSmall, // اضافه کردن استایل دایره
                  //   }}
                  //   deleteIcon={{
                  //     name: "delete",
                  //     size: 22,
                  //     color: colors.danger,
                  //     onPress: () => {
                  //       showRemoveConfirmation(product.id, () => {
                  //         showToast("محصول با موفقیت حذف شد", "info");
                  //       });
                  //     },
                  //     containerStyle: styles.iconCircleSmall, // اضافه کردن استایل دایره
                  //   }}
                  containerStyle={
                    Platform.OS === "android"
                      ? styles.androidCardAdjustment
                      : {}
                  }
                  //   onLongPress={() => {
                  //     showRemoveConfirmation(product.id, () => {
                  //       showToast("محصول با موفقیت حذف شد", "info");
                  //     });
                  //   }}
                  onPress={() => setTaskDrawerVisible(true)}
                />
                <TaskDrawer
                  visible={taskDrawerVisible}
                  onClose={() => setTaskDrawerVisible(false)}
                  taskId={task.TaskId}
                />
              </>
            ))
          )}
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  androidCardAdjustment: {
    borderWidth: 3,
    borderColor: "#e0e0e0",
    marginVertical: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: getFontFamily("", "bold"),
    color: colors.black,
  },
  carouselContainer: {
    marginTop: 16,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#6e7e94",
    borderRadius: 12,
    padding: 10,
    marginHorizontal: 15,
  },
  carousel: {
    paddingHorizontal: 5,
    flexDirection: "row-reverse", // Ensure RTL layout
  },
  dayItem: {
    // Width and height now dynamically set in the component
    borderRadius: 8, // Reduced radius for square look
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  selectedDayItem: {
    backgroundColor: colors.primary || "#4A80F0",
  },
  dayText: {
    fontSize: 26, // Increased font size
    fontFamily: getFontFamily("", "semi-bold"),
    color: colors.primary || "#707070",
  },
  selectedDayText: {
    color: colors.white || "#FFFFFF",
  },
  content: {
    flex: 1,
    padding: 16,
    // alignItems: "center",
  },
  contentText: {
    fontSize: 16,
    fontFamily: getFontFamily("", "regular"),
    textAlign: "center",
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
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
    fontSize: 16,
    color: "#6B7280",
    marginTop: 12,
    textAlign: "center",
  },
  arrowButton: {
    padding: 10,
    marginHorizontal: 6,
    borderWidth: 1,
    borderRadius: 50,
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
});

export default TaskManagement;
