import { useState } from "react";
import {
  Card,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Center,
  Stack,
  Text,
} from "@mantine/core";
import { useLogin } from "@refinedev/core";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { mutate: login, isPending } = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <Center h="100vh" bg="gray.1">
      <Card shadow="md" padding="xl" radius="md" w={400} withBorder>
        <Title order={2} ta="center" mb="sm" c="blue.7">
          EffectiveTours
        </Title>
        <Text size="sm" c="dimmed" ta="center" mb="lg">
          Hotel Management Dashboard
        </Text>
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <TextInput
              label="Email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <PasswordInput
              label="Password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" loading={isPending} fullWidth>
              Sign In
            </Button>
          </Stack>
        </form>
      </Card>
    </Center>
  );
}
