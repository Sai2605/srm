import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ChatListScreen from '../screens/chat/ChatListScreen';
import CharViewScreen from '../screens/chat/CharViewScreen';

export type ChatStackParamList = {
  ChatList: undefined;
  Chat: { threadId: string };
};

const Stack = createNativeStackNavigator<ChatStackParamList>();

export default function ChatNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="ChatList"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="ChatList" component={ChatListScreen} />
      <Stack.Screen name="Chat" component={CharViewScreen} />
    </Stack.Navigator>
  );
}