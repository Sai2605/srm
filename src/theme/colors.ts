export const colors = {
    primary: '#FFC530',
    primaryDark: '#14213D',
    primaryLight: '#5A6170',

    white: '#FFFFFF',
    background: '#E4E2DA',
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

    navy: '#14213D',
    navySoft: '#24365C',
    navyMuted: '#3A4D74',
    yellow: '#FFC530',
    yellowSoft: '#FFF3CF',
    yellowTint: '#FFF8E1',

    bg: '#F5F4EF',
    surface: '#FFFFFF',
    surfaceAlt: '#EAE8E0',
    borderStrong: '#D9D6CC',
    divider: '#EEECE5',

    textOnDark: '#FFFFFF',
    textOnDarkMuted: '#AEB7C7',

    successBg: '#E3F2EA',
    successDot: '#16A34A',
    warningBg: '#FDEEDC',
    danger: '#9B1C14',
    dangerBg: '#FCE8E6',
    infoBg: '#E7ECF6',
    neutral: '#4A505C',
    neutralBg: '#EEECE5',

    purple: '#6D28D9',
    purpleBg: '#EFE7FB',
    blueBg: '#DCE6F7',
    pinkBg: '#FBE3EC',
    greenBg: '#E1F1E7',

    mapLand: '#E8E5DB',
} as const;

export type ColorKey = keyof typeof colors;