import { useState, useMemo, useCallback } from "react";
import {
  Title,
  Group,
  Text,
  Button,
  Select,
  Box,
  TextInput,
  Skeleton,
  Notification,
  Badge,
} from "@mantine/core";
import { IconDeviceFloppy, IconAlertCircle } from "@tabler/icons-react";
import { useList, useCustomMutation } from "@refinedev/core";
import { useHotelStore } from "../../contexts/hotelStore";
import type { Rate, DayPrice } from "../../models";
import { generateDateColumns, formatDate } from "../../utils";
import { format } from "date-fns";

const OCCUPANCY_FIELDS = ["sgl", "dbl", "tpl", "full"] as const;

export function RatesPage() {
  const activeHotelId = useHotelStore((s) => s.activeHotelId);
  const company = useHotelStore((s) => s.company);
  const isDistributor = company?.type === "distributor";

  const [selectedRateId, setSelectedRateId] = useState<string | null>(null);
  const [startDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [dirtyPrices, setDirtyPrices] = useState<
    Map<string, Partial<DayPrice>>
  >(new Map());
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const dateColumns = useMemo(
    () => generateDateColumns(startDate, 30),
    [startDate]
  );

  const { result: ratesResult, query: ratesQuery } = useList<Rate>({
    resource: "rates",
    pagination: { currentPage: 1, pageSize: 100 },
    queryOptions: { enabled: !!activeHotelId },
  });

  const ratesLoading = ratesQuery.isLoading;
  const rates = ratesResult.data ?? [];

  const { result: pricesResult, query: pricesQuery } = useList<DayPrice>({
    resource: "prices",
    meta: {
      rateId: selectedRateId ? Number(selectedRateId) : undefined,
      params: {
        start_date: dateColumns[0],
        end_date: dateColumns[dateColumns.length - 1],
      },
    },
    pagination: { currentPage: 1, pageSize: 500 },
    queryOptions: { enabled: !!activeHotelId && !!selectedRateId },
  });

  const pricesLoading = pricesQuery.isLoading;
  const prices = pricesResult.data ?? [];

  const { mutateAsync: customMutateAsync } = useCustomMutation();

  // Build price map: date -> DayPrice
  const priceMap = useMemo(() => {
    const map = new Map<string, DayPrice>();
    for (const p of prices) {
      map.set(p.date, p);
    }
    return map;
  }, [prices]);

  const getDisplayValue = useCallback(
    (date: string, field: string): string => {
      const dirty = dirtyPrices.get(date);
      if (dirty && field in dirty) {
        return String((dirty as Record<string, unknown>)[field] ?? "");
      }
      const price = priceMap.get(date);
      if (!price) return "";
      return String((price as unknown as Record<string, number>)[field] ?? "");
    },
    [dirtyPrices, priceMap]
  );

  const handleCellChange = useCallback(
    (date: string, field: string, value: string) => {
      setDirtyPrices((prev) => {
        const next = new Map(prev);
        const existing = next.get(date) ?? {};
        next.set(date, { ...existing, [field]: value === "" ? null : Number(value) });
        return next;
      });
      setSaveSuccess(false);
    },
    []
  );

  const handleSave = useCallback(async () => {
    if (dirtyPrices.size === 0 || !selectedRateId || !activeHotelId) return;

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    const payload = Array.from(dirtyPrices.entries()).map(([date, changes]) => {
      const existing = priceMap.get(date) ?? ({} as DayPrice);
      return { ...existing, date, ...changes };
    });

    try {
      await customMutateAsync({
        url: `https://api.effectivetours.com/v1/hotels/${activeHotelId}/rates/${selectedRateId}/prices`,
        method: "post",
        values: { prices: payload },
      });
      setDirtyPrices(new Map());
      setSaveSuccess(true);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to save prices.";
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  }, [dirtyPrices, selectedRateId, activeHotelId, priceMap, customMutateAsync]);

  // Build column headers based on company type
  const priceColumns = useMemo(() => {
    const cols: { field: string; label: string }[] = [];
    for (const occ of OCCUPANCY_FIELDS) {
      if (!isDistributor) {
        cols.push({ field: `${occ}_buy`, label: `${occ.toUpperCase()} Buy` });
      }
      cols.push({ field: `${occ}_sell`, label: `${occ.toUpperCase()} Sell` });
    }
    return cols;
  }, [isDistributor]);

  if (!activeHotelId) {
    return (
      <Text c="dimmed" ta="center" mt="xl">
        Please select a hotel to manage rates.
      </Text>
    );
  }

  return (
    <>
      <Group justify="space-between" mb="md">
        <Title order={2}>Rates & Inventory</Title>
        <Group>
          <Select
            placeholder="Select Rate Plan"
            value={selectedRateId}
            onChange={setSelectedRateId}
            data={rates.map((r: Rate) => ({
              value: r.id.toString(),
              label: r.name,
            }))}
            w={200}
            disabled={ratesLoading}
          />
          {dirtyPrices.size > 0 && (
            <Button
              leftSection={<IconDeviceFloppy size={16} />}
              onClick={handleSave}
              loading={saving}
            >
              Save Changes ({dirtyPrices.size})
            </Button>
          )}
        </Group>
      </Group>

      {saveError && (
        <Notification
          color="red"
          icon={<IconAlertCircle size={16} />}
          onClose={() => setSaveError(null)}
          mb="md"
        >
          {saveError}
        </Notification>
      )}

      {saveSuccess && (
        <Notification
          color="green"
          onClose={() => setSaveSuccess(false)}
          mb="md"
        >
          Prices saved successfully.
        </Notification>
      )}

      {!selectedRateId ? (
        <Text c="dimmed" ta="center" mt="xl">
          Select a rate plan to view and edit prices.
        </Text>
      ) : pricesLoading ? (
        <Skeleton height={400} />
      ) : (
        <Box
          style={{
            overflow: "auto",
            border: "1px solid var(--mantine-color-gray-3)",
            borderRadius: 8,
          }}
        >
          <table
            style={{
              borderCollapse: "collapse",
              minWidth: 120 + priceColumns.length * 100,
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
                  Date
                </th>
                {priceColumns.map((col) => (
                  <th
                    key={col.field}
                    style={{
                      position: "sticky",
                      top: 0,
                      zIndex: 2,
                      background: "var(--mantine-color-gray-1)",
                      minWidth: 100,
                      padding: "8px 4px",
                      borderBottom: "2px solid var(--mantine-color-gray-3)",
                      borderRight: "1px solid var(--mantine-color-gray-2)",
                      textAlign: "center",
                      fontSize: 12,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dateColumns.map((date, rowIdx) => {
                const isDirty = dirtyPrices.has(date);
                return (
                  <tr
                    key={date}
                    style={{
                      background: isDirty
                        ? "var(--mantine-color-yellow-0)"
                        : rowIdx % 2 === 0
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
                      }}
                    >
                      {formatDate(date)}
                      {isDirty && (
                        <Badge
                          size="xs"
                          color="yellow"
                          variant="filled"
                          ml={4}
                        >
                          edited
                        </Badge>
                      )}
                    </td>
                    {priceColumns.map((col) => (
                      <td
                        key={col.field}
                        style={{
                          borderRight: "1px solid var(--mantine-color-gray-2)",
                          borderBottom: "1px solid var(--mantine-color-gray-2)",
                          padding: 2,
                        }}
                      >
                        <TextInput
                          size="xs"
                          variant="unstyled"
                          value={getDisplayValue(date, col.field)}
                          onChange={(e) =>
                            handleCellChange(date, col.field, e.target.value)
                          }
                          styles={{
                            input: {
                              textAlign: "right",
                              padding: "4px 8px",
                              fontSize: 13,
                            },
                          }}
                          placeholder="—"
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Box>
      )}
    </>
  );
}
