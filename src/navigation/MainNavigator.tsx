
import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Animated,
    Easing
} from 'react-native';

import {
    createBottomTabNavigator,
    type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';

import {
    House,
    Route,
    Users,
    UserRound,
    type LucideIcon,
} from 'lucide-react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography } from '../theme';

import DashboardScreen from '../screens/dashboard/Dashboard';
import TripsScreen from '../screens/trips/Trips';
import StudentsScreen from '../screens/students/Students';
import ProfileScreen from '../screens/profile/Profile';

export type MainTabParamList = {
    Home: undefined;
    Trips: undefined;
    Students: undefined;
    Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const tabIcons: Record<string, LucideIcon> = {
    Home: House,
    Trips: Route,
    Students: Users,
    Profile: UserRound,
};

const tabLabels: Record<string, string> = {
    Home: 'Home',
    Trips: 'Trips',
    Students: 'Students',
    Profile: 'Profile',
};


function CustomTabBar({
    state,
    descriptors,
    navigation,
}: BottomTabBarProps) {
    const insets = useSafeAreaInsets();

    // Animate the selected tab's position in the tab list
    const indicatorPosition = useRef(
        new Animated.Value(state.index),
    ).current;

    useEffect(() => {
        Animated.spring(indicatorPosition, {
            toValue: state.index,
            stiffness: 180,
            damping: 22,
            mass: 0.8,
            useNativeDriver: false,
        }).start();
    }, [state.index, indicatorPosition]);

    return (
        <View
            style={[
                styles.tabBarContainer,
                {
                    bottom: Math.max(insets.bottom, 12),
                },
            ]}
        >
            {state.routes.map((route, index) => {
                const isFocused = state.index === index;
                const Icon = tabIcons[route.name] ?? House;
                const label = tabLabels[route.name] ?? route.name;
                const { options } = descriptors[route.key];

                // Each tab animates its own active appearance
                const activeProgress = useRef(
                    new Animated.Value(isFocused ? 1 : 0),
                ).current;

                useEffect(() => {
                    Animated.timing(activeProgress, {
                        toValue: isFocused ? 1 : 0,
                        duration: 250,
                        easing: Easing.out(Easing.cubic),
                        useNativeDriver: false,
                    }).start();
                }, [isFocused, activeProgress]);

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name, route.params);
                    }
                };

                const onLongPress = () => {
                    navigation.emit({
                        type: 'tabLongPress',
                        target: route.key,
                    });
                };

                const animatedBackground = activeProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['rgba(49, 94, 172, 0)', colors.primary],
                });

                const iconTranslateY = activeProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [2, 0],
                });

                const labelOpacity = activeProgress;

                return (
                    <Pressable
                        key={route.key}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: isFocused }}
                        accessibilityLabel={
                            options.tabBarAccessibilityLabel ?? label
                        }
                        onPress={onPress}
                        onLongPress={onLongPress}
                        style={styles.tabItem}
                    >
                        <Animated.View
                            style={[
                                styles.tabContent,
                                {
                                    backgroundColor: animatedBackground,
                                    transform: [
                                        { translateY: iconTranslateY },
                                    ],
                                },
                                isFocused && styles.activeTabContent,
                            ]}
                        >
                            <Icon
                                size={22}
                                strokeWidth={isFocused ? 2.5 : 2}
                                color={
                                    isFocused
                                        ? colors.textOnPrimary
                                        : colors.textSecondary
                                }
                            />

                            <Animated.View
                                style={{
                                    opacity: labelOpacity,
                                    maxWidth: activeProgress.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, 60],
                                    }),
                                    overflow: 'hidden',
                                }}
                            >
                                <Text
                                    numberOfLines={1}
                                    style={[
                                        styles.tabLabel,
                                        styles.activeTabLabel,
                                    ]}
                                >
                                    {label}
                                </Text>
                            </Animated.View>
                        </Animated.View>
                    </Pressable>
                );
            })}
        </View>
    );
}


export default function MainNavigator() {
    return (
        <Tab.Navigator
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
                sceneStyle: {
                    backgroundColor: colors.background,
                },
            }}
        >
            <Tab.Screen name="Home" component={DashboardScreen} />
            <Tab.Screen name="Trips" component={TripsScreen} />
            <Tab.Screen name="Students" component={StudentsScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    tabBarContainer: {
        position: 'absolute',
        left: 16,
        right: 16,
        height: 70,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: 0,
        borderTopRightRadius: 25,
        borderBottomLeftRadius: 25,
        paddingHorizontal: 6,

        shadowColor: '#10213F',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 12,

        borderWidth: 1,
        borderColor: colors.border,
    },

    tabItem: {
        flex: 1,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },

    tabContent: {
        minWidth: 60,
        height: 48,
        paddingHorizontal: 8,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        // backgroundColor:'red'
    },

    activeTabContent: {
        backgroundColor: colors.primary,
        minWidth: 74,
        paddingHorizontal: 12,
        borderRadius: 0,
        borderBottomLeftRadius: 20,
        borderTopRightRadius: 20,
    },

    tabLabel: {
        fontSize: typography.fontSize.xs,
        fontWeight: '600',
        color: colors.textSecondary,
    },

    activeTabLabel: {
        color: colors.textOnPrimary,
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.bold,
    },
});
