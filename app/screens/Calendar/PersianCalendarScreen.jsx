import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Image,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import colors from "../../config/colors";
import { useNavigation } from "@react-navigation/native";
import ScreenHeader from "../../components/ScreenHeader";
import { toPersianDigits } from "../../utils/numberConversions";
import MonthYearPicker from "./MonthYearPicker";
import { LinearGradient } from "expo-linear-gradient";



const { width, height } = Dimensions.get("window");

const getFontFamily = (baseFont, weight) => {
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

const persianMonths = [
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

const weekDays = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

// Define Persian seasons
const persianSeasons = {
  SPRING: "بهار",
  SUMMER: "تابستان",
  FALL: "پاییز",
  WINTER: "زمستان",
};

// Function to determine season based on month
const getSeason = (month) => {
  if (month >= 0 && month <= 2) return persianSeasons.SPRING;
  if (month >= 3 && month <= 5) return persianSeasons.SUMMER;
  if (month >= 6 && month <= 8) return persianSeasons.FALL;
  return persianSeasons.WINTER;
};

// Function to get seasonal image path
const getSeasonalImage = (season) => {
  switch (season) {
    case persianSeasons.SPRING:
      return require("../../../assets/seasons/spring.webp");
    case persianSeasons.SUMMER:
      return require("../../../assets/seasons/summer.webp");
    case persianSeasons.FALL:
      return require("../../../assets/seasons/autumn.webp");
    case persianSeasons.WINTER:
      return require("../../../assets/seasons/winter.webp");
    // default:
    //   return require("../../../assets/seasons/default.jpg");
  }
};

const calculateImageHeight = () => {
  const imageRatio = 520 / 1000;
  return width * imageRatio;
};

const isJalaliLeapYear = (year) => {
  return ((year + 12) % 33) % 4 === 1;
};

const toJalali = (date) => {
  const gregorianDate = new Date(date);
  const gregorianYear = gregorianDate.getFullYear();
  const gregorianMonth = gregorianDate.getMonth() + 1;
  const gregorianDay = gregorianDate.getDate();

  let jYear, jMonth, jDay;

  const gregorianDays =
    (gregorianYear - 1) * 365 +
    Math.floor((gregorianYear - 1) / 4) -
    Math.floor((gregorianYear - 1) / 100) +
    Math.floor((gregorianYear - 1) / 400);

  let gDaysInMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  if (
    gregorianYear % 4 === 0 &&
    (gregorianYear % 100 !== 0 || gregorianYear % 400 === 0)
  ) {
    gDaysInMonth[2] = 29;
  }

  let dayOfYear = gregorianDay;
  for (let i = 1; i < gregorianMonth; i++) {
    dayOfYear += gDaysInMonth[i];
  }

  if (dayOfYear <= 79) {
    jYear = gregorianYear - 622;
    const jDaysInMonth = [0, 31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
    if (jYear % 4 === 3) {
      jDaysInMonth[12] = 30;
    }

    let remainingDays = dayOfYear + 286;
    jMonth = 10;
    while (remainingDays > jDaysInMonth[jMonth]) {
      remainingDays -= jDaysInMonth[jMonth];
      jMonth++;
      if (jMonth > 12) {
        jMonth = 1;
      }
    }
    jDay = remainingDays;
  } else {
    jYear = gregorianYear - 621;
    const jDaysInMonth = [0, 31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
    if (jYear % 4 === 3) {
      jDaysInMonth[12] = 30;
    }

    let remainingDays = dayOfYear - 79;
    jMonth = 1;
    while (remainingDays > jDaysInMonth[jMonth]) {
      remainingDays -= jDaysInMonth[jMonth];
      jMonth++;
    }
    jDay = remainingDays;
  }

  return {
    year: jYear,
    month: jMonth - 1,
    day: jDay,
    monthName: persianMonths[jMonth - 1],
  };
};

const daysInMonth = (month, year) => {
  if (month < 6) return 31;
  if (month < 11) return 30;
  if (isJalaliLeapYear(year)) return 30;
  return 29;
};

const getJalaliToGregorianArray = (year) => {
  if (isJalaliLeapYear(year)) {
    return [
      [3, 21],
      [4, 21],
      [5, 22],
      [6, 22],
      [7, 23],
      [8, 23],
      [9, 23],
      [10, 23],
      [11, 22],
      [12, 22],
      [1, 21],
      [2, 20],
    ];
  } else {
    return [
      [3, 22],
      [4, 22],
      [5, 23],
      [6, 23],
      [7, 24],
      [8, 24],
      [9, 24],
      [10, 24],
      [11, 23],
      [12, 23],
      [1, 22],
      [2, 21],
    ];
  }
};

const getFirstDayOfMonth = (year, month) => {
  let gYear, gMonth, gDay;

  if (month < 10) {
    gYear = year + 621;
  } else {
    gYear = year + 622;
  }

  const jalaliToGregorian = getJalaliToGregorianArray(year);

  gMonth = jalaliToGregorian[month][0] - 1;
  gDay = jalaliToGregorian[month][1];

  const gregorianDate = new Date(gYear, gMonth, gDay);

  let dayOfWeek = gregorianDate.getDay();

  return dayOfWeek;
};

const PersianCalendarScreen = () => {
  const navigation = useNavigation();
  const today = new Date();
  const jalaliToday = toJalali(today);

  const [currentYear, setCurrentYear] = useState(jalaliToday.year);
  const [currentMonth, setCurrentMonth] = useState(jalaliToday.month);
  const [selectedDay, setSelectedDay] = useState(jalaliToday.day);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  // New state to track which month and year the selected day belongs to
  const [selectedDayMonth, setSelectedDayMonth] = useState(jalaliToday.month);
  const [selectedDayYear, setSelectedDayYear] = useState(jalaliToday.year);

  // State for current season
  const [currentSeason, setCurrentSeason] = useState(
    getSeason(jalaliToday.month)
  );

  // Update current season when month changes
  useEffect(() => {
    setCurrentSeason(getSeason(currentMonth));
  }, [currentMonth]);

  // Calculate cell size with better spacing
  const cellSpacing = 4;
  const horizontalPadding = 8;
  const availableWidth = width - horizontalPadding * 2;
  const cellSize = Math.floor(availableWidth / 7);

  const generateCalendarDays = () => {
    const days = [];
    const totalDays = daysInMonth(currentMonth, currentYear);
    const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    for (let i = 1; i <= totalDays; i++) {
      days.push(i);
    }

    const remainingCells = 7 - (days.length % 7);
    if (remainingCells < 7) {
      for (let i = 0; i < remainingCells; i++) {
        days.push(null);
      }
    }

    return days;
  };

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const selectDay = (day) => {
    if (day !== null) {
      setSelectedDay(day);
      // When a day is selected, update the month and year it belongs to
      setSelectedDayMonth(currentMonth);
      setSelectedDayYear(currentYear);
    }
  };

  const handleMonthYearConfirm = (date) => {
    setCurrentYear(date[0]);
    setCurrentMonth(date[1] - 1);
  };

  const renderDay = ({ item, index }) => {
    if (item === null) {
      return <View style={[styles.dayCellSquare, styles.emptyDay]} />;
    }

    // Only highlight the selected day if it belongs to the current month being viewed
    const isSelected =
      selectedDay === item &&
      selectedDayMonth === currentMonth &&
      selectedDayYear === currentYear;

    const firstDayOfMonthIndex = getFirstDayOfMonth(currentYear, currentMonth);

    const dayOfWeek = (firstDayOfMonthIndex + (item - 1)) % 7;

    const isFriday = dayOfWeek === 6;

    const isToday =
      currentYear === jalaliToday.year &&
      currentMonth === jalaliToday.month &&
      item === jalaliToday.day;

    return (
      <View style={styles.dayCellSquare}>
        <TouchableOpacity
          style={[
            styles.dayItemContainer,
            isSelected && styles.selectedDay,
            isToday && !isSelected && styles.todayDay,
          ]}
          onPress={() => selectDay(item)}
        >
          <Text
            style={[
              styles.dayText,
              isFriday && !isSelected && styles.fridayText,
              isSelected && styles.selectedDayText,
              isToday && !isSelected && styles.todayText,
            ]}
          >
            {toPersianDigits(item)}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      {/* <ScreenHeader title="تقویم" /> */}
      <View style={styles.container}>
        <View style={styles.seasonalImageContainer}>
          <Image
            source={getSeasonalImage(currentSeason)}
            style={styles.seasonalImage}
          />

          {/* Glass Effect with Gradient Overlay */}
          <LinearGradient
            colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0.5)"]}
            style={styles.glassOverlay}
          >
            <View style={styles.monthHeader}>
              <TouchableOpacity onPress={goToPreviousMonth}>
                <MaterialIcons name="chevron-right" size={40} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setDatePickerVisible(true)}>
                <Text style={styles.monthYearTextOverlay}>
                  {persianMonths[currentMonth]} {toPersianDigits(currentYear)}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={goToNextMonth}>
                <MaterialIcons name="chevron-left" size={40} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.weekDaysContainer}>
          {weekDays.map((day, index) => (
            <View
              key={index}
              style={[styles.weekDayContainer, { width: cellSize }]}
            >
              <Text
                style={[styles.weekDayText, index === 6 && styles.fridayText]}
              >
                {day}
              </Text>
            </View>
          ))}
        </View>

        <FlatList
          data={generateCalendarDays()}
          renderItem={renderDay}
          keyExtractor={(item, index) => index.toString()}
          numColumns={7}
          scrollEnabled={false}
          columnWrapperStyle={styles.calendarRow}
          contentContainerStyle={styles.calendarContainer}
        />
      </View>

      <MonthYearPicker
        isVisible={isDatePickerVisible}
        onClose={() => setDatePickerVisible(false)}
        onConfirm={handleMonthYearConfirm}
        initialDate={[currentYear, currentMonth + 1]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    direction: "rtl",
  },

  seasonalImageContainer: {
    width: "100%",
    height: calculateImageHeight(),
    position: "relative",
    marginBottom: 15,

    overflow: "hidden",
  },
  seasonalImage: {
    width: "100%",
    height: "100%",
  },

  glassOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingVertical: 15,
    paddingHorizontal: 10,
    justifyContent: "flex-end",
    marginBottom: -2,
    ...Platform.select({
      android: {
        elevation: 1,
      },
    }),
  },

  seasonOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderTopLeftRadius: 10,
  },
  seasonText: {
    bottom: 0,
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "bold"),
  },
  calendarContainer: {
    marginRight: 1,
    marginLeft: 1,
  },
  // Month header styling (now in the glass overlay)
  monthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: -5,
  },
  monthYearTextOverlay: {
    fontSize: 22,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "bold"),
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    marginBottom: -10,
  },
  weekDaysContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#F5F5F5",
    paddingVertical: 10,
    marginBottom: 4,
  },
  weekDayContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  weekDayText: {
    fontSize: 14,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "bold"),
    color: "#888888",
    textAlign: "center",
  },
  calendarRow: {
    justifyContent: "space-around",
    marginBottom: 1,
  },
  dayCellSquare: {
    width: Math.floor(width / 7) - 4,
    height: Math.floor(width / 7) - 4,
    justifyContent: "center",
    alignItems: "center",
    margin: 2,
    padding: 0,
  },
  dayItemContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
  },
  emptyDay: {
    elevation: 0,
    shadowOpacity: 0,
  },
  dayText: {
    fontSize: 16,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "bold"),
    color: "#333333",
    textAlign: "center",
    includeFontPadding: false,
    padding: 0,
    margin: 0,
  },
  selectedDay: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
  },
  selectedDayText: {
    color: "#FFFFFF",
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "bold"),
  },
  fridayText: {
    color: "#FF0000",
    fontSize: 16,
  },
  todayDay: {
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  todayText: {
    color: colors.secondary,
  },
});

export default PersianCalendarScreen;
