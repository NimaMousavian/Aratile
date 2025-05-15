import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Keyboard,
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import colors from "../config/colors";
import Text from "./Text";
import Toast from "./Toast";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import AppTextInput from "./TextInput";
import { ITask } from "../config/types";
import axios from "axios";
import appConfig from "../../config";
const { height } = Dimensions.get("window");
interface TaskDrawerProps {
  visible: boolean;
  onClose: () => void;
  onError?: (
    message: string,
    type: "success" | "error" | "warning" | "info"
  ) => void;
  taskId: number;
}

const TaskDrawer: React.FC<TaskDrawerProps> = ({
  visible,
  onClose,
  taskId,
}) => {
  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<
    "success" | "error" | "warning" | "info"
  >("error");

  const slideAnimation = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const [task, setTask] = useState<ITask>();

  const getTask = async () => {
    try {
      const response = await axios.get(
        `${appConfig.mobileApi}Task/Get?id=${taskId}`
      );
      setTask(response.data);
    } catch (error) {}
  };

  useEffect(() => {
    if (visible) {
      slideAnimation.setValue(0);
      Animated.parallel([
        Animated.timing(slideAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnimation, backdropOpacity]);

  const closeDrawer = () => {
    Keyboard.dismiss();
    Animated.parallel([
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease),
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const animatedStyle = {
    transform: [
      {
        translateY: slideAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [height, 0],
        }),
      },
    ],
  };

  const backdropStyle = {
    opacity: backdropOpacity,
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={closeDrawer}
    >
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onDismiss={() => setToastVisible(false)}
      />

      <View style={styles.modalContainer}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <TouchableOpacity
            style={styles.backdropTouchable}
            activeOpacity={1}
            onPress={closeDrawer}
          />
        </Animated.View>

        <Animated.View style={[styles.drawerContainer, animatedStyle]}>
          <LinearGradient
            colors={[colors.secondary, colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              {/* <MaterialIcons
                name="search"
                size={24}
                color="white"
                style={styles.headerIcon}
              /> */}
              <Text style={styles.headerTitle}>جزئیات وظیفه</Text>
            </View>
            <TouchableOpacity onPress={closeDrawer} style={styles.closeButton}>
              <MaterialIcons
                name="close"
                size={32}
                color="white"
                style={{ marginLeft: -4 }}
              />
            </TouchableOpacity>
          </LinearGradient>

          <View style={styles.body}>
            <Text>{taskId}</Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  backdropTouchable: {
    flex: 1,
  },
  drawerContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 16,
    height: "80%",
    paddingBottom: Platform.OS === "android" ? 20 : 0,
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
  headerIcon: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    fontSize: 18,
    color: colors.white,
    marginRight: 8,
    fontFamily: "Yekan_Bakh_Bold",
  },
  closeButton: {
    padding: 0,
  },
  body: {
    padding: 16,
    flex: 1,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInputWrapper: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    height: 56,
  },
  textInputContainer: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    fontFamily: "Yekan_Bakh_Regular",
    fontSize: 14,
    padding: 8,
    height: Platform.OS === "android" ? 40 : 44,
    textAlign: "right",
    minHeight: 40,
  },
  clearButton: {
    padding: 5,
  },
  searchButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    width: 40,
    height: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: colors.medium,
  },
  emptyResultText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: colors.medium,
    textAlign: "center",
    marginTop: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  productCard: {
    marginBottom: 10,
  },
  searchTipsContainer: {
    marginTop: 20,
    alignItems: "center",
    width: "100%",
    padding: 10,
  },
  searchTipsTitle: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: colors.secondary,
    marginBottom: 8,
  },
  searchTipText: {
    fontSize: 13,
    fontFamily: "Yekan_Bakh_Regular",
    color: colors.medium,
    marginBottom: 4,
    textAlign: "center",
  },
});

export default TaskDrawer;
