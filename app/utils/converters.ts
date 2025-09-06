// نسخه اصلاح شده تابع toPersianDigits
export const toPersianDigits = (number: any): string => {
  // بررسی مقادیر null و undefined
  if (number === null || number === undefined) {
    return "";
  }

  // بررسی string خالی
  if (number === "") {
    return "";
  }

  // بررسی عدد صفر
  if (number === 0) {
    return "۰";
  }

  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

  try {
    // تبدیل امن به string
    const stringValue = String(number);

    // تبدیل اعداد انگلیسی به فارسی
    return stringValue.replace(
      /\d/g,
      (match) => persianDigits[parseInt(match)]
    );
  } catch (error) {
    console.error("Error in toPersianDigits:", error, "Input:", number);
    return "";
  }
};

// یا به صورت محافظانه‌تر:
export const toPersianDigitsSafe = (
  number: string | number | null | undefined
): string => {
  // بررسی شرایط خاص
  if (number == null) return ""; // null یا undefined
  if (number === "") return "";
  if (number === 0) return "۰";

  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

  try {
    // استفاده از String() به جای toString() که ایمن‌تر است
    const str = String(number);
    return str.replace(/\d/g, (digit) => persianDigits[parseInt(digit)]);
  } catch (error) {
    console.error("Error converting to Persian digits:", error);
    return "";
  }
};

// نسخه با type checking دقیق‌تر:
export const toPersianDigitsTypeSafe = (input: unknown): string => {
  // Type guards
  if (input === null || input === undefined) {
    return "";
  }

  if (input === 0) {
    return "۰";
  }

  if (input === "") {
    return "";
  }

  // بررسی اینکه آیا input قابل تبدیل به string است
  if (typeof input !== "string" && typeof input !== "number") {
    console.warn(
      "Invalid input type for toPersianDigits:",
      typeof input,
      input
    );
    return "";
  }

  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

  try {
    const stringValue = String(input);
    return stringValue.replace(/\d/g, (match) => {
      const index = parseInt(match, 10);
      return persianDigits[index] || match;
    });
  } catch (error) {
    console.error("Error in toPersianDigitsTypeSafe:", error, "Input:", input);
    return "";
  }
};
