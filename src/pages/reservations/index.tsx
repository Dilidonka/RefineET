import { useState, useMemo, useCallback } from "react";
import {
  Title,
  Group,
  Text,
  ActionIcon,
  Tooltip,
  Box,
  Badge,
  Skeleton,
  Modal,
  Stack,
  SegmentedControl,
} from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useList, useUpdate } from "@refinedev/core";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useHotelStore } from "../../contexts/hotelStore";
import type { Room, Reservation } from "../../models";
import { generateDateColumns, formatDate, getNights } from "../../utils";
import { format, addDays, subDays } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
  confirmed: "blue",
  checked_in: "green",
  checked_out: "gray",
  cancelled: "red",
  tentative: "yellow",
};

const DAYS_VISIBLE = 14;

export function ReservationsPage() {
  const activeHotelId = useHotelStore((s) => s.activeHotelId);
  const [startDate, setStartDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [viewMode, setViewMode] = useState<string>("comfortable");
  const [activeReservation, setActiveReservation] =
    useState<Reservation | null>(null);
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);

  const dateColumns = useMemo(
    () => generateDateColumns(startDate, DAYS_VISIBLE),
    [startDate]
  );

  const { result: roomsResult, query: roomsQuery } = useList<Room>({
    resource: "rooms",
    pagination: { currentPage: 1, pageSize: 200 },
    queryOptions: { enabled: !!activeHotelId },
  });

  const { result: reservationsResult, query: reservationsQuery } =
    useList<Reservation>({
      resource: "reservations",
      pagination: { currentPage: 1, pageSize: 500 },
      meta: { params: { start_date: dateColumns[0], end_date: dateColumns[dateColumns.length - 1] } },
      queryOptions: { enabled: !!activeHotelId },
    });

  const { mutate: updateReservation } = useUpdate();

  const rooms = roomsResult.data ?? [];
  const reservations = reservationsResult.data ?? [];
  const isLoading = roomsQuery.isLoading || reservationsQuery.isLoading;

  const cellHeight = viewMode === "comfortable" ? 48 : 32;
  const cellWidth = 90;

  // Build a map: roomId -> date -> reservation
  const reservationMap = useMemo(() => {
    const map = new Map<string, Reservation>();
    for (const res of reservations) {
      const nights = getNights(res.start_date, res.end_date);
      const dates = generateDateColumns(res.start_date, Math.max(nights, 1));
      for (const d of dates) {
        map.set(`${res.room_id}-${d}`, res);
      }
    }
    return map;
  }, [reservations]);

  const handlePrev = () =>
    setStartDate(format(subDays(new Date(startDate), 7), "yyyy-MM-dd"));
  const handleNext = () =>
    setStartDate(format(addDays(new Date(startDate), 7), "yyyy-MM-dd"));

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const res = reservations.find((r: Reservation) => r.id === Number(event.active.id));
      setActiveReservation(res ?? null);
    },
    [reservations]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveReservation(null);
      const { active, over } = event;
      if (!over) return;

      const reservationId = Number(active.id);
      const [newRoomId, newDate] = (over.id as string).split("__");

      const reservation = reservations.find((r: Reservation) => r.id === reservationId);
      if (!reservation) return;

      const nights = getNights(reservation.start_date, reservation.end_date);
      const newEndDate = format(
        addDays(new Date(newDate), nights),
        "yyyy-MM-dd"
      );

      updateReservation({
        resource: "reservations",
        id: reservationId,
        values: {
          room_id: Number(newRoomId),
          start_date: newDate,
          end_date: newEndDate,
        },
      });
    },
    [reservations, updateReservation]
  );

  if (!activeHotelId) {
    return (
      <Text c="dimmed" ta="center" mt="xl">
        Please select a hotel to view reservations.
      </Text>
    );
  }

  return (
    <>
      <Group justify="space-between" mb="md">
        <Title order={2}>Tape Chart</Title>
        <Group>
          <SegmentedControl
            value={viewMode}
            onChange={setViewMode}
            data={[
              { label: "Comfortable", value: "comfortable" },
              { label: "Compact", value: "compact" },
            ]}
            size="xs"
          />
          <Tooltip label="Previous week">
            <ActionIcon variant="light" onClick={handlePrev}>
              <IconChevronLeft size={18} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Next week">
            <ActionIcon variant="light" onClick={handleNext}>
              <IconChevronRight size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      {isLoading ? (
        <Skeleton height={400} />
      ) : (
        <DndContext
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <Box
            style={{
              overflow: "auto",
              border: "1px solid var(--mantine-color-gray-3)",
              borderRadius: 8,
              position: "relative",
            }}
          >
            <table
              style={{
                borderCollapse: "collapse",
                minWidth: cellWidth * (dateColumns.length + 1),
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      position: "sticky",
                      left: 0,
                      top: 0,
                      zIndex: 3,
                      background: "var(--mantine-color-gray-1)",
                      minWidth: 120,
                      padding: "8px 12px",
                      borderBottom: "2px solid var(--mantine-color-gray-3)",
                      borderRight: "2px solid var(--mantine-color-gray-3)",
                    }}
                  >
                    Room
                  </th>
                  {dateColumns.map((d) => (
                    <th
                      key={d}
                      style={{
                        position: "sticky",
                        top: 0,
                        zIndex: 2,
                        background: "var(--mantine-color-gray-1)",
                        minWidth: cellWidth,
                        padding: "8px 4px",
                        borderBottom: "2px solid var(--mantine-color-gray-3)",
                        borderRight: "1px solid var(--mantine-color-gray-2)",
                        textAlign: "center",
                        fontSize: 12,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatDate(d)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rooms.map((room: Room, rowIdx: number) => (
                  <tr
                    key={room.id}
                    style={{
                      background:
                        rowIdx % 2 === 0
                          ? "white"
                          : "var(--mantine-color-gray-0)",
                    }}
                  >
                    <td
                      style={{
                        position: "sticky",
                        left: 0,
                        zIndex: 1,
                        background: "inherit",
                        padding: "4px 12px",
                        borderRight: "2px solid var(--mantine-color-gray-3)",
                        borderBottom: "1px solid var(--mantine-color-gray-2)",
                        fontWeight: 600,
                        fontSize: 13,
                        height: cellHeight,
                      }}
                    >
                      {room.room_number}
                      <Text size="xs" c="dimmed">
                        {room.room_type}
                      </Text>
                    </td>
                    {dateColumns.map((date) => {
                      const key = `${room.id}-${date}`;
                      const res = reservationMap.get(key);
                      const isStart = res?.start_date === date;
                      const droppableId = `${room.id}__${date}`;

                      return (
                        <td
                          key={date}
                          data-droppable-id={droppableId}
                          style={{
                            borderRight:
                              "1px solid var(--mantine-color-gray-2)",
                            borderBottom:
                              "1px solid var(--mantine-color-gray-2)",
                            height: cellHeight,
                            padding: 0,
                            position: "relative",
                            cursor: res ? "pointer" : "cell",
                          }}
                          onClick={() => {
                            if (res) setSelectedReservation(res);
                          }}
                        >
                          {res && isStart && (
                            <Box
                              draggable
                              data-draggable-id={res.id.toString()}
                              style={{
                                position: "absolute",
                                top: 2,
                                left: 2,
                                height: cellHeight - 4,
                                width:
                                  getNights(res.start_date, res.end_date) *
                                    cellWidth -
                                  4,
                                zIndex: 1,
                                borderRadius: 4,
                                overflow: "hidden",
                              }}
                            >
                              <Badge
                                color={STATUS_COLORS[res.status] ?? "gray"}
                                variant="filled"
                                size={viewMode === "compact" ? "xs" : "sm"}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "flex-start",
                                  paddingLeft: 8,
                                  borderRadius: 4,
                                  cursor: "grab",
                                }}
                              >
                                {res.guest_details.last_name} (
                                {getNights(res.start_date, res.end_date)}n)
                              </Badge>
                            </Box>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>

          <DragOverlay>
            {activeReservation && (
              <Badge
                color={STATUS_COLORS[activeReservation.status] ?? "gray"}
                variant="filled"
                size="lg"
                style={{
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  cursor: "grabbing",
                }}
              >
                {activeReservation.guest_details.last_name}
              </Badge>
            )}
          </DragOverlay>
        </DndContext>
      )}

      {/* Color legend */}
      <Group mt="md" gap="md">
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <Group key={status} gap={4}>
            <Box
              style={{
                width: 12,
                height: 12,
                borderRadius: 2,
                background: `var(--mantine-color-${color}-6)`,
              }}
            />
            <Text size="xs" tt="capitalize">
              {status.replace("_", " ")}
            </Text>
          </Group>
        ))}
      </Group>

      {/* Reservation detail modal */}
      <Modal
        opened={!!selectedReservation}
        onClose={() => setSelectedReservation(null)}
        title="Reservation Details"
        size="md"
      >
        {selectedReservation && (
          <Stack gap="sm">
            <Group justify="space-between">
              <Text fw={600}>Guest</Text>
              <Text>
                {selectedReservation.guest_details.first_name}{" "}
                {selectedReservation.guest_details.last_name}
              </Text>
            </Group>
            <Group justify="space-between">
              <Text fw={600}>Email</Text>
              <Text>{selectedReservation.guest_details.email ?? "N/A"}</Text>
            </Group>
            <Group justify="space-between">
              <Text fw={600}>Check-in</Text>
              <Text>{formatDate(selectedReservation.start_date, "PPP")}</Text>
            </Group>
            <Group justify="space-between">
              <Text fw={600}>Check-out</Text>
              <Text>{formatDate(selectedReservation.end_date, "PPP")}</Text>
            </Group>
            <Group justify="space-between">
              <Text fw={600}>Status</Text>
              <Badge color={STATUS_COLORS[selectedReservation.status] ?? "gray"}>
                {selectedReservation.status.replace("_", " ")}
              </Badge>
            </Group>
            <Group justify="space-between">
              <Text fw={600}>Nights</Text>
              <Text>
                {getNights(
                  selectedReservation.start_date,
                  selectedReservation.end_date
                )}
              </Text>
            </Group>
          </Stack>
        )}
      </Modal>
    </>
  );
}
