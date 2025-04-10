import axios from "axios";
import appConfig from "../../../../../config";
import { toPersianDigits, toEnglishDigits, NumberConverterInput } from "../../../../utils/numberConversions";



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


const convertObjectNumbersToEnglish = <T extends Record<string, any>>(obj: T): T => {
  const result = { ...obj };

  for (const key in result) {
    if (typeof result[key] === 'string') {
      result[key] = toEnglishDigits(result[key]);

      if (key === 'FirstName' || key === 'LastName') {
        result[key] = toEnglishDigits(result[key]);
      }
    } else if (typeof result[key] === 'object' && result[key] !== null) {
      if (Array.isArray(result[key])) {
        result[key] = result[key].map((item: any) =>
          typeof item === 'object' ? convertObjectNumbersToEnglish(item) :
            typeof item === 'string' ? toEnglishDigits(item) : item
        );
      } else {
        result[key] = convertObjectNumbersToEnglish(result[key]);
      }
    }
  }

  return result;
};


const PersonManagementService = {
 

  createPerson: async (personData: CreatePersonDTO): Promise<number> => {
    try {
      const apiUrl = `${appConfig.mobileApi}Person/Add`;

      const convertedPersonData = convertObjectNumbersToEnglish(personData);

      if (convertedPersonData.FirstName) {
        convertedPersonData.FirstName = toEnglishDigits(convertedPersonData.FirstName);
      }

      if (convertedPersonData.LastName) {
        convertedPersonData.LastName = toEnglishDigits(convertedPersonData.LastName);
      }

      console.log("ارسال درخواست ایجاد شخص:", convertedPersonData);

      const response = await axios.post<number>(apiUrl, convertedPersonData, {
        headers: {
          'Content-Type': 'application/json',
          'accept': '*/*'
        }
      });

      console.log("پاسخ ایجاد شخص:", response.data);

      return response.data;
    } catch (error) {
      console.error("خطا در ایجاد شخص جدید:", error);
      throw error;
    }
  },

 
  getPersonGroupIdByName: async (groupName: string): Promise<number | null> => {
    try {
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


  getPersonGroupIdsByNames: async (groupNames: string[]): Promise<number[]> => {
    try {
      const convertedGroupNames = groupNames.map(name => toEnglishDigits(name));

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


  getCityIdByName: async (cityName: string, provinceName: string): Promise<number | null> => {
    try {
      const convertedCityName = toEnglishDigits(cityName);
      const convertedProvinceName = toEnglishDigits(provinceName);

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

        const provinceId = province.ProvinceId;

        const possibleEndpoints = [
          "City/GetByProvinceId",
          "City/GetAllActiveByProvinceId",
          "City/GetAllByProvinceId",
          "City/GetCitiesByProvinceId"
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
            console.log(`خطا در فراخوانی ${endpoint}: ${e}`);
          }
        }
      }

      console.error(`شهر با نام ${convertedCityName} در استان ${convertedProvinceName} یافت نشد`);
      return null;
    } catch (error) {
      console.error("خطا در دریافت شناسه شهر:", error);
      return null;
    }
  }
};

export default PersonManagementService;