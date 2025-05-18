import AsyncStorage from '@react-native-async-storage/async-storage';
import appConfig from '../../../config';

class HolidayService {
  static async getJalaliToday() {
    const today = new Date();
    return this.toJalali(today);
  }

  static toJalali(date) {
    const gregorianDate = new Date(date);
    const gregorianYear = gregorianDate.getFullYear();
    const gregorianMonth = gregorianDate.getMonth() + 1;
    const gregorianDay = gregorianDate.getDate();

    // محاسبه سال و ماه جلالی
    let jYear;
    if (gregorianMonth < 3 || (gregorianMonth === 3 && gregorianDay < 21)) {
      jYear = gregorianYear - 622;
    } else {
      jYear = gregorianYear - 621;
    }

    // برای سادگی، فقط سال را برمی‌گردانیم چون فقط به آن نیاز داریم
    return {
      year: jYear
    };
  }

  static async getHolidays(year, month) {
    try {
      const jalaliToday = await this.getJalaliToday();

      // بررسی سال جدید
      await this.checkYearChange(jalaliToday.year);

      // اگر سال مورد درخواست، سال فعلی است
      if (year === jalaliToday.year) {
        // ابتدا بررسی می‌کنیم آیا در حافظه محلی وجود دارد یا خیر
        const cachedHolidays = await this.getStoredHolidays(year, month);
        if (cachedHolidays) {
          return cachedHolidays;
        }

        // اگر در حافظه محلی نبود، از API دریافت می‌کنیم و ذخیره می‌کنیم
        const holidays = await this.fetchHolidaysFromApi(year, month);
        await this.storeHolidays(year, month, holidays);
        return holidays;
      } else {
        // اگر سال مورد درخواست، سال فعلی نیست، مستقیماً از API دریافت می‌کنیم
        // و در حافظه محلی ذخیره نمی‌کنیم
        return await this.fetchHolidaysFromApi(year, month);
      }
    } catch (error) {
      console.error('خطا در دریافت تعطیلات:', error);
      return [];
    }
  }

  // افزودن متد جدید برای دریافت مناسبت‌های روز
  static async getOccasions(year, month, day) {
    try {
      // کلید منحصر به فرد برای ذخیره در حافظه محلی
      const occasionCacheKey = `occasions_${year}_${month}_${day}`;

      // ابتدا سعی می‌کنیم از حافظه محلی بخوانیم
      const cachedOccasions = await AsyncStorage.getItem(occasionCacheKey);
      if (cachedOccasions) {
        return JSON.parse(cachedOccasions);
      }

      // اگر در حافظه محلی نبود، از API دریافت می‌کنیم
      const response = await fetch(
        `${appConfig.mobileApi}Calendar/GetOccasionsOfDay?year=${year}&month=${month}&day=${day}`
      );

      if (!response.ok) {
        throw new Error(`خطای API با کد: ${response.status}`);
      }

      const occasions = await response.json();

      // ذخیره در حافظه محلی برای استفاده بعدی
      // مناسبت‌ها معمولاً تغییر نمی‌کنند، بنابراین ذخیره‌سازی آن‌ها منطقی است
      await AsyncStorage.setItem(occasionCacheKey, JSON.stringify(occasions));

      return occasions;
    } catch (error) {
      console.error('خطا در دریافت مناسبت‌ها:', error);
      return [];
    }
  }

