import { create } from "zustand";
import type { Hotel, Company } from "../models";

interface HotelState {
  activeHotelId: number | null;
  hotels: Hotel[];
  company: Company | null;
  setActiveHotelId: (id: number) => void;
  setHotels: (hotels: Hotel[]) => void;
  setCompany: (company: Company) => void;
}

export const useHotelStore = create<HotelState>((set) => ({
  activeHotelId: null,
  hotels: [],
  company: null,
  setActiveHotelId: (id) => set({ activeHotelId: id }),
  setHotels: (hotels) => set({ hotels }),
  setCompany: (company) => set({ company }),
}));
