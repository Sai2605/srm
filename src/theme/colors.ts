export const colors = {
    primary: '#315EAC',
    primaryDark: '#10213F',
    primaryLight: '#85B1FF',

    background: '#F5F7FB',
    surface: '#FFFFFF',
    surfaceSecondary: '#EDF3FF',

    text: '#17243B',
    textSecondary: '#7B879B',
    textMuted: '#A0A9B8',
    textOnPrimary: '#FFFFFF',

    border: '#E3E8F0',
    borderFocused: '#315EAC',

    success: '#16A34A',
    successBackground: '#DCFCE7',

    error: '#DC2626',
    errorBackground: '#FEF2F2',

    warning: '#D97706',
    warningBackground: '#FEF3C7',

    info: '#2563EB',
    infoBackground: '#DBEAFE',

    overlay: 'rgba(16, 33, 63, 0.5)',
    transparent: 'transparent',
} as const;

export type ColorKey = keyof typeof colors;