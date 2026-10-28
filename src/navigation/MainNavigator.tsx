
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
    Calendar,
    MessageCircle,
    Settings,
    CardSim,
} from 'lucide-react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, typography } from '../theme';

import DashboardScreen from '../screens/dashboard/Dashboard';
import TripsScreen from '../screens/trips/Trips';
import StudentsScreen from '../screens/chat/ChatListScreen';
import ProfileScreen from '../screens/settings/SettingsScreen';
import PaymentsScreen from '../screens/payments/PaymentsScreen';
import ChatListScreen from '../screens/chat/ChatListScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import ChatNavigator from './ChatNavigator';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import SettingsNavigator from './SettingsNavigator';

export type MainTabParamList = {
    Home: undefined;
    Trips: undefined;
    Chats: undefined;
    Payments: undefined;
    Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const tabIcons: Record<string, LucideIcon> = {
    Home: House,
    Trips: Calendar,
    Chats: MessageCircle,
    Payments: CardSim,
    Settings: Settings,
};

const tabLabels: Record<string, string> = {
    Home: 'Home',
    Trips: 'Trips',
    Chats: 'Chats',
    Payments: 'Payments',
    Settings: 'Settings',
};


function CustomTabBar({
    state,
    descriptors,
    navigation,
}: BottomTabBarProps) {
    const insets = useSafeAreaInsets();

    const activeRoute = state.routes[state.index];

    const nestedRouteName = getFocusedRouteNameFromRoute(activeRoute)


    // Hide the custom bottom bar while a conversation is open
    const hideTabBar =
        (activeRoute.name === 'Chats' && nestedRouteName === 'Chat') ||
        (activeRoute.name === 'Settings' &&
            (nestedRouteName === 'EditSettings' || nestedRouteName === 'StudentsSettings' || nestedRouteName === 'LocationSettings'));


    console.log('hide status', hideTabBar)

    if (hideTabBar) {
        return null;
    }

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
                // {
                //     bottom: Math.max(insets.bottom, 12),
                // },
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
                                        ? colors.primaryDark
                                        : colors.primaryLight
                                }
                            />

                        </Animated.View>
                        {/* <Animated.View
                            style={{
                                opacity: labelOpacity,
                                maxWidth: activeProgress.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, 60],
                                }),
                                overflow: 'hidden',
                            }}
                        > */}
                        <Text
                            numberOfLines={1}
                            style={[
                                !isFocused ? styles.tabLabel :
                                    styles.activeTabLabel,
                            ]}
                        >
                            {label}
                        </Text>
                        {/* </Animated.View> */}
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
            <Tab.Screen name="Chats" component={ChatNavigator} />
            <Tab.Screen name="Payments" component={PaymentsScreen} />
            <Tab.Screen name="Settings" component={SettingsNavigator} />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    tabBarContainer: {
        // position: 'absolute',
        // left: 16,
        // right: 16,
        height: 80,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: 0,
        // borderTopRightRadius: 25,
        // borderBottomLeftRadius: 25,
        paddingHorizontal: 6,
        // paddingVertical:5,

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
        height: 36,
        paddingHorizontal: 8,
        borderRadius: 16,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        // backgroundColor:'red'
    },

    activeTabContent: {
        backgroundColor: colors.primary,
        minWidth: 64,
        paddingHorizontal: 12,
        borderRadius: 18,
    },

    tabLabel: {
        fontSize: 14,
        fontFamily: fonts.bold,
        color: colors.primaryLight,
    },

    activeTabLabel: {
        fontSize: 14,
        color: colors.primaryDark,
        // fontSize: typography.fontSize.xs,
        fontFamily: fonts.bold,
    },
});
