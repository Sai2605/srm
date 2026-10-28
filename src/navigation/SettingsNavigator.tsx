import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SettingsScreen from '../screens/settings/SettingsScreen';
import EditProfileScreen from '../screens/settings/EditProfileScreen';
import StudentsScreen from '../screens/settings/StudentsScreen';
import PickupLocationScreen from '../screens/settings/PickupLocationScreen';


export type SettingsStackParamList = {
    Setting: undefined;
    EditSettings: undefined;
    StudentsSettings: undefined;
    LocationSettings: undefined;
};

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export default function SettingsNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Setting"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Setting" component={SettingsScreen} />
      <Stack.Screen name="EditSettings" component={EditProfileScreen} />
      <Stack.Screen name="StudentsSettings" component={StudentsScreen} />
      <Stack.Screen name="LocationSettings" component={PickupLocationScreen} />
    </Stack.Navigator>
  );
}
