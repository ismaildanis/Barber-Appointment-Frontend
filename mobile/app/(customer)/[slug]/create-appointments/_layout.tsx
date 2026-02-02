import { Stack } from "expo-router";

export default function AppointmentsStack() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="select-barber" options={{ presentation: "modal" }} />
      <Stack.Screen name="select-service" options={{ presentation: "modal" }} />
    </Stack>
  );
}
