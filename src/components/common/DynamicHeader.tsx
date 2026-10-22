import React from 'react';

import {
    View,
    Text,
    StyleSheet,
    Pressable,
    type ViewStyle,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';

import {
    ArrowLeft,
    Bell,
    Ellipsis,
    type LucideIcon,
} from 'lucide-react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../../theme';

type HeaderVariant = 'default' | 'greeting';

interface DynamicHeaderProps {
    title: string;
    subtitle?: string;

    variant?: HeaderVariant;

    showBack?: boolean;
    onBackPress?: () => void;

    rightIcon?: LucideIcon;
    onRightPress?: () => void;
    rightAccessibilityLabel?: string;

    showNotification?: boolean;
    onNotificationPress?: () => void;

    avatarInitials?: string;
    containerStyle?: ViewStyle;
    includeTopInset?: boolean;
}

export default function DynamicHeader({
    title,
    subtitle,
    variant = 'default',
    showBack = false,
    onBackPress,
    rightIcon: RightIcon,
    onRightPress,
    rightAccessibilityLabel = 'Header action',
    showNotification = false,
    onNotificationPress,
    avatarInitials,
    containerStyle,
    includeTopInset = false,
}: DynamicHeaderProps) {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    const isGreeting = variant === 'greeting';

    const handleBackPress = () => {
        if (onBackPress) {
            onBackPress();
            return;
        }

        if (navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    return (
        <View
            style={[
                styles.container,
                {
                    paddingTop: includeTopInset ? insets.top + 8 : 8,
                },
                containerStyle,
            ]}
        >
            <View style={styles.content}>
                {/* Left section */}
                {showBack ? (
                    <Pressable
                        onPress={handleBackPress}
                        accessibilityRole="button"
                        accessibilityLabel="Go back"
                        hitSlop={8}
                        style={styles.iconButton}
                    >
                        <ArrowLeft size={22} color={colors.text} />
                    </Pressable>
                ) : isGreeting && avatarInitials ? (
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {avatarInitials}
                        </Text>
                    </View>
                ) : null}

                {/* Title and subtitle */}
                <View style={styles.titleContainer}>
                    <Text
                        numberOfLines={1}
                        style={[
                            styles.title,
                            isGreeting && styles.greetingTitle,
                        ]}
                    >
                        {title}
                    </Text>

                    {!!subtitle && (
                        <Text
                            numberOfLines={2}
                            style={styles.subtitle}
                        >
                            {subtitle}
                        </Text>
                    )}
                </View>

                {/* Right actions */}
                {RightIcon && onRightPress && (
                    <Pressable
                        onPress={onRightPress}
                        accessibilityRole="button"
                        accessibilityLabel={rightAccessibilityLabel}
                        hitSlop={8}
                        style={styles.iconButton}
                    >
                        <RightIcon size={21} color={colors.text} />
                    </Pressable>
                )}

                {showNotification && (
                    <Pressable
                        onPress={onNotificationPress}
                        accessibilityRole="button"
                        accessibilityLabel="Notifications"
                        hitSlop={8}
                        style={styles.notificationButton}
                    >
                        <Bell size={21} color={colors.text} />

                        {/* Optional notification indicator */}
                        <View style={styles.notificationDot} />
                    </Pressable>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.primary,
        paddingHorizontal: 20,
        paddingBottom: 16,
    },

    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        minHeight: 48,
    },

    titleContainer: {
        flex: 1,
        justifyContent: 'center',
        gap: 4,
    },

    title: {
        fontSize: 21,
        fontWeight: '700',
        color: colors.text,
        letterSpacing: -0.4,
    },

    greetingTitle: {
        fontSize: 22,
    },

    subtitle: {
        fontSize: 13,
        lineHeight: 19,
        fontWeight: '400',
        color: colors.textSecondary,
    },

    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },

    notificationButton: {
        width: 44,
        height: 44,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },

    notificationDot: {
        position: 'absolute',
        top: 9,
        right: 10,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.error,
        borderWidth: 1,
        borderColor: colors.surface,
    },

    avatar: {
        width: 46,
        height: 46,
        borderRadius: 16,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },

    avatarText: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.textOnPrimary,
    },
});