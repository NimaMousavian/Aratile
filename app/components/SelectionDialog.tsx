import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  TextInput,
  Keyboard,
  Modal,
  Easing,
  ActivityIndicator
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import colors from "../config/colors";
import AppText from "./Text";
import IconButton from "./IconButton";

interface SelectionBottomSheetProps {
  iconName?: React.ComponentProps<typeof MaterialIcons>["name"];
  placeholderText?: string;
  onSelect: (values: string[]) => void;
  initialValues?: string[];
  options: string[];
  title?: string;
  accentColor?: string;
  multiSelect?: boolean;
  loading?: boolean;
  onPress?: () => void;
}

const { height } = Dimensions.get("window");

const SelectionBottomSheet: React.FC<SelectionBottomSheetProps> = ({
  iconName = "person",
  placeholderText = "انتخاب کنید",
  onSelect,
  initialValues = [],
  options = [],
  title = "انتخاب گزینه",
  accentColor = colors.secondary,
  multiSelect = false,
  loading = false,
  onPress,
}) => {
  const [selectedValues, setSelectedValues] = useState<string[]>(initialValues);
  const [tempSelectedValues, setTempSelectedValues] = useState<string[]>(initialValues);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [filteredOptions, setFilteredOptions] = useState<string[]>(options);
  const [searchQuery, setSearchQuery] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const slideAnimation = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const loadingAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredOptions(options);
      return;
    }

    const lowercasedQuery = searchQuery.toLowerCase().trim();
    const filtered = options.filter(
      option => option.toLowerCase().includes(lowercasedQuery)
    );

    setFilteredOptions(filtered);
  }, [searchQuery, options]);

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      e => setKeyboardHeight(e.endCoordinates.height)
    );
    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardHeight(0)
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  useEffect(() => {
    if (modalVisible) {
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

      if (multiSelect) {
        setTempSelectedValues([...selectedValues]);
      }
    }
  }, [modalVisible, slideAnimation, backdropOpacity, selectedValues, multiSelect]);

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(loadingAnimation, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(loadingAnimation, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ])
      ).start();
    } else {
      loadingAnimation.setValue(0);
    }
  }, [loading, loadingAnimation]);

  const openModal = () => {
    if (onPress) {
      onPress();
      return;
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 450,
        useNativeDriver: true,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setSearchQuery("");
      setModalVisible(false);
    });
  };

  const handleValueChange = (value: string) => {
    if (multiSelect) {
      const currentIndex = tempSelectedValues.indexOf(value);
      const newSelectedValues = [...tempSelectedValues];

      if (currentIndex === -1) {
        newSelectedValues.push(value);
      } else {
        newSelectedValues.splice(currentIndex, 1);
      }

      setTempSelectedValues(newSelectedValues);
    } else {
      setSelectedValues([value]);
      onSelect([value]);
      closeModal();
    }
  };

  const handleConfirm = () => {
    setSelectedValues([...tempSelectedValues]);
    onSelect([...tempSelectedValues]);
    closeModal();
  };

  const handleCancel = () => {
    closeModal();
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const renderPlaceholderText = () => {
    if (selectedValues.length === 0) return placeholderText;
    if (multiSelect) return selectedValues.join('، ');
    return selectedValues[0];
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

  const pulseAnimation = {
    opacity: loadingAnimation,
    transform: [
      {
        scale: loadingAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0.95, 1.05],
        }),
      },
    ],
  };

  const getContentHeight = () => {
    if (loading) {
      return height * 0.6;
    } else if (filteredOptions.length <= 3) {
      return "auto";
    } else if (filteredOptions.length <= 5) {
      return Math.min(height * 0.5, height * 0.8);
    } else if (filteredOptions.length <= 8) {
      return Math.min(height * 0.6, height * 0.8);
    } else {
      return height * 0.8;
    }
  };

  const getPlaceholderStyle = () => {
    if (selectedValues.length === 0) {
      return [styles.selectedText, { color: colors.darkGray }];
    }
    return styles.selectedText;
  };

  const getInputContainerStyle = () => {
    return styles.inputContainer;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={getInputContainerStyle()}
        onPress={openModal}
        activeOpacity={0.7}
      >
        <View style={styles.inputContent}>
          <MaterialIcons name={iconName} size={20} color={colors.medium} style={styles.icon} />
          <AppText style={getPlaceholderStyle()}>
            {renderPlaceholderText()}
          </AppText>
        </View>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <Animated.View
            style={[styles.backdrop, backdropStyle]}
          >
            <TouchableOpacity
              style={styles.backdropTouchable}
              activeOpacity={1}
              onPress={closeModal}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.bottomSheet,
              animatedStyle,
              {
                paddingBottom: keyboardHeight > 0 ? keyboardHeight : 20,
                height: getContentHeight(),
                maxHeight: "80%",
              }
            ]}
          >
            <LinearGradient
              colors={[colors.secondary, colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.header}
            >
              <View style={styles.headerContent}>
                <MaterialIcons
                  name={iconName}
                  size={24}
                  color="white"
                />
                <Text style={styles.headerTitle}>{title}</Text>
              </View>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <MaterialIcons name="close" size={28} color="white" />
              </TouchableOpacity>
            </LinearGradient>

            <View style={styles.body}>
              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="جستجو..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  textAlign="right"
                  placeholderTextColor={colors.medium}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
                    <MaterialIcons name="close" size={20} color={colors.medium} />
                  </TouchableOpacity>
                )}
                <MaterialIcons name="search" size={20} color={colors.medium} style={styles.searchIcon} />
              </View>

              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator
                    size="large"
                    color={colors.secondary}
                    style={styles.spinner}
                  />
                </View>
              ) : filteredOptions.length > 0 ? (
                <ScrollView
                  style={styles.optionsList}
                  contentContainerStyle={styles.optionsListContent}
                  showsVerticalScrollIndicator={false}
                >
                  {filteredOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={styles.optionItem}
                      onPress={() => handleValueChange(option)}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          multiSelect
                            ? tempSelectedValues.includes(option) && styles.checkboxSelected
                            : selectedValues[0] === option && styles.checkboxSelected
                        ]}
                      >
                        {(multiSelect
                          ? tempSelectedValues.includes(option)
                          : selectedValues[0] === option) && (
                            <MaterialIcons name="check" size={16} color="white" />
                          )}
                      </View>
                      <Text style={styles.optionText}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.noResultsContainer}>
                  <MaterialIcons name="search-off" size={48} color={colors.medium} />
                  <Text style={styles.noResultsText}>نتیجه‌ای یافت نشد</Text>
                </View>
              )}

              {multiSelect && (
                <View style={styles.buttonsContainer}>
                  <IconButton
                    text="انصراف"
                    iconName="close"
                    backgroundColor={colors.danger}
                    onPress={handleCancel}
                    flex={0.48}
                  />
                  <IconButton
                    text="تایید"
                    iconName="check"
                    backgroundColor={colors.success}
                    onPress={handleConfirm}
                    flex={0.48}
                  />
                </View>
              )}
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 10,
    marginBottom: 16,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "white",
  },
  disabledInput: {
    backgroundColor: "#f5f5f5",
    borderColor: "#e0e0e0",
  },
  inputContent: {
    flexDirection: "row-reverse",
    alignItems: "center",
    flex: 1,
  },
  icon: {
    marginLeft: 8,
  },
  selectedText: {
    color: colors.dark,
    fontSize: 15,
    marginRight: 8,
    textAlign: "right",
  },
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
  bottomSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 16,
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
  headerTitle: {
    fontSize: 18,
    color: colors.white,
    marginRight: 8,
    fontFamily: "Yekan_Bakh_Bold",
  },
  closeButton: {
    padding: 8,
    position: "absolute",
    left: 5,
  },
  body: {
    padding: 16,
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row-reverse",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.dark,
    fontFamily: "Yekan_Bakh_Regular",
    textAlign: "right",
    paddingVertical: 4,
  },
  searchIcon: {
    marginLeft: 8,
  },
  clearButton: {
    padding: 4,
    marginLeft: 4,
  },
  optionsList: {
    flex: 1,
  },
  optionsListContent: {
    paddingVertical: 4,
    paddingBottom: 20,
  },
  optionItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  optionText: {
    fontSize: 15,
    color: colors.dark,
    fontFamily: "Yekan_Bakh_Regular",
    marginRight: 12,
    flex: 1,
    textAlign: "right",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.medium,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  noResultsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
    paddingBottom: 40,
  },
  noResultsText: {
    fontSize: 16,
    color: colors.medium,
    marginTop: 12,
    fontFamily: "Yekan_Bakh_Regular",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    minHeight: 250,
    borderRadius: 8,
    margin: 20,
    flex: 1,
  },
  spinner: {
    transform: [{ scale: 1.5 }],
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 18,
    color: colors.secondary,
    marginTop: 12,
    fontFamily: "Yekan_Bakh_Regular",
    textAlign: "center",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
});

export default SelectionBottomSheet;