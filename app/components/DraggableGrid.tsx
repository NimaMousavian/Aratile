import React, { useState, useRef, useEffect } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  Animated,
  ViewStyle,
  TextStyle,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { PanGestureHandler, State } from "react-native-gesture-handler";

// تعریف اینترفیس برای آیتم‌های قابل درگ
export interface DraggableItem {
  id: number | string;
  [key: string]: any; // اجازه دادن به سایر پروپرتی‌های دلخواه
}

// تعریف پراپ‌های کامپوننت
interface DraggableGridProps<T extends DraggableItem> {
  items: T[];
  onItemsChange?: (items: T[]) => void;
  renderItemContent: (item: T, isDragging: boolean, isHovered: boolean) => React.ReactNode;
  onItemPress?: (item: T) => void;
  storageKey?: string;
  numColumns?: number;
  containerStyle?: ViewStyle;
  itemStyle?: ViewStyle;
  draggedItemStyle?: ViewStyle;
  hoveredItemStyle?: ViewStyle;
  instructionsText?: string;
  instructionsStyle?: TextStyle;
  saveButtonText?: string;
  saveButtonStyle?: ViewStyle;
  saveButtonTextStyle?: TextStyle;
  itemHeight?: number;
  itemMargin?: number;
}

// تعریف وزن فونت
type FontWeight = "700" | "600" | "500" | "bold" | "semi-bold" | string;

// تابع تعیین فونت بر اساس پلتفرم
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

