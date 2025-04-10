import axios from "axios";
import appConfig from "../../../../../config";

// Interface for PersonGroup based on API response
interface PersonGroup {
  PersonGroupId: number;
  PersonGroupName: string;
  PersonCount: number;
  Active: boolean;
  ActiveStr: string;
}

// API response interface for PersonGroups
interface PersonGroupResponse {
  Items: PersonGroup[];
  Page: number;
  PageSize: number;
  TotalCount: number;
  TotalPages: number;
}

const PersonGroupService = {
  async getAllActive(): Promise<PersonGroup[]> {
    try {
      const response = await axios.get<PersonGroupResponse>(
        `${appConfig.mobileApi}PersonGroup/GetAllActive?page=1&pageSize=1000`
      );
      return response.data.Items;
    } catch (error) {
      console.error("Error fetching person groups:", error);
      return [];
    }
  },

  async getPersonGroupNames(): Promise<string[]> {
    try {
      const personGroups = await this.getAllActive();
      return personGroups.map(group => group.PersonGroupName);
    } catch (error) {
      console.error("Error getting person group names:", error);
      return [];
    }
  }
};

export default PersonGroupService;