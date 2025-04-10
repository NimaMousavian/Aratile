import axios from "axios";
import appConfig from "../../../../config";

// تعریف مدل‌های داده
export interface Province {
  ProvinceId: number;
  ProvinceName: string;
  CityCount: number;
  Active: boolean;
  ActiveStr: string;
}

export interface City {
  CityId: number;
  CityName: string;
  ProvinceId: number;
  ProvinceName: string;
  Active: boolean;
  ActiveStr: string;
}

// پاسخ API برای لیست استان‌ها
export interface ProvincesResponse {
  Items: Province[];
  Page: number;
  PageSize: number;
  TotalCount: number;
  TotalPages: number;
}

// پاسخ API برای لیست شهرها
export interface CitiesResponse {
  Items: City[];
  Page: number;
  PageSize: number;
  TotalCount: number;
  TotalPages: number;
}

/**
 * سرویس مدیریت استان‌ها و شهرها
 */
const LocationService = {
  /**
   * دریافت لیست همه استان‌های فعال
   */
  getAllProvinces: async (): Promise<Province[]> => {
    try {
      const apiUrl = `${appConfig.mobileApi}Province/GetAllActive?page=1&pageSize=100`;

      const response = await axios.get<ProvincesResponse>(apiUrl);

      if (response.data && response.data.Items) {
        return response.data.Items;
      }
      return [];
    } catch (error) {
      console.error("خطا در دریافت لیست استان‌ها:", error);
      throw error;
    }
  },

  /**
   * دریافت نام‌های استان‌ها برای نمایش در SelectionBottomSheet
   */
  getProvinceNames: async (): Promise<string[]> => {
    try {
      const provinces = await LocationService.getAllProvinces();
      return provinces.map((province) => province.ProvinceName);
    } catch (error) {
      console.error("خطا در دریافت نام استان‌ها:", error);
      return [];
    }
  },

  /**
   * دریافت شهرهای یک استان خاص با شناسه استان
   * با تلاش مجدد روی endpoint های مختلف در صورت خطا
   */
  getCitiesByProvinceId: async (provinceId: number): Promise<City[]> => {
    try {
      // لیست endpoint های احتمالی برای دریافت شهرها
      const possibleEndpoints = [
        "City/GetByProvinceId",
        "City/GetAllActiveByProvinceId",
        "City/GetAllByProvinceId",
        "City/GetCitiesByProvinceId",
      ];

      let response = null;
      let error = null;

      // تلاش برای فراخوانی endpoint های مختلف تا پیدا کردن یکی که کار می‌کند
      for (const endpoint of possibleEndpoints) {
        try {
          const apiUrl = `${appConfig.mobileApi}${endpoint}?provinceId=${provinceId}&page=1&pageSize=100`;
          console.log(`تلاش برای فراخوانی ${apiUrl}`);
          response = await axios.get<CitiesResponse>(apiUrl);
          if (response.status === 200) {
            console.log(`${endpoint} با موفقیت فراخوانی شد`);
            break; // اگر موفق بود، حلقه را متوقف کن
          }
        } catch (e) {
          error = e;
          console.log(`خطا در فراخوانی ${endpoint}: ${e}`);
          // ادامه دادن به endpoint بعدی
        }
      }

      // اگر هیچ کدام از endpoint ها کار نکرد، خطای آخرین تلاش را پرتاب کن
      if (!response) {
        throw error;
      }

      if (response.data && response.data.Items) {
        return response.data.Items;
      }
      return [];
    } catch (error) {
      console.error(
        `خطا در دریافت شهرهای استان با شناسه ${provinceId}:`,
        error
      );
      throw error;
    }
  },

  /**
   * دریافت نام‌های شهرهای یک استان با نام استان
   * ابتدا استان با نام مشخص پیدا می‌شود، سپس شهرهای آن دریافت می‌شوند
   */
  getCityNamesByProvinceName: async (
    provinceName: string
  ): Promise<string[]> => {
    try {
      // ابتدا همه استان‌ها را دریافت می‌کنیم
      const provinces = await LocationService.getAllProvinces();

      // استان مورد نظر را پیدا می‌کنیم
      const province = provinces.find((p) => p.ProvinceName === provinceName);

      if (!province) {
        console.error(`استان با نام ${provinceName} یافت نشد`);
        return [];
      }

      try {
        // شهرهای استان را دریافت می‌کنیم
        const cities = await LocationService.getCitiesByProvinceId(
          province.ProvinceId
        );

        // نام شهرها را برمی‌گردانیم
        return cities.map((city) => city.CityName);
      } catch (error) {
        console.error(`خطا در دریافت شهرهای استان ${provinceName}:`, error);

        // برای سایر استان‌ها، یک لیست خالی برگردان
        return [];
      }
    } catch (error) {
      console.error(`خطا در دریافت نام شهرهای استان ${provinceName}:`, error);
      return [];
    }
  },

  /**
   * دریافت شناسه استان با نام استان
   */
  getProvinceIdByName: async (provinceName: string): Promise<number | null> => {
    try {
      const provinces = await LocationService.getAllProvinces();
      const province = provinces.find((p) => p.ProvinceName === provinceName);

      return province ? province.ProvinceId : null;
    } catch (error) {
      console.error(`خطا در دریافت شناسه استان ${provinceName}:`, error);
      return null;
    }
  },
};

export default LocationService;
