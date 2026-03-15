import type { DataProvider } from "@refinedev/core";
import axiosInstance from "./axiosInstance";
import { useHotelStore } from "../contexts/hotelStore";

/**
 * Custom Refine Data Provider that dynamically injects the activeHotelId
 * into hotel-scoped API endpoints.
 *
 * Resource naming convention:
 *   - "hotels"         → /hotels
 *   - "rooms"          → /hotels/{hotelId}/rooms
 *   - "reservations"   → /hotels/{hotelId}/reservations
 *   - "rates"          → /hotels/{hotelId}/rates
 *   - "prices"         → /hotels/{hotelId}/rates/{rateId}/prices  (pass rateId via meta)
 */

const HOTEL_SCOPED_RESOURCES = [
  "rooms",
  "reservations",
  "rates",
  "prices",
];

function buildUrl(resource: string, meta?: Record<string, unknown>): string {
  const hotelId = useHotelStore.getState().activeHotelId;

  if (HOTEL_SCOPED_RESOURCES.includes(resource)) {
    if (!hotelId) {
      throw new Error(`No active hotel selected for resource "${resource}".`);
    }
    if (resource === "prices") {
      const rateId = meta?.rateId;
      if (!rateId) throw new Error("rateId is required in meta for prices.");
      return `/hotels/${hotelId}/rates/${rateId}/prices`;
    }
    return `/hotels/${hotelId}/${resource}`;
  }

  return `/${resource}`;
}

export const dataProvider: DataProvider = {
  getList: async ({ resource, pagination, sorters, filters, meta }) => {
    const url = buildUrl(resource, meta as Record<string, unknown>);
    const params: Record<string, unknown> = {};

    if (pagination) {
      const { currentPage = 1, pageSize = 10 } = pagination;
      params.page = currentPage;
      params.page_size = pageSize;
    }

    if (sorters && sorters.length > 0) {
      params.sort_by = sorters[0].field;
      params.sort_order = sorters[0].order;
    }

    if (filters && filters.length > 0) {
      for (const filter of filters) {
        if ("field" in filter) {
          params[filter.field] = filter.value;
        }
      }
    }

    // Pass any extra meta params (e.g., start_date, end_date)
    if (meta?.params) {
      Object.assign(params, meta.params);
    }

    const { data } = await axiosInstance.get(url, { params });

    return {
      data: Array.isArray(data) ? data : data.data ?? data.results ?? [],
      total: data.total ?? data.count ?? (Array.isArray(data) ? data.length : 0),
    };
  },

  getOne: async ({ resource, id, meta }) => {
    const url = buildUrl(resource, meta as Record<string, unknown>);
    const { data } = await axiosInstance.get(`${url}/${id}`);
    return { data };
  },

  create: async ({ resource, variables, meta }) => {
    const url = buildUrl(resource, meta as Record<string, unknown>);
    const { data } = await axiosInstance.post(url, variables);
    return { data };
  },

  update: async ({ resource, id, variables, meta }) => {
    const url = buildUrl(resource, meta as Record<string, unknown>);
    const { data } = await axiosInstance.put(`${url}/${id}`, variables);
    return { data };
  },

  deleteOne: async ({ resource, id, meta }) => {
    const url = buildUrl(resource, meta as Record<string, unknown>);
    const { data } = await axiosInstance.delete(`${url}/${id}`);
    return { data };
  },

  getApiUrl: () => "https://api.effectivetours.com/v1",

  custom: async ({ url, method = "get", payload, query, headers }) => {
    let response;
    const config = {
      headers: headers as Record<string, string>,
      params: query,
    };

    if (method === "get") {
      response = await axiosInstance.get(url, config);
    } else if (method === "post") {
      response = await axiosInstance.post(url, payload, config);
    } else if (method === "put") {
      response = await axiosInstance.put(url, payload, config);
    } else if (method === "delete") {
      response = await axiosInstance.delete(url, config);
    } else {
      response = await axiosInstance({ method, url, data: payload, ...config });
    }

    return { data: response.data };
  },
};
