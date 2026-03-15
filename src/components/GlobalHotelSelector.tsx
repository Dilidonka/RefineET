import { Select, Loader } from "@mantine/core";
import { useList } from "@refinedev/core";
import { useHotelStore } from "../contexts/hotelStore";
import type { Hotel } from "../models";
import { useEffect } from "react";

export function GlobalHotelSelector() {
  const { activeHotelId, setActiveHotelId, setHotels } = useHotelStore();

  const { result, query } = useList<Hotel>({
    resource: "hotels",
    pagination: { currentPage: 1, pageSize: 100 },
  });

  const isLoading = query.isLoading;
  const hotels = result.data ?? [];

  useEffect(() => {
    if (hotels.length > 0) {
      setHotels(hotels);
      if (!activeHotelId) {
        setActiveHotelId(hotels[0].id);
      }
    }
  }, [hotels, activeHotelId, setActiveHotelId, setHotels]);

  if (isLoading) return <Loader size="sm" />;

  return (
    <Select
      placeholder="Select Hotel"
      value={activeHotelId?.toString() ?? null}
      onChange={(val) => val && setActiveHotelId(Number(val))}
      data={hotels.map((h: Hotel) => ({
        value: h.id.toString(),
        label: h.name,
      }))}
      searchable
      w={250}
      styles={{
        input: { fontWeight: 600 },
      }}
    />
  );
}
