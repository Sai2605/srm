import { useEffect, useMemo, useState } from 'react';
import { Alert, Linking, StyleSheet, View } from 'react-native';
// import * as WebBrowser from 'expo-web-browser';
// import * as ExpoLinking from 'expo-linking';
import { useActiveStudent } from './../../store/ActiveStudentProvider';
import { useCreatePaymentOrder, usePaymentHistory, usePendingInvoices, useRefreshPayments } from './../../hooks/queries';
import { errorMessage } from './../../api/client';
import { colors, fonts, radius, spacing } from './../../theme';
import {
  AppText, Button, Card, Chip, EmptyState, ErrorState, Icon, IconButton, LoadingState, Screen, Segmented, SelectRow, TabHeader, type Tone,
} from './../../components/ui';
import { formatCurrency, formatDayMonth, formatMonth } from './../../utils/format';
import type { Invoice, InvoiceStatus } from './../../types/models';

type Tab = 'pending' | 'history';

const statusChip: Record<InvoiceStatus, { label: string; tone: Tone }> = {
  overdue: { label: 'Overdue', tone: 'danger' },
  due: { label: 'Due', tone: 'warning' },
  upcoming: { label: 'Upcoming', tone: 'neutral' },
  paid: { label: 'Paid', tone: 'success' },
};

