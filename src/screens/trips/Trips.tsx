import { useState } from 'react';
import { View } from 'react-native';
import { useActiveStudent } from './../../store/ActiveStudentProvider';
import { useCreateConversation, useProfile, useThreads, useTrips } from './../../hooks/queries';
import { errorMessage } from './../../api/client';
import { colors, fonts, radius } from './../../theme';
import { AppText, EmptyState, ErrorState, Icon, LoadingState, Screen, TabHeader } from './../../components/ui';
import { DateStrip, TripCard } from './../../components/trip';
import { formatMonthYear } from './../../utils/format';
import { todayISO } from './../../utils/date';
import { mockTrips } from '../../data/mockStudents';
import MarkAbsentSheet from '../../modal/MarkAbsent';
import { Trip, TripType } from '../../types/models';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { ChatStackParamList } from '../../navigation/ChatNavigator';

const USE_MOCK_DATA = true;
type AbsenceParams = {
  date?: string;
  type?: TripType;
};
export default function TripsScreen() {
  const { activeStudent } = useActiveStudent();
  // console.log('sai', activeStudent)
  const [date, setDate] = useState(todayISO());
  const { data: parent } = useProfile();
  // const parentId = Number(parent?.id);
  console.log('parent data', parent)
  // const trips = useTrips(activeStudent?.id, date);
  const realTrips = useTrips(activeStudent?.id, date);
  const trips = USE_MOCK_DATA
    ? {
      data: mockTrips,
      isLoading: false,
      isError: false,
      isRefetching: false,
      refetch: async () => { },
    }
    : realTrips;


  const [absentVisible, setAbsentVisible] = useState(false);
  const createConversation = useCreateConversation();
  const { refetch: refetchThreads } = useThreads();

  const navigation =
    useNavigation<NativeStackNavigationProp<ChatStackParamList>>();

  const [absenceParams, setAbsenceParams] =
    useState<AbsenceParams>({});

  const openAbsentSheet = (params: AbsenceParams = {}) => {
    setAbsenceParams(params);
    setAbsentVisible(true);
  };

  const handleChatWithDriver = (trip: Trip) => {
    console.log('button pressed')
    if (!activeStudent) return;

    const driverId = Number(trip.driver.id);
    const studentId = Number(activeStudent.id);

    if (!Number.isFinite(driverId) || !Number.isFinite(studentId) || !Number.isFinite(parentId)) {
      console.warn('Invalid driver, student, or parent ID');
      return;
    }

    createConversation.mutate(
      {
        driver_id: driverId,
        student_id: studentId,
        parent_id: parentId, // Get this from your authenticated parent data
      },
      {
        onSuccess: async () => {
          await refetchThreads();
        },
        onError: (error) => {
          console.log('Create conversation failed:', error);
        },
      },
    );
  };



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
        trips.data.map((t) => <TripCard key={t.id} trip={t} onMarkAbsent={openAbsentSheet} onChat={() => handleChatWithDriver(t)} chatLoading={createConversation.isPending} />)
      )}

      <MarkAbsentSheet
        visible={absentVisible}
        onClose={() => setAbsentVisible(false)}
        date={absenceParams.date}
        type={absenceParams.type}
      />

    </Screen>
  );
}
