import axios from "axios";
import appConfig from "../../../../config";
import {
  toPersianDigits,
  toEnglishDigits,
  NumberConverterInput,
} from "../../../utils/numberConversions";

// مدل داده برای ایجاد شخص جدید
export interface CreatePersonDTO {
  PersonId: number;
  FirstName: string;
  LastName: string;
  Mobile: string;
  ProvinceId: number;
  CityId: number;
  MarketingChannelId: string;
  Address: string;
  PersonGroupIdList: number[];
}

/**
 * تبدیل فیلدهای عددی فارسی به انگلیسی در آبجکت
 * @param obj آبجکت حاوی فیلدهای متنی
 * @returns آبجکت با اعداد تبدیل شده به انگلیسی
 */
const convertObjectNumbersToEnglish = <T extends Record<string, any>>(
  obj: T
): T => {
  const result = { ...obj };

  for (const key in result) {
    if (typeof result[key] === "string") {
      // تبدیل فیلدهای متنی با اعداد فارسی به انگلیسی
      result[key] = toEnglishDigits(result[key]);

      // تبدیل اعداد فارسی در نام و نام خانوادگی به انگلیسی به صورت ویژه
      if (key === "FirstName" || key === "LastName") {
        result[key] = toEnglishDigits(result[key]);
      }
    } else if (typeof result[key] === "object" && result[key] !== null) {
      // بازگشتی برای آبجکت‌های تو در تو
      if (Array.isArray(result[key])) {
        // اگر آرایه باشد
        result[key] = result[key].map((item: any) =>
          typeof item === "object"
            ? convertObjectNumbersToEnglish(item)
            : typeof item === "string"
            ? toEnglishDigits(item)
            : item
        );
      } else {
        // اگر آبجکت باشد
        result[key] = convertObjectNumbersToEnglish(result[key]);
      }
    }
  }

  return result;
};

/**
 * سرویس مدیریت اشخاص - ایجاد، ویرایش و جستجو
 */
const PersonManagementService = {
  /**
   * ایجاد شخص جدید
   * @param personData داده‌های شخص جدید
   * @returns شناسه شخص ایجاد شده
   */
  createPerson: async (personData: CreatePersonDTO): Promise<number> => {
    try {
      const apiUrl = `${appConfig.mobileApi}Person/Add`;

      // تبدیل اعداد فارسی به انگلیسی قبل از ارسال به API
      const convertedPersonData = convertObjectNumbersToEnglish(personData);

      // اطمینان از تبدیل اعداد فارسی در نام و نام خانوادگی
      if (convertedPersonData.FirstName) {
        convertedPersonData.FirstName = toEnglishDigits(
          convertedPersonData.FirstName
        );
      }

      if (convertedPersonData.LastName) {
        convertedPersonData.LastName = toEnglishDigits(
          convertedPersonData.LastName
        );
      }

      console.log("ارسال درخواست ایجاد شخص:", convertedPersonData);

      const response = await axios.post<number>(apiUrl, convertedPersonData, {
        headers: {
          "Content-Type": "application/json",
          accept: "*/*",
        },
      });

      console.log("پاسخ ایجاد شخص:", response.data);

      return response.data;
    } catch (error) {
      console.error("خطا در ایجاد شخص جدید:", error);
      throw error;
    }
  },

  /**
   * دریافت شناسه گروه شخص با نام گروه
   * @param groupName نام گروه
   * @returns شناسه گروه
   */
  getPersonGroupIdByName: async (groupName: string): Promise<number | null> => {
    try {
      // تبدیل اعداد فارسی به انگلیسی در نام گروه
      const convertedGroupName = toEnglishDigits(groupName);

      const response = await axios.get(
        `${appConfig.mobileApi}PersonGroup/GetAllActive?page=1&pageSize=1000`
      );

      if (response.data && response.data.Items) {
        const group = response.data.Items.find(
          (g: any) => g.PersonGroupName === convertedGroupName
        );

        return group ? group.PersonGroupId : null;
      }

      return null;
    } catch (error) {
      console.error("خطا در دریافت شناسه گروه شخص:", error);
      return null;
    }
  },

  /**
   * دریافت لیست شناسه‌های گروه‌های شخص با نام‌های گروه
   * @param groupNames نام‌های گروه
   * @returns لیست شناسه‌های گروه
   */
  getPersonGroupIdsByNames: async (groupNames: string[]): Promise<number[]> => {
    try {
      // تبدیل اعداد فارسی به انگلیسی در آرایه نام‌های گروه
      const convertedGroupNames = groupNames.map((name) =>
        toEnglishDigits(name)
      );

      const response = await axios.get(
        `${appConfig.mobileApi}PersonGroup/GetAllActive?page=1&pageSize=1000`
      );

      if (response.data && response.data.Items) {
        const groupIds: number[] = [];

        for (const name of convertedGroupNames) {
          const group = response.data.Items.find(
            (g: any) => g.PersonGroupName === name
          );

          if (group) {
            groupIds.push(group.PersonGroupId);
          }
        }

        return groupIds;
      }

      return [];
    } catch (error) {
      console.error("خطا در دریافت شناسه‌های گروه‌های شخص:", error);
      return [];
    }
  },

  /**
   * دریافت شناسه شهر با نام شهر و نام استان
   * @param cityName نام شهر
   * @param provinceName نام استان
   * @returns شناسه شهر
   */
  getCityIdByName: async (
    cityName: string,
    provinceName: string
  ): Promise<number | null> => {
    try {
      // تبدیل اعداد فارسی به انگلیسی در نام شهر و استان
      const convertedCityName = toEnglishDigits(cityName);
      const convertedProvinceName = toEnglishDigits(provinceName);

      // ابتدا شناسه استان را دریافت می‌کنیم
      const response = await axios.get(
        `${appConfig.mobileApi}Province/GetAllActive?page=1&pageSize=100`
      );

      if (response.data && response.data.Items) {
        const province = response.data.Items.find(
          (p: any) => p.ProvinceName === convertedProvinceName
        );

        if (!province) {
          console.error(`استان با نام ${convertedProvinceName} یافت نشد`);
          return null;
        }

        // سپس شناسه شهر را با شناسه استان دریافت می‌کنیم
        const provinceId = province.ProvinceId;

        // لیست endpoint های احتمالی برای دریافت شهرها
        const possibleEndpoints = [
          "City/GetByProvinceId",
          "City/GetAllActiveByProvinceId",
          "City/GetAllByProvinceId",
          "City/GetCitiesByProvinceId",
        ];

        for (const endpoint of possibleEndpoints) {
          try {
            const cityResponse = await axios.get(
              `${appConfig.mobileApi}${endpoint}?provinceId=${provinceId}&page=1&pageSize=100`
            );

            if (cityResponse.data && cityResponse.data.Items) {
              const city = cityResponse.data.Items.find(
                (c: any) => c.CityName === convertedCityName
              );

              if (city) {
                return city.CityId;
              }
            }
          } catch (e) {
            // ادامه با endpoint بعدی
            console.log(`خطا در فراخوانی ${endpoint}: ${e}`);
          }
        }
      }

      console.error(
        `شهر با نام ${convertedCityName} در استان ${convertedProvinceName} یافت نشد`
      );
      return null;
    } catch (error) {
      console.error("خطا در دریافت شناسه شهر:", error);
      return null;
    }
  },
};

export default PersonManagementService;
