import { Pressable, StyleSheet, View } from 'react-native';
// import { router } from 'expo-router';
import { useThreads } from './../../hooks/queries';
import { errorMessage } from './../../api/client';
import { colors, fonts, radius, spacing } from './../../theme';
import { AppText, Avatar, Card, Chip, EmptyState, ErrorState, Icon, LoadingState, Screen, SectionTitle, TabHeader, type IconName } from './../../components/ui';
import { formatRelative } from './../../utils/format';
import type { ChatThread } from './../../types/models';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChatStackParamList } from '../../navigation/ChatNavigator';

export default function ChatListScreen() {
  const { data = [], isLoading, isError, error, refetch, isRefetching } = useThreads();
  const general = data.filter((t) => t.kind === 'general');
  const trips = data.filter((t) => t.kind === 'trip');
  const announcements = data.filter((t) => t.kind === 'announcement');
  const navigation =
    useNavigation<NativeStackNavigationProp<ChatStackParamList>>();

  return (
    <Screen onRefresh={refetch} refreshing={isRefetching}>
      <TabHeader title="Chats" subtitle="Talk to your driver about a trip or anything else" />

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState message={errorMessage(error)} onRetry={refetch} />
      ) : !data.length ? (
        <EmptyState icon='MessageCircleMore' title="No conversations yet" />
      ) : (
        <>
          {general.length > 0 && (
            <View style={{ gap: spacing.sm }}>
              <SectionTitle>Driver · General</SectionTitle>
              {general.map((t) => (
                <Card key={t.id} padded={false}>
                  <ThreadRow thread={t} onPress={() => navigation.navigate('Chat', { threadId: t.id })} />
                </Card>
              ))}
            </View>
          )}

          {trips.length > 0 && (
            <View style={{ gap: spacing.sm }}>
              <SectionTitle>Trip chats</SectionTitle>
              <Card padded={false}>
                {trips.map((t, i) => <ThreadRow key={t.id} thread={t} divider={i < trips.length - 1} onPress={() =>
                  navigation.navigate('Chat', { threadId: t.id })
                } />)}
              </Card>
            </View>
          )}

          {announcements.length > 0 && (
            <View style={{ gap: spacing.sm }}>
              <SectionTitle>Announcements</SectionTitle>
              {announcements.map((t) => (
                <Card key={t.id} style={{ flexDirection: 'row', gap: spacing.md }}>
                  <View style={[styles.tile, { backgroundColor: colors.navy }]}>
                    <Icon name='Volume2' size={20} color={colors.yellow} />
                  </View>
                  <View style={{ flex: 1, gap: 3 }}>
                    <View style={styles.rowBetween}>
                      <AppText variant="bodyStrong">{t.title}</AppText>
                      <AppText variant="caption" color={colors.textMuted}>{formatRelative(t.lastAt)}</AppText>
                    </View>
                    <AppText variant="small" color={colors.textMuted}>{t.lastMessage}</AppText>
                  </View>
                </Card>
              ))}
            </View>
          )}
        </>
      )}
    </Screen>
  );
}

function ThreadRow({ thread, divider, onPress }: { thread: ChatThread; divider?: boolean; onPress: () => void }) {
  const isTrip = thread.kind === 'trip';
  const icon: IconName = thread.tripType === 'drop' ? 'home' : 'Sun';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${thread.title}. ${thread.unread ? `${thread.unread} unread. ` : ''}${thread.lastMessage}`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, divider && styles.divider, pressed && { opacity: 0.7 }]}
    >
      {isTrip ? (
        <View style={[styles.tile, { backgroundColor: thread.tripType === 'drop' ? colors.infoBg : colors.yellowSoft }]}>
          <Icon name={icon} size={20} />
        </View>
      ) : (
        <View>
          <Avatar name={thread.title} size={48} />
          <View style={styles.online} />
        </View>
      )}
      <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
        <View style={styles.rowBetween}>
          <AppText variant="bodyStrong" numberOfLines={1} style={{ flex: 1 }}>{thread.title}</AppText>
          {thread.tripStatus === 'in_progress' ? <Chip label="Live" tone="success" /> : <AppText variant="caption" color={colors.textMuted}>{formatRelative(thread.lastAt)}</AppText>}
        </View>
        <View style={styles.rowBetween}>
          <AppText
            variant="small"
            numberOfLines={1}
            color={thread.unread ? colors.text : colors.textMuted}
            style={[{ flex: 1 }, thread.unread ? { fontFamily: fonts.semibold } : null]}
          >
            {thread.lastMessage}
          </AppText>
          {thread.unread > 0 && (
            <View style={styles.unread}>
              <AppText variant="caption" color={colors.textOnDark} style={{ fontSize: 11, fontFamily: fonts.bold }}>{thread.unread}</AppText>
            </View>
          )}
        </View>
        {thread.subtitle && <AppText variant="caption" color={colors.textMuted} style={{ fontSize: 11 }}>{thread.subtitle}</AppText>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: 14 },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  tile: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  online: { position: 'absolute', right: 0, bottom: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: colors.successDot, borderWidth: 2, borderColor: colors.surface },
  unread: { minWidth: 20, height: 20, paddingHorizontal: 6, borderRadius: 10, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
});
