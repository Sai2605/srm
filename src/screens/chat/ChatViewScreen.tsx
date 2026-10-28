/**
 * One conversation. Opened either by thread id (from the chat list)
 * or by trip id (from a trip card / live trip) — then the thread is resolved first.
 */
import { useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// import { router } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { useMessages, useSendMessage, useThreads, useTripThread } from '../../hooks/queries';
import { errorMessage } from '../../api/client';
import { colors, fonts, radius, spacing } from '../../theme';
import { AppText, Avatar, ErrorState, IconButton, LoadingState } from '../../components/ui';
import { formatTime } from '../../utils/format';
import type { ChatMessage, ChatThread } from '../../types/models';

const QUICK_TRIP = ['Coming in 2 min', 'Please wait', 'Not coming today', 'Reached stop'];
const QUICK_GENERAL = ['Absent tomorrow', 'Change pickup point', 'Thank you'];

export function ChatByThread({ threadId }: { threadId: string }) {
  const threads = useThreads();
  const thread = threads.data?.find((t) => t.id === threadId);
  if (threads.isLoading) return <Centered><LoadingState /></Centered>;
  if (!thread) return <Centered><ErrorState message="Conversation not found" onRetry={threads.refetch} /></Centered>;
  return <ChatViewScreen thread={thread} />;
}

export function ChatByTrip({ tripId }: { tripId: string }) {
  const q = useTripThread(tripId);
  if (q.isLoading) return <Centered><LoadingState /></Centered>;
  if (q.isError || !q.data) return <Centered><ErrorState message={errorMessage(q.error)} onRetry={q.refetch} /></Centered>;
  return <ChatViewScreen thread={q.data} />;
}

function Centered({ children }: { children: React.ReactNode }) {
  return <SafeAreaView style={{ flex: 1, justifyContent: 'center', padding: spacing.xl, backgroundColor: colors.bg }}>{children}</SafeAreaView>;
}

function ChatViewScreen({ thread }: { thread: ChatThread }) {
  const messages = useMessages(thread.id);
  const send = useSendMessage(thread.id);
  const [text, setText] = useState('');
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const readOnly = thread.kind === 'announcement';
  const person = thread.participant;
 const navigation = useNavigation();
  const submit = (value = text) => {
    const v = value.trim();
    if (!v) return;
    send.mutate(v);
    setText('');
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: colors.surface }}>
      {/* Header */}
      <View style={styles.header}>
        <IconButton name='chevronLeft' label="Back" variant="soft"
        //  onPress={() => router.back()}
        onPress={() => navigation.goBack()}
          />
        {person && <Avatar name={person.name} size={42} />}
        <View style={{ flex: 1, minWidth: 0 }}>
          <AppText variant="title" style={{ fontSize: 16 }} numberOfLines={1}>{person?.name ?? thread.title}</AppText>
          <AppText variant="caption" color={colors.textMuted} numberOfLines={1}>
            {thread.kind === 'trip' ? thread.title : thread.subtitle ?? ''}
          </AppText>
        </View>
        {person && <IconButton name='Phone' label="Call driver" variant="dark" onPress={() => Linking.openURL(`tel:${person.phone}`)} />}
      </View>

      {thread.kind === 'trip' && thread.tripId && thread.tripStatus === 'in_progress' && (
        <Pressable
          accessibilityRole="button"
        //   onPress={() => router.push({ pathname: '/live-trip/[tripId]', params: { tripId: thread.tripId! } })}
          style={styles.tripBanner}
        >
          <View style={styles.liveDot} />
          <AppText variant="small" style={{ flex: 1 }}>
            <AppText variant="small" style={{ fontFamily: fonts.bold }}>{thread.title}</AppText> · Live now
          </AppText>
          <AppText variant="small" style={{ fontFamily: fonts.extraBold }}>Track</AppText>
        </Pressable>
      )}

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ flex: 1, backgroundColor: colors.bg }}>
          {messages.isLoading ? (
            <LoadingState />
          ) : messages.isError ? (
            <View style={{ padding: spacing.xl }}><ErrorState message={errorMessage(messages.error)} onRetry={messages.refetch} /></View>
          ) : (
            <FlatList
              ref={listRef}
              data={messages.data}
              keyExtractor={(m) => m.id}
              renderItem={({ item }) => <Bubble message={item} />}
              contentContainerStyle={{ padding: spacing.lg, gap: 10, flexGrow: 1, justifyContent: 'flex-end' }}
              onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
              accessibilityRole="list"
            />
          )}
        </View>

        {!readOnly && (
          <View style={styles.composer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }} keyboardShouldPersistTaps="handled">
              {(thread.kind === 'trip' ? QUICK_TRIP : QUICK_GENERAL).map((q) => (
                <Pressable key={q} accessibilityRole="button" onPress={() => submit(q)} style={styles.quick}>
                  <AppText variant="caption" style={{ fontFamily: fonts.semibold }}>{q}</AppText>
                </Pressable>
              ))}
            </ScrollView>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <IconButton name='UserRoundX' label="Mark absent" variant="warning"
            //    onPress={() => router.push('/mark-absent')}
                />
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder={`Message ${person?.name.split(' ')[0] ?? ''}…`}
                placeholderTextColor={colors.textMuted}
                accessibilityLabel="Message"
                style={styles.input}
                returnKeyType="send"
                onSubmitEditing={() => submit()}
              />
              <IconButton name="SendHorizonal" label="Send" variant="accent" onPress={() => submit()} />
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Bubble({ message }: { message: ChatMessage }) {
  if (message.sender === 'system') {
    return (
      <View style={styles.event}>
        <AppText variant="caption" color={colors.neutral} style={{ fontFamily: fonts.semibold }}>
          {message.text} · {formatTime(message.createdAt)}
        </AppText>
      </View>
    );
  }
  const mine = message.sender === 'parent';
  return (
    <View style={{ maxWidth: '78%', alignSelf: mine ? 'flex-end' : 'flex-start', alignItems: mine ? 'flex-end' : 'flex-start', gap: 3 }}>
      <View style={[styles.bubble, mine ? styles.mine : styles.theirs, message.pending && { opacity: 0.6 }]}>
        <AppText variant="body" style={{ fontSize: 14, lineHeight: 20 }} color={mine ? colors.textOnDark : colors.text}>{message.text}</AppText>
      </View>
      <AppText variant="caption" color={colors.textMuted} style={{ fontSize: 11 }}>
        {message.pending ? 'Sending…' : formatTime(message.createdAt)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  tripBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: spacing.lg, marginVertical: spacing.sm, padding: 10, borderRadius: radius.md, backgroundColor: colors.yellowSoft },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.successDot },
  composer: { gap: 10, paddingHorizontal: spacing.lg, paddingTop: 10, paddingBottom: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
  quick: { height: 36, paddingHorizontal: spacing.md, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.borderStrong, justifyContent: 'center' },
  input: { flex: 1, height: 44, paddingHorizontal: 14, borderWidth: 1.5, borderColor: colors.borderStrong, borderRadius: radius.md, fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  event: { alignSelf: 'center', paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt },
  bubble: { paddingHorizontal: 14, paddingVertical: 10 },
  mine: { backgroundColor: colors.navy, borderRadius: 18, borderBottomRightRadius: 4 },
  theirs: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 18, borderBottomLeftRadius: 4 },
});
