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
  Animated,
  Alert,
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

// به‌روزرسانی تعریف وضعیت‌های تسک بر اساس API
const TASK_STATUS = {
  NOT_STARTED: "شروع نشده",
  IN_PROGRESS: "در حال انجام",
  COMPLETED: "انجام شده",
  CANCELED: "لغو شده",
};

// نگاشت وضعیت‌های عددی API به متن فارسی (بر اساس API جدید)
const API_STATUS_MAPPING = {
  1: TASK_STATUS.NOT_STARTED,
  2: TASK_STATUS.IN_PROGRESS,
  3: TASK_STATUS.COMPLETED,
  4: TASK_STATUS.CANCELED,
};

// نگاشت برعکس: از متن فارسی به عدد (حالت‌های قابل تغییر توسط کاربر)
const STATUS_TO_API_MAPPING = {
  [TASK_STATUS.NOT_STARTED]: 1,
  [TASK_STATUS.IN_PROGRESS]: 2,
  [TASK_STATUS.COMPLETED]: 3,
};

// رنگ‌های جدید بر اساس Google Colors
const TASK_STATUS_COLORS = {
  [TASK_STATUS.NOT_STARTED]: "#fbbc05",  // Yellow
  [TASK_STATUS.IN_PROGRESS]: "#4285f4",  // Blue
  [TASK_STATUS.COMPLETED]: "#34a853",    // Green
  [TASK_STATUS.CANCELED]: "#9E9E9E",     // Gray
};

const TASK_STATUS_BACKGROUND = {
  [TASK_STATUS.NOT_STARTED]: "#fef7e0",  // Light yellow background
  [TASK_STATUS.IN_PROGRESS]: "#e8f0fe",  // Light blue background
  [TASK_STATUS.COMPLETED]: "#e6f4ea",    // Light green background
  [TASK_STATUS.CANCELED]: "#f5f5f5",     // Light gray background
};

// تابع برای تبدیل وضعیت عددی به متن
const getTaskStatusText = (taskState, taskStateStr) => {
  // اگر TaskStateStr موجود باشد، از آن استفاده کن
  if (taskStateStr) {
    return taskStateStr;
  }

  // در غیر این صورت از TaskState عددی استفاده کن
  return API_STATUS_MAPPING[taskState] || TASK_STATUS.NOT_STARTED;
};

// تابع بهبود یافته برای محاسبه تفاوت زمان با ساعت، دقیقه و ثانیه
const getTimeDifference = (date1, date2) => {
  const diffMs = Math.abs(date2.getTime() - date1.getTime());
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  let result = "";

  if (diffDays > 0) {
    result = `${toPersianDigits(diffDays.toString())} روز`;
    if (diffHours > 0) {
      result += ` و ${toPersianDigits(diffHours.toString())} ساعت`;
    }
  } else if (diffHours > 0) {
    result = `${toPersianDigits(diffHours.toString())} ساعت`;
    if (diffMinutes > 0) {
      result += ` و ${toPersianDigits(diffMinutes.toString())} دقیقه`;
    }
  } else if (diffMinutes > 0) {
    result = `${toPersianDigits(diffMinutes.toString())} دقیقه`;
    if (diffSeconds > 0) {
      result += ` و ${toPersianDigits(diffSeconds.toString())} ثانیه`;
    }
  } else {
    result = `${toPersianDigits(diffSeconds.toString())} ثانیه`;
  }

  return result;
};

// تابع برای تشخیص زمان تاخیر - فقط برای تسک‌های شروع نشده
const isTaskOverdue = (deadlineDate, taskState) => {
  if (!deadlineDate || taskState !== 1) return false; // فقط برای شروع نشده (taskState === 1)

  const deadline = new Date(deadlineDate);
  const now = new Date();
  return now > deadline;
};

