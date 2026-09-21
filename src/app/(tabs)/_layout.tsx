import { Tabs } from 'expo-router/tabs';

import { TabBar } from '@/components/common/TabBar';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <TabBar state={props.state} navigation={props.navigation} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="limits" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}
