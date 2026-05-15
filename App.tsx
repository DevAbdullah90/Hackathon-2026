import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Dashboard from "./app/index";
import FloodMap from "./app/map";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Dashboard"
        screenOptions={{
          headerStyle: { backgroundColor: "#111827" },
          headerTintColor: "#ffffff",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      >
        <Stack.Screen name="Dashboard" component={Dashboard} options={{ title: "🌊 Flood Monitor", headerShown: false }} />
        <Stack.Screen name="Map" component={FloodMap} options={{ title: "Live Map", headerShown: false }} />
        {/* <Stack.Screen name="Reasoning" component={ReasoningCenter} options={{ title: "AI Reasoning" }} />
        <Stack.Screen name="Simulation" component={SimView} options={{ title: "Simulation" }} />
        <Stack.Screen name="Outcome" component={OutcomeScreen} options={{ title: "Outcome" }} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