// کامپوننت برای نمایش زمان داینامیک
const DynamicTimeInfo = ({ task }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // به‌روزرسانی هر ثانیه

    return () => clearInterval(interval);
  }, []);

  const getTimeInfo = () => {
    if (task.TaskState === 2 && task.InsertDate) {
      // در حال انجام - نمایش زمان شروع
      const startDate = new Date(task.InsertDate);
      const timePassed = getTimeDifference(startDate, currentTime);
      return {
        label: "زمان شروع:",
        value: `${timePassed} پیش`,
        icon: "play-arrow",
        color: colors.secondary
      };
    } else if (task.TaskState === 1 && task.TaskDeadlineDate) {
      // شروع نشده - فقط در صورت زمان تاخیر نمایش داده شود
      const deadline = new Date(task.TaskDeadlineDate);
      if (currentTime > deadline) {
        const overdue = getTimeDifference(deadline, currentTime);
        return {
          label: "زمان تاخیر:",
          value: overdue,
          icon: "warning",
          color: '#d32f2f'
        };
      }
    }

    return null;
  };

  const timeInfo = getTimeInfo();
  if (!timeInfo) return null;

  return {
    icon: timeInfo.icon,
    iconColor: timeInfo.color,
    label: timeInfo.label,
    value: timeInfo.value,
  };
};

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

