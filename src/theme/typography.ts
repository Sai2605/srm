export const fonts = {
  regular: 'PlusJakartaSans-Regular',
  medium: 'PlusJakartaSans-Medium',
  semibold: 'PlusJakartaSans-SemiBold',
  bold: 'PlusJakartaSans-Bold',
  extraBold: 'PlusJakartaSans-ExtraBold',
} as const;

export const typography = {
  display: { fontFamily: fonts.extraBold, fontSize: 38, lineHeight: 42, letterSpacing: -0.6 },
  h0: { fontFamily: fonts.extraBold, fontSize: 28, lineHeight: 32, letterSpacing: -0.4 },
  h1: { fontFamily: fonts.extraBold, fontSize: 26, lineHeight: 32, letterSpacing: -0.4 },
  h2: { fontFamily: fonts.extraBold, fontSize: 20, lineHeight: 26 },
  h3: { fontFamily: fonts.extraBold, fontSize: 16, lineHeight: 22 },
  title: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 20 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 20 },
  small: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16 },
  overline: { fontFamily: fonts.bold, fontSize: 12, lineHeight: 16, letterSpacing: 0.7 },
  button: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 20 },
} as const;

export type TypographyVariant = keyof typeof typography;