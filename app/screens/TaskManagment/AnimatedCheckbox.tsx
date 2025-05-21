import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Easing, TouchableOpacity, Text } from "react-native";
import { Feather } from "@expo/vector-icons";

const TASK_STATUS = {
  NOT_STARTED: "شروع نشده",
  IN_PROGRESS: "درحال انجام",
  COMPLETED: "پایان یافته",
  DELAYED: "تاخیر خورده",
  CANCELED: "لغو شده",
};

const TASK_STATUS_COLORS = {
  [TASK_STATUS.NOT_STARTED]: "#f1c02a",
  [TASK_STATUS.IN_PROGRESS]: "#2196F3",
  [TASK_STATUS.COMPLETED]: "#4CAF50",
  [TASK_STATUS.DELAYED]: "#F44336",
  [TASK_STATUS.CANCELED]: "#9E9E9E",
};

const AnimatedCheckbox = ({ status, onPress, size = 24, showStatus = false }) => {
  // Determine if the checkbox is completed
  const isCompleted = status === TASK_STATUS.COMPLETED;

  // Animation references with proper initial values
  const scaleAnim = useRef(new Animated.Value(isCompleted ? 1 : 0)).current;
  const opacityAnim = useRef(new Animated.Value(isCompleted ? 1 : 0)).current;
  const rotateAnim = useRef(new Animated.Value(isCompleted ? 1 : 0)).current;

  // Get the appropriate color based on status
  const statusColor = TASK_STATUS_COLORS[status] || "#9E9E9E";

  // Configure rotation animation
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  // Run animations when status changes
  useEffect(() => {
    // Reset animations to avoid conflicts
    if (isCompleted) {
      // Animate check mark appearing with rotation and scaling
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.elastic(1),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.bezier(0.175, 0.885, 0.32, 1.275),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate check mark disappearing
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isCompleted, scaleAnim, opacityAnim, rotateAnim]);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.container}
      testID="animated-checkbox"
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isCompleted }}
    >
      {/* Checkbox container */}
      <Animated.View
        style={[
          styles.checkbox,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: statusColor,
            backgroundColor: isCompleted ? statusColor : 'transparent',
            transform: [
              { scale: isCompleted ? 1 : 0.98 } // Slight size difference for unchecked
            ]
          }
        ]}
      >
        {/* Animated checkmark */}
        <Animated.View
          style={{
            opacity: opacityAnim,
            transform: [
              { scale: scaleAnim },
              { rotate: spin }
            ],
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Feather
            name="check"
            size={size * 0.65}
            color="white"
            style={styles.checkIcon}
          />
        </Animated.View>
      </Animated.View>

      {/* Optional status text */}
      {showStatus && (
        <Text style={[styles.statusText, { color: statusColor }]}>
          {status}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  checkbox: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
  },
  checkIcon: {
    textAlign: 'center',
    textAlignVertical: 'center', // For Android
  },
  statusText: {
    marginRight: 8,
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default AnimatedCheckbox;