import axios from "axios";
import appConfig from "../../../../config";

export interface Person {
  PersonId: number;
  FirstName: string;
  LastName: string;
  FullName: string;
  Gender: boolean | null;
  GenderStr: string;
  Phone1: string | null;
  Phone2: string | null;
  Phone3: string | null;
  Mobile: string;
  IntroducingCode: string;
  IntroducerPersonId: number | null;
  IntroducerPersonFullName: string;
  CityId: number | null;
  CityName: string;
  ProvinceId: number;
  ProvinceName: string | null;
  Address: string | null;
  PersonGroupsStr: string;
  PersonPersonasStr: string;
  IsIndividual: boolean | null;
  IsIndividualStr: string;
  ApplicationUserName: string;
  ShamsiInsertDate: string;
}

interface SearchResponse {
  Items: Person[];
  Page: number;
  PageSize: number;
  TotalCount: number;
  TotalPages: number;
}

class PersonService {
  static async searchPersonByMobileOrFullName(
    query: string = "",
    page: number = 1,
    pageSize: number = 100
  ): Promise<SearchResponse> {
    try {
      const response = await axios.get<SearchResponse>(
        `${
          appConfig.mobileApi
        }Person/SearchPersonByMobileOrFullName?page=${page}&pageSize=${pageSize}${
          query ? `&query=${encodeURIComponent(query)}` : ""
        }`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getPersonById(personId: number): Promise<Person> {
    try {
      const response = await axios.get<Person>(
        `${appConfig.mobileApi}Person/GetPersonById/${personId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async createPerson(personData: Partial<Person>): Promise<number> {
    try {
      const response = await axios.post<number>(
        `${appConfig.mobileApi}Person/CreatePerson`,
        personData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async updatePerson(
    personId: number,
    personData: Partial<Person>
  ): Promise<boolean> {
    try {
      const response = await axios.put<boolean>(
        `${appConfig.mobileApi}Person/UpdatePerson/${personId}`,
        personData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default PersonService;
