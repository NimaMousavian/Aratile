import React, { useState, useEffect } from "react";
import { ActivityIndicator } from "react-native";
import axios from "axios";
import { IShopCustomField } from "../config/types";
import appConfig from "../../config";
import SelectionBottomSheet from "./SelectionDialog";
import { MaterialIcons } from "@expo/vector-icons";
import { FormikProps, FormikValues } from "formik";

interface DynamicSelectionBottomSheetProps<T extends object> {
  customFieldId: number;
  customFieldName: string;
  customIconName?: string;
  url: string;
  formikProps: FormikProps<T>;
}

const DynamicSelectionBottomSheet = <T extends object>({
  customFieldId,
  customFieldName,
  customIconName,
  url,
  formikProps,
}: DynamicSelectionBottomSheetProps<T>) => {
  const fieldName = `custom_${customFieldId}`;
  const [options, setOptions] = useState<
    { Item: string; Value: string | number }[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOptions = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(url);
        const fetchedOptions = response.data;
        console.log(fetchedOptions);

        setOptions(fetchedOptions);
      } catch (err) {
        console.error(
          `Error fetching options for customFieldId ${customFieldId}:`,
          err
        );

        setError("خطا در بارگذاری گزینه‌ها");
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, [customFieldId]);

  return (
    <SelectionBottomSheet
      placeholderText={
        (formikProps.values[fieldName] as string | undefined) || customFieldName
      }
      title={customFieldName}
      iconName={
        customIconName as React.ComponentProps<typeof MaterialIcons>["name"]
      }
      options={options.map((option) => option.Item)}
      onSelect={(value) =>
        formikProps.setFieldValue(
          fieldName,
          options.find((option) => option.Item === value[0])?.Value
        )
      }
      loading={loading}
      error={
        error ||
        (formikProps.touched[fieldName] && formikProps.errors[fieldName]
          ? (formikProps.errors[fieldName] as string)
          : undefined)
      }
    />
  );
};

export default DynamicSelectionBottomSheet;
