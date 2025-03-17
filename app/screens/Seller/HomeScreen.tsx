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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import colors from "../../config/colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { AppNavigationProp, RootStackParamList } from "../../StackNavigator";
import { PanGestureHandler, State } from "react-native-gesture-handler";

interface MenuItem {
  id: number;
  name: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor?: string;
  screenName?: keyof RootStackParamList;
}

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

// کلید ذخیره‌سازی در AsyncStorage
const LAYOUT_STORAGE_KEY = "home_screen_items_layout";

const initialItems: MenuItem[] = [
  {
    id: 1,
    name: "صدور فاکتور جدید",
    icon: "receipt",
    iconColor: "#1C3F64",
    screenName: "IssuingNewInvoic",
  },
  {
    id: 2,
    name: "فاکتور ها",
    icon: "description",
    iconColor: "#1C3F64",
    screenName: "IssuedInvoices",
  },
  {
    id: 5,
    name: "راس گیر چک",
    icon: "account-balance",
    iconColor: "#1C3F64",
  },
  {
    id: 6,
    name: "ماشین حساب",
    icon: "calculate",
    iconColor: "#1C3F64",
  },
  {
    id: 7,
    name: "درخواست تامین",
    icon: "shopping-cart",
    iconColor: "#1C3F64",
    screenName: "SupplyRequest",
  },
  {
    id: 8,
    name: "مشاهده درخواست های تامین",
    icon: "visibility",
    iconColor: "#1C3F64",
    screenName: "SupplyRequestList",
  },
];

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
  const [layoutSaved, setLayoutSaved] = useState(false); // وضعیت ذخیره‌سازی

  // Animation configurations for smoother transitions
  const SPRING_CONFIG = {
    tension: 50, // Lower tension makes it more elastic
    friction: 7, // Lower friction makes it smoother
    useNativeDriver: true,
  };

  // Timing configuration for smoother animations
  const TIMING_CONFIG = {
    duration: 200,
    useNativeDriver: true,
  };

  // Use a more reliable way to store item positions
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

  // Store fixed grid positions
  const gridPositions = useRef<{
    [key: number]: { x: number; y: number; width: number; height: number };
  }>({});

  // Use this ref to track the overall scroll position
  const scrollOffset = useRef(0);
  const flatListRef = useRef<FlatList | null>(null);

  // Last gesture location for smoother movement
  const lastGestureLocation = useRef({ x: 0, y: 0 });

  // Flag to prevent multiple rapid swaps
  const isSwapping = useRef(false);

  // Debounce timer for swaps
  const swapDebounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Setup gesture handler state
  const panState = useRef(State.UNDETERMINED);

  // بارگذاری چیدمان ذخیره شده هنگام اجرای برنامه
  useEffect(() => {
    loadSavedLayout();
  }, []);

  // بارگذاری چیدمان ذخیره‌شده از AsyncStorage
  const loadSavedLayout = async () => {
    try {
      const savedLayout = await AsyncStorage.getItem(LAYOUT_STORAGE_KEY);
      if (savedLayout !== null) {
        const parsedLayout = JSON.parse(savedLayout) as MenuItem[];
        setItems(parsedLayout);
        console.log("چیدمان ذخیره‌شده بارگذاری شد");
      }
    } catch (error) {
      console.error("خطا در بارگذاری چیدمان:", error);
    }
  };

  // ذخیره چیدمان در AsyncStorage
  const saveLayout = async () => {
    try {
      await AsyncStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(items));
      setLayoutSaved(true);
      console.log("چیدمان ذخیره شد:", items);
    } catch (error) {
      console.error("خطا در ذخیره چیدمان:", error);
    }
  };

  // Calculate grid positions based on current measurements
  const calculateGridPositions = () => {
    Object.keys(itemRefs.current).forEach((indexStr) => {
      const index = parseInt(indexStr);
      const itemRef = itemRefs.current[index];

      if (itemRef && itemRef.position && itemRef.dimensions) {
        gridPositions.current[index] = {
          x: itemRef.position.x,
          y: itemRef.position.y,
          width: itemRef.dimensions.width,
          height: itemRef.dimensions.height,
        };
      }
    });
  };

  // Initialize grid positions when component mounts and when items change
  useEffect(() => {
    // Wait for all items to be measured
    const timer = setTimeout(() => {
      calculateGridPositions();
    }, 300);

    return () => clearTimeout(timer);
  }, [items]);

  // Handle touch outside to immediately cancel dragging
  useEffect(() => {
    // Function to handle touch end anywhere
    const handleTouchEnd = () => {
      if (isDragging) {
        finishDragging();
      }
    };

    // Add global touch end listener
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

  // Safety timeout to prevent cards from getting stuck
  useEffect(() => {
    let safetyTimer: NodeJS.Timeout | null = null;

    if (isDragging) {
      // If dragging continues for too long, force reset
      safetyTimer = setTimeout(() => {
        finishDragging();
      }, 10000); // 10 seconds max drag time
    }

    return () => {
      if (safetyTimer) {
        clearTimeout(safetyTimer);
      }
    };
  }, [isDragging]);

  // Function to finish dragging and reset state
  const finishDragging = () => {
    // ذخیره چیدمان در پایان کشیدن
    saveLayout();

    if (draggedIndex !== null) {
      // Reset animations with spring for a smoother finish
      Animated.parallel([
        Animated.spring(itemRefs.current[draggedIndex].scale, {
          toValue: 1,
          ...SPRING_CONFIG,
        }),
        Animated.spring(itemRefs.current[draggedIndex].translateX, {
          toValue: 0,
          ...SPRING_CONFIG,
        }),
        Animated.spring(itemRefs.current[draggedIndex].translateY, {
          toValue: 0,
          ...SPRING_CONFIG,
        }),
        Animated.timing(itemRefs.current[draggedIndex].opacity, {
          toValue: 1,
          ...TIMING_CONFIG,
        }),
      ]).start(() => {
        // Reset all states only after animation completes
        setIsDragging(false);
        setDraggedItem(null);
        setDraggedIndex(null);
        setHoveredIndex(null);

        // Force reset all animations for all items to ensure nothing is stuck
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
      // If no draggedIndex, just reset states
      setIsDragging(false);
      setDraggedItem(null);
      setDraggedIndex(null);
      setHoveredIndex(null);
    }

    // Reset swapping state immediately
    isSwapping.current = false;

    if (swapDebounceTimer.current) {
      clearTimeout(swapDebounceTimer.current);
      swapDebounceTimer.current = null;
    }
  };

  // Debounced swap function to prevent too rapid swaps
  const debouncedSwapItems = (fromIndex: number, toIndex: number) => {
    if (isSwapping.current || fromIndex === toIndex) return;

    if (swapDebounceTimer.current) {
      clearTimeout(swapDebounceTimer.current);
    }

    swapDebounceTimer.current = setTimeout(() => {
      swapItems(fromIndex, toIndex);
    }, 150); // Debounce time
  };

  // Optimized swap function with smoother animations
  const swapItems = (fromIndex: number, toIndex: number) => {
    if (isSwapping.current || fromIndex === toIndex) return;

    isSwapping.current = true;

    // Create a new items array with the swapped items
    const newItems = [...items];
    const temp = newItems[fromIndex];
    newItems[fromIndex] = newItems[toIndex];
    newItems[toIndex] = temp;

    // Update the items state
    setItems(newItems);

    // ذخیره چیدمان پس از هر عملیات جابجایی
    setTimeout(() => {
      saveLayout();
    }, 100);

    // Update the dragged index
    setDraggedIndex(toIndex);

    // Recalculate grid positions for the swapped items
    if (
      itemRefs.current[toIndex]?.component &&
      itemRefs.current[fromIndex]?.component
    ) {
      setTimeout(() => {
        // Re-measure the positions to ensure they're updated
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

      // Animate the item that's "receiving" the drag
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

      // Briefly highlight the swap by changing opacity
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

    // Reset the swapping flag after the animation
    setTimeout(() => {
      isSwapping.current = false;
    }, 250);
  };

  // Find the closest item that can be swapped with - allow ANY distance
  const findClosestItem = (currentPosition: { x: number; y: number }) => {
    let minDistance = Number.MAX_VALUE;
    let closestIndex = -1;

    // No distance threshold - allow ANY item to be swapped with the dragged item

    // Find closest item to current position - search ALL items
    Object.keys(gridPositions.current).forEach((key) => {
      const index = parseInt(key);

      // Skip the current dragged item
      if (index === draggedIndex) return;

      const position = gridPositions.current[index];
      if (!position) return;

      // Calculate distance to the center of this item
      const distance = Math.sqrt(
        Math.pow(position.x - currentPosition.x, 2) +
          Math.pow(position.y - currentPosition.y, 2)
      );

      // Find the closest one regardless of distance
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    return closestIndex;
  };

  // Handle auto-scrolling when dragging near edges
  const handleAutoScroll = (y: number) => {
    if (!flatListRef.current) return;

    const SCROLL_THRESHOLD = 100;
    const SCROLL_INCREMENT = 5;
    const { height } = Dimensions.get("window");

    // Fix for the scrollTo error - safely access FlatList scrollToOffset method
    if (y < SCROLL_THRESHOLD) {
      // Scroll up more smoothly
      if (flatListRef.current.scrollToOffset) {
        flatListRef.current.scrollToOffset({
          offset: Math.max(0, scrollOffset.current - SCROLL_INCREMENT),
          animated: false,
        });
      }
    } else if (y > height - SCROLL_THRESHOLD) {
      // Scroll down more smoothly
      if (flatListRef.current.scrollToOffset) {
        flatListRef.current.scrollToOffset({
          offset: scrollOffset.current + SCROLL_INCREMENT,
          animated: false,
        });
      }
    }
  };

  // Instructions that appear during drag and drop
  const renderDragInstructions = () => {
    if (!isDragging) return null;

    return (
      <Animated.View
        style={[
          styles.dragInstructionContainer,
          { opacity: isDragging ? 1 : 0 },
        ]}
      >
        <Text style={styles.dragInstructionText}>
          کارت را به مکان دلخواه بکشید و رها کنید
        </Text>
        <TouchableOpacity style={styles.saveButton} onPress={finishDragging}>
          <View style={styles.saveButtonContent}>
            <MaterialIcons name="save" size={20} color="#fff" />
            <Text style={styles.saveButtonText}>ذخیره و اتمام</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Item renderer with enhanced animations
  const renderItem = ({ item, index }: { item: MenuItem; index: number }) => {
    // Initialize animations and refs if needed
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

    // Start dragging on long press
    const onLongPress = () => {
      // If already dragging, don't start again
      if (isDragging) return;

      // Make sure position is properly measured before starting to drag
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

                // Update grid positions with this measurement
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

    // Function to start drag with improved animation
    const startDragging = () => {
      setIsDragging(true);
      setDraggedItem(item);
      setDraggedIndex(index);

      // Animate scale up with spring for smoother motion
      Animated.spring(scale, {
        toValue: 1.1,
        ...SPRING_CONFIG,
      }).start();

      // Add a subtle shadow effect
      Animated.timing(opacity, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }).start();
    };

    // Improved pan gesture handler for smoother dragging
    const onGestureEvent = (event: any) => {
      if (isDragging && draggedIndex === index) {
        const {
          translationX: tx,
          translationY: ty,
          absoluteX,
          absoluteY,
        } = event.nativeEvent;

        // Store current gesture location
        lastGestureLocation.current = { x: absoluteX, y: absoluteY };

        // Update animations more smoothly
        translateX.setValue(tx);
        translateY.setValue(ty);

        // Calculate current position (including scroll offset)
        const currentPosition = {
          x: itemRefs.current[index].position.x + tx,
          y: itemRefs.current[index].position.y + ty,
        };

        // Auto-scroll if needed for smoother experience
        handleAutoScroll(absoluteY);

        // Find closest item that this can be swapped with
        const closestIndex = findClosestItem(currentPosition);

        // Update hovered state to provide visual feedback
        if (closestIndex !== -1 && closestIndex !== index) {
          setHoveredIndex(closestIndex);

          // Only swap if not already swapping
          if (!isSwapping.current) {
            debouncedSwapItems(index, closestIndex);
          }
        } else {
          setHoveredIndex(null);
        }
      }
    };

    // Pan handler state change with improved end behavior
    const onHandlerStateChange = (event: any) => {
      const { state } = event.nativeEvent;
      panState.current = state;

      if (state === State.BEGAN) {
        // Reset translations at the beginning
        translateX.setValue(0);
        translateY.setValue(0);
      } else if (
        state === State.END ||
        state === State.CANCELLED ||
        state === State.FAILED
      ) {
        // If we're currently dragging this item
        if (isDragging && draggedIndex === index) {
          // Check for final swap
          const { translationX: tx, translationY: ty } = event.nativeEvent;
          const currentPosition = {
            x: itemRefs.current[index].position.x + tx,
            y: itemRefs.current[index].position.y + ty,
          };

          // Find closest position for final swap
          const closestIndex = findClosestItem(currentPosition);

          // Perform final swap if needed
          if (
            closestIndex !== -1 &&
            closestIndex !== index &&
            !isSwapping.current
          ) {
            swapItems(index, closestIndex);
          }

          // ذخیره چیدمان هنگام رها کردن آیتم
          saveLayout();

          // Finish dragging with smoother animations
          finishDragging();
        }
      }

      // Add a safety mechanism - if the gesture is in a weird state, reset everything
      if (state !== State.ACTIVE && state !== State.BEGAN && isDragging) {
        // Force reset after a short delay to ensure we don't interfere with normal gesture handling
        setTimeout(() => {
          if (isDragging) {
            // Double check we're still dragging
            // ذخیره چیدمان در شرایط اضطراری
            saveLayout();
            finishDragging();
          }
        }, 300);
      }
    };

    // Visual states for current item
    const isBeingDragged = isDragging && draggedIndex === index;
    const isHovered = hoveredIndex === index && !isBeingDragged;

    return (
      <PanGestureHandler
        enabled={true}
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
      >
        <Animated.View
          ref={(ref) => {
            if (ref) {
              itemRefs.current[index].component = ref;
            }
          }}
          style={[
            styles.gridItemContainer,
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

            // Measure position with delay to ensure accuracy
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
                      // Store position relative to scroll
                      itemRefs.current[index].position = {
                        x: pageX + width / 2,
                        y: pageY + height / 2 - scrollOffset.current,
                      };

                      itemRefs.current[index].dimensions = {
                        width,
                        height,
                      };

                      // Update grid positions
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
              isBeingDragged && styles.draggingItem,
              isHovered && styles.hoveredItem,
            ]}
            onLongPress={onLongPress}
            delayLongPress={200}
            activeOpacity={0.7}
            onPress={() => {
              // Only navigate if we're not in dragging mode
              if (!isDragging && item.screenName) {
                navigation.navigate(item.screenName);
              }
            }}
          >
            <MaterialIcons
              name={item.icon}
              size={40}
              color={item.iconColor || colors.primary}
            />
            <Text style={styles.gridText}>{item.name}</Text>

            {/* Improved drag handle indicator */}
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
          source={require("../../../assets/aratile_logo_2.png")}
        />
      </View>

      <View style={styles.headerBox}>
        <View style={styles.infoBox}>
          <TouchableOpacity
            style={styles.avatarCircle}
            onPress={() => navigation.navigate("Profile")}
          >
            <MaterialIcons name="person" size={26} color="#666666" />
          </TouchableOpacity>
          <Text style={styles.userName}>خانم پوردایی</Text>
        </View>
        <MaterialIcons name="create" size={24} color="#666666" />
      </View>

      {/* Display drag instructions when dragging */}
      {renderDragInstructions()}

      <FlatList
        ref={flatListRef}
        data={items}
        numColumns={2}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.columnWrapper}
        extraData={[isDragging, draggedIndex, hoveredIndex, items]}
        scrollEnabled={true} // Always allow scrolling for better UX
        onScroll={(e) => {
          scrollOffset.current = e.nativeEvent.contentOffset.y;

          // Recalculate grid positions when scrolling
          if (isDragging) {
            Object.keys(gridPositions.current).forEach((key) => {
              const index = parseInt(key);
              if (gridPositions.current[index]) {
                gridPositions.current[index].y =
                  itemRefs.current[index].position.y -
                  scrollOffset.current +
                  e.nativeEvent.contentOffset.y;
              }
            });
          }
        }}
        scrollEventThrottle={16}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: "#ffffff",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
  },
  logo: {
    width: 100,
    height: 36,
  },
  list: {
    paddingLeft: 5,
    paddingRight: 5,
    marginLeft: 5,
    marginRight: 5,
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
    elevation: 3,
  },
  gridItem: {
    padding: 15,
    height: 150,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 15,
    backgroundColor: "#F2F2F2", // Color back to original grey
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
    elevation: 10,
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
    marginVertical: 20,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  columnWrapper: {
    flexDirection: "row-reverse",
    justifyContent: "center",
  },
  dragInstructionContainer: {
    backgroundColor: colors.light,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 15,
    marginHorizontal: 20,
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  dragInstructionText: {
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "500"),
    textAlign: "center",
    fontSize: 16,
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
    elevation: 2,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  saveButtonContent: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  saveButtonText: {
    color: "white",
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "600"),
    fontSize: 16,
    textAlign: "center",
  },
});

export default HomeScreen;
