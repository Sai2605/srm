import { useState } from 'react';
import { View } from 'react-native';
import { useActiveStudent } from './../../store/ActiveStudentProvider';
import { useTrips } from './../../hooks/queries';
import { errorMessage } from './../../api/client';
import { colors, fonts, radius } from './../../theme';
import { AppText, EmptyState, ErrorState, Icon, LoadingState, Screen, TabHeader } from './../../components/ui';
import { DateStrip, TripCard } from './../../components/trip';
import { formatMonthYear } from './../../utils/format';
import { todayISO } from './../../utils/date';
import { mockTrips } from '../../data/mockStudents';

const USE_MOCK_DATA = true;
export default function TripsScreen() {
  const { activeStudent } = useActiveStudent();
  console.log('sai',activeStudent)
  const [date, setDate] = useState(todayISO());
  // const trips = useTrips(activeStudent?.id, date);
    const realTrips = useTrips(activeStudent?.id, date);
  const trips = USE_MOCK_DATA
    ? {
        data: mockTrips,
        isLoading: false,
        isError: false,
        isRefetching: false,
        refetch: async () => {},
      }
    : realTrips;

  return (
    <Screen onRefresh={trips.refetch} refreshing={trips.isRefetching} gap={14}>
      <TabHeader
        title="Trips"
        subtitle={activeStudent ? `${activeStudent.name}${activeStudent.vehicleLabel ? ` · ${activeStudent.vehicleLabel}` : ''}` : undefined}
        right={
          // TODO: open a full calendar picker for older dates (e.g. @react-native-community/datetimepicker)
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 44, paddingHorizontal: 14, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }}>
            <Icon name="Calendar" size={18} />
            <AppText variant="small" style={{ fontFamily: fonts.bold }}>{formatMonthYear(date)}</AppText>
          </View>
        }
      />

      <DateStrip value={date} onChange={setDate} />

      {trips.isLoading ? (
        <LoadingState />
      // ) : trips.isError ? (
      //   <ErrorState message={errorMessage(trips.error)} onRetry={trips.refetch} />
      ) : !trips.data?.length ? (
        <EmptyState icon='Calendar' title="No trips on this day" message="School holiday or weekend." />
      ) : (
        trips.data.map((t) => <TripCard key={t.id} trip={t} />)
      )}
    </Screen>
  );
}
