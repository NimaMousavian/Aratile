import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import colors from "../../config/colors";

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

const TaskManagement: React.FC = () => {
  const navigation = useNavigation();
  const [selectedDay, setSelectedDay] = useState(0);

  // This array can be changed to days of the week in Farsi if needed
  const weekDays = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
  // Or for Farsi days: ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه", "شنبه", "یکشنبه", "دوشنبه"];

  const screenWidth = Dimensions.get('window').width;
  // Calculate item width to display 3 items at a time with some spacing
  const dayItemWidth = (screenWidth - 48) / 3; // 48 accounts for padding and margins

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>مدیریت وظایف</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.carouselContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carousel}
          snapToInterval={dayItemWidth + 10} // Add margin to snap calculation
          decelerationRate="fast"
          snapToAlignment="center"
          contentInset={{ left: 0, right: 0 }}
        >
          {weekDays.map((day, index) => (
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
                {day}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.content}>
        <Text style={styles.contentText}>
          روز انتخاب شده: {weekDays[selectedDay]}
        </Text>
        {/* Add your task list here */}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
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
  },
  carousel: {
    paddingHorizontal: 16,
  },
  dayItem: {
    // Width and height now dynamically set in the component
    borderRadius: 8, // Reduced radius for square look
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
    backgroundColor: colors.lightGray || "#F5F5F5",
  },
  selectedDayItem: {
    backgroundColor: colors.primary || "#4A80F0",
  },
  dayText: {
    fontSize: 18, // Increased font size
    fontFamily: getFontFamily("", "semi-bold"),
    color: colors.darkGray || "#707070",
  },
  selectedDayText: {
    color: colors.white || "#FFFFFF",
  },
  content: {
    flex: 1,
    padding: 16,
    alignItems: "center",
  },
  contentText: {
    fontSize: 16,
    fontFamily: getFontFamily("", "regular"),
    textAlign: "center",
    marginTop: 20,
  },
});

export default TaskManagement;