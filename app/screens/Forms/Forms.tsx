import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import ScreenHeader from "../../components/ScreenHeader";
import colors from "../../config/colors";
import { AppNavigationProp } from "../../StackNavigator";
import { IForm } from "../../config/types";
import axios from "axios";
import appConfig from "../../../config";
import {
  groupBy,
  InputContainer,
} from "../FieldMarketer/B2BFieldMarketer/AddNewShop";
import AppText from "../../components/Text";

// Google Material Design Colors
const googleColors = [
  "#4285F4", // Google Blue
  "#ea4335", // Google Red
  "#F4B400", // Google Yellow
  "#0F9D58", // Google Green
  "#AB47BC", // Purple
  "#FF7043", // Deep Orange
  "#26A69A", // Teal
  "#42A5F5", // Light Blue
  "#66BB6A", // Light Green
  "#FFA726", // Orange
  "#EC407A", // Pink
  "#5C6BC0", // Indigo
];

const Forms = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const [forms, setForms] = useState<IForm[]>([]);
  const [isLoading, setIsloading] = useState<boolean>(false);
  const [groupedForms, setGroupedForms] = useState<Record<string, IForm[]>>({});

  const getForms = async () => {
    setIsloading(true);
    try {
      const response = await axios.get<IForm[]>(
        `${appConfig.mobileApi}Form/GetAllActive`
      );
      setForms(response.data);
      const groupedForm = groupBy(response.data, "FormGroupId");
      const sortedForms = sortGroupedItems(groupedForm);
      setGroupedForms(sortedForms);
    } catch (error) {
      console.log(error);
    } finally {
      setIsloading(false);
    }
  };

  useEffect(() => {
    getForms();
  }, []);

  const sortGroupedItems = (data: Record<string, IForm[]>) => {
    const dataArray = Object.entries(data);

    // Sort by FormGroupShowOrder
    const sortedArray = dataArray.sort((a, b) => {
      // Get FormGroupShowOrder from the first item in each group's array
      const orderA = a[1][0]?.FormGroupShowOrder || Infinity; // Fallback for safety
      const orderB = b[1][0]?.FormGroupShowOrder || Infinity;
      return orderA - orderB;
    });

    const sortedObject = Object.fromEntries(sortedArray);
    return sortedObject;
  };

  // Function to get color based on form index
  const getFormColor = (formId: string): string => {
    // Use form ID to generate consistent color index
    const hash = formId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return googleColors[hash % googleColors.length];
  };

  const renderItem = (formItem: IForm, index: number, isLast: boolean): React.ReactElement => {
    const formColor = getFormColor(formItem.FormId.toString());

    return (
      <View key={formItem.FormId}>
        <TouchableOpacity
          onPress={() => navigation.navigate("FormItem", { formItem: formItem })}
          style={[styles.touchableItem, index === 0 && styles.firstItem]}
          activeOpacity={0.7}
        >
          <View style={styles.formItemContainer}>
            <View style={[
              styles.iconContainer,
              {
                backgroundColor: `${formColor}20`,
                borderColor: `${formColor}60`,
              }
            ]}>
              <MaterialIcons
                name={formItem.IconName || "article"}
                color={formColor}
                size={32}
              />
            </View>
            <View style={styles.textContainer}>
              <AppText style={styles.formTitle}>{formItem.FormName}</AppText>
            </View>
            <View style={styles.arrowContainer}>
              <MaterialIcons
                name="chevron-left"
                color={colors.secondary}
                size={24}
              />
            </View>
          </View>
        </TouchableOpacity>
        {!isLast && <View style={styles.separator} />}
      </View>
    );
  };

  return (
    <>
      <ScreenHeader title="فرم ها" />
      <View style={styles.container}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <AppText style={styles.loadingText}>
              در حال دریافت اطلاعات...
            </AppText>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {Object.entries(groupedForms).map(([groupId, fields]) => (
              <InputContainer
                key={groupId}
                title={
                  fields[0].FormGroupName
                    ? fields[0].FormGroupName
                    : "سایر فرم ها"
                }
                showFilterIcon={true}
                filterIconName={fields[0].FormGroupIconName || "edit-note"}
              >
                {fields.map((field, index) =>
                  renderItem(field, index, index === fields.length - 1)
                )}
              </InputContainer>
            ))}
          </ScrollView>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 0,
    paddingBottom:10,
    marginBottom:50,
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
  touchableItem: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  firstItem: {
    marginTop: -12,
  },
  formItemContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 8,
    backgroundColor: 'transparent',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: -8,
    marginLeft: 8,
    borderWidth: 1,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  formTitle: {
    fontFamily: "Yekan_Bakh_Bold",
    fontSize: 17,
    textAlign: 'right',
    lineHeight: 24,
    letterSpacing: 0.3,
  },
  arrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 36,
    height: 36,
    marginLeft: -5,
    borderRadius: 50,
    backgroundColor: `${colors.primaryLight}20`,
  },
  separator: {
    height: 1,
    backgroundColor: colors.gray,
    marginHorizontal: 0,
    marginVertical: 2,
    opacity: 0.5,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: colors.medium,
    marginTop: 12,
    fontFamily: "Yekan_Bakh_Bold",
  },
});

export default Forms;