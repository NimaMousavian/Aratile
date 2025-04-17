import axios from "axios";
import appConfig from "../../../../config";

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

export interface ProvincesResponse {
  Items: Province[];
  Page: number;
  PageSize: number;
  TotalCount: number;
  TotalPages: number;
}

export interface CitiesResponse {
  Items: City[];
  Page: number;
  PageSize: number;
  TotalCount: number;
  TotalPages: number;
}

const LocationService = {
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

  getProvinceNames: async (): Promise<string[]> => {
    try {
      const provinces = await LocationService.getAllProvinces();
      return provinces.map((province) => province.ProvinceName);
    } catch (error) {
      console.error("خطا در دریافت نام استان‌ها:", error);
      return [];
    }
  },
  getProvinceNameByID: async (Pid: number): Promise<string> => {
    try {
      const provinces = await LocationService.getAllProvinces();
      return (
        provinces.find((province) => province.ProvinceId === Pid)
          ?.ProvinceName || ""
      );
    } catch (error) {
      console.error("خطا در دریافت نام استان‌:", error);
      return "";
    }
  },

  getCitiesByProvinceId: async (provinceId: number): Promise<City[]> => {
    try {
      const possibleEndpoints = [
        "City/GetByProvinceId",
        "City/GetAllActiveByProvinceId",
        "City/GetAllByProvinceId",
        "City/GetCitiesByProvinceId",
      ];

      let response = null;
      let error = null;

      for (const endpoint of possibleEndpoints) {
        try {
          const apiUrl = `${appConfig.mobileApi}${endpoint}?provinceId=${provinceId}&page=1&pageSize=100`;
          console.log(`تلاش برای فراخوانی ${apiUrl}`);
          response = await axios.get<CitiesResponse>(apiUrl);
          if (response.status === 200) {
            console.log(`${endpoint} با موفقیت فراخوانی شد`);
            break;
          }
        } catch (e) {
          error = e;
          console.log(`خطا در فراخوانی ${endpoint}: ${e}`);
        }
      }

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

  getCityNamesByProvinceName: async (
    provinceName: string
  ): Promise<string[]> => {
    try {
      const provinces = await LocationService.getAllProvinces();

      const province = provinces.find((p) => p.ProvinceName === provinceName);

      if (!province) {
        console.error(`استان با نام ${provinceName} یافت نشد`);
        return [];
      }

      try {
        const cities = await LocationService.getCitiesByProvinceId(
          province.ProvinceId
        );

        return cities.map((city) => city.CityName);
      } catch (error) {
        console.error(`خطا در دریافت شهرهای استان ${provinceName}:`, error);

        return [];
      }
    } catch (error) {
      console.error(`خطا در دریافت نام شهرهای استان ${provinceName}:`, error);
      return [];
    }
  },

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
