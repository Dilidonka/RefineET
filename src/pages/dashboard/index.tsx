import { Title, SimpleGrid, Card, Text, Skeleton } from "@mantine/core";
import { useList } from "@refinedev/core";
import { useHotelStore } from "../../contexts/hotelStore";
import type { Room, Reservation } from "../../models";

export function DashboardPage() {
  const activeHotelId = useHotelStore((s) => s.activeHotelId);

  const { result: roomsResult, query: roomsQuery } = useList<Room>({
    resource: "rooms",
    pagination: { currentPage: 1, pageSize: 200 },
    queryOptions: { enabled: !!activeHotelId },
  });

  const { result: reservationsResult, query: reservationsQuery } =
    useList<Reservation>({
      resource: "reservations",
      pagination: { currentPage: 1, pageSize: 200 },
      queryOptions: { enabled: !!activeHotelId },
    });

  const rooms = roomsResult.data ?? [];
  const reservations = reservationsResult.data ?? [];
  const isLoading = roomsQuery.isLoading || reservationsQuery.isLoading;

  const checkedIn = reservations.filter(
    (r: Reservation) => r.status === "checked_in"
  ).length;
  const confirmed = reservations.filter(
    (r: Reservation) => r.status === "confirmed"
  ).length;
  const occupancyRate =
    rooms.length > 0
      ? Math.round((checkedIn / rooms.length) * 100)
      : 0;

  if (!activeHotelId) {
    return (
      <Text c="dimmed" ta="center" mt="xl">
        Please select a hotel to view the dashboard.
      </Text>
    );
  }

  const stats = [
    { label: "Total Rooms", value: rooms.length },
    { label: "Checked In", value: checkedIn },
    { label: "Confirmed", value: confirmed },
    { label: "Occupancy Rate", value: `${occupancyRate}%` },
  ];

  return (
    <>
      <Title order={2} mb="lg">
        Dashboard
      </Title>
      <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} spacing="lg">
        {stats.map((stat) => (
          <Card key={stat.label} shadow="sm" padding="lg" radius="md" withBorder>
            <Text size="sm" c="dimmed" tt="uppercase" fw={600}>
              {stat.label}
            </Text>
            {isLoading ? (
              <Skeleton height={36} mt="sm" />
            ) : (
              <Text size="xl" fw={700} mt="sm">
                {stat.value}
              </Text>
            )}
          </Card>
        ))}
      </SimpleGrid>
    </>
  );
}
