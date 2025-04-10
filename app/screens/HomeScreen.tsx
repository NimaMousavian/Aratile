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
import colors from "../config/colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { AppNavigationProp, RootStackParamList } from "../StackNavigator";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  {
    id: 9,
    name: "دریافت فاکتور جدید",
    icon: "receipt-long",
    iconColor: "#1C3F64",
    screenName: "ReceiveNewInvoice",
  },
  {
    id: 10,
    name: "فاکتور ها",
    icon: "done-all",
    iconColor: "#1C3F64",
    screenName: "StatusFilterScreen",
  },
  {
    id: 11,
    name: "بازاریاب میدانی B2B",
    icon: "business",
    iconColor: "#1C3F64",
    screenName: "B2BFieldMarketer",
  },
  {
    id: 12,
    name: "بازاریاب میدانی B2C",
    icon: "business-center",
    iconColor: "#1C3F64",
    screenName: "B2CFieldMarketer",
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
  const [layoutModified, setLayoutModified] = useState(false);

  const SPRING_CONFIG = {
    tension: 50,
    friction: 7,
    useNativeDriver: true,
  };

  const TIMING_CONFIG = {
    duration: 200,
    useNativeDriver: true,
  };

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

  useEffect(() => {
    loadSavedLayout();
  }, []);

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
      setLayoutModified(false);
      setShowSaveButton(false);
    } catch (error) {
      console.error("خطا در ذخیره چیدمان:", error);
    }
  };

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

  useEffect(() => {
    const timer = setTimeout(() => {
      calculateGridPositions();
    }, 300);

    return () => clearTimeout(timer);
  }, [items]);

  useEffect(() => {
    const handleTouchEnd = () => {
      if (isDragging) {
        finishDragging();
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
        finishDragging();
      }, 10000);
    }

    return () => {
      if (safetyTimer) {
        clearTimeout(safetyTimer);
      }
    };
  }, [isDragging]);

  const finishDragging = () => {
    setLayoutModified(true);
    setShowSaveButton(true);

    if (draggedIndex !== null) {
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
        setIsDragging(false);
        setDraggedItem(null);
        setDraggedIndex(null);
        setHoveredIndex(null);

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
      setIsDragging(false);
      setDraggedItem(null);
      setDraggedIndex(null);
      setHoveredIndex(null);
    }

    isSwapping.current = false;

    if (swapDebounceTimer.current) {
      clearTimeout(swapDebounceTimer.current);
      swapDebounceTimer.current = null;
    }
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

    setItems(newItems);
    setLayoutModified(true);
    setShowSaveButton(true);
    setDraggedIndex(toIndex);

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

      if (index === draggedIndex) return;

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
    if (!flatListRef.current) return;

    const SCROLL_THRESHOLD = 100;
    const SCROLL_INCREMENT = 5;
    const { height } = Dimensions.get("window");

    if (y < SCROLL_THRESHOLD) {
      if (flatListRef.current.scrollToOffset) {
        flatListRef.current.scrollToOffset({
          offset: Math.max(0, scrollOffset.current - SCROLL_INCREMENT),
          animated: false,
        });
      }
    } else if (y > height - SCROLL_THRESHOLD) {
      if (flatListRef.current.scrollToOffset) {
        flatListRef.current.scrollToOffset({
          offset: scrollOffset.current + SCROLL_INCREMENT,
          animated: false,
        });
      }
    }
  };

  const renderInstructionsAndSaveButton = () => {
    if (!isDragging && !showSaveButton) return null;

    return (
      <View style={styles.dragInstructionContainer}>
        {isDragging ? (
          <Text style={styles.dragInstructionText}>
            کارت را به مکان دلخواه بکشید و رها کنید
          </Text>
        ) : (
          showSaveButton && (
            <Text style={styles.dragInstructionText}>
              چیدمان جدید ایجاد شد. برای اتمام روی دکمه زیر کلیک کنید
            </Text>
          )
        )}

        <TouchableOpacity
          style={styles.saveButton}
          onPress={isDragging ? finishDragging : saveLayout}
        >
          <View style={styles.saveButtonContent}>
            <MaterialIcons name="save" size={20} color="#fff" />
            <Text style={styles.saveButtonText}>ذخیره و اتمام</Text>
          </View>
        </TouchableOpacity>
      </View>
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

    const onLongPress = () => {
      if (isDragging) return;

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
      setIsDragging(true);
      setDraggedItem(item);
      setDraggedIndex(index);

      Animated.spring(scale, {
        toValue: 1.1,
        ...SPRING_CONFIG,
      }).start();

      Animated.timing(opacity, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }).start();
    };

    const onGestureEvent = (event: any) => {
      if (isDragging && draggedIndex === index) {
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

        handleAutoScroll(absoluteY);

        const closestIndex = findClosestItem(currentPosition);

        if (closestIndex !== -1 && closestIndex !== index) {
          setHoveredIndex(closestIndex);

          if (!isSwapping.current) {
            debouncedSwapItems(index, closestIndex);
          }
        } else {
          setHoveredIndex(null);
        }
      }
    };

    const onHandlerStateChange = (event: any) => {
      const { state } = event.nativeEvent;
      panState.current = state;

      if (state === State.BEGAN) {
        translateX.setValue(0);
        translateY.setValue(0);
      } else if (
        state === State.END ||
        state === State.CANCELLED ||
        state === State.FAILED
      ) {
        if (isDragging && draggedIndex === index) {
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

          setLayoutModified(true);
          setShowSaveButton(true);

          finishDragging();
        }
      }

      if (state !== State.ACTIVE && state !== State.BEGAN && isDragging) {
        setTimeout(() => {
          if (isDragging) {
            setLayoutModified(true);
            setShowSaveButton(true);
            finishDragging();
          }
        }, 300);
      }
    };

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
              isBeingDragged && styles.draggingItem,
              isHovered && styles.hoveredItem,
            ]}
            onLongPress={onLongPress}
            delayLongPress={200}
            activeOpacity={0.7}
            // In the renderItem function of HomeScreen.js
            onPress={() => {
              if (!isDragging && item.screenName) {
                console.log("Navigating to:", item.screenName);

                // Add this check to correct any typos
                if (item.screenName === "IssuingNewInvoice") {
                  navigation.navigate(
                    "IssuingNewInvoice" as keyof RootStackParamList
                  );
                } else {
                  navigation.navigate(
                    item.screenName as keyof RootStackParamList
                  );
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
          onPress={() => navigation.navigate("Profile")}
        >
          <View style={styles.avatarCircle}>
            <MaterialIcons name="person" size={26} color="#666666" />
          </View>
          <Text style={styles.userName}>خانم پوردایی</Text>
        </TouchableOpacity>
        {/* <MaterialIcons name="create" size={24} color="#666666" /> */}
      </View>

      {renderInstructionsAndSaveButton()}

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
        scrollEnabled={true}
        onScroll={(e) => {
          scrollOffset.current = e.nativeEvent.contentOffset.y;

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
    elevation: 1,
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
    elevation: 1,
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
    elevation: 1,
  },
  saveButton: {
    backgroundColor: colors.primary,
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
