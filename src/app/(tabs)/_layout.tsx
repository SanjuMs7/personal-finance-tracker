import { Tabs } from 'expo-router/tabs';

import { TabBar } from '@/components/common/TabBar';

// Defined once rather than inline, so the navigator is not handed a new
// renderer on every render of this layout.
function renderTabBar(props: { state: any; navigation: any }) {
  return <TabBar state={props.state} navigation={props.navigation} />;
}

export default function TabsLayout() {
  return (
    <Tabs
      // freezeOnBlur: a background tab stops re-rendering entirely. Without it
      // every store or theme change re-rendered all three screens at once, and
      // the two you cannot see were competing with the one you can.
      screenOptions={{ headerShown: false, freezeOnBlur: true }}
      tabBar={renderTabBar}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="limits" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}
