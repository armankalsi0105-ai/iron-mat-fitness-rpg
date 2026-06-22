import type { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig =>
  ({
    ...config,
    name: 'IronPath',
    slug: 'ironpath-fitness',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'dark',
    scheme: 'ironpath',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#060609',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.ironpath.fitness',
      infoPlist: {
        NSAppTransportSecurity: {
          NSAllowsLocalNetworking: true,
          NSAllowsArbitraryLoadsInWebContent: true,
        },
      },
    },
    android: {
      package: 'com.ironpath.fitness',
      adaptiveIcon: {
        backgroundColor: '#060609',
        foregroundImage: './assets/android-icon-foreground.png',
        backgroundImage: './assets/android-icon-background.png',
        monochromeImage: './assets/android-icon-monochrome.png',
      },
      predictiveBackGestureEnabled: false,
      usesCleartextTraffic: true,
    },
    web: {
      favicon: './assets/favicon.png',
    },
    extra: {
      defaultDevServerUrl: process.env.EXPO_PUBLIC_DEV_SERVER_URL ?? 'http://localhost:3000',
    },
  }) as ExpoConfig;
