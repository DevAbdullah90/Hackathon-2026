import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import * as Location from "expo-location";

import Dashboard from "./app/index";
import MapScreen from "./app/map";
import ReasoningScreen from "./app/reasoning";
import SimulationScreen from "./app/simulation";
import OutcomeScreen from "./app/outcome";

export type RootStackParamList = {
    Dashboard: undefined;
    Map: undefined;
    Reasoning: undefined;
    Simulation: undefined;
    Outcome: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
    const [locationPermission, setLocationPermission] = useState<Location.PermissionStatus | null>(null);

    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            setLocationPermission(status);
        })();
    }, []);

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
                <Stack.Screen
                    name="Dashboard"
                    component={Dashboard}
                    options={{ title: "🌊 CIRO", headerShown: false }}
                />
                <Stack.Screen
                    name="Map"
                    component={MapScreen}
                    options={{ title: "Live Map", headerShown: false }}
                />
                <Stack.Screen
                    name="Reasoning"
                    component={ReasoningScreen}
                    options={{ title: "🤖 AI Reasoning", headerShown: false }}
                />
                <Stack.Screen
                    name="Simulation"
                    component={SimulationScreen}
                    options={{ title: "⚡ Simulation", headerShown: false }}
                />
                <Stack.Screen
                    name="Outcome"
                    component={OutcomeScreen}
                    options={{ title: "📊 Outcome", headerShown: false }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}