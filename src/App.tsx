import { Refine, Authenticated } from "@refinedev/core";
import routerProvider, {
  NavigateToResource,
  CatchAllNavigate,
} from "@refinedev/react-router";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MantineProvider, createTheme } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import { dataProvider } from "./api/dataProvider";
import { authProvider } from "./api/authProvider";
import { AppShell } from "./components/AppShell";
import { DashboardPage } from "./pages/dashboard";
import { ReservationsPage } from "./pages/reservations";
import { RatesPage } from "./pages/rates";
import { OtaSyncPage } from "./pages/ota-sync";
import { LoginPage } from "./pages/login";

const theme = createTheme({
  primaryColor: "blue",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  defaultRadius: "md",
});

function App() {
  return (
    <BrowserRouter>
      <MantineProvider theme={theme}>
        <Notifications position="top-right" />
        <Refine
          dataProvider={dataProvider}
          authProvider={authProvider}
          routerProvider={routerProvider}
          resources={[
            {
              name: "dashboard",
              list: "/",
              meta: { label: "Dashboard" },
            },
            {
              name: "reservations",
              list: "/reservations",
              meta: { label: "Reservations" },
            },
            {
              name: "rates",
              list: "/rates",
              meta: { label: "Rates & Inventory" },
            },
            {
              name: "ota-sync",
              list: "/ota-sync",
              meta: { label: "OTA Sync" },
            },
          ]}
          options={{
            syncWithLocation: true,
            disableTelemetry: true,
          }}
        >
          <Routes>
            <Route
              element={
                <Authenticated
                  key="auth"
                  fallback={<CatchAllNavigate to="/login" />}
                >
                  <AppShell />
                </Authenticated>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="/reservations" element={<ReservationsPage />} />
              <Route path="/rates" element={<RatesPage />} />
              <Route path="/ota-sync" element={<OtaSyncPage />} />
            </Route>
            <Route
              path="/login"
              element={
                <Authenticated
                  key="auth-login"
                  fallback={<LoginPage />}
                >
                  <NavigateToResource resource="dashboard" />
                </Authenticated>
              }
            />
            <Route path="*" element={<NavigateToResource resource="dashboard" />} />
          </Routes>
        </Refine>
      </MantineProvider>
    </BrowserRouter>
  );
}

export default App;
