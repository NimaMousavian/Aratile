import React, { useState, useRef, useEffect } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  Animated,
  InteractionManager,
  Linking,
  Alert,
} from "react-native";
import colors from "../config/colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { AppNavigationProp, RootStackParamList } from "../StackNavigator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLoginResponse } from "./LogingScreen";
import { ILoginResponse } from "../config/types";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import * as FileSystem from "expo-file-system";
import appConfig from "../../config";
import * as IntentLauncher from "expo-intent-launcher";

export interface MenuItem {
  id: number;
  name: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor?: string;
  screenName?: keyof RootStackParamList;
}

type FontWeight = "700" | "600" | "500" | "bold" | "semi-bold" | string;
const API_BASE_URL = appConfig.mobileApi;

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

const openAppByPackageName = async () => {
  if (Platform.OS === "android") {
    try {
      await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
        data: "package:com.pirooze.MianCheck", // Change this to the package you want
      });
    } catch (error) {
      Alert.alert("Error", "App not found or cannot be opened.");
    }
  } else {
    Alert.alert("Unsupported", "This only works on Android.");
  }
};

const openApp = async (packageName: string) => {
  if (Platform.OS === "android") {
    // Construct the intent URI for Android
    const url = `intent://open#Intent;package=${packageName};end`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.log(`Cannot open app with package: ${packageName}`);
      }
    } catch (error) {
      console.error("An error occurred while opening the app:", error);
    }
  } else {
    console.log("This feature is only supported on Android");
  }
};

const openCalculator = async () => {
  if (Platform.OS === "android") {
    try {
      const calculatorIntent = "android.intent.action.MAIN";
      const calculatorCategory = "android.intent.category.APP_CALCULATOR";

      try {
        await IntentLauncher.startActivityAsync(calculatorIntent, {
          category: calculatorCategory,
        });
        return;
      } catch (intentError) {
        console.log("Intent launcher failed, trying Linking...");
      }

      const calculatorPackages = [
        "com.google.android.calculator", 
        "com.android.calculator2", 
        "com.sec.android.app.popupcalculator", 
        "com.miui.calculator",
        "com.oneplus.calculator",
        "com.huawei.calculator",
        "calculator://", 
      ];

      for (const packageName of calculatorPackages) {
        try {
          let url;
          if (packageName.startsWith("calculator://")) {
            url = packageName;
          } else {
            url = `intent://open#Intent;package=${packageName};end`;
          }

          const canOpen = await Linking.canOpenURL(url);
          if (canOpen) {
            await Linking.openURL(url);
            return;
          }
        } catch (error) {
          console.log(`Failed to open calculator with package: ${packageName}`);
          continue;
        }
      }

      Alert.alert(
        "خطا",
        "ماشین حساب پیدا نشد. لطفاً از فهرست برنامه‌ها ماشین حساب را باز کنید.",
        [{ text: "باشه", style: "default" }]
      );

    } catch (error) {
      console.error("Error opening calculator:", error);
      Alert.alert(
        "خطا",
        "خطا در باز کردن ماشین حساب. لطفاً دستی باز کنید.",
        [{ text: "باشه", style: "default" }]
      );
    }
  } else if (Platform.OS === "ios") {
    try {
      const calculatorURL = "calc://";
      const canOpen = await Linking.canOpenURL(calculatorURL);

      if (canOpen) {
        await Linking.openURL(calculatorURL);
      } else {
        const shortcutsURL = "shortcuts://run-shortcut?name=Calculator";
        const canOpenShortcuts = await Linking.canOpenURL(shortcutsURL);

        if (canOpenShortcuts) {
          await Linking.openURL(shortcutsURL);
        } else {
          Alert.alert(
            "ماشین حساب",
            "ماشین حساب را از Control Center یا صفحه اصلی باز کنید.",
            [{ text: "باشه", style: "default" }]
          );
        }
      }
    } catch (error) {
      console.error("Error opening calculator on iOS:", error);
      Alert.alert(
        "ماشین حساب",
        "ماشین حساب را از Control Center یا صفحه اصلی باز کنید.",
        [{ text: "باشه", style: "default" }]
      );
    }
  } else {
    Alert.alert(
      "پشتیبانی نشده",
      "این ویژگی فقط روی موبایل قابل استفاده است.",
      [{ text: "باشه", style: "default" }]
    );
  }
};
const safeNavigate = (navigation: any, screenName: string, params?: any) => {
  console.log(`Attempting to navigate to: ${screenName}`);

  let correctedName = screenName;

  if (screenName === "IssuingNewInvoic") {
    correctedName = "IssuingNewInvoice";
    console.log(`Corrected screen name from ${screenName} to ${correctedName}`);
  }

  const commonScreens: { [key: string]: string } = {
    IssuedInvoic: "IssuedInvoices",
    SupplyReques: "SupplyRequest",
    SupplyRequestLis: "SupplyRequestList",
    ReceiveNewInvoic: "ReceiveNewInvoice",
    StatusFilterScree: "StatusFilterScreen",
    FieldMarketer: "FieldMarketer",
    ShowRoom: "ShowRoom",
    Forms: "Forms",
    Checklist: "TaskManagement",
  };

  if (commonScreens[screenName]) {
    correctedName = commonScreens[screenName];
    console.log(`Corrected screen name from ${screenName} to ${correctedName}`);
  }

  try {
    if (correctedName === "IssuingNewInvoice") {
      console.log("Navigating to IssuingNewInvoice with explicit parameters");
      navigation.navigate(correctedName, { scannedCode: undefined });
    } else {
      navigation.navigate(correctedName, params);
    }
  } catch (error) {
    console.error(`Navigation error: ${error}`);

    try {
      console.log("Fallback to Home navigation");
      navigation.navigate("Home");
    } catch (fallbackError) {
      console.error(`Even fallback navigation failed: ${fallbackError}`);
    }
  }
};

