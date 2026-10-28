import { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline, type Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';
import { router, useLocalSearchParams } from 'expo-router';
import { useLiveTrip } from '@/hooks/queries';
import { errorMessage } from '@/api/client';
import { colors, fonts, radius, shadow, spacing } from '@/theme';
import { AppText, Chip, ErrorState, IconButton, LoadingState } from '@/components/ui';
import { DriverRow, StopTimeline, phaseCopy, tripName } from '@/components/trip';
import { formatTime } from '@/utils/format';
import type { LatLng } from '@/types/models';

const toCoord = (p: LatLng) => ({ latitude: p.lat, longitude: p.lng });

function regionFor(points: LatLng[]): Region {
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max(0.01, (maxLat - minLat) * 1.6),
    longitudeDelta: Math.max(0.01, (maxLng - minLng) * 1.6),
  };
}

export default function LiveTripScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const { data, isLoading, isError, error, refetch, dataUpdatedAt } = useLiveTrip(tripId);

  // Follow the van as it moves.
  useEffect(() => {
    if (data) mapRef.current?.animateCamera({ center: toCoord(data.vehicleLocation) }, { duration: 800 });
  }, [data?.vehicleLocation.lat, data?.vehicleLocation.lng]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) return <View style={styles.center}><LoadingState label="Finding the van…" /></View>;
  if (isError || !data)
    return (
      <View style={[styles.center, { padding: spacing.xl }]}>
        <ErrorState message={errorMessage(error)} onRetry={refetch} />
      </View>
    );

  const copy = phaseCopy[data.phase];
  const secondsAgo = Math.max(0, Math.round((Date.now() - dataUpdatedAt) / 1000));
  const firstStop = data.stops[0];
  const lastStop = data.stops[data.stops.length - 1];

  return (
    <View style={{ flex: 1, backgroundColor: colors.mapLand }}>
      <MapView ref={mapRef} style={StyleSheet.absoluteFill} initialRegion={regionFor(data.route)} showsCompass={false} toolbarEnabled={false}>
        <Polyline coordinates={data.route.map(toCoord)} strokeColor={colors.navy} strokeWidth={5} />
        {data.stops.slice(1).map((s) => (
          <Marker key={s.id} coordinate={toCoord(s.location)} title={s.title} description={s.subtitle} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={s.id === lastStop?.id ? styles.destPin : styles.stopPin}>
              {s.id === lastStop?.id ? <Feather name="flag" size={14} color={colors.yellow} /> : <View style={styles.stopDot} />}
            </View>
          </Marker>
        ))}
        <Marker coordinate={toCoord(data.vehicleLocation)} anchor={{ x: 0.5, y: 0.5 }} title={data.vehicle.label} tracksViewChanges={false}>
          <View style={styles.van}>
            <Feather name="truck" size={20} color={colors.navy} />
          </View>
        </Marker>
      </MapView>

      {/* Floating top bar */}
      <View style={[styles.topBar, { top: insets.top + spacing.sm }]}>
        <IconButton name="chevron-left" label="Back" variant="floating" onPress={() => router.back()} />
        <View style={styles.statusPill}>
          <View style={[styles.dot, { backgroundColor: data.phase === 'reached' ? colors.textMuted : colors.successDot }]} />
          <AppText variant="bodyStrong">{tripName(data.type)} · {data.phase === 'reached' ? 'Done' : 'Live'}</AppText>
          <AppText variant="caption" color={colors.textMuted} style={{ marginLeft: 'auto' }}>
            {secondsAgo < 5 ? 'Just now' : `${secondsAgo}s ago`}
          </AppText>
        </View>
      </View>
      <View style={styles.recenter}>
        <IconButton
          name="crosshair"
          label="Re-centre map on van"
          variant="floating"
          onPress={() => mapRef.current?.animateCamera({ center: toCoord(data.vehicleLocation), zoom: 15 }, { duration: 500 })}
        />
      </View>

      {/* Bottom panel */}
      <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
        <View style={styles.handle} />
        <ScrollView contentContainerStyle={{ gap: 14 }} showsVerticalScrollIndicator={false}>
          <View style={styles.etaRow}>
            <View style={{ gap: 4, flex: 1 }}>
              <Chip label={copy.chip} tone={data.phase === 'reached' ? 'info' : 'live'} />
              <AppText variant="small" color={colors.textMuted}>{copy.etaLabel}</AppText>
              <AppText variant="display" accessibilityLiveRegion="polite">
                {data.etaMinutes != null ? `${data.etaMinutes} min` : formatTime(lastStop?.time)}
              </AppText>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 2 }}>
              <AppText variant="small" style={{ fontFamily: fonts.bold }}>
                {data.distanceKm != null ? `${data.distanceKm} km away` : 'Trip completed'}
              </AppText>
              <AppText variant="small" color={colors.textMuted}>
                {data.etaTime ? `ETA ${formatTime(data.etaTime)}` : firstStop ? `Started ${formatTime(firstStop.time)}` : ''}
              </AppText>
            </View>
          </View>

          <StopTimeline stops={data.stops} />

          <View style={styles.driverCard}>
            <DriverRow
              driver={data.driver}
              vehicle={data.vehicle}
              onChat={() => router.push({ pathname: '/chat/trip/[tripId]', params: { tripId: data.tripId } })}
            />
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', backgroundColor: colors.bg },
  topBar: { position: 'absolute', left: spacing.lg, right: spacing.lg, flexDirection: 'row', gap: 10 },
  statusPill: {
    flex: 1,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    ...shadow.floating,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  recenter: { position: 'absolute', right: spacing.lg, top: '42%' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '56%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingHorizontal: spacing.xl,
    paddingTop: 10,
    gap: 14,
    ...shadow.sheet,
  },
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: colors.borderStrong },
  etaRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.md },
  driverCard: { padding: spacing.md, borderRadius: radius.lg, backgroundColor: colors.bg },
  van: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.yellow,
    borderWidth: 3,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.floating,
  },
  stopPin: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.surface, borderWidth: 4, borderColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
  stopDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.navy },
  destPin: { width: 30, height: 30, borderRadius: 8, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
});
