import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ChatStackParamList } from '../../navigation/ChatNavigator';
import { ChatByThread } from './ChatViewScreen';

type Props = NativeStackScreenProps<ChatStackParamList, 'Chat'>;

export default function CharViewScreen({ route }: Props) {
  return <ChatByThread threadId={route.params.threadId} />;
}