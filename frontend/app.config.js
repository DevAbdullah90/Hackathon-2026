module.exports = {
  expo: {
    name: "ResQ by AQUA",
    slug: "resq-by-aqua",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    updates: {
      enabled: false,
    },
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.devabdullah90.resqbyaqua",
    },
    android: {
      package: "com.devabdullah90.resqbyaqua",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: ["expo-router"],
    extra: {
      eas: {
        projectId: "4a2d5262-9496-4463-8ba5-596a4c8b0892",
      },
    },
  },
};