const initialItems: MenuItem[] = [
  {
    id: 1,
    name: "صدور فاکتور جدید",
    icon: "receipt",
    iconColor: "#1C3F64",
    screenName: "IssuingNewInvoice",
  },
  {
    id: 2,
    name: "فاکتور ها",
    icon: "description",
    iconColor: "#1C3F64",
    screenName: "IssuedInvoices",
  },
  {
    id: 3,
    name: "راس گیر چک",
    icon: "account-balance",
    iconColor: "#1C3F64",
  },
  {
    id: 4,
    name: "ماشین حساب",
    icon: "calculate",
    iconColor: "#1C3F64",
  },
  {
    id: 5,
    name: "درخواست تامین",
    icon: "shopping-cart",
    iconColor: "#1C3F64",
    screenName: "SupplyRequest",
  },
  {
    id: 6,
    name: "بازاریابی میدانی",
    icon: "store",
    iconColor: "#1C3F64",
    screenName: "FieldMarketer",
  },
  {
    id: 7,
    name: "شوروم",
    icon: "filter-frames",
    iconColor: "#1C3F64",
    screenName: "Visits",
  },
  {
    id: 8,
    name: "فرم ها",
    icon: "edit-note",
    iconColor: "#1C3F64",
    screenName: "Forms",
  },
];

const LAYOUT_STORAGE_KEY = "home_screen_items_layout";

