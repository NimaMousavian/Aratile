import React, { useState, useEffect, useRef } from "react";
import { View, TouchableOpacity, StyleSheet, Animated, Easing } from "react-native";
import { Feather } from "@expo/vector-icons";
import colors from "../config/colors";

// تعریف انواع ورودی
interface StatusCircleProps {
  status: string;
  onPress: (e: any) => void;
  size?: number; // امکان تغییر اندازه
  showPulse?: boolean; // نمایش افکت پالس
}

// کامپوننت دایره وضعیت
const StatusCircle: React.FC<StatusCircleProps> = ({
  status,
  onPress,
  size = 40,
  showPulse = true
}) => {
  // انیمیشن برای چرخش آیکون
  const rotateAnim = useRef(new Animated.Value(0)).current;
  // انیمیشن برای تغییر اندازه
  const scaleAnim = useRef(new Animated.Value(1)).current;
  // انیمیشن برای افکت پالس
  const pulseAnim = useRef(new Animated.Value(1)).current;
  // انیمیشن برای تغییر رنگ
  const colorFade = useRef(new Animated.Value(0)).current;

  // حالت قبلی برای مقایسه تغییرات
  const prevStatusRef = useRef(status);

  // تنظیم آیکون بر اساس وضعیت
  let iconName = "circle";

  switch (status) {
    case "شروع نشده":
      iconName = "circle";
      break;
    case "درحال انجام":
      iconName = "play";
      break;
    case "پایان یافته":
      iconName = "check-circle";
      break;
    case "تاخیر خورده":
      iconName = "alert-triangle";
      break;
    case "لغو شده":
      iconName = "x-circle";
      break;
    default:
      iconName = "circle";
  }

  // رنگ مربوط به هر وضعیت
  const getStatusColor = () => {
    switch (status) {
      case "شروع نشده":
        return "#f1c02a"; // زرد
      case "درحال انجام":
        return "#2196F3"; // آبی
      case "پایان یافته":
        return "#4CAF50"; // سبز
      case "تاخیر خورده":
        return "#F44336"; // قرمز
      case "لغو شده":
        return "#9E9E9E"; // خاکستری
      default:
        return "#9E9E9E";
    }
  };

  // افکت پالس مداوم برای وضعیت "درحال انجام"
  useEffect(() => {
    let pulseAnimation: Animated.CompositeAnimation;

    if (status === "درحال انجام" && showPulse) {
      pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
    } else {
      // بازنشانی به حالت اولیه
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }

    return () => {
      if (pulseAnimation) {
        pulseAnimation.stop();
      }
    };
  }, [status, showPulse]);

  // اجرای انیمیشن هنگام تغییر وضعیت
  useEffect(() => {
    // فقط اگر وضعیت تغییر کرده باشد انیمیشن را اجرا کن
    if (prevStatusRef.current !== status) {
      // انیمیشن‌های ترکیبی
      Animated.sequence([
        // ابتدا کوچک می‌شود
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 150,
          easing: Easing.out(Easing.back(2)),
          useNativeDriver: true,
        }),
        // سپس انیمیشن‌های موازی
        Animated.parallel([
          // چرخش با شتاب و کندی طبیعی
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 400,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
          }),
          // بزرگ شدن با افکت فنری
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 5,
            tension: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        // بازنشانی انیمیشن چرخش برای دفعه بعد
        rotateAnim.setValue(0);
      });

      // بروزرسانی حالت قبلی
      prevStatusRef.current = status;
    }
  }, [status]);

  // محاسبه انیمیشن چرخش
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  // اضافه کردن افکت سایه متناسب با وضعیت
  const getAdditionalStyles = () => {
    if (status === "درحال انجام") {
      return {
        shadowColor: getStatusColor(),
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 6,
        elevation: 8,
      };
    } else if (status === "تاخیر خورده") {
      return {
        shadowColor: "#F44336",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 8,
        elevation: 10,
      };
    }
    return {};
  };

  // استایل برای دایره باید با اندازه داینامیک تنظیم شود
  const dynamicCircleStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  // افکت ریپل برای کلیک
  const [rippleScale] = useState(new Animated.Value(0));
  const [rippleOpacity] = useState(new Animated.Value(1));

  const handlePress = (e: any) => {
    // ریست انیمیشن‌های ریپل
    rippleScale.setValue(0);
    rippleOpacity.setValue(1);

    // اجرای انیمیشن ریپل
    Animated.parallel([
      Animated.timing(rippleScale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(rippleOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // فراخوانی تابع اصلی
    onPress(e);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.circleContainer}
      activeOpacity={0.9}
    >
      {/* افکت ریپل */}
      <Animated.View
        style={[
          styles.ripple,
          dynamicCircleStyle,
          {
            backgroundColor: getStatusColor(),
            opacity: rippleOpacity,
            transform: [{ scale: rippleScale }],
          },
        ]}
      />

      {/* دایره اصلی */}
      <Animated.View
        style={[
          styles.circle,
          dynamicCircleStyle,
          getAdditionalStyles(),
          {
            backgroundColor: getStatusColor(),
            transform: [
              { rotate },
              { scale: Animated.multiply(scaleAnim, pulseAnim) }
            ]
          }
        ]}
      >
        <Feather name={iconName} size={size * 0.45} color="white" />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  circleContainer: {
    padding: 5,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  ripple: {
    position: 'absolute',
    opacity: 0,
  },
});

export default StatusCircle;