  // متد جدید برای دریافت روزهای چشمک‌زن
  static async getBlinkingDays(year, month) {
    try {
      // کلید منحصر به فرد برای ذخیره در حافظه محلی
      const blinkingDaysCacheKey = `blinking_days_${year}_${month}`;

      // ابتدا سعی می‌کنیم از حافظه محلی بخوانیم
      const cachedBlinkingDays = await AsyncStorage.getItem(blinkingDaysCacheKey);
      if (cachedBlinkingDays) {
        return JSON.parse(cachedBlinkingDays);
      }

      // اگر در حافظه محلی نبود، از API دریافت می‌کنیم
      const response = await fetch(
        `${appConfig.mobileApi}Calendar/GetBlinkingDaysOfMonth?year=${year}&month=${month}`
      );

      if (!response.ok) {
        throw new Error(`خطای API با کد: ${response.status}`);
      }

      const blinkingDays = await response.json();

      // ذخیره در حافظه محلی برای استفاده بعدی
      await AsyncStorage.setItem(blinkingDaysCacheKey, JSON.stringify(blinkingDays));

      return blinkingDays;
    } catch (error) {
      console.error('خطا در دریافت روزهای چشمک‌زن:', error);
      return [];
    }
  }

  static async fetchHolidaysFromApi(year, month) {
    try {
      const response = await fetch(
        `${appConfig.mobileApi}Calendar/GetHolidays?year=${year}&month=${month}`
      );

      if (!response.ok) {
        throw new Error(`خطای API با کد: ${response.status}`);
      }

      const holidays = await response.json();
      return holidays;
    } catch (error) {
      console.error('خطا در دریافت تعطیلات از API:', error);
      return [];
    }
  }

  static async storeHolidays(year, month, holidays) {
    try {
      const key = `holidays_${year}_${month}`;
      await AsyncStorage.setItem(key, JSON.stringify(holidays));
    } catch (error) {
      console.error('خطا در ذخیره‌سازی تعطیلات:', error);
    }
  }

  static async getStoredHolidays(year, month) {
    try {
      const key = `holidays_${year}_${month}`;
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('خطا در بازیابی تعطیلات از حافظه محلی:', error);
      return null;
    }
  }

  static async checkYearChange(currentYear) {
    try {
      const lastSavedYearStr = await AsyncStorage.getItem('last_saved_year');
      const lastSavedYear = lastSavedYearStr ? parseInt(lastSavedYearStr) : null;

      if (lastSavedYear !== currentYear) {
        await this.clearAllHolidaysCache();
        await this.clearAllOccasionsCache();
        await this.clearAllBlinkingDaysCache(); // افزودن پاک کردن حافظه روزهای چشمک‌زن
        await AsyncStorage.setItem('last_saved_year', currentYear.toString());

        console.log(`سال جدید ${currentYear} شناسایی شد. داده‌های قبلی پاک شدند.`);
      }
    } catch (error) {
      console.error('خطا در بررسی تغییر سال:', error);
    }
  }

  static async clearAllHolidaysCache() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const holidayKeys = keys.filter(key => key.startsWith('holidays_'));
      if (holidayKeys.length > 0) {
        await AsyncStorage.multiRemove(holidayKeys);
        console.log(`${holidayKeys.length} مورد داده تعطیلات از حافظه محلی پاک شد.`);
      }
    } catch (error) {
      console.error('خطا در پاک کردن حافظه تعطیلات:', error);
    }
  }

  // متد جدید برای پاک کردن حافظه روزهای چشمک‌زن
  static async clearAllBlinkingDaysCache() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const blinkingDaysKeys = keys.filter(key => key.startsWith('blinking_days_'));
      if (blinkingDaysKeys.length > 0) {
        await AsyncStorage.multiRemove(blinkingDaysKeys);
        console.log(`${blinkingDaysKeys.length} مورد داده روزهای چشمک‌زن از حافظه محلی پاک شد.`);
      }
    } catch (error) {
      console.error('خطا در پاک کردن حافظه روزهای چشمک‌زن:', error);
    }
  }

  static async clearAllOccasionsCache() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const occasionKeys = keys.filter(key => key.startsWith('occasions_'));
      if (occasionKeys.length > 0) {
        await AsyncStorage.multiRemove(occasionKeys);
        console.log(`${occasionKeys.length} مورد داده مناسبت از حافظه محلی پاک شد.`);
      }
    } catch (error) {
      console.error('خطا در پاک کردن حافظه مناسبت‌ها:', error);
    }
  }
}

export default HolidayService;