export const jalaliToGregorian = (
  jy: number,
  jm: number,
  jd: number
): [number, number, number] => {
  let gy = jy + 621;
  let leapDays = 0;

  const jalaliLeapYears = [1, 5, 9, 13, 17, 22, 26, 30];
  const cycle = (jy - 1) % 33;
  const isLeap = jalaliLeapYears.includes(cycle);

  const jalaliDaysInMonth = [
    31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30,
    isLeap ? 30 : 29,
  ];
  let dayOfYear = jd;

  for (let i = 0; i < jm - 1; i++) {
    dayOfYear += jalaliDaysInMonth[i];
  }

  const nowruzGregorian = new Date(gy, 2, 21);
  const nowruzDayOfYear =
    Math.floor(
      (nowruzGregorian.getTime() - new Date(gy, 0, 1).getTime()) / 86400000
    ) + 1;

  let gregDayOfYear = dayOfYear + nowruzDayOfYear - 1;

  const isGregorianLeap = (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0;
  const daysInGregorianYear = isGregorianLeap ? 366 : 365;

  if (gregDayOfYear > daysInGregorianYear) {
    gregDayOfYear -= daysInGregorianYear;
    gy += 1;
  }

  const gregDate = new Date(gy, 0, gregDayOfYear);
  return [gregDate.getFullYear(), gregDate.getMonth() + 1, gregDate.getDate()];
};

export const getJalaliDateRange = (rangeSize: number = 11) => {
  const today = new Date();
  const currentJalali = toJalali(today);

  const [jy, jm, jd] = currentJalali;
  let totalDays = jd;

  const jalaliDaysInMonth = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
  for (let i = 0; i < jm - 1; i++) {
    totalDays += jalaliDaysInMonth[i];
  }

  const dates = [];
  const halfRange = Math.floor(rangeSize / 2);

  for (let i = -halfRange; i <= halfRange; i++) {
    let targetDays = totalDays + i;
    let year = jy;

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

    const [month, day] = daysToJalaliMonthDay(year, targetDays);
    dates.push([year, month, day]);
  }

  return dates;
};

const isJalaliLeap = (year: number) => {
  const cycle = (year - 1) % 33;
  const leapYears = [1, 5, 9, 13, 17, 22, 26, 30];
  return leapYears.includes(cycle);
};

const daysToJalaliMonthDay = (year: number, dayOfYear: number) => {
  const jalaliDaysInMonth = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
  if (isJalaliLeap(year)) {
    jalaliDaysInMonth[11] = 30;
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

const persianMonths: string[] = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];

const ScrollableDayCarousel = ({
  dateRange,
  selectedDay,
  onDaySelect,
  currentDayIndex
}) => {
  const scrollViewRef = useRef(null);
  const screenWidth = Dimensions.get("window").width;
  const dayItemWidth = 80;
  const dayItemSpacing = 20;
  const [scrollOffset, setScrollOffset] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(false);

  const getItemCenterPosition = (index) => {
    const paddingStart = screenWidth / 2 - dayItemWidth / 2;
    let totalWidth = paddingStart;

    for (let i = 0; i < index; i++) {
      const itemMargin = getItemMargin(i);
      totalWidth += dayItemWidth + (itemMargin * 2);
    }

    const currentItemMargin = getItemMargin(index);
    totalWidth += currentItemMargin + (dayItemWidth / 2);

    return totalWidth;
  };

  const getItemMargin = (index) => {
    if (index === selectedDay) {
      return dayItemSpacing * 1.1;
    } else if (Math.abs(index - selectedDay) === 1) {
      return dayItemSpacing * 0.3;
    } else {
      return dayItemSpacing / 2;
    }
  };

  const getScrollOffsetForIndex = (index) => {
    const itemCenterX = getItemCenterPosition(index);
    const screenCenterX = screenWidth / 2;
    const offset = itemCenterX - screenCenterX;

    return Math.max(0, offset);
  };

  const getTotalContentWidth = () => {
    let totalWidth = 0;
    for (let i = 0; i < dateRange.length; i++) {
      const itemMargin = getItemMargin(i);
      totalWidth += dayItemWidth + (itemMargin * 2);
    }
    return totalWidth;
  };

  useEffect(() => {
    if (!isInitialized && scrollViewRef.current && dateRange.length > 0) {
      setTimeout(() => {
        const reversedTodayIndex = dateRange.length - 1 - currentDayIndex;
        const offsetX = getScrollOffsetForIndex(reversedTodayIndex);

        scrollViewRef.current.scrollTo({
          x: offsetX,
          animated: false
        });
        setIsInitialized(true);
      }, 150);
    }
  }, [dateRange, currentDayIndex, isInitialized, selectedDay]);

  const handleDayPress = (index) => {
    onDaySelect(index);
    setShouldAutoScroll(true);

    setTimeout(() => {
      const offsetX = getScrollOffsetForIndex(index);

      scrollViewRef.current?.scrollTo({
        x: offsetX,
        animated: true
      });

      setTimeout(() => {
        setShouldAutoScroll(false);
      }, 600);
    }, 30);
  };

  const handleScroll = (event) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    setScrollOffset(scrollX);
  };

  const getCenterDistance = (index) => {
    const itemCenterX = getItemCenterPosition(index);
    const screenCenterX = scrollOffset + (screenWidth / 2);
    return Math.abs(itemCenterX - screenCenterX);
  };

  const getItemScale = (index) => {
    if (index === selectedDay) {
      return 1.5;
    }

    if (Math.abs(index - selectedDay) === 1) {
      return 1.2;
    }

    if (Math.abs(index - selectedDay) === 2) {
      return 1.1;
    }

    const distance = getCenterDistance(index);
    const maxDistance = (dayItemWidth + dayItemSpacing) * 3;
    const scale = Math.max(0.8, 1.0 - (distance / maxDistance) * 0.2);
    return Math.min(1.0, scale);
  };

  const getItemOpacity = (index) => {
    if (index === selectedDay) {
      return 1.0;
    }

    if (Math.abs(index - selectedDay) === 1) {
      return 0.9;
    }

    const distance = getCenterDistance(index);
    const maxDistance = (dayItemWidth + dayItemSpacing) * 2.5;
    return Math.max(0.5, 1 - (distance / maxDistance) * 0.5);
  };

  const handleScrollEnd = () => {
    if (shouldAutoScroll) {
      setShouldAutoScroll(false);
      return;
    }

    if (!shouldAutoScroll) {
      let closestIndex = 0;
      let minDistance = Infinity;

      for (let i = 0; i < dateRange.length; i++) {
        const distance = getCenterDistance(i);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = i;
        }
      }

      if (minDistance > 20) {
        setTimeout(() => {
          const offsetX = getScrollOffsetForIndex(closestIndex);
          scrollViewRef.current?.scrollTo({
            x: offsetX,
            animated: true
          });
        }, 100);
      }
    }
  };

  const renderDayItem = (dayData, index) => {
    const [year, month, day] = dayData;
    const originalIndex = dateRange.length - 1 - index;
    const isToday = originalIndex === currentDayIndex;
    const scale = getItemScale(index);
    const opacity = getItemOpacity(index);
    const isSelected = selectedDay === index;

    return (
      <TouchableOpacity
        key={`day-${index}`}
        style={[
          styles.dayCarouselItem,
          {
            width: dayItemWidth,
            marginHorizontal: getItemMargin(index),
            opacity: opacity,
            transform: [{ scale: scale }]
          }
        ]}
        onPress={() => handleDayPress(index)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.dayItemContainer,
            {
              backgroundColor: isSelected ? "#d60079" : colors.white,
              borderColor: isToday && !isSelected
                ? (colors.secondary || "#4A80F0")
                : (colors.lightGray || "#E5E7EB"),
              borderWidth: (isToday && !isSelected) ? 2 : 0,
              width: 70,
              height: 70,
            }
          ]}
        >
          <Text
            style={[
              styles.dayText,
              {
                color: isSelected
                  ? (colors.white || "#FFFFFF")
                  : (colors.text || "#374151"),
                fontSize: isSelected ? 24 : 18,
                fontFamily: isSelected
                  ? (Platform.OS === "android" ? "Yekan_Bakh_Bold" : getFontFamily("Yekan_Bakh_Bold", "500"))
                  : (Platform.OS === "android" ? "Yekan_Bakh_Regular" : getFontFamily("Yekan_Bakh_Regular", "normal")),
              }
            ]}
          >
            {toPersianDigits(day.toString())}
          </Text>
          <Text
            style={[
              styles.monthText,
              {
                color: isSelected
                  ? (colors.white || "#FFFFFF")
                  : (colors.secondary || "#6B7280"),
                fontSize: isSelected ? 11 : 9,
                fontFamily: isSelected
                  ? getFontFamily("Yekan_Bakh_Bold", "500")
                  : getFontFamily("Yekan_Bakh_Regular", "normal"),
              }
            ]}
          >
            {persianMonths[month - 1]}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const reversedDateRange = [...dateRange].reverse();

  return (
    <View style={styles.carouselContainer}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: screenWidth / 2 - dayItemWidth / 2,
            paddingRight: screenWidth / 2,
          }
        ]}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToAlignment="center"
        snapToInterval={dayItemWidth + dayItemSpacing}
      >
        {reversedDateRange.map((dayData, index) => renderDayItem(dayData, index))}
      </ScrollView>
    </View>
  );
};