export default function PaymentsScreen() {
  const { activeStudent } = useActiveStudent();
  const sid = activeStudent?.id;
  const [tab, setTab] = useState<Tab>('pending');
  const pending = usePendingInvoices(sid);
  const history = usePaymentHistory(sid);
  const createOrder = useCreatePaymentOrder();
  const refresh = useRefreshPayments(sid);

  const [selected, setSelected] = useState<string[]>([]);
  // Pre-select everything that's pending when data arrives / student changes.
  useEffect(() => setSelected(pending.data?.map((i) => i.id) ?? []), [pending.data]);

  const chosen = useMemo(() => pending.data?.filter((i) => selected.includes(i.id)) ?? [], [pending.data, selected]);
  const total = chosen.reduce((s, i) => s + i.amount, 0);
  const overdueCount = pending.data?.filter((i) => i.status === 'overdue').length ?? 0;
  const monthly = pending.data?.[0]?.amount;

//   const pay = () => {
//     if (!sid || !chosen.length) return;
//     createOrder.mutate(
//       { studentId: sid, invoiceIds: chosen.map((i) => i.id) },
//       {
//         onSuccess: async (order) => {
//           // Gateway redirects back to saferide://payment-result when done.
//           const returnUrl = ExpoLinking.createURL('payment-result');
//           await WebBrowser.openAuthSessionAsync(order.checkoutUrl, returnUrl);
//           // Whatever happened in the browser, re-read the source of truth from the backend.
//           refresh();
//         },
//         onError: (e) => Alert.alert('Payment failed to start', errorMessage(e)),
//       },
//     );
//   };

  return (
    <Screen onRefresh={refresh} refreshing={pending.isRefetching || history.isRefetching}>
      <TabHeader
        title="Payments"
        subtitle={activeStudent ? `${activeStudent.name}${monthly ? ` · Van fee ${formatCurrency(monthly)} / month` : ''}` : undefined}
      />

      <View style={styles.summary}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ gap: 4 }}>
            <AppText variant="small" color={colors.textOnDarkMuted}>
              {chosen.length ? `Total for ${chosen.length} ${chosen.length === 1 ? 'month' : 'months'}` : 'Select a month to pay'}
            </AppText>
            <AppText variant="display" color={colors.textOnDark} style={{ fontSize: 34 }}>{formatCurrency(total)}</AppText>
          </View>
          {overdueCount > 0 && (
            <View style={styles.overduePill}>
              <AppText variant="caption" color="#FFD9B8" style={{ fontSize: 11, fontFamily: fonts.bold }}>{overdueCount} overdue</AppText>
            </View>
          )}
        </View>
        <Button
          label={chosen.length ? `Pay ${formatCurrency(total)} now` : 'Select months'}
          variant="accent"
          size="md"
          disabled={!chosen.length}
          loading={createOrder.isPending}
        //   onPress={pay}
        />
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
          <Icon name="Lock" size={13} color={colors.textOnDarkMuted} />
          <AppText variant="caption" color={colors.textOnDarkMuted} style={{ fontSize: 11 }}>UPI · Cards · Net banking — secure checkout</AppText>
        </View>
      </View>

      <Segmented
        tone="light"
        value={tab}
        onChange={setTab}
        options={[{ value: 'pending', label: 'Pending' }, { value: 'history', label: 'History' }]}
      />

      {tab === 'pending' ? (
        pending.isLoading ? (
          <LoadingState />
        ) : pending.isError ? (
          <ErrorState message={errorMessage(pending.error)} onRetry={pending.refetch} />
        ) : !pending.data?.length ? (
          <EmptyState icon='MessageCircleMore' title="All paid up" message="No pending fees right now." />
        ) : (
          <View style={{ gap: 10 }} accessibilityLabel="Select months to pay">
            {pending.data.map((inv) => (
              <InvoiceRow
                key={inv.id}
                invoice={inv}
                selected={selected.includes(inv.id)}
                onToggle={() => setSelected((s) => (s.includes(inv.id) ? s.filter((x) => x !== inv.id) : [...s, inv.id]))}
              />
            ))}
          </View>
        )
      ) : history.isLoading ? (
        <LoadingState />
      ) : history.isError ? (
        <ErrorState message={errorMessage(history.error)} onRetry={history.refetch} />
      ) : !history.data?.length ? (
        <EmptyState icon='info' title="No payments yet" />
      ) : (
        <Card padded={false}>
          {history.data.map((p, i) => (
            <View key={p.id} style={[styles.historyRow, i < history.data!.length - 1 && styles.divider]}>
              <View style={styles.paidIcon}><Icon name="MessageCircleMore" size={18} color={colors.success} /></View>
              <View style={{ flex: 1, gap: 2 }}>
                <AppText variant="bodyStrong">{formatMonth(p.month)}</AppText>
                <AppText variant="caption" color={colors.textMuted}>
                  Paid {formatDayMonth(p.paidAt)} · {p.method}
                </AppText>
              </View>
              <AppText variant="bodyStrong" style={{ fontFamily: fonts.extraBold }}>{formatCurrency(p.amount)}</AppText>
              {p.receiptUrl && (
                <IconButton name='ChevronDown' label={`Download receipt for ${formatMonth(p.month)}`} size={40} onPress={() => Linking.openURL(p.receiptUrl!)} />
              )}
            </View>
          ))}
        </Card>
      )}
    </Screen>
  );
}

function InvoiceRow({ invoice, selected, onToggle }: { invoice: Invoice; selected: boolean; onToggle: () => void }) {
  const chip = statusChip[invoice.status];
  const dueText = `${invoice.status === 'overdue' ? 'Was due' : 'Due'} ${formatDayMonth(invoice.dueDate)}`;
  return (
    <SelectRow selected={selected} onPress={onToggle}>
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="title">{formatMonth(invoice.month)}</AppText>
        <AppText variant="caption" color={colors.textMuted}>{dueText}</AppText>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 4 }}>
        <AppText variant="title" style={{ fontFamily: fonts.extraBold }}>{formatCurrency(invoice.amount)}</AppText>
        <Chip label={chip.label} tone={chip.tone} />
      </View>
    </SelectRow>
  );
}

const styles = StyleSheet.create({
  summary: { backgroundColor: colors.navy, borderRadius: radius.xl, padding: 18, gap: 14 },
  overduePill: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: radius.sm, backgroundColor: '#5C2A0A' },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, paddingHorizontal: 14 },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  paidIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.successBg, alignItems: 'center', justifyContent: 'center' },
});
