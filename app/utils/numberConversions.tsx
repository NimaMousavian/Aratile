import React, { useState, useRef, useEffect } from "react";
import {
  Text,
  TextInput,
  TextInputProps,
  StyleSheet,
  NativeSyntheticEvent,
  TextInputSelectionChangeEventData
} from "react-native";

/**
 * تبدیل اعداد انگلیسی به فارسی
 */
export const toPersianDigits = (
  input: string | number | null | undefined
): string => {
  if (input === null || input === undefined) return "";

  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
  const englishDigits = "0123456789";

  return input.toString().replace(/[0-9]/g, (match) => {
    return persianDigits[englishDigits.indexOf(match)];
  });
};

/**
 * تبدیل اعداد فارسی به انگلیسی
 */
export const toEnglishDigits = (
  input: string | null | undefined
): string => {
  if (input === null || input === undefined) return "";

  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
  const englishDigits = "0123456789";

  return input.toString().replace(/[۰-۹]/g, (match) => {
    return englishDigits[persianDigits.indexOf(match)];
  });
};

/**
 * پراپ‌های ورودی برای کامپوننت NumberConverterInput
 */
interface NumberConverterInputProps extends Omit<TextInputProps, 'onChangeText'> {
  value?: string;
  onChangeText?: (value: string, convertedValue: string) => void;
  convertTo: 'persian' | 'english';
  showRealTimeConversion?: boolean;
}

/**
 * کامپوننت ورودی برای تبدیل اعداد فارسی به انگلیسی یا برعکس
 * با قابلیت تبدیل آنی در حین تایپ
 */
export const NumberConverterInput: React.FC<NumberConverterInputProps> = ({
  value = "",
  onChangeText,
  convertTo = "persian",
  showRealTimeConversion = false,
  style,
  ...props
}) => {
  const inputRef = useRef<TextInput>(null);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [isComposing, setIsComposing] = useState(false);

  const [displayValue, setDisplayValue] = useState<string>("");

  useEffect(() => {
    if (value !== undefined) {
      setDisplayValue(convertTo === "persian" ? toPersianDigits(value) : toEnglishDigits(value));
    }
  }, [value, convertTo]);

  // مدیریت موقعیت مکان‌نما هنگام تغییر متن
  const handleSelectionChange = (event: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
    setSelection(event.nativeEvent.selection);
  };

  // رویداد تغییر متن با تبدیل آنی در حین تایپ
  const handleChangeText = (text: string) => {
    // مقدار selection قبل از تبدیل را ذخیره می‌کنیم
    const cursorPosition = selection.end;
    const lengthBeforeConversion = text.length;

    let displayText: string;
    let originalText: string;

    if (convertTo === "persian") {
      // تبدیل به فارسی برای نمایش
      displayText = toPersianDigits(text);
      // تبدیل به انگلیسی برای ذخیره
      originalText = toEnglishDigits(text);
    } else {
      // تبدیل به انگلیسی برای نمایش
      displayText = toEnglishDigits(text);
      // متن اصلی برای ذخیره
      originalText = text;
    }

    // به‌روزرسانی متن نمایشی
    setDisplayValue(displayText);

    // فراخوانی callback
    if (onChangeText) {
      onChangeText(originalText, displayText);
    }

    // تنظیم موقعیت مکان‌نما
    if (inputRef.current && !isComposing) {
      const lengthDifference = displayText.length - lengthBeforeConversion;
      const newPosition = cursorPosition + lengthDifference;

      // با استفاده از تایمر، این تنظیم را پس از رندر شدن UI انجام می‌دهیم
      setTimeout(() => {
        inputRef.current?.setNativeProps({
          selection: { start: newPosition, end: newPosition }
        });
      }, 0);
    }
  };

  return (
    <>
      <TextInput
        ref={inputRef}
        value={displayValue}
        onChangeText={handleChangeText}
        onSelectionChange={handleSelectionChange}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => setIsComposing(false)}
        style={[styles.input, style]}
        textAlign="right"
        writingDirection="rtl"
        {...props}
      />

      {showRealTimeConversion && displayValue && (
        <Text style={styles.conversionText}>
          {convertTo === "persian"
            ? `معادل انگلیسی: ${toEnglishDigits(displayValue)}`
            : `معادل فارسی: ${toPersianDigits(displayValue)}`}
        </Text>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    textAlign: "right",
  },
  conversionText: {
    marginTop: 4,
    fontSize: 12,
    color: "#666",
    textAlign: "right",
  },
});