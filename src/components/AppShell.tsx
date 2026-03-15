import { useState } from "react";
import {
  AppShell as MantineAppShell,
  Burger,
  Group,
  NavLink,
  Title,
  Text,
  ScrollArea,
} from "@mantine/core";
import {
  IconDashboard,
  IconCalendarEvent,
  IconCurrencyDollar,
  IconCloudUpload,
} from "@tabler/icons-react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { GlobalHotelSelector } from "./GlobalHotelSelector";

const NAV_ITEMS = [
  { label: "Dashboard", icon: IconDashboard, path: "/" },
  { label: "Reservations", icon: IconCalendarEvent, path: "/reservations" },
  { label: "Rates & Inventory", icon: IconCurrencyDollar, path: "/rates" },
  { label: "OTA Sync", icon: IconCloudUpload, path: "/ota-sync" },
];

export function AppShell() {
  const [opened, setOpened] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <MantineAppShell
      header={{ height: 60 }}
      navbar={{
        width: 250,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <MantineAppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={() => setOpened((o) => !o)}
              hiddenFrom="sm"
              size="sm"
            />
            <Title order={3} c="blue.7">
              EffectiveTours
            </Title>
          </Group>
          <Group>
            <Text size="sm" c="dimmed" visibleFrom="sm">
              Active Hotel:
            </Text>
            <GlobalHotelSelector />
          </Group>
        </Group>
      </MantineAppShell.Header>

      <MantineAppShell.Navbar p="xs">
        <MantineAppShell.Section grow component={ScrollArea}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              label={item.label}
              leftSection={<item.icon size={20} />}
              active={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                setOpened(false);
              }}
              variant="filled"
              mb={4}
            />
          ))}
        </MantineAppShell.Section>
      </MantineAppShell.Navbar>

      <MantineAppShell.Main>
        <Outlet />
      </MantineAppShell.Main>
    </MantineAppShell>
  );
}
