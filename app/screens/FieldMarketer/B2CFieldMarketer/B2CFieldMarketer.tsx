import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import colors from "../../../config/colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { AppNavigationProp } from "../../../StackNavigator";
import ScreenHeader from "../../../components/ScreenHeader";
import SearchInput from "../../../components/SearchInput";
import AppText from "../../../components/Text";
import ProductCard from "../../../components/ProductCard";
import { handlePhoneCall } from "../B2BFieldMarketer/B2BFieldMarketer";
import { Feather } from "@expo/vector-icons";
import { IProjectItem } from "../../../config/types";
import Toast from "../../../components/Toast";
import axios from "axios";
import appConfig from "../../../../config";
import { toPersianDigits } from "../../../utils/numberConversions";

const B2CFieldMarketer = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const [projectItems, setProjectItems] = useState<IProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filterProjectName, setFilterProjectName] = useState<string>("");

  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<
    "success" | "error" | "warning" | "info"
  >("error");

  const showToast = (
    message: string,
    type: "success" | "error" | "warning" | "info" = "error"
  ) => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const getProjectItems = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get<{ Items: IProjectItem[] }>(
        `${appConfig.mobileApi}PersonProject/GetAll?page=1&pageSize=1000`
      );

      setProjectItems(response.data.Items);
    } catch (error) {
      showToast("خطا در دریافت اطلاعات پروژه ها", "error");
    } finally {
      setIsLoading(false);
    }
  };
  const getProjectItemsWithFilter = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get<{ Items: IProjectItem[] }>(
        `${appConfig.mobileApi}PersonProject/GetAll?filterProjectName=${filterProjectName}&page=1&pageSize=20`
      );

      console.log(response.data.Items);

      setProjectItems(response.data.Items);
    } catch (error) {
      showToast("خطا در دریافت اطلاعات پروژه ها", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getProjectItems();
  }, []);

  const onScreenFocus = useCallback(() => {
    getProjectItems();
  }, []);

  // Use useFocusEffect to run the function when the screen is focused
  useFocusEffect(
    useCallback(() => {
      onScreenFocus();
    }, [onScreenFocus])
  );

  return (
    <>
      <ScreenHeader
        title="پروژه ها"
        rightComponent={
          <TouchableOpacity
            style={styles.addIconContainer}
            onPress={() =>
              navigation.navigate("AddNewProject", { project: undefined })
            }
          >
            <MaterialIcons name="add" size={24} color="white" />
          </TouchableOpacity>
        }
      />
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onDismiss={() => setToastVisible(false)}
      />
      <View style={styles.container}>
        <View style={styles.searchInput}>
          <SearchInput
            value={filterProjectName}
            onChangeText={setFilterProjectName}
            onSearch={() => getProjectItemsWithFilter()}
            onClear={() => getProjectItems()}
          />
        </View>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <AppText
                style={{ marginTop: 15, fontSize: 20, color: colors.primary }}
              >
                در حال بارگذاری اطلاعات
              </AppText>
            </View>
          ) : projectItems.length > 0 ? (
            projectItems?.map((project) => (
              <ProductCard
                key={project.PersonProjectId}
                title={toPersianDigits(project.ProjectName)}
                fields={[
                  {
                    icon: "person",
                    iconColor: colors.blueIcon,
                    label: "کارفرما:",
                    value: `${project.PersonFullName}`,
                  },
                  {
                    icon: "location-pin",
                    iconColor: colors.greenIcon,
                    label: "مکان:",
                    value: `${project.ProvinceName} / ${project.CityName}`,
                  },
                  {
                    icon: "question-mark",
                    iconColor: colors.orangeIcon,
                    label: "تاریخ ثبت:",
                    value: toPersianDigits(project.ShamsiInsertDate),
                  },
                ]}
                note={
                  project.Description
                    ? toPersianDigits(project.Description)
                    : ""
                }
                noteConfig={{
                  show: false,
                  icon: "notes",
                  iconColor: colors.secondary,
                  label: "توضیحات:",
                }}
                qrConfig={{
                  show: false,
                  icon: "camera", // تغییر آیکون به دوربین/عکس
                  iconSize: 36,
                  iconColor: colors.secondary,
                }}
                titleStyle={{ fontSize: 20 }}
                callIcon={{
                  name: "call",
                  onPress: () => handlePhoneCall(project.PersonMobile),
                  containerStyle: {
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    justifyContent: "center",
                    alignItems: "center",
                    // marginRight: -10, // حرکت به چپ
                    marginLeft: -3,
                    borderWidth: 2,
                    borderColor: colors.success, // یا هر رنگی که می‌خواید
                    backgroundColor: "white",
                  },
                }}
                editIcon={{
                  name: "edit",
                  size: 22,
                  color: colors.warning,
                  onPress: () => {
                    navigation.navigate("AddNewProject", { project: project });
                  },
                  containerStyle: styles.iconCircleSmall, // اضافه کردن استایل دایره
                }}
                //   deleteIcon={{
                //     name: "delete",
                //     size: 22,
                //     color: colors.danger,
                //     onPress: () => {
                //       showRemoveConfirmation(product.id, () => {
                //         showToast("محصول با موفقیت حذف شد", "info");
                //       });
                //     },
                //     containerStyle: styles.iconCircleSmall, // اضافه کردن استایل دایره
                //   }}
                containerStyle={
                  Platform.OS === "android" ? styles.androidCardAdjustment : {}
                }
                //   onLongPress={() => {
                //     showRemoveConfirmation(product.id, () => {
                //       showToast("محصول با موفقیت حذف شد", "info");
                //     });
                //   }}
                onPress={() => {
                  navigation.navigate("AddNewProject", { project: project });
                }}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Feather name="clipboard" size={64} color="#9CA3AF" />
              <AppText style={styles.emptyText}>موردی یافت نشد</AppText>
            </View>
          )}
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  addIconContainer: {
    backgroundColor: colors.success,
    width: 40,
    height: 40,
    marginLeft: 10,
    marginTop: -4,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  androidCardAdjustment: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginVertical: 4,
  },
  searchInput: {
    marginBottom: 10,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontFamily: "Yekan_Bakh_Regular",
    fontSize: 16,
    color: "#6B7280",
    marginTop: 12,
    textAlign: "center",
  },
  iconCircleSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 2,
    marginRight: -20,
    borderWidth: 2,
    borderColor: colors.warning,
    backgroundColor: "white",
  },
});

export default B2CFieldMarketer;
