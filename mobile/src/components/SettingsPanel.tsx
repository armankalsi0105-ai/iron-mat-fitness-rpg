import React, { useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { normalizeDevServerUrl } from '../config';

type SettingsPanelProps = {
  visible: boolean;
  currentUrl: string;
  defaultUrl: string;
  onClose: () => void;
  onSave: (url: string) => void;
};

export default function SettingsPanel({
  visible,
  currentUrl,
  defaultUrl,
  onClose,
  onSave,
}: SettingsPanelProps) {
  const [draft, setDraft] = useState(currentUrl);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setDraft(currentUrl);
      setError(null);
    }
  }, [visible, currentUrl]);

  const handleSave = () => {
    try {
      const normalized = normalizeDevServerUrl(draft);
      onSave(normalized);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid URL');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Dev Server URL</Text>
          <Text style={styles.help}>
            Point this at your IronPath backend. Start it from the repo root with{' '}
            <Text style={styles.mono}>npm run dev</Text>. On a physical device, use your
            computer&apos;s LAN IP (e.g. <Text style={styles.mono}>http://192.168.1.42:3000</Text>
            ).
          </Text>

          <TextInput
            value={draft}
            onChangeText={setDraft}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            placeholder={defaultUrl}
            placeholderTextColor="#71717a"
            style={styles.input}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.actions}>
            <Pressable
              onPress={() => {
                setDraft(defaultUrl);
                setError(null);
              }}
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.secondaryLabel}>Use default</Text>
            </Pressable>
            <Pressable
              onPress={handleSave}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.primaryLabel}>Save & reload</Text>
            </Pressable>
          </View>

          <Pressable onPress={onClose} style={styles.cancel}>
            <Text style={styles.cancelLabel}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#111114',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderColor: '#27272a',
  },
  title: {
    color: '#f59e0b',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  help: {
    color: '#a1a1aa',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },
  mono: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    color: '#e4e4e7',
  },
  input: {
    backgroundColor: '#060609',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 12,
    color: '#fafafa',
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  error: {
    color: '#f87171',
    fontSize: 12,
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#f59e0b',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#18181b',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3f3f46',
  },
  primaryLabel: {
    color: '#000',
    fontWeight: '800',
    fontSize: 13,
  },
  secondaryLabel: {
    color: '#e4e4e7',
    fontWeight: '700',
    fontSize: 13,
  },
  pressed: {
    opacity: 0.85,
  },
  cancel: {
    marginTop: 14,
    alignItems: 'center',
    paddingVertical: 8,
  },
  cancelLabel: {
    color: '#71717a',
    fontSize: 13,
    fontWeight: '600',
  },
});
