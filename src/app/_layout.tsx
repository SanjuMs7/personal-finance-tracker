import '@/global.css';

import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { Stack } from 'expo-router';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { StatusBar } from 'expo-status-bar';

import { AppText } from '@/components/common/AppText';
import { migrateDbIfNeeded } from '@/database/schema';
import { useTheme } from '@/hooks/use-theme';
import { useAppStore } from '@/store/useAppStore';

SplashScreen.preventAutoHideAsync().catch(() => {});

function Hydrator({ children, onError }: { children: React.ReactNode; onError: (err: Error) => void }) {
  const db = useSQLiteContext();
  const hydrated = useAppStore((s) => s.hydrated);
  const hydrate = useAppStore((s) => s.hydrate);

  useEffect(() => {
    hydrate(db).catch((err) => {
      console.warn('Failed to hydrate app store', err);
      SplashScreen.hideAsync().catch(() => {});
      onError(err instanceof Error ? err : new Error(String(err)));
    });
  }, [db, hydrate, onError]);

  useEffect(() => {
    if (hydrated) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [hydrated]);

  if (!hydrated) return null;
  return <>{children}</>;
}

function ThemedStatusBar() {
  const { isDark } = useTheme();
  return <StatusBar style={isDark ? 'light' : 'dark'} />;
}

function ErrorScreen({ message }: { message: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.errorRoot, { backgroundColor: colors.bg }]}>
      <AppText weight="extrabold" style={{ fontSize: 17, color: colors.textPrimary, marginBottom: 8 }}>
        Couldn&apos;t start the app
      </AppText>
      <AppText style={{ fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 19 }}>{message}</AppText>
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
  const [dbError, setDbError] = useState<Error | null>(null);

  if (!fontsLoaded) return null;

  if (dbError) {
    return <ErrorScreen message={dbError.message} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <SQLiteProvider
          databaseName="pft.db"
          onInit={migrateDbIfNeeded}
          onError={(err) => {
            console.warn('Failed to initialize database', err);
            SplashScreen.hideAsync().catch(() => {});
            setDbError(err);
          }}
        >
          <Hydrator onError={setDbError}>
            <ThemedStatusBar />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="expense/[id]" options={{ presentation: 'transparentModal', animation: 'fade' }} />
              <Stack.Screen name="category/[id]" options={{ presentation: 'transparentModal', animation: 'fade' }} />
            </Stack>
          </Hydrator>
        </SQLiteProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  errorRoot: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
});