const screenWidth = Dimensions.get("window").width;
const numColumns = 2;
const itemMargin = 10;
const itemWidth = (screenWidth - (numColumns + 1) * itemMargin) / numColumns;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const [items, setItems] = useState(initialItems);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<MenuItem | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [layoutSaved, setLayoutSaved] = useState(false);
  const [showSaveButton, setShowSaveButton] = useState(false);
  const [userData, setUserData] = useState<ILoginResponse>();
  const [avatarUri, setAvatarUri] = useState<string | undefined>(
    userData?.AvatarImageFileName
  );
  const [hasTodayTasks, setHasTodayTasks] = useState(false);
  const checklistButtonColorValue = useRef(new Animated.Value(0)).current;

  const checklistButtonColor = checklistButtonColorValue.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.secondary, "#FFFFFF"],
  });

  const isDraggingRef = useRef(false);
  const draggedItemRef = useRef<MenuItem | null>(null);
  const draggedIndexRef = useRef<number | null>(null);
  const hoveredIndexRef = useRef<number | null>(null);
  const showSaveButtonRef = useRef(false);

  const SPRING_CONFIG = {
    tension: 50,
    friction: 7,
    useNativeDriver: true,
  };

  const TIMING_CONFIG = {
    duration: 200,
    useNativeDriver: true,
  };

  const instructionOpacity = useRef(new Animated.Value(0)).current;
  const interactionType = useRef<"none" | "scrolling" | "dragging">("none");
  const lastInteractionTimestamp = useRef(0);

  const itemRefs = useRef<{
    [key: number]: {
      position: { x: number; y: number };
      dimensions: { width: number; height: number };
      scale: Animated.Value;
      translateX: Animated.Value;
      translateY: Animated.Value;
      opacity: Animated.Value;
      component: any;
    };
  }>({});

  const gridPositions = useRef<{
    [key: number]: { x: number; y: number; width: number; height: number };
  }>({});

  const scrollOffset = useRef(0);
  const flatListRef = useRef<FlatList | null>(null);
  const lastGestureLocation = useRef({ x: 0, y: 0 });
  const isSwapping = useRef(false);
  const swapDebounceTimer = useRef<NodeJS.Timeout | null>(null);
  const panState = useRef(State.UNDETERMINED);
  const avatarCacheKey = "@AvatarImage";
  const avatarLocalPath = FileSystem.documentDirectory
    ? `${FileSystem.documentDirectory}avatar.jpg`
    : null;
  const pendingGridCalculation = useRef(false);
  const autoScrollTimerId = useRef<NodeJS.Timeout | null>(null);
  const blinkTimerId = useRef<NodeJS.Timeout | null>(null);

  // Safely update states
  const safeUpdateDraggingState = (value: boolean) => {
    isDraggingRef.current = value;
    InteractionManager.runAfterInteractions(() => {
      setIsDragging(value);
    });
  };

  const safeUpdateDraggedItem = (value: MenuItem | null) => {
    draggedItemRef.current = value;
    InteractionManager.runAfterInteractions(() => {
      setDraggedItem(value);
    });
  };

  const safeUpdateDraggedIndex = (value: number | null) => {
    draggedIndexRef.current = value;
    InteractionManager.runAfterInteractions(() => {
      setDraggedIndex(value);
    });
  };

  const safeUpdateHoveredIndex = (value: number | null) => {
    hoveredIndexRef.current = value;
    InteractionManager.runAfterInteractions(() => {
      setHoveredIndex(value);
    });
  };

  const safeUpdateShowSaveButton = (value: boolean) => {
    showSaveButtonRef.current = value;
    InteractionManager.runAfterInteractions(() => {
      setShowSaveButton(value);
    });
  };

  // Function to check if there are any tasks for today
  const checkTodayTasks = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}Task/IsAnyTasksForToday`);
      const result = await response.json();
      setHasTodayTasks(result === true);
    } catch (error) {
      console.error("Failed to check today tasks:", error);
    }
  };

  const blinkChecklistButton = () => {
    // First blink
    Animated.sequence([
      Animated.timing(checklistButtonColorValue, {
        toValue: 1, // به رنگ سفید تغییر می‌کند
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(checklistButtonColorValue, {
        toValue: 0, // به رنگ اصلی برمی‌گردد
        duration: 300,
        useNativeDriver: false,
      }),
      // Small pause between blinks
      Animated.delay(200),
      // Second blink
      Animated.timing(checklistButtonColorValue, {
        toValue: 1, // به رنگ سفید تغییر می‌کند
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(checklistButtonColorValue, {
        toValue: 0, // به رنگ اصلی برمی‌گردد
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  };

  useEffect(() => {
    if (hasTodayTasks) {
      // Initial blink
      blinkChecklistButton();

      // Set up timer to blink every 10 seconds
      blinkTimerId.current = setInterval(() => {
        blinkChecklistButton();
      }, 5000);
    }

    return () => {
      if (blinkTimerId.current) {
        clearInterval(blinkTimerId.current);
      }
    };
  }, [hasTodayTasks]);

  const fetchUserData = async () => {
    const storedData = await getLoginResponse();
    if (storedData) {
      setUserData(storedData);
    } else {
      console.log("No data found");
    }
  };

  // Load or download avatar image
  useEffect(() => {
    const loadAvatar = async () => {
      try {
        // If userData or AvatarImageURL is not available, fall back to default
        if (!userData?.AvatarImageURL) {
          setAvatarUri(undefined);
          return;
        }

        if (!avatarLocalPath || !FileSystem.getInfoAsync) {
          console.warn(
            "FileSystem is not available, falling back to default icon"
          );
          setAvatarUri(undefined);
          return;
        }

        // Check if image exists in AsyncStorage
        const cachedUri = await AsyncStorage.getItem(avatarCacheKey);
        if (cachedUri) {
          const fileInfo = await FileSystem.getInfoAsync(avatarLocalPath).catch(
            () => ({ exists: false })
          );
          if (fileInfo.exists) {
            setAvatarUri(cachedUri);
            return;
          }
        }

        // If not cached, download and cache the image
        const downloadResult = await FileSystem.downloadAsync(
          userData.AvatarImageURL,
          avatarLocalPath
        );

        if (downloadResult.status === 200) {
          const uri = `${avatarLocalPath}`;
          await AsyncStorage.setItem(avatarCacheKey, uri);
          setAvatarUri(uri);
        } else {
          setAvatarUri(undefined);
        }
      } catch (error) {
        console.error("Error loading avatar:", error);
        setAvatarUri(undefined);
      }
    };

    loadAvatar();
  }, [userData?.AvatarImageURL]);

  useEffect(() => {
    isDraggingRef.current = isDragging;

    if (isDragging) {
      showSaveButtonRef.current = true;
      interactionType.current = "dragging";
      safeUpdateShowSaveButton(true);
    } else {
      setTimeout(() => {
        if (interactionType.current === "dragging") {
          interactionType.current = "none";
        }
      }, 300);
    }

    Animated.timing(instructionOpacity, {
      toValue: showSaveButton ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isDragging, showSaveButton]);

  useEffect(() => {
    loadSavedLayout();
    fetchUserData();
    checkTodayTasks(); // Check for today's tasks when component mounts
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      calculateGridPositions();
    }, 300);

    return () => clearTimeout(timer);
  }, [items]);

  useEffect(() => {
    const handleTouchEnd = () => {
      if (isDragging) {
        stopDraggingButKeepSaveButton();
      }
    };

    if (isDragging) {
      if (Platform.OS === "web") {
        document.addEventListener("touchend", handleTouchEnd);
        document.addEventListener("mouseup", handleTouchEnd);

        return () => {
          document.removeEventListener("touchend", handleTouchEnd);
          document.removeEventListener("mouseup", handleTouchEnd);
        };
      }
    }

    return () => {};
  }, [isDragging]);

  useEffect(() => {
    let safetyTimer: NodeJS.Timeout | null = null;

    if (isDragging) {
      safetyTimer = setTimeout(() => {
        stopDraggingButKeepSaveButton();
      }, 10000);
    }

    return () => {
      if (safetyTimer) {
        clearTimeout(safetyTimer);
      }
    };
  }, [isDragging]);

  const calculateGridPositions = () => {
    if (pendingGridCalculation.current) return;
    pendingGridCalculation.current = true;

    requestAnimationFrame(() => {
      Object.keys(itemRefs.current).forEach((indexStr) => {
        const index = parseInt(indexStr);
        const itemRef = itemRefs.current[index];

        if (
          itemRef &&
          itemRef.component &&
          (!gridPositions.current[index] ||
            !itemRef.position ||
            itemRef.position.x === 0)
        ) {
          itemRef.component.measure(
            (
              x: number,
              y: number,
              width: number,
              height: number,
              pageX: number,
              pageY: number
            ) => {
              if (typeof pageX === "number" && typeof pageY === "number") {
                itemRef.position = {
                  x: pageX + width / 2,
                  y: pageY + height / 2 - scrollOffset.current,
                };

                itemRef.dimensions = { width, height };

                gridPositions.current[index] = {
                  x: pageX + width / 2,
                  y: pageY + height / 2 - scrollOffset.current,
                  width,
                  height,
                };
              }
            }
          );
        }
      });

      pendingGridCalculation.current = false;
    });
  };

  const loadSavedLayout = async () => {
    try {
      const savedLayout = await AsyncStorage.getItem(LAYOUT_STORAGE_KEY);
      if (savedLayout !== null) {
        const parsedLayout = JSON.parse(savedLayout);
        setItems(parsedLayout);
      }
    } catch (error) {
      console.error("خطا در بارگذاری چیدمان:", error);
    }
  };

  const saveLayout = async () => {
    try {
      await AsyncStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(items));
      setLayoutSaved(true);
      console.log("چیدمان ذخیره شد:", items);
    } catch (error) {
      console.error("خطا در ذخیره چیدمان:", error);
    }
  };

  const stopDraggingButKeepSaveButton = () => {
    interactionType.current = "none";

    if (draggedIndexRef.current !== null) {
      const currentDraggedIndex = draggedIndexRef.current;
      saveLayout();

      Animated.parallel([
        Animated.spring(itemRefs.current[currentDraggedIndex].scale, {
          toValue: 1,
          ...SPRING_CONFIG,
        }),
        Animated.spring(itemRefs.current[currentDraggedIndex].translateX, {
          toValue: 0,
          ...SPRING_CONFIG,
        }),
        Animated.spring(itemRefs.current[currentDraggedIndex].translateY, {
          toValue: 0,
          ...SPRING_CONFIG,
        }),
        Animated.timing(itemRefs.current[currentDraggedIndex].opacity, {
          toValue: 1,
          ...TIMING_CONFIG,
        }),
      ]).start(() => {
        // Defer state updates until after animation completes
        InteractionManager.runAfterInteractions(() => {
          safeUpdateDraggingState(false);
          safeUpdateDraggedItem(null);
          safeUpdateDraggedIndex(null);
          safeUpdateHoveredIndex(null);
          safeUpdateShowSaveButton(true);
        });

        Object.keys(itemRefs.current).forEach((indexStr) => {
          const index = parseInt(indexStr);
          if (itemRefs.current[index]) {
            itemRefs.current[index].translateX.setValue(0);
            itemRefs.current[index].translateY.setValue(0);
            itemRefs.current[index].scale.setValue(1);
            itemRefs.current[index].opacity.setValue(1);
          }
        });
      });
    } else {
      InteractionManager.runAfterInteractions(() => {
        safeUpdateDraggingState(false);
        safeUpdateDraggedItem(null);
        safeUpdateDraggedIndex(null);
        safeUpdateHoveredIndex(null);
        safeUpdateShowSaveButton(true);
      });
    }

    isSwapping.current = false;

    if (swapDebounceTimer.current) {
      clearTimeout(swapDebounceTimer.current);
      swapDebounceTimer.current = null;
    }

    setTimeout(() => {
      if (interactionType.current === "none") {
        lastInteractionTimestamp.current = Date.now();
      }
    }, 200);
  };

  const finishDragging = () => {
    if (draggedIndexRef.current !== null) {
      const currentDraggedIndex = draggedIndexRef.current;
      saveLayout();

      Animated.parallel([
        Animated.spring(itemRefs.current[currentDraggedIndex].scale, {
          toValue: 1,
          ...SPRING_CONFIG,
        }),
        Animated.spring(itemRefs.current[currentDraggedIndex].translateX, {
          toValue: 0,
          ...SPRING_CONFIG,
        }),
        Animated.spring(itemRefs.current[currentDraggedIndex].translateY, {
          toValue: 0,
          ...SPRING_CONFIG,
        }),
        Animated.timing(itemRefs.current[currentDraggedIndex].opacity, {
          toValue: 1,
          ...TIMING_CONFIG,
        }),
      ]).start(() => {
        InteractionManager.runAfterInteractions(() => {
          safeUpdateDraggingState(false);
          safeUpdateDraggedItem(null);
          safeUpdateDraggedIndex(null);
          safeUpdateHoveredIndex(null);
          safeUpdateShowSaveButton(false);
        });

        Object.keys(itemRefs.current).forEach((indexStr) => {
          const index = parseInt(indexStr);
          if (itemRefs.current[index]) {
            itemRefs.current[index].translateX.setValue(0);
            itemRefs.current[index].translateY.setValue(0);
            itemRefs.current[index].scale.setValue(1);
            itemRefs.current[index].opacity.setValue(1);
          }
        });
      });
    } else {
      InteractionManager.runAfterInteractions(() => {
        safeUpdateDraggingState(false);
        safeUpdateDraggedItem(null);
        safeUpdateDraggedIndex(null);
        safeUpdateHoveredIndex(null);
        safeUpdateShowSaveButton(false);
      });
    }

    interactionType.current = "none";
    isSwapping.current = false;

    if (swapDebounceTimer.current) {
      clearTimeout(swapDebounceTimer.current);
      swapDebounceTimer.current = null;
    }
  };

  const finishDraggingAndSave = () => {
    saveLayout();
    finishDragging();
  };

  const debouncedSwapItems = (fromIndex: number, toIndex: number) => {
    if (isSwapping.current || fromIndex === toIndex) return;

    if (swapDebounceTimer.current) {
      clearTimeout(swapDebounceTimer.current);
    }

    swapDebounceTimer.current = setTimeout(() => {
      swapItems(fromIndex, toIndex);
    }, 150);
  };

  const swapItems = (fromIndex: number, toIndex: number) => {
    if (isSwapping.current || fromIndex === toIndex) return;

    isSwapping.current = true;

    const newItems = [...items];
    const temp = newItems[fromIndex];
    newItems[fromIndex] = newItems[toIndex];
    newItems[toIndex] = temp;

    // Update items outside of the event handler
    InteractionManager.runAfterInteractions(() => {
      setItems(newItems);
      safeUpdateDraggedIndex(toIndex);
    });

    if (
      itemRefs.current[toIndex]?.component &&
      itemRefs.current[fromIndex]?.component
    ) {
      setTimeout(() => {
        itemRefs.current[toIndex].component.measure(
          (
            x: number,
            y: number,
            width: number,
            height: number,
            pageX: number,
            pageY: number
          ) => {
            if (typeof pageX === "number" && typeof pageY === "number") {
              itemRefs.current[toIndex].position = {
                x: pageX + width / 2,
                y: pageY + height / 2 - scrollOffset.current,
              };
              gridPositions.current[toIndex] = {
                x: pageX + width / 2,
                y: pageY + height / 2 - scrollOffset.current,
                width,
                height,
              };
            }
          }
        );

        itemRefs.current[fromIndex].component.measure(
          (
            x: number,
            y: number,
            width: number,
            height: number,
            pageX: number,
            pageY: number
          ) => {
            if (typeof pageX === "number" && typeof pageY === "number") {
              itemRefs.current[fromIndex].position = {
                x: pageX + width / 2,
                y: pageY + height / 2 - scrollOffset.current,
              };
              gridPositions.current[fromIndex] = {
                x: pageX + width / 2,
                y: pageY + height / 2 - scrollOffset.current,
                width,
                height,
              };
            }
          }
        );
      }, 100);

      Animated.sequence([
        Animated.timing(itemRefs.current[fromIndex].scale, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(itemRefs.current[fromIndex].scale, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();

      Animated.sequence([
        Animated.timing(itemRefs.current[toIndex].opacity, {
          toValue: 0.7,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(itemRefs.current[toIndex].opacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }

    setTimeout(() => {
      isSwapping.current = false;
    }, 250);
  };

  const findClosestItem = (currentPosition: { x: number; y: number }) => {
    let minDistance = Number.MAX_VALUE;
    let closestIndex = -1;

    Object.keys(gridPositions.current).forEach((key) => {
      const index = parseInt(key);

      if (index === draggedIndexRef.current) return;

      const position = gridPositions.current[index];
      if (!position) return;

      const distance = Math.sqrt(
        Math.pow(position.x - currentPosition.x, 2) +
          Math.pow(position.y - currentPosition.y, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    return closestIndex;
  };

  const handleAutoScroll = (y: number) => {
    if (!flatListRef.current || interactionType.current !== "dragging") return;

    if (autoScrollTimerId.current) {
      clearTimeout(autoScrollTimerId.current);
      autoScrollTimerId.current = null;
    }

    const SCROLL_THRESHOLD = 120;
    const MIN_SCROLL_INCREMENT = 2;
    const MAX_SCROLL_INCREMENT = 12;
    const { height } = Dimensions.get("window");

    const topDistance = Math.max(0, y);
    const bottomDistance = Math.max(0, height - y);

    let scrollSpeed = 0;

    if (topDistance < SCROLL_THRESHOLD) {
      const factor = 1 - topDistance / SCROLL_THRESHOLD;
      scrollSpeed =
        -MIN_SCROLL_INCREMENT -
        (MAX_SCROLL_INCREMENT - MIN_SCROLL_INCREMENT) * factor;
    } else if (bottomDistance < SCROLL_THRESHOLD) {
      const factor = 1 - bottomDistance / SCROLL_THRESHOLD;
      scrollSpeed =
        MIN_SCROLL_INCREMENT +
        (MAX_SCROLL_INCREMENT - MIN_SCROLL_INCREMENT) * factor;
    }

    if (scrollSpeed !== 0) {
      const newOffset = Math.max(0, scrollOffset.current + scrollSpeed);

      flatListRef.current.scrollToOffset({
        offset: newOffset,
        animated: false,
      });

      autoScrollTimerId.current = setTimeout(() => {
        if (interactionType.current === "dragging") {
          handleAutoScroll(y);
        }
      }, 16);
    }
  };

  const renderSaveButton = () => {
    if (!showSaveButton) return null;

    return (
      <Animated.View
        style={[styles.saveButtonContainer, { opacity: instructionOpacity }]}
      >
        <TouchableOpacity
          style={styles.floatingSaveButton}
          onPress={finishDraggingAndSave}
        >
          <MaterialIcons name="check" size={28} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderItem = ({ item, index }: { item: MenuItem; index: number }) => {
    if (!itemRefs.current[index]) {
      itemRefs.current[index] = {
        position: { x: 0, y: 0 },
        dimensions: { width: 0, height: 0 },
        scale: new Animated.Value(1),
        translateX: new Animated.Value(0),
        translateY: new Animated.Value(0),
        opacity: new Animated.Value(1),
        component: null,
      };
    }

    const scale = itemRefs.current[index].scale;
    const translateX = itemRefs.current[index].translateX;
    const translateY = itemRefs.current[index].translateY;
    const opacity = itemRefs.current[index].opacity;
    const isLastItemInOddList =
      index === items.length - 1 && items.length % 2 !== 0;

    const onLongPress = () => {
      if (isDragging) return;
      if (
        interactionType.current === "scrolling" &&
        Date.now() - lastInteractionTimestamp.current < 300
      ) {
        return;
      }

      interactionType.current = "dragging";
      lastInteractionTimestamp.current = Date.now();

      if (
        !itemRefs.current[index]?.position ||
        !itemRefs.current[index]?.dimensions ||
        itemRefs.current[index].position.x === 0
      ) {
        if (itemRefs.current[index]?.component) {
          itemRefs.current[index].component.measure(
            (
              x: number,
              y: number,
              width: number,
              height: number,
              pageX: number,
              pageY: number
            ) => {
              if (typeof pageX === "number" && typeof pageY === "number") {
                itemRefs.current[index].position = {
                  x: pageX + width / 2,
                  y: pageY + height / 2 - scrollOffset.current,
                };
                itemRefs.current[index].dimensions = {
                  width,
                  height,
                };

                gridPositions.current[index] = {
                  x: pageX + width / 2,
                  y: pageY + height / 2 - scrollOffset.current,
                  width,
                  height,
                };

                startDragging();
              }
            }
          );
        }
        return;
      }

      startDragging();
    };

    const startDragging = () => {
      // First animate
      Animated.spring(scale, {
        toValue: 1.1,
        ...SPRING_CONFIG,
      }).start();

      Animated.timing(opacity, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }).start();

      // Set ref values immediately to use in gestures
      isDraggingRef.current = true;
      draggedItemRef.current = item;
      draggedIndexRef.current = index;
      showSaveButtonRef.current = true;

      // Then update states outside of the event handler
      InteractionManager.runAfterInteractions(() => {
        setIsDragging(true);
        setDraggedItem(item);
        setDraggedIndex(index);
        setShowSaveButton(true);
      });
    };

    const onGestureEvent = (event: any) => {
      if (
        isDraggingRef.current &&
        draggedIndexRef.current === index &&
        interactionType.current === "dragging"
      ) {
        const {
          translationX: tx,
          translationY: ty,
          absoluteX,
          absoluteY,
        } = event.nativeEvent;

        lastGestureLocation.current = { x: absoluteX, y: absoluteY };

        translateX.setValue(tx);
        translateY.setValue(ty);

        const currentPosition = {
          x: itemRefs.current[index].position.x + tx,
          y: itemRefs.current[index].position.y + ty,
        };

        if (interactionType.current === "dragging") {
          handleAutoScroll(absoluteY);
        }

        const closestIndex = findClosestItem(currentPosition);

        if (closestIndex !== -1 && closestIndex !== index) {
          // Update ref directly
          hoveredIndexRef.current = closestIndex;

          // Then schedule state update
          InteractionManager.runAfterInteractions(() => {
            setHoveredIndex(closestIndex);
          });

          if (!isSwapping.current) {
            debouncedSwapItems(index, closestIndex);
          }
        } else if (hoveredIndexRef.current !== null) {
          // Update ref directly
          hoveredIndexRef.current = null;

          // Then schedule state update
          InteractionManager.runAfterInteractions(() => {
            setHoveredIndex(null);
          });
        }
      }
    };

    const onHandlerStateChange = (event: any) => {
      const { state } = event.nativeEvent;
      panState.current = state;

      if (state === State.BEGAN) {
        if (interactionType.current === "dragging") {
          translateX.setValue(0);
          translateY.setValue(0);
        }
      } else if (
        state === State.END ||
        state === State.CANCELLED ||
        state === State.FAILED
      ) {
        if (
          isDraggingRef.current &&
          draggedIndexRef.current === index &&
          interactionType.current === "dragging"
        ) {
          const { translationX: tx, translationY: ty } = event.nativeEvent;
          const currentPosition = {
            x: itemRefs.current[index].position.x + tx,
            y: itemRefs.current[index].position.y + ty,
          };

          const closestIndex = findClosestItem(currentPosition);

          if (
            closestIndex !== -1 &&
            closestIndex !== index &&
            !isSwapping.current
          ) {
            swapItems(index, closestIndex);
          }

          saveLayout();
          stopDraggingButKeepSaveButton();
        }
      }

      if (
        state !== State.ACTIVE &&
        state !== State.BEGAN &&
        isDraggingRef.current &&
        interactionType.current === "dragging"
      ) {
        setTimeout(() => {
          if (isDraggingRef.current && interactionType.current === "dragging") {
            saveLayout();
            stopDraggingButKeepSaveButton();
          }
        }, 300);
      }
    };

    const isBeingDragged = isDragging && draggedIndex === index;
    const isHovered = hoveredIndex === index && !isBeingDragged;

    return (
      <PanGestureHandler
        enabled={interactionType.current === "dragging"}
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        minDist={5}
        avgTouches
      >
        <Animated.View
          ref={(ref) => {
            if (ref) {
              itemRefs.current[index].component = ref;
            }
          }}
          style={[
            styles.gridItemContainer,
            isLastItemInOddList && styles.fullWidthItem,
            {
              transform: [
                { scale: isBeingDragged ? scale : 1 },
                { translateX: isBeingDragged ? translateX : 0 },
                { translateY: isBeingDragged ? translateY : 0 },
              ],
              zIndex: isBeingDragged ? 100 : isHovered ? 50 : 1,
              opacity: opacity,
            },
          ]}
          onLayout={(event) => {
            const layout = event.nativeEvent.layout;

            setTimeout(() => {
              if (itemRefs.current[index]?.component) {
                itemRefs.current[index].component.measure(
                  (
                    x: number,
                    y: number,
                    width: number,
                    height: number,
                    pageX: number,
                    pageY: number
                  ) => {
                    if (
                      typeof pageX === "number" &&
                      typeof pageY === "number"
                    ) {
                      itemRefs.current[index].position = {
                        x: pageX + width / 2,
                        y: pageY + height / 2 - scrollOffset.current,
                      };

                      itemRefs.current[index].dimensions = {
                        width,
                        height,
                      };

                      gridPositions.current[index] = {
                        x: pageX + width / 2,
                        y: pageY + height / 2 - scrollOffset.current,
                        width,
                        height,
                      };
                    }
                  }
                );
              }
            }, 100);
          }}
        >
          <TouchableOpacity
            style={[
              styles.gridItem,
              isLastItemInOddList && styles.fullWidthItemContent,
              isBeingDragged && styles.draggingItem,
              isHovered && styles.hoveredItem,
            ]}
            onLongPress={onLongPress}
            delayLongPress={200}
            activeOpacity={0.7}
            onPress={() => {
              if (!isDragging) {
                if (item.id === 4) openCalculator();
                // else if (item.id === 3) openApp("com.pirooze.MianCheck");
                else if (item.id === 3) openAppByPackageName();
                else if (item.screenName) {
                  console.log("Navigating to:", item.screenName);
                  safeNavigate(navigation, item.screenName);
                }
              }
            }}
          >
            <MaterialIcons
              name={item.icon}
              size={40}
              color={item.iconColor || colors.primary}
            />
            <Text style={styles.gridText}>{item.name}</Text>

            {isBeingDragged && (
              <View style={styles.dragHandle}>
                <MaterialIcons name="drag-handle" size={20} color="#666" />
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          style={styles.logo}
          source={require("../../assets/logo-aratile.png")}
        />
      </View>

      <View style={styles.headerBox}>
        <TouchableOpacity
          style={styles.infoBox}
          onPress={() => safeNavigate(navigation, "Profile")}
        >
          <View style={styles.avatarCircle}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <MaterialIcons name="person" size={26} color="#666666" />
            )}
          </View>
          <Text style={styles.userName}>{userData?.DisplayName}</Text>
        </TouchableOpacity>

        <View style={styles.iconsContainer}>
          <TouchableOpacity
            style={[
              styles.iconButton,
              { backgroundColor: checklistButtonColor },
            ]}
            onPress={() => {
              safeNavigate(navigation, "TaskManagement");
            }}
          >
            <MaterialIcons
              name="checklist-rtl"
              size={25}
              color={colors.light}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              safeNavigate(navigation, "PersianCalendar");
            }}
          >
            <MaterialIcons
              name="calendar-month"
              size={25}
              color={colors.light}
            />
          </TouchableOpacity>
        </View>
      </View>

      {renderSaveButton()}

      <View style={styles.listContainer}>
        <FlatList
          ref={flatListRef}
          data={items}
          numColumns={2}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.columnWrapper}
          extraData={[
            isDragging,
            draggedIndex,
            hoveredIndex,
            items,
            showSaveButton,
          ]}
          showsVerticalScrollIndicator={true}
          scrollEnabled={interactionType.current !== "dragging"}
          onScrollBeginDrag={() => {
            if (interactionType.current !== "dragging") {
              interactionType.current = "scrolling";
              lastInteractionTimestamp.current = Date.now();
            }
          }}
          onScrollEndDrag={() => {
            if (interactionType.current === "scrolling") {
              setTimeout(() => {
                interactionType.current = "none";
              }, 200);
            }
          }}
          onScroll={(e) => {
            scrollOffset.current = e.nativeEvent.contentOffset.y;

            if (
              isDraggingRef.current &&
              interactionType.current === "dragging"
            ) {
              if (
                draggedIndexRef.current !== null &&
                itemRefs.current[draggedIndexRef.current]
              ) {
                const index = draggedIndexRef.current;

                if (itemRefs.current[index]?.component) {
                  itemRefs.current[index].component.measure(
                    (
                      x: number,
                      y: number,
                      width: number,
                      height: number,
                      pageX: number,
                      pageY: number
                    ) => {
                      if (
                        typeof pageX === "number" &&
                        typeof pageY === "number"
                      ) {
                        itemRefs.current[index].position = {
                          x: pageX + width / 2,
                          y: pageY + height / 2 - scrollOffset.current,
                        };

                        gridPositions.current[index] = {
                          x: pageX + width / 2,
                          y: pageY + height / 2 - scrollOffset.current,
                          width,
                          height,
                        };
                      }
                    }
                  );
                }
              }
            }
          }}
          scrollEventThrottle={16}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
    marginTop: 50,
  },
  logo: {
    width: 100,
    height: 36,
  },
  listContainer: {
    flex: 1,
    width: "100%",
  },
  calendarIconContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: -6,
  },
  list: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    paddingBottom: 100,
  },
  gridItemContainer: {
    margin: 5,
    paddingLeft: 5,
    paddingRight: 5,
    paddingBottom: 10,
    width: itemWidth,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 1,
  },
  gridItem: {
    padding: 15,
    height: 150,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 15,
    backgroundColor: "#F2F2F2",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#E4E4E4",
  },
  draggingItem: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: "#FFFFFF",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  hoveredItem: {
    borderColor: colors.primary,
    backgroundColor: "#F0F7FF",
    borderStyle: "dashed",
    borderWidth: 2,
  },
  gridText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: Platform.OS === "ios" ? "700" : "normal",
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "700"),
    color: "#333333",
  },
  headerBox: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  iconsContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    // gap: -2,
  },
  iconButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 43,
    height: 43,
    borderRadius: 25,
    marginLeft: 0,
    marginRight: 7,
    backgroundColor: colors.secondary,
    // backgroundColor: "#faf2f6",
    // borderWidth: 2,
    // borderColor: colors.secondary,
  },
  infoBox: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: Platform.OS === "ios" ? "700" : "normal",
    color: "#666666",
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "700"),
  },
  avatarCircle: {
    width: 45,
    height: 45,
    borderRadius: 50,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginRight: 0,
  },
  columnWrapper: {
    flexDirection: "row-reverse",
    justifyContent: "center",
  },
  unevenColumnWrapper: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    paddingHorizontal: itemMargin,
  },
  fullWidthItem: {
    width: screenWidth - 2 * itemMargin,
    alignSelf: "center",
  },
  fullWidthItemContent: {
    width: "100%",
  },
  saveButtonContainer: {
    position: "absolute",
    bottom: 30,
    right: 30,
    zIndex: 1000,
  },
  floatingSaveButton: {
    backgroundColor: colors.primary || "#1C3F64",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  dragHandle: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 10,
    padding: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  saveButton: {
    backgroundColor: colors.primary || "#1C3F64",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "#ccc",
  },
});

export default HomeScreen;
