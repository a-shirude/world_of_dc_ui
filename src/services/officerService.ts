import api from "./api";
import { ApiResponse, Officer } from "../types";

export const officerService = {
  async getAllOfficers(searchQuery?: string): Promise<Officer[]> {
    const params = searchQuery
      ? new URLSearchParams({ search: searchQuery })
      : undefined;
    const url = params ? `/officer/list?${params.toString()}` : "/officer/list";
    const response = await api.get<ApiResponse<Officer[]>>(url);
    return response.data.data;
  },
};
