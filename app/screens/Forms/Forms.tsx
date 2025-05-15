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

  const renderItem = (formItem: IForm): React.ReactElement => {
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate("FormItem", { formItem: formItem })}
        key={formItem.FormId}
      >
        <View key={formItem.FormId} style={styles.formItemContainer}>
          <MaterialIcons
            name={formItem.IconName || "article"}
            color={colors.info}
            size={40}
          />
          <AppText style={styles.formTitle}>{formItem.FormName}</AppText>
        </View>
      </TouchableOpacity>
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
          <ScrollView>
            {Object.entries(groupedForms).map(([groupId, fields]) => (
              <InputContainer
                key={groupId}
                title={
                  fields[0].FormGroupName
                    ? fields[0].FormGroupName
                    : "سایر فرم ها"
                }
                showFilterIcon={true}
                isGradient={false}
                filterIconName={fields[0].FormGroupIconName || "edit-note"} 
              >
                {fields.map((field) => renderItem(field))}
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
  formItemContainer: {
    borderWidth: 1,
    borderColor: colors.info,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
    backgroundColor: "#deeaf1",
  },
  formTitle: {
    fontFamily: "Yekan_Bakh_Bold",
    fontSize: 20,
    marginTop: 6,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 12,
  },
});

export default Forms;