// کامپوننت اصلی
function DraggableGrid<T extends DraggableItem>({
  items: initialItems,
  onItemsChange,
  renderItemContent,
  onItemPress,
  storageKey,
  numColumns = 2,
  containerStyle,
  itemStyle,
  draggedItemStyle,
  hoveredItemStyle,
  instructionsText = "آیتم را به مکان دلخواه بکشید و رها کنید",
  instructionsStyle,
  saveButtonText = "ذخیره و اتمام",
  saveButtonStyle,
  saveButtonTextStyle,
  itemHeight = 150,
  itemMargin = 10,
}: DraggableGridProps<T>) {
  // محاسبه عرض آیتم‌ها
  const screenWidth = Dimensions.get("window").width;
  const itemWidth = (screenWidth - (numColumns + 1) * itemMargin) / numColumns;

  // استیت‌های کامپوننت
  const [items, setItems] = useState<T[]>(initialItems);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<T | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [layoutSaved, setLayoutSaved] = useState(false);
  const [loadedLayout, setLoadedLayout] = useState<T[] | null>(null);

  // تنظیمات انیمیشن برای حرکت نرم‌تر
  const SPRING_CONFIG = {
    tension: 50,
    friction: 7,
    useNativeDriver: true
  };

  // تنظیمات زمان‌بندی برای انیمیشن‌های نرم‌تر
  const TIMING_CONFIG = {
    duration: 200,
    useNativeDriver: true
  };

  // استفاده از راه روش‌های مطمئن‌تر برای ذخیره موقعیت آیتم‌ها
  const itemRefs = useRef<{
    [key: string]: {
      position: { x: number, y: number },
      dimensions: { width: number, height: number },
      scale: Animated.Value,
      translateX: Animated.Value,
      translateY: Animated.Value,
      opacity: Animated.Value,
      component: any
    }
  }>({});

  // ذخیره موقعیت‌های ثابت شبکه
  const gridPositions = useRef<{ [key: string]: { x: number, y: number, width: number, height: number } }>({});

  // رفرنس برای پیگیری موقعیت اسکرول کلی
  const scrollOffset = useRef(0);
  const flatListRef = useRef<FlatList | null>(null);

  // آخرین موقعیت حرکت برای حرکت نرم‌تر
  const lastGestureLocation = useRef({ x: 0, y: 0 });

  // پرچم برای جلوگیری از جابجایی‌های سریع متعدد
  const isSwapping = useRef(false);

  // تایمر تاخیر برای جابجایی‌ها
  const swapDebounceTimer = useRef<NodeJS.Timeout | null>(null);

  // تنظیم وضعیت هندلر حرکت
  const panState = useRef(State.UNDETERMINED);

  // بارگذاری چیدمان ذخیره شده هنگام اجرای کامپوننت
  useEffect(() => {
    if (storageKey) {
      loadSavedLayout();
    } else {
      setItems(initialItems);
    }
  }, [storageKey, initialItems]);

  // اعمال تغییرات آیتم‌ها به کامپوننت والد
  useEffect(() => {
    if (onItemsChange) {
      onItemsChange(items);
    }
  }, [items, onItemsChange]);

  const loadSavedLayout = async () => {
    if (!storageKey) return null;

    try {
      const savedLayout = await AsyncStorage.getItem(storageKey);
      if (savedLayout !== null) {
        return JSON.parse(savedLayout) as T[];
        // console.log("چیدمان ذخیره‌شده بارگذاری شد");
      }
    } catch (error) {
      console.error("خطا در بارگذاری چیدمان:", error);
    }
    return null;
  };
  const applyLayout = (layout: T[] | null) => {
    if (layout) {
      setItems(layout);
    }
  };
  useEffect(() => {
    const initLayout = async () => {
      const layout = await loadSavedLayout();
      // Store the layout in state but don't apply it yet
      setLoadedLayout(layout);
    };

    initLayout();
  }, []);

  // On save button click
  const handleSave = () => {
    // Apply the loaded layout
    applyLayout(loadedLayout);
    // Save the current state
    saveLayout(items);
  };

  // After drag end
  const handleDragEnd = () => {
    setIsDragging(false);
    // Apply the layout after drag ends
    applyLayout(loadedLayout);
  };

  // ذخیره چیدمان در AsyncStorage
  const saveLayout = async () => {
    if (!storageKey) return;

    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(items));
      setLayoutSaved(true);
      console.log("چیدمان ذخیره شد:", items);
    } catch (error) {
      console.error("خطا در ذخیره چیدمان:", error);
    }
  };

  // محاسبه موقعیت‌های شبکه بر اساس اندازه‌گیری‌های فعلی
  const calculateGridPositions = () => {
    Object.keys(itemRefs.current).forEach((indexStr) => {
      const index = indexStr;
      const itemRef = itemRefs.current[index];

      if (itemRef && itemRef.position && itemRef.dimensions) {
        gridPositions.current[index] = {
          x: itemRef.position.x,
          y: itemRef.position.y,
          width: itemRef.dimensions.width,
          height: itemRef.dimensions.height
        };
      }
    });
  };

  // مقدار دهی اولیه موقعیت‌های شبکه وقتی کامپوننت نصب می‌شود و زمانی که آیتم‌ها تغییر می‌کنند
  useEffect(() => {
    // انتظار برای اندازه‌گیری تمام آیتم‌ها
    const timer = setTimeout(() => {
      calculateGridPositions();
    }, 300);

    return () => clearTimeout(timer);
  }, [items]);

  // مدیریت لمس خارج از محدوده برای لغو فوری درگ کردن
  useEffect(() => {
    // تابع برای مدیریت پایان لمس در هر جایی
    const handleTouchEnd = () => {
      if (isDragging) {
        finishDragging();
      }
    };

    // افزودن شنونده پایان لمس سراسری
    if (isDragging) {
      if (Platform.OS === 'web') {
        document.addEventListener('touchend', handleTouchEnd);
        document.addEventListener('mouseup', handleTouchEnd);

        return () => {
          document.removeEventListener('touchend', handleTouchEnd);
          document.removeEventListener('mouseup', handleTouchEnd);
        };
      }
    }

    return () => { };
  }, [isDragging]);

  // تایمر اطمینان برای جلوگیری از گیر کردن کارت‌ها
  useEffect(() => {
    let safetyTimer: NodeJS.Timeout | null = null;

    if (isDragging) {
      // اگر کشیدن برای مدت طولانی ادامه یابد، بازنشانی اجباری
      safetyTimer = setTimeout(() => {
        finishDragging();
      }, 10000); // حداکثر 10 ثانیه زمان کشیدن
    }

    return () => {
      if (safetyTimer) {
        clearTimeout(safetyTimer);
      }
    };
  }, [isDragging]);

  const finishDragging = () => {
    if (draggedIndex !== null) {
      // بازنشانی انیمیشن‌ها با اسپرینگ برای پایان نرم‌تر
      Animated.parallel([
        Animated.spring(itemRefs.current[draggedIndex.toString()].scale, {
          toValue: 1,
          ...SPRING_CONFIG,
        }),
        Animated.spring(itemRefs.current[draggedIndex.toString()].translateX, {
          toValue: 0,
          ...SPRING_CONFIG,
        }),
        Animated.spring(itemRefs.current[draggedIndex.toString()].translateY, {
          toValue: 0,
          ...SPRING_CONFIG,
        }),
        Animated.timing(itemRefs.current[draggedIndex.toString()].opacity, {
          toValue: 1,
          ...TIMING_CONFIG
        })
      ]).start(() => {
        // حذف فراخوانی saveLayout از اینجا
        // saveLayout();

        // بازنشانی همه وضعیت‌ها فقط پس از تکمیل انیمیشن
        setIsDragging(false);
        setDraggedItem(null);
        setDraggedIndex(null);
        setHoveredIndex(null);

        // بازنشانی اجباری همه انیمیشن‌ها برای همه آیتم‌ها برای اطمینان از عدم گیر
        Object.keys(itemRefs.current).forEach((indexStr) => {
          const itemRef = itemRefs.current[indexStr];
          if (itemRef) {
            itemRef.translateX.setValue(0);
            itemRef.translateY.setValue(0);
            itemRef.scale.setValue(1);
            itemRef.opacity.setValue(1);
          }
        });
      });
    } else {
      // اگر draggedIndex وجود ندارد، فقط وضعیت‌ها را بازنشانی کن
      setIsDragging(false);
      setDraggedItem(null);
      setDraggedIndex(null);
      setHoveredIndex(null);
    }

    // بازنشانی فوری وضعیت جابجایی
    isSwapping.current = false;

    if (swapDebounceTimer.current) {
      clearTimeout(swapDebounceTimer.current);
      swapDebounceTimer.current = null;
    }
  };
  const handleSaveButton = () => {
    // ذخیره چیدمان
    saveLayout();

    // پایان دادن به حالت درگینگ
    finishDragging();
  };

  // تابع جابجایی با تاخیر برای جلوگیری از جابجایی‌های بسیار سریع
  const debouncedSwapItems = (fromIndex: number, toIndex: number) => {
    if (isSwapping.current || fromIndex === toIndex) return;

    if (swapDebounceTimer.current) {
      clearTimeout(swapDebounceTimer.current);
    }

    swapDebounceTimer.current = setTimeout(() => {
      swapItems(fromIndex, toIndex);
    }, 150); // زمان تاخیر
  };

  // تابع جابجایی بهینه‌سازی شده با انیمیشن‌های نرم‌تر
  const swapItems = (fromIndex: number, toIndex: number) => {
    if (isSwapping.current || fromIndex === toIndex) return;

    isSwapping.current = true;

    // ایجاد آرایه جدید آیتم‌ها با آیتم‌های جابجا شده
    const newItems = [...items];
    const temp = newItems[fromIndex];
    newItems[fromIndex] = newItems[toIndex];
    newItems[toIndex] = temp;

    // به‌روزرسانی وضعیت آیتم‌ها
    setItems(newItems);

    // به‌روزرسانی شاخص کشیده شده
    setDraggedIndex(toIndex);

    // محاسبه مجدد موقعیت‌های شبکه برای آیتم‌های جابجا شده
    if (itemRefs.current[toIndex.toString()]?.component && itemRefs.current[fromIndex.toString()]?.component) {
      setTimeout(() => {
        // اندازه‌گیری مجدد موقعیت‌ها برای اطمینان از به‌روز بودن آنها
        itemRefs.current[toIndex.toString()].component.measure(
          (x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
            if (typeof pageX === 'number' && typeof pageY === 'number') {
              itemRefs.current[toIndex.toString()].position = {
                x: pageX + width / 2,
                y: pageY + height / 2 - scrollOffset.current
              };
              gridPositions.current[toIndex.toString()] = {
                x: pageX + width / 2,
                y: pageY + height / 2 - scrollOffset.current,
                width, height
              };
            }
          }
        );

        itemRefs.current[fromIndex.toString()].component.measure(
          (x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
            if (typeof pageX === 'number' && typeof pageY === 'number') {
              itemRefs.current[fromIndex.toString()].position = {
                x: pageX + width / 2,
                y: pageY + height / 2 - scrollOffset.current
              };
              gridPositions.current[fromIndex.toString()] = {
                x: pageX + width / 2,
                y: pageY + height / 2 - scrollOffset.current,
                width, height
              };
            }
          }
        );
      }, 100);

      // انیمیشن آیتمی که "دریافت‌کننده" درگ است
      Animated.sequence([
        Animated.timing(itemRefs.current[fromIndex.toString()].scale, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(itemRefs.current[fromIndex.toString()].scale, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();

      // برجسته کردن کوتاه جابجایی با تغییر شفافیت
      Animated.sequence([
        Animated.timing(itemRefs.current[toIndex.toString()].opacity, {
          toValue: 0.7,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(itemRefs.current[toIndex.toString()].opacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }

    // بازنشانی پرچم جابجایی پس از انیمیشن
    setTimeout(() => {
      isSwapping.current = false;
    }, 250);
  };

  // یافتن نزدیک‌ترین آیتمی که می‌تواند جابجا شود - اجازه هر فاصله‌ای
  const findClosestItem = (currentPosition: { x: number; y: number }) => {
    let minDistance = Number.MAX_VALUE;
    let closestIndex = -1;

    // بدون آستانه فاصله - اجازه جابجایی با هر آیتمی

    // یافتن نزدیک‌ترین آیتم به موقعیت فعلی - جستجو همه آیتم‌ها
    Object.keys(gridPositions.current).forEach((key) => {
      const index = parseInt(key);

      // رد کردن آیتم درگ شده فعلی
      if (index === draggedIndex) return;

      const position = gridPositions.current[key];
      if (!position) return;

      // محاسبه فاصله تا مرکز این آیتم
      const distance = Math.sqrt(
        Math.pow(position.x - currentPosition.x, 2) +
        Math.pow(position.y - currentPosition.y, 2)
      );

      // یافتن نزدیک‌ترین مورد بدون توجه به فاصله
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    return closestIndex;
  };

  // مدیریت اسکرول خودکار هنگام کشیدن نزدیک لبه‌ها
  const handleAutoScroll = (y: number) => {
    if (!flatListRef.current) return;

    const SCROLL_THRESHOLD = 100;
    const SCROLL_INCREMENT = 5;
    const { height } = Dimensions.get('window');

    // اصلاح خطای scrollTo - دسترسی ایمن به متد scrollToOffset در FlatList
    if (y < SCROLL_THRESHOLD) {
      // اسکرول به بالا به صورت نرم‌تر
      if (flatListRef.current.scrollToOffset) {
        flatListRef.current.scrollToOffset({
          offset: Math.max(0, scrollOffset.current - SCROLL_INCREMENT),
          animated: false
        });
      }
    } else if (y > height - SCROLL_THRESHOLD) {
      // اسکرول به پایین به صورت نرم‌تر
      if (flatListRef.current.scrollToOffset) {
        flatListRef.current.scrollToOffset({
          offset: scrollOffset.current + SCROLL_INCREMENT,
          animated: false
        });
      }
    }
  };


  // 3. دکمه ذخیره را به تابع handleSaveButton متصل کنید:
  const renderDragInstructions = () => {
    if (!isDragging) return null;

    return (
      <Animated.View
        style={[
          styles.dragInstructionContainer,
          { opacity: isDragging ? 1 : 0 },
          instructionsStyle
        ]}
      >
        <Text style={styles.dragInstructionText}>
          {instructionsText}
        </Text>
        <TouchableOpacity
          style={[styles.saveButton, saveButtonStyle]}
          onPress={handleSaveButton} // تغییر در اینجا
        >
          <View style={styles.saveButtonContent}>
            <MaterialIcons name="save" size={20} color="#fff" />
            <Text style={[styles.saveButtonText, saveButtonTextStyle]}>
              {saveButtonText}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };
  // رندر کننده آیتم با انیمیشن‌های پیشرفته
  const renderItem = ({ item, index }: { item: T; index: number }) => {
    const itemKey = index.toString();

    // مقداردهی اولیه انیمیشن‌ها و رفرنس‌ها در صورت نیاز
    if (!itemRefs.current[itemKey]) {
      itemRefs.current[itemKey] = {
        position: { x: 0, y: 0 },
        dimensions: { width: 0, height: 0 },
        scale: new Animated.Value(1),
        translateX: new Animated.Value(0),
        translateY: new Animated.Value(0),
        opacity: new Animated.Value(1),
        component: null
      };
    }

    const scale = itemRefs.current[itemKey].scale;
    const translateX = itemRefs.current[itemKey].translateX;
    const translateY = itemRefs.current[itemKey].translateY;
    const opacity = itemRefs.current[itemKey].opacity;

    // شروع درگ با فشار طولانی
    const onLongPress = () => {
      // اگر قبلاً در حال درگ هستیم، دوباره شروع نکن
      if (isDragging) return;

      // اطمینان از اندازه‌گیری صحیح موقعیت قبل از شروع درگ
      if (!itemRefs.current[itemKey]?.position ||
        !itemRefs.current[itemKey]?.dimensions ||
        itemRefs.current[itemKey].position.x === 0) {
        if (itemRefs.current[itemKey]?.component) {
          itemRefs.current[itemKey].component.measure(
            (x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
              if (typeof pageX === 'number' && typeof pageY === 'number') {
                itemRefs.current[itemKey].position = {
                  x: pageX + width / 2,
                  y: pageY + height / 2 - scrollOffset.current
                };
                itemRefs.current[itemKey].dimensions = {
                  width,
                  height
                };

                // به‌روزرسانی موقعیت‌های شبکه با این اندازه‌گیری
                gridPositions.current[itemKey] = {
                  x: pageX + width / 2,
                  y: pageY + height / 2 - scrollOffset.current,
                  width,
                  height
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

    // تابع شروع درگ با انیمیشن بهبود یافته
    const startDragging = () => {
      setIsDragging(true);
      setDraggedItem(item);
      setDraggedIndex(index);

      // انیمیشن افزایش مقیاس با اسپرینگ برای حرکت نرم‌تر
      Animated.spring(scale, {
        toValue: 1.1,
        ...SPRING_CONFIG
      }).start();

      // افزودن یک افکت سایه ظریف
      Animated.timing(opacity, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true
      }).start();
    };

    // هندلر حرکت ژست بهبود یافته برای درگ نرم‌تر
    const onGestureEvent = (event: any) => {
      if (isDragging && draggedIndex === index) {
        const { translationX: tx, translationY: ty, absoluteX, absoluteY } = event.nativeEvent;

        // ذخیره موقعیت فعلی حرکت
        lastGestureLocation.current = { x: absoluteX, y: absoluteY };

        // به‌روزرسانی انیمیشن‌ها به صورت نرم‌تر
        translateX.setValue(tx);
        translateY.setValue(ty);

        // محاسبه موقعیت فعلی (شامل آفست اسکرول)
        const currentPosition = {
          x: itemRefs.current[itemKey].position.x + tx,
          y: itemRefs.current[itemKey].position.y + ty
        };

        // اسکرول خودکار در صورت نیاز برای تجربه نرم‌تر
        handleAutoScroll(absoluteY);

        // یافتن نزدیک‌ترین آیتم که می‌تواند با آن جابجا شود
        const closestIndex = findClosestItem(currentPosition);

        // به‌روزرسانی وضعیت هاور برای ارائه بازخورد بصری
        if (closestIndex !== -1 && closestIndex !== index) {
          setHoveredIndex(closestIndex);

          // فقط در صورتی جابجا کن که قبلاً در حال جابجایی نباشیم
          if (!isSwapping.current) {
            debouncedSwapItems(index, closestIndex);
          }
        } else {
          setHoveredIndex(null);
        }
      }
    };

    // تغییر وضعیت هندلر پن با رفتار پایان بهبود یافته
    const onHandlerStateChange = (event: any) => {
      const { state } = event.nativeEvent;
      panState.current = state;

      if (state === State.BEGAN) {
        // بازنشانی ترجمه‌ها در ابتدا
        translateX.setValue(0);
        translateY.setValue(0);
      }
      else if (state === State.END || state === State.CANCELLED || state === State.FAILED) {
        // اگر در حال حاضر این آیتم را می‌کشیم
        if (isDragging && draggedIndex === index) {
          // بررسی برای جابجایی نهایی
          const { translationX: tx, translationY: ty } = event.nativeEvent;
          const currentPosition = {
            x: itemRefs.current[itemKey].position.x + tx,
            y: itemRefs.current[itemKey].position.y + ty
          };

          // یافتن نزدیک‌ترین موقعیت برای جابجایی نهایی
          const closestIndex = findClosestItem(currentPosition);

          // انجام جابجایی نهایی در صورت نیاز
          if (closestIndex !== -1 && closestIndex !== index && !isSwapping.current) {
            swapItems(index, closestIndex);
          }

          // پایان کشیدن با انیمیشن‌های نرم‌تر
          finishDragging();
        }
      }

      // افزودن یک مکانیسم ایمنی - اگر حرکت در وضعیت عجیبی باشد، همه چیز را بازنشانی کن
      if (state !== State.ACTIVE && state !== State.BEGAN && isDragging) {
        // بازنشانی اجباری پس از تاخیر کوتاه برای اطمینان از عدم تداخل با مدیریت معمولی حرکت
        setTimeout(() => {
          if (isDragging) {  // بررسی مجدد اینکه آیا هنوز در حال کشیدن هستیم
            finishDragging();
          }
        }, 300);
      }
    };

    // وضعیت‌های بصری برای آیتم فعلی
    const isBeingDragged = isDragging && draggedIndex === index;
    const isHovered = hoveredIndex === index && !isBeingDragged;

    return (
      <PanGestureHandler
        enabled={true}
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
      >
        <Animated.View
          ref={ref => {
            if (ref) {
              itemRefs.current[itemKey].component = ref;
            }
          }}
          style={[
            styles.gridItemContainer,
            {
              width: itemWidth,
              height: itemHeight,
              margin: itemMargin / 2,
              transform: [
                { scale: isBeingDragged ? scale : 1 },
                { translateX: isBeingDragged ? translateX : 0 },
                { translateY: isBeingDragged ? translateY : 0 }
              ],
              zIndex: isBeingDragged ? 100 : (isHovered ? 50 : 1),
              opacity: opacity,
            },
            containerStyle
          ]}
          onLayout={(event) => {
            const layout = event.nativeEvent.layout;

            // اندازه‌گیری موقعیت با تاخیر برای اطمینان از دقت
            setTimeout(() => {
              if (itemRefs.current[itemKey]?.component) {
                itemRefs.current[itemKey].component.measure(
                  (x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
                    if (typeof pageX === 'number' && typeof pageY === 'number') {
                      // ذخیره موقعیت نسبت به اسکرول
                      itemRefs.current[itemKey].position = {
                        x: pageX + width / 2,
                        y: pageY + height / 2 - scrollOffset.current
                      };

                      itemRefs.current[itemKey].dimensions = {
                        width,
                        height
                      };

                      // به‌روزرسانی موقعیت‌های شبکه
                      gridPositions.current[itemKey] = {
                        x: pageX + width / 2,
                        y: pageY + height / 2 - scrollOffset.current,
                        width,
                        height
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
              { height: itemHeight },
              itemStyle,
              isBeingDragged && [styles.draggingItem, draggedItemStyle],
              isHovered && [styles.hoveredItem, hoveredItemStyle]
            ]}
            onLongPress={onLongPress}
            delayLongPress={200}
            activeOpacity={0.7}
            onPress={() => {
              // فقط در صورتی حرکت کن که در حالت کشیدن نباشیم
              if (!isDragging && onItemPress) {
                onItemPress(item);
              }
            }}
          >
            {renderItemContent(item, isBeingDragged, isHovered)}

            {/* نشانگر بهبود یافته دسته کشیدن */}
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

  // رندر کامپوننت اصلی
  return (
    <View style={[styles.container, containerStyle]}>
      {/* نمایش دستورالعمل‌های کشیدن در هنگام کشیدن */}
      {renderDragInstructions()}

      <FlatList
        ref={flatListRef}
        data={items}
        numColumns={numColumns}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.columnWrapper}
        extraData={[isDragging, draggedIndex, hoveredIndex, items]}
        scrollEnabled={true} // همیشه اجازه اسکرول برای تجربه کاربری بهتر
        onScroll={(e) => {
          scrollOffset.current = e.nativeEvent.contentOffset.y;

          // محاسبه مجدد موقعیت‌های شبکه هنگام اسکرول
          if (isDragging) {
            Object.keys(gridPositions.current).forEach(key => {
              if (gridPositions.current[key]) {
                gridPositions.current[key].y =
                  itemRefs.current[key].position.y -
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

// استایل‌های کامپوننت
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  list: {
    padding: 5,
    paddingBottom: 50, // پدینگ اضافی در پایین برای کشیدن
  },
  gridItemContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 1,
  },
  gridItem: {
    padding: 15,
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
    borderColor: "#1C3F64",
    borderWidth: 2,
    backgroundColor: "#FFFFFF",
    shadowColor: "#1C3F64",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 1,
  },
  hoveredItem: {
    borderColor: "#1C3F64",
    backgroundColor: "#F0F7FF",
    borderStyle: "dashed",
    borderWidth: 2,
  },
  columnWrapper: {
    justifyContent: "center",
  },
  dragInstructionContainer: {
    backgroundColor: "#F8F8F8",
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
    backgroundColor: "#1C3F64",
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

export default DraggableGrid;