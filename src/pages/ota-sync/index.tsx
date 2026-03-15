import { useState } from "react";
import {
  Title,
  Card,
  TextInput,
  Select,
  Button,
  Stack,
  Text,
  Notification,
  Alert,
} from "@mantine/core";
import {
  IconCloudUpload,
  IconCheck,
  IconAlertCircle,
} from "@tabler/icons-react";
import { useCustomMutation, useList } from "@refinedev/core";
import { useHotelStore } from "../../contexts/hotelStore";
import type { Rate } from "../../models";
import { format } from "date-fns";

interface OtaError {
  field?: string;
  message: string;
}

export function OtaSyncPage() {
  const activeHotelId = useHotelStore((s) => s.activeHotelId);
  const [startDate, setStartDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState("");
  const [channelId, setChannelId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<OtaError[]>([]);

  const { result: ratesResult } = useList<Rate>({
    resource: "rates",
    pagination: { currentPage: 1, pageSize: 100 },
    queryOptions: { enabled: !!activeHotelId },
  });

  // Gather unique channels from rate mappings
  const channels = (ratesResult.data ?? [])
    .flatMap((r: Rate) => r.channel_mappings ?? [])
    .filter(
      (c: { channel_id: number; channel_name: string }, i: number, arr: { channel_id: number; channel_name: string }[]) => arr.findIndex((x) => x.channel_id === c.channel_id) === i
    );

  const { mutateAsync: customMutateAsync } = useCustomMutation();

  const handleSync = async () => {
    if (!activeHotelId || !channelId || !startDate || !endDate) return;

    setSyncing(true);
    setSuccess(false);
    setErrors([]);

    try {
      await customMutateAsync({
        url: `https://api.effectivetours.com/v1/hotels/${activeHotelId}/ota-update`,
        method: "post",
        values: {
          start_date: startDate,
          end_date: endDate,
          channel_id: Number(channelId),
        },
      });
      setSuccess(true);
    } catch (err: unknown) {
      const error = err as { response?: { status?: number; data?: { errors?: OtaError[]; message?: string } } };
      if (error.response?.status === 422 && error.response.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors([
          {
            message:
              error.response?.data?.message ??
              "An unexpected error occurred during sync.",
          },
        ]);
      }
    } finally {
      setSyncing(false);
    }
  };

  if (!activeHotelId) {
    return (
      <Text c="dimmed" ta="center" mt="xl">
        Please select a hotel to sync OTA channels.
      </Text>
    );
  }

  return (
    <>
      <Title order={2} mb="lg">
        OTA Channel Sync
      </Title>

      <Card shadow="sm" padding="lg" radius="md" withBorder maw={500}>
        <Stack gap="md">
          <Select
            label="Channel"
            placeholder="Select OTA channel"
            value={channelId}
            onChange={setChannelId}
            data={channels.map((c) => ({
              value: c.channel_id.toString(),
              label: c.channel_name,
            }))}
            required
            error={errors.find((e) => e.field === "channel_id")?.message}
          />

          <TextInput
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            error={errors.find((e) => e.field === "start_date")?.message}
          />

          <TextInput
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            error={errors.find((e) => e.field === "end_date")?.message}
          />

          <Button
            leftSection={<IconCloudUpload size={16} />}
            onClick={handleSync}
            loading={syncing}
            disabled={!channelId || !startDate || !endDate}
            fullWidth
          >
            Sync to Channel
          </Button>
        </Stack>
      </Card>

      {success && (
        <Notification
          color="green"
          icon={<IconCheck size={16} />}
          mt="md"
          onClose={() => setSuccess(false)}
        >
          OTA sync completed successfully.
        </Notification>
      )}

      {errors.length > 0 && !errors.some((e) => e.field) && (
        <Alert
          color="red"
          icon={<IconAlertCircle size={16} />}
          mt="md"
          title="Sync Error"
        >
          {errors.map((e, i) => (
            <Text key={i} size="sm">
              {e.message}
            </Text>
          ))}
        </Alert>
      )}
    </>
  );
}
