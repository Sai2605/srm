/**
 * Pickup / Drop Location Screen
 *
 * - Uses MapLibre instead of react-native-maps.
 * - Fixed centre pin; drag the map to choose a location.
 * - Supports current-location positioning.
 * - Sends changes to the transport desk for approval.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import {
  Camera,
  LocationManager,
  Map,
} from '@maplibre/maplibre-react-native';

import type {
  CameraRef,
  MapRef,
} from '@maplibre/maplibre-react-native';

import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useActiveStudent } from './../../store/ActiveStudentProvider';
import {
  usePickupLocations,
  useUpdatePickupLocations,
} from './../../hooks/queries';

import { errorMessage } from './../../api/client';
import {
  colors,
  fonts,
  radius,
  shadows,
  spacing,
} from './../../theme';

import {
  AppText,
  Button,
  Icon,
  IconButton,
  ListRow,
  LoadingState,
  Segmented,
  TextField,
  Toggle,
} from './../../components/ui';

import type {
  LatLng,
  StopPoint,
} from './../../types/models';
import { MOCK_PICKUP_LOCATIONS } from '../../data/mockStudents';

type Which = 'pickup' | 'drop';

const MAP_STYLE =
  'https://tiles.openfreemap.org/styles/liberty';

const INITIAL_ZOOM = 16;

export default function PickupLocationScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const mapRef = useRef<MapRef>(null);
  const cameraRef = useRef<CameraRef>(null);

  const { activeStudent } = useActiveStudent();
  const sid = activeStudent?.id ?? '';

  // const current = usePickupLocations(sid);
  const current = MOCK_PICKUP_LOCATIONS;
  const save = useUpdatePickupLocations(sid);

  const [which, setWhich] = useState<Which>('pickup');

  const [points, setPoints] =
    useState<Record<Which, StopPoint> | null>(null);

  const [same, setSame] = useState(true);
  const [moving, setMoving] = useState(false);
  const [locating, setLocating] = useState(false);

  // Avoid overwriting edited points when query data refreshes.
  useEffect(() => {
    if (current && !points) {
      setPoints({
        pickup: current.pickup,
        drop: current.drop,
      });

      setSame(current.dropSameAsPickup);
    }
  }, [current, points]);

  const setActive = useCallback(
    (patch: Partial<StopPoint>) => {
      setPoints((previous) => {
        if (!previous) {
          return previous;
        }

        return {
          ...previous,
          [which]: {
            ...previous[which],
            ...patch,
          },
        };
      });
    },
    [which],
  );

  // Read the map's geographic centre after the map finishes moving.
  const onRegionDidChange = useCallback(async () => {
    setMoving(false);

    const editingLocked = which === 'drop' && same;

    if (editingLocked) {
      return;
    }

    try {
      const center = await mapRef.current?.getCenter();

      if (!center) {
        return;
      }

      // MapLibre coordinates use [longitude, latitude].
      const location: LatLng = {
        lng: center[0],
        lat: center[1],
      };

      setActive({
        location,
      });
    } catch (error) {
      console.warn('Unable to read map centre:', error);
    }
  }, [which, same, setActive]);

  if (!points) {
    return (
      <View style={styles.center}>
        <LoadingState />
      </View>
    );
  }

  const active =
    which === 'drop' && same
      ? points.pickup
      : points[which];

  const editingLocked = which === 'drop' && same;

  const useMyLocation = async () => {
    setLocating(true);

    try {
      const permissionGranted =
        await LocationManager.requestPermissions();

      if (!permissionGranted) {
        Alert.alert(
          'Location permission needed',
          'Allow location access to use your current position.',
        );
        return;
      }

      const position =
        await LocationManager.getCurrentPosition();

      if (!position) {
        Alert.alert(
          'Location unavailable',
          'Could not determine your current location. Please try again.',
        );
        return;
      }

      const longitude = position.coords.longitude;
      const latitude = position.coords.latitude;

      cameraRef.current?.easeTo({
        center: [longitude, latitude],
        zoom: INITIAL_ZOOM,
        duration: 600,
      });
    } catch (error) {
      Alert.alert(
        'Unable to get location',
        error instanceof Error
          ? error.message
          : 'Please check your location settings and try again.',
      );
    } finally {
      setLocating(false);
    }
  };

  const submit = () => {
    save.mutate(
      {
        pickup: points.pickup,
        drop: same ? undefined : points.drop,
        dropSameAsPickup: same,
      },
      {
        onSuccess: () => {
          Alert.alert(
            'Sent for approval',
            'The transport desk will confirm the new location before it goes live.',
          );
        },
        onError: (error) => {
          Alert.alert(
            'Couldn’t save',
            errorMessage(error),
          );
        },
      },
    );
  };

  return (
    <View style={styles.container}>
      {/* MapLibre map */}
      <Map
        ref={mapRef}
        style={styles.map}
        mapStyle={MAP_STYLE}
        dragPan={!editingLocked}
        touchZoom={!editingLocked}
        doubleTapZoom={!editingLocked}
        doubleTapHoldZoom={!editingLocked}
        touchRotate={!editingLocked}
        touchPitch={!editingLocked}
        attribution
        logo={false}
        compass
        onRegionWillChange={() => {
          setMoving(true);
        }}
        onRegionDidChange={onRegionDidChange}
      >
        <Camera
          ref={cameraRef}
          initialViewState={{
            center: [
              active.location.lng,
              active.location.lat,
            ],
            zoom: INITIAL_ZOOM,
          }}
        />
      </Map>

      {/* Fixed centre pin */}
      <View
        pointerEvents="none"
        style={styles.pinWrap}
      >
        <View
          style={[
            styles.pinLabel,
            moving && styles.pinLabelHidden,
          ]}
        >
          <AppText
            variant="caption"
            color={colors.textOnDark}
            style={{ fontFamily: fonts.bold }}
          >
            {editingLocked
              ? 'Same as pickup'
              : moving
                ? 'Moving map…'
                : 'Drag map to adjust'}
          </AppText>
        </View>

        <View
          style={[
            styles.pin,
            moving && styles.pinMoving,
          ]}
        >
          <View style={styles.pinInner} />
        </View>

        <View style={styles.pinTip} />
      </View>

      {/* Top navigation and search field */}
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
          size={48}
          onPress={() => navigation.goBack()}
        />

        <View style={styles.search}>
          <Icon
            name="search"
            size={18}
            color={colors.textMuted}
          />

          <TextInput
            placeholder="Search address or landmark"
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
            accessibilityLabel="Search address"
            returnKeyType="search"
            onSubmitEditing={() => {
              Alert.alert(
                'Search not connected',
                'Connect an address autocomplete service to search for places.',
              );
            }}
          />
        </View>
      </View>

      {/* Bottom sheet */}
      <View
        style={[
          styles.sheet,
          {
            paddingBottom: insets.bottom + spacing.lg,
          },
        ]}
      >
        <View style={styles.handle} />

        <ScrollView
          contentContainerStyle={styles.sheetContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Pickup / Drop selector */}
          <View style={styles.selectorRow}>
            <Segmented
              style={{ flex: 1 }}
              value={which}
              onChange={setWhich}
              options={[
                {
                  value: 'pickup',
                  label: 'Pickup point',
                },
                {
                  value: 'drop',
                  label: 'Drop point',
                },
              ]}
            />

            <IconButton
              name="Navigation"
              label="Use current location"
              variant="outline"
              onPress={useMyLocation}
              // disabled={locating || editingLocked}
            />
          </View>

          {/* Selected location */}
          <ListRow
            icon="MapPin"
            iconBg={colors.purpleBg}
            iconColor={colors.purple}
            title={active.name}
            subtitle={
              locating
                ? 'Finding your location…'
                : active.address ||
                  `${active.location.lat.toFixed(6)}, ${active.location.lng.toFixed(6)}`
            }
            chevron={false}
          />

          {/* Landmark */}
          <TextField
            label="Landmark for driver"
            value={active.landmark ?? ''}
            editable={!editingLocked}
            onChangeText={(text) => {
              setActive({ landmark: text });
            }}
            placeholder="e.g. Opposite the bakery"
          />

          {/* Same pickup and drop location */}
          <ListRow
            title="Drop at the same place"
            subtitle="Turn off to set a different drop point"
            chevron={false}
            right={
              <Toggle
                label="Drop at the same place"
                value={same}
                onChange={(value) => {
                  setSame(value);

                  if (!value) {
                    setWhich('drop');
                  } else {
                    setWhich('pickup');
                  }
                }}
              />
            }
          />

          {/* Save */}
          <Button
            label="Save & send for approval"
            onPress={submit}
            loading={save.isPending}
          />

          <AppText
            variant="caption"
            color={colors.textMuted}
            align="center"
          >
            The transport desk confirms route changes before they go live.
          </AppText>
        </ScrollView>
      </View>
    </View>
  );
}

const PIN = 44;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.mapLand,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },

  map: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '62%',
  },

  pinWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '31%',
    alignItems: 'center',
    marginTop: -(PIN + 12 + 36),
  },

  pinLabel: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.sm,
    backgroundColor: colors.navy,
    marginBottom: 8,
  },

  pinLabelHidden: {
    opacity: 0,
  },

  pin: {
    width: PIN,
    height: PIN,
    borderRadius: PIN / 2,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.large,
  },

  pinMoving: {
    transform: [{ translateY: -8 }],
  },

  pinInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.yellow,
  },

  pinTip: {
    width: 4,
    height: 12,
    backgroundColor: colors.navy,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },

  topBar: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    gap: 10,
  },

  search: {
    flex: 1,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    ...shadows.medium,
  },

  searchInput: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.text,
  },

  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '52%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.xl,
    paddingTop: 10,
    gap: 14,
    ...shadows.medium,
  },

  sheetContent: {
    gap: 14,
    paddingBottom: spacing.sm,
  },

  handle: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.borderStrong,
  },

  selectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});