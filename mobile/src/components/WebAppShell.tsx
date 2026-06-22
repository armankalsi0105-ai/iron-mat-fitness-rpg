import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { WebView, type WebViewNavigation } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getDefaultDevServerUrl, STORAGE_KEYS } from '../config';
import SettingsPanel from './SettingsPanel';

type LoadState = 'loading' | 'ready' | 'error';

export default function WebAppShell() {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);
  const defaultUrl = getDefaultDevServerUrl();

  const [devServerUrl, setDevServerUrl] = useState(defaultUrl);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.devServerUrl);
        if (mounted && stored) {
          setDevServerUrl(stored);
        }
      } catch (err) {
        console.warn('Failed to read dev server URL from AsyncStorage', err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const reloadWebApp = useCallback(() => {
    setLoadState('loading');
    setErrorMessage(null);
    webViewRef.current?.reload();
  }, []);

  const handleSaveUrl = useCallback(async (url: string) => {
    setDevServerUrl(url);
    setLoadState('loading');
    setErrorMessage(null);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.devServerUrl, url);
    } catch (err) {
      console.warn('Failed to persist dev server URL', err);
    }
  }, []);

  const handleNavigationStateChange = useCallback((navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.toolbar}>
        <View style={styles.brand}>
          <Text style={styles.brandMark}>IRONPATH</Text>
          <Text style={styles.brandSub}>Mobile shell (WebView)</Text>
        </View>
        <View style={styles.toolbarActions}>
          {canGoBack ? (
            <Pressable
              onPress={() => webViewRef.current?.goBack()}
              style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
              accessibilityLabel="Go back"
            >
              <Text style={styles.iconButtonLabel}>Back</Text>
            </Pressable>
          ) : null}
          <Pressable
            onPress={reloadWebApp}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
            accessibilityLabel="Reload app"
          >
            <Text style={styles.iconButtonLabel}>Reload</Text>
          </Pressable>
          <Pressable
            onPress={() => setSettingsOpen(true)}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
            accessibilityLabel="Server settings"
          >
            <Text style={styles.iconButtonLabel}>Server</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.webviewHost}>
        <WebView
          ref={webViewRef}
          source={{ uri: devServerUrl }}
          style={styles.webview}
          onLoadStart={() => {
            setLoadState('loading');
            setErrorMessage(null);
          }}
          onLoadEnd={() => setLoadState('ready')}
          onError={(event) => {
            setLoadState('error');
            setErrorMessage(event.nativeEvent.description || 'Could not load the IronPath web app.');
          }}
          onHttpError={(event) => {
            if (event.nativeEvent.statusCode >= 400) {
              setLoadState('error');
              setErrorMessage(`HTTP ${event.nativeEvent.statusCode} from ${devServerUrl}`);
            }
          }}
          onNavigationStateChange={handleNavigationStateChange}
          originWhitelist={['*']}
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled
          domStorageEnabled
          sharedCookiesEnabled
          startInLoadingState={false}
          setSupportMultipleWindows={false}
          allowsBackForwardNavigationGestures
        />

        {loadState === 'loading' ? (
          <View style={styles.overlay} pointerEvents="none">
            <ActivityIndicator size="large" color="#f59e0b" />
            <Text style={styles.overlayText}>Connecting to {devServerUrl}</Text>
          </View>
        ) : null}

        {loadState === 'error' ? (
          <View style={styles.overlay}>
            <Text style={styles.errorTitle}>Cannot reach IronPath server</Text>
            <Text style={styles.errorBody}>
              {errorMessage || 'Make sure the backend is running with npm run dev from the repo root.'}
            </Text>
            <Text style={styles.errorHint}>
              Current URL: {devServerUrl}
              {'\n'}
              Physical devices need your computer&apos;s LAN IP, not localhost.
            </Text>
            <Pressable
              onPress={() => setSettingsOpen(true)}
              style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
            >
              <Text style={styles.retryLabel}>Change server URL</Text>
            </Pressable>
            <Pressable
              onPress={reloadWebApp}
              style={({ pressed }) => [styles.secondaryRetry, pressed && styles.pressed]}
            >
              <Text style={styles.secondaryRetryLabel}>Try again</Text>
            </Pressable>
          </View>
        ) : null}
      </View>

      <SettingsPanel
        visible={settingsOpen}
        currentUrl={devServerUrl}
        defaultUrl={defaultUrl}
        onClose={() => setSettingsOpen(false)}
        onSave={handleSaveUrl}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#060609',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#18181b',
    backgroundColor: '#09090b',
  },
  brand: {
    flexShrink: 1,
  },
  brandMark: {
    color: '#f59e0b',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
  },
  brandSub: {
    color: '#71717a',
    fontSize: 10,
    marginTop: 2,
  },
  toolbarActions: {
    flexDirection: 'row',
    gap: 6,
  },
  iconButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    minHeight: 32,
    justifyContent: 'center',
  },
  iconButtonLabel: {
    color: '#e4e4e7',
    fontSize: 11,
    fontWeight: '700',
  },
  webviewHost: {
    flex: 1,
    position: 'relative',
  },
  webview: {
    flex: 1,
    backgroundColor: '#060609',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(6,6,9,0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  overlayText: {
    color: '#a1a1aa',
    fontSize: 13,
    marginTop: 14,
    textAlign: 'center',
  },
  errorTitle: {
    color: '#fafafa',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorBody: {
    color: '#fca5a5',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
  },
  errorHint: {
    color: '#a1a1aa',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  retryButton: {
    backgroundColor: '#f59e0b',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginBottom: 10,
    minWidth: 200,
    alignItems: 'center',
  },
  retryLabel: {
    color: '#000',
    fontWeight: '800',
    fontSize: 13,
  },
  secondaryRetry: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  secondaryRetryLabel: {
    color: '#a1a1aa',
    fontSize: 13,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
});