const StatusIndicator = ({ status }: { status: string }) => {
  const statusColor = TASK_STATUS_COLORS[status] || "#9E9E9E";
  const statusColorBackground = TASK_STATUS_BACKGROUND[status] || "#f5f5f5";

  return (
    <View style={[styles.statusIndicator, { borderRadius: 6, backgroundColor: statusColorBackground }]}>
      <AppText style={[styles.statusText, { color: statusColor }]}>{status}</AppText>
    </View>
  );
};

// کامپوننت کارت تسک با زمان داینامیک
const TaskCard = ({ task, onStatusChange, isStatusChangeable, statusUpdateLoading, onPress }) => {
  const timeInfo = DynamicTimeInfo({ task });
  const isOverdue = isTaskOverdue(task.TaskDeadlineDate, task.TaskState);

  const fields = [
    {
      icon: "person-4",
      iconColor: colors.secondary,
      label: "نوع:",
      value: toPersianDigits(task.TaskTypeName),
    },
  ];

  if (timeInfo) {
    fields.push(timeInfo);
  }

  return (
    <View>
      <ProductCard
        title={
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>{toPersianDigits(task.TaskTitle)}</Text>
            <View style={styles.statusContainer}>
              <StatusIndicator status={task.TaskStateStr} />
              {statusUpdateLoading && (
                <ActivityIndicator
                  size="small"
                  color={colors.primary}
                  style={styles.statusLoader}
                />
              )}
            </View>
          </View>
        }
        fields={fields}
        note=""
        noteConfig={{
          show: false,
          icon: "notes",
          iconColor: colors.secondary,
          label: "",
        }}
        qrConfig={{
          show: false,
          icon: "camera",
          iconSize: 36,
          iconColor: colors.secondary,
        }}
        titleStyle={{ fontSize: 20 }}
        containerStyle={[
          Platform.OS === "android"
            ? {
              ...styles.androidCardAdjustment,
              borderColor: TASK_STATUS_COLORS[task.TaskStateStr] || "#9E9E9E",
            }
            : {
              ...styles.cardContainer,
              borderWidth: 2,
              borderColor: TASK_STATUS_COLORS[task.TaskStateStr] || "#9E9E9E",
            },
          styles.taskContentContainer,
          isOverdue && { borderColor: '#d32f2f' }
        ]}
        onPress={onPress}
        status={task.TaskStateStr}
        onStatusChange={isStatusChangeable ? onStatusChange : undefined}
        disabled={statusUpdateLoading}
      />
    </View>
  );
};

