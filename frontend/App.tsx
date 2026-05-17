import React, { useEffect, useState, useCallback } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import * as Location from "expo-location";
import * as SplashScreen from "expo-splash-screen";
import { 
  useFonts, 
  Inter_400Regular, 
  Inter_700Bold, 
  Inter_900Black 
} from "@expo-google-fonts/inter";
import { JetBrainsMono_400Regular } from "@expo-google-fonts/jetbrains-mono";

import WelcomeScreen from "./app/welcome";
import Dashboard from "./app/index";
import FloodMap from "./app/map";
import ReasoningCenter from "./app/reasoning";
import SimView from "./app/simulation";
import OutcomeScreen from "./app/outcome";
import { THEME } from "./lib/theme";

SplashScreen.preventAutoHideAsync();

export type RootStackParamList = {
    Welcome: undefined;
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

    const [fontsLoaded] = useFonts({
        Inter_400Regular,
        Inter_700Bold,
        Inter_900Black,
        JetBrainsMono_400Regular,
    });

    const onLayoutRootView = useCallback(async () => {
        if (fontsLoaded) {
            await SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return null;
    }

    return (
        <NavigationContainer onReady={onLayoutRootView}>
            <Stack.Navigator
                initialRouteName="Welcome"
                screenOptions={{
                    headerStyle: { backgroundColor: THEME.colors.background },
                    headerTintColor: THEME.colors.text.primary,
                    headerTitleStyle: { fontFamily: THEME.fonts.subheading },
                    headerShown: false,
                }}
            >
                <Stack.Screen name="Welcome" component={WelcomeScreen} />
                <Stack.Screen name="Dashboard" component={Dashboard} />
                <Stack.Screen name="Map" component={FloodMap} />
                <Stack.Screen name="Reasoning" component={ReasoningCenter} />
                <Stack.Screen name="Simulation" component={SimView} />
                <Stack.Screen name="Outcome" component={OutcomeScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}