
import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Map,
  Camera,
  GeoJSONSource,
  Layer,
  Marker,
} from '@maplibre/maplibre-react-native';
// import type { CameraRef } from '@maplibre/maplibre-react-native';
import type { Feature, LineString } from 'geojson';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Bus } from 'lucide-react-native';

import { useLiveTrip } from './../../hooks/queries';
import { errorMessage } from './../../api/client';
import { colors, fonts, radius, shadows, spacing } from './../../theme';
import {
  AppText,
  Chip,
  ErrorState,
  IconButton,
  LoadingState,
} from './../../components/ui';
import {
  DriverRow,
  StopTimeline,
  phaseCopy,
  tripName,
} from './../../components/trip';
import { formatTime } from './../../utils/format';
import type { LatLng } from './../../types/models';
import { MainStackParamList } from '../../navigation/MainNavigator';

// If this screen is in Expo Router, uncomment:
// import { useLocalSearchParams } from 'expo-router';

const toCoord = (p: LatLng): [number, number] => [p.lng, p.lat];

export default function LiveTripScreen() {
  // Replace this with your existing navigation parameter source.
  // Example for Expo Router:
  // const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const route = useRoute<RouteProp<MainStackParamList, 'LiveTrip'>>();
  const { tripId } = route.params;

  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  // const cameraRef = useRef<CameraRef>(null);
  const [cameraCenter, setCameraCenter] = useState<[number, number] | null>(null);
  const [cameraZoom, setCameraZoom] = useState(13);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    dataUpdatedAt,
  } = useLiveTrip(tripId);

  // Keep this hook above all conditional returns.
  useEffect(() => {
    if (!data?.vehicleLocation) return;

    setCameraCenter(toCoord(data.vehicleLocation));
  }, [data?.vehicleLocation.lat, data?.vehicleLocation.lng]);

  const recenterOnVan = () => {
    if (!data?.vehicleLocation) return;

    setCameraCenter(toCoord(data.vehicleLocation));
    setCameraZoom(15);
  };

  const routeFeature = useMemo<Feature<LineString> | null>(() => {
    if (!data?.route?.length) return null;

    return {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: data.route.map(toCoord),
      },
    };
  }, [data?.route]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <LoadingState label="Finding the van…" />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={[styles.center, { padding: spacing.xl }]}>
        <ErrorState
          message={errorMessage(error)}
          onRetry={refetch}
        />
      </View>
    );
  }

  const copy = phaseCopy[data.phase];
  const secondsAgo = Math.max(
    0,
    Math.round((Date.now() - dataUpdatedAt) / 1000),
  );
  const firstStop = data.stops[0];
  const lastStop = data.stops[data.stops.length - 1];

  // const recenterOnVan = () => {
  //   cameraRef.current?.setCamera({
  //     center: toCoord(data.vehicleLocation),
  //     zoom: 15,
  //     animationDuration: 500,
  //   });
  // };


  return (
    <View style={{ flex: 1, backgroundColor: colors.mapLand }}>
      <Map
        style={StyleSheet.absoluteFill}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
      >
        <Camera
          // ref={cameraRef}
          initialViewState={{
            center: toCoord(data.vehicleLocation),
            zoom: 13,
          }}
        />

        {/* Route */}
        {routeFeature && (
          <GeoJSONSource id="trip-route" data={routeFeature}>
            <Layer
              id="trip-route-line"
              type="line"
              layout={{
                'line-cap': 'round',
                'line-join': 'round',
              }}
              paint={{
                'line-color': colors.navy,
                'line-width': 5,
              }}
            />
          </GeoJSONSource>
        )}

        {/* Stops */}
        {data.stops.slice(1).map((stop) => (
          <Marker
            key={stop.id}
            id={`stop-${stop.id}`}
            lngLat={toCoord(stop.location)}
          >
            <View
              style={
                stop.id === lastStop?.id
                  ? styles.destPin
                  : styles.stopPin
              }
            >
              {stop.id === lastStop?.id ? (
                <Bus size={14} color={colors.yellow} />
              ) : (
                <View style={styles.stopDot} />
              )}
            </View>
          </Marker>
        ))}

        {/* Live vehicle */}
        <Marker
          id="live-vehicle"
          lngLat={toCoord(data.vehicleLocation)}
        >
          <View style={styles.van}>
            <Bus size={20} color={colors.navy} />
          </View>
        </Marker>
      </Map>

      {/* Floating top bar */}
      <View
        style={[
          styles.topBar,
          { top: insets.top + spacing.sm },
        ]}
      >
        <IconButton
          name="chevronLeft"
          label="Back"
          variant="floating"
          onPress={() => navigation.goBack()}
        />

        <View style={styles.statusPill}>
          <View
            style={[
              styles.dot,
              {
                backgroundColor:
                  data.phase === 'reached'
                    ? colors.textMuted
                    : colors.successDot,
              },
            ]}
          />

          <AppText variant="bodyStrong">
            {tripName(data.type)} ·{' '}
            {data.phase === 'reached' ? 'Done' : 'Live'}
          </AppText>

          <AppText
            variant="caption"
            color={colors.textMuted}
            style={{ marginLeft: 'auto' }}
          >
            {secondsAgo < 5 ? 'Just now' : `${secondsAgo}s ago`}
          </AppText>
        </View>
      </View>

      {/* Recenter map */}
      <View style={styles.recenter}>
        <IconButton
          name="LocateFixed"
          label="Re-centre map on van"
          variant="floating"
          onPress={recenterOnVan}
        />
      </View>

      {/* Bottom trip panel */}
      <View
        style={[
          styles.sheet,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}
      >
        <View style={styles.handle} />

        <ScrollView
          contentContainerStyle={{ gap: 14 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.etaRow}>
            <View style={{ gap: 4, flex: 1 }}>
              <Chip
                label={copy.chip}
                tone={data.phase === 'reached' ? 'info' : 'live'}
              />

              <AppText variant="small" color={colors.textMuted}>
                {copy.etaLabel}
              </AppText>

              <AppText
                variant="display"
                accessibilityLiveRegion="polite"
              >
                {data.etaMinutes != null
                  ? `${data.etaMinutes} min`
                  : formatTime(lastStop?.time)}
              </AppText>
            </View>

            <View style={{ alignItems: 'flex-end', gap: 2 }}>
              <AppText
                variant="small"
                style={{ fontFamily: fonts.bold }}
              >
                {data.distanceKm != null
                  ? `${data.distanceKm} km away`
                  : 'Trip completed'}
              </AppText>

              <AppText variant="small" color={colors.textMuted}>
                {data.etaTime
                  ? `ETA ${formatTime(data.etaTime)}`
                  : firstStop
                    ? `Started ${formatTime(firstStop.time)}`
                    : ''}
              </AppText>
            </View>
          </View>

          <StopTimeline stops={data.stops} />

          <View style={styles.driverCard}>
            <DriverRow
              driver={data.driver}
              vehicle={data.vehicle}
            />
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  topBar: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    gap: 10,
  },
  statusPill: {
    flex: 1,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    ...shadows.medium,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  recenter: {
    position: 'absolute',
    right: spacing.lg,
    bottom: '37%',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '56%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.xl,
    paddingTop: 10,
    gap: 14,
    ...shadows.small,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.borderStrong,
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.md,
  },
  driverCard: {
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.bg,
  },
  van: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.yellow,
    borderWidth: 3,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },
  stopPin: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surface,
    borderWidth: 4,
    borderColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.navy,
  },
  destPin: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