const TaskManagement: React.FC = () => {
  const navigation = useNavigation();
  const dateRange = getJalaliDateRange(11);
  const days = dateRange.map(([year, month, day]) => day);
  const months = dateRange.map(([year, month, day]) => month);
  const years = dateRange.map(([year, month, day]) => year);
  const [jyear, jmonth, jday] = toJalali(new Date());
  const gregorianDate = new Date();
  const [taskDrawerVisible, setTaskDrawerVisible] = useState<boolean>(false);
  const [currentTaskId, setCurrentTaskId] = useState<number | null>(null);

  const [tasks, setTasks] = useState<ITask[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState<{ [key: number]: boolean }>({});

  const currentDayIndex = 5;
  const todayIndexInReversedArray = dateRange.length - 1 - currentDayIndex;
  const [selectedDay, setSelectedDay] = useState(todayIndexInReversedArray);

  useEffect(() => {
    setSelectedDay(todayIndexInReversedArray);
  }, []);

  const getTasks = async () => {
    setLoading(true);
    const originalIndex = dateRange.length - 1 - selectedDay;

    const [year, month, day] = jalaliToGregorian(
      years[originalIndex],
      months[originalIndex],
      days[originalIndex]
    );

    try {
      const response = await axios.get(
        `${appConfig.mobileApi}Task/GetAllByDate?date=${year}%2F${month}%2F${day}&page=1&pageSize=1000`
      );

      const tasksWithStatuses = response.data.Items.map((task: ITask) => {
        // استفاده از وضعیت واقعی از API
        const statusText = getTaskStatusText(task.TaskState, task.TaskStateStr);

        // به‌روزرسانی TaskStateStr با وضعیت صحیح
        task.TaskStateStr = statusText;

        return task;
      });

      setTasks(tasksWithStatuses);
    } catch (error) {
      console.log(error);
      Alert.alert("خطا", "خطا در دریافت اطلاعات تسک‌ها");
    } finally {
      setLoading(false);
    }
  };

  const handleDaySelect = (selectedIndex: number) => {
    setSelectedDay(selectedIndex);
  };

  useEffect(() => {
    getTasks();
  }, [selectedDay]);

  const updateTaskStatus = async (taskId: number, newStatus: string) => {
    const newStateNumber = STATUS_TO_API_MAPPING[newStatus];

    if (!newStateNumber) {
      Alert.alert("خطا", "وضعیت نامعتبر");
      return false;
    }

    setStatusUpdateLoading(prev => ({ ...prev, [taskId]: true }));

    try {
      const response = await axios.get(
        `${appConfig.mobileApi}Task/SetTaskState?taskId=${taskId}&state=${newStateNumber}`
      );

      if (response.data === true) {
        // بروزرسانی موفقیت‌آمیز
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.TaskId === taskId
              ? { ...task, TaskStateStr: newStatus, TaskState: newStateNumber }
              : task
          )
        );
        return true;
      } else {
        // API خطا برگردانده
        Alert.alert("خطا", "تغییر وضعیت ناموفق بود");
        return false;
      }
    } catch (error) {
      console.log("Error updating task status:", error);
      Alert.alert("خطا", "خطا در ارتباط با سرور");
      return false;
    } finally {
      setStatusUpdateLoading(prev => ({ ...prev, [taskId]: false }));
    }
  };

  const handleStatusChange = async (taskId: number, currentStatus: string) => {
    // تعیین وضعیت بعدی بر اساس وضعیت فعلی
    let nextStatus;

    switch (currentStatus) {
      case TASK_STATUS.NOT_STARTED:
        nextStatus = TASK_STATUS.IN_PROGRESS;
        break;
      case TASK_STATUS.IN_PROGRESS:
        nextStatus = TASK_STATUS.COMPLETED;
        break;
      case TASK_STATUS.COMPLETED:
        nextStatus = TASK_STATUS.IN_PROGRESS;
        break;
      case TASK_STATUS.CANCELED:
        // حالت "لغو شده" قابل تغییر نیست
        return;
      default:
        return;
    }

    // فراخوانی API برای تغییر وضعیت
    const success = await updateTaskStatus(taskId, nextStatus);

    if (!success) {
      // در صورت ناموفق بودن، وضعیت تغییر نمی‌کند
      console.log("Status update failed for task:", taskId);
    }
  };

  // تابع برای تشخیص اینکه آیا وضعیت قابل تغییر است
  const isStatusChangeable = (status: string) => {
    return status !== TASK_STATUS.CANCELED;
  };

  return (
    <>
      <ScreenHeader title="مدیریت وظایف" />
      <SafeAreaView style={styles.container}>
        <ScrollableDayCarousel
          dateRange={dateRange}
          selectedDay={selectedDay}
          onDaySelect={handleDaySelect}
          currentDayIndex={currentDayIndex}
        />

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
              <TaskCard
                key={task.TaskId}
                task={task}
                onStatusChange={(currentStatus) => handleStatusChange(task.TaskId, currentStatus)}
                isStatusChangeable={isStatusChangeable(task.TaskStateStr)}
                statusUpdateLoading={statusUpdateLoading[task.TaskId]}
                onPress={() => {
                  setCurrentTaskId(task.TaskId);
                  setTaskDrawerVisible(true);
                }}
              />
            ))
          )}
        </View>
      </SafeAreaView>

      {currentTaskId && (
        <TaskDrawer
          visible={taskDrawerVisible}
          onClose={() => setTaskDrawerVisible(false)}
          taskId={currentTaskId}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  androidCardAdjustment: {
    borderWidth: 2,
    marginVertical: 8,
    minHeight: 120,
    paddingVertical: 16,
  },
  cardContainer: {
    minHeight: 120,
    paddingVertical: 16,
    marginVertical: 10,
  },
  titleContainer: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    minHeight: 0,
    paddingVertical: 0,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusLoader: {
    marginLeft: 4,
  },
  taskContentContainer: {
    paddingVertical: 8,
    paddingTop: 0,
    minHeight: 80,
  },
  carouselContainer: {
    height: 120,
    marginTop: 0,
    marginBottom: 10,
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  dayCarouselItem: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 100,
  },
  dayItemContainer: {
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  dayText: {
    fontFamily: getFontFamily("Yekan_Bakh_Regular", "normal"),
    textAlign: 'center',
  },
  monthText: {
    fontFamily: getFontFamily("Yekan_Bakh_Regular", "normal"),
    textAlign: 'center',
    marginTop: 2,
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
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "bold"),
    color: colors.black,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  contentText: {
    fontSize: 16,
    fontFamily: getFontFamily("Yekan_Bakh_Regular", "normal"),
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
  titleText: {
    fontSize: 20,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "500"),
    color: colors.text || "#333",
    textAlign: 'right',
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontFamily: getFontFamily("Yekan_Bakh_Regular", "500"),
  },
  timeIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
  },
  timeText: {
    fontSize: 11,
    fontFamily: getFontFamily("Yekan_Bakh_Regular", "400"),
  }
});

export default TaskManagement;