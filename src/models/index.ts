// ── Company ──────────────────────────────────────────────
export type BusinessModel = "b2b" | "b2c" | "mixed";
export type CompanyType = "direct" | "distributor";

export interface Company {
  id: number;
  name: string;
  type: CompanyType;
  business_model: BusinessModel;
}

// ── Hotel ────────────────────────────────────────────────
export interface Hotel {
  id: number;
  name: string;
  category: string;
  address: string;
  rate_type: string;
  is_active: boolean;
}

// ── Rate ─────────────────────────────────────────────────
export type OccupancyType = "sgl" | "dbl" | "tpl" | "full";

export interface ChannelMapping {
  channel_id: number;
  channel_name: string;
  mapped_rate_id: string;
}

export interface Rate {
  id: number;
  name: string;
  occupancy_types: OccupancyType[];
  channel_mappings: ChannelMapping[];
}

// ── Room ─────────────────────────────────────────────────
export interface OccupancyConfig {
  max_adults: number;
  max_children: number;
  max_occupancy: number;
}

export interface Room {
  id: number;
  room_number: string;
  room_type: string;
  physical_vs_virtual: "physical" | "virtual";
  occupancy_config: OccupancyConfig;
}

// ── DayPrice ─────────────────────────────────────────────
export interface DayPrice {
  date: string;
  sgl_buy: number;
  sgl_sell: number;
  dbl_buy: number;
  dbl_sell: number;
  tpl_buy: number;
  tpl_sell: number;
  full_buy: number;
  full_sell: number;
}

// ── Reservation ──────────────────────────────────────────
export type ReservationStatus =
  | "confirmed"
  | "checked_in"
  | "checked_out"
  | "cancelled"
  | "tentative";

export interface GuestDetails {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
}

export interface Reservation {
  id: number;
  guest_details: GuestDetails;
  start_date: string;
  end_date: string;
  room_id: number;
  status: ReservationStatus;
}
