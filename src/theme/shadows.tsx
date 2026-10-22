import { Platform, type ViewStyle } from 'react-native';

export const shadows = {
  small: {
    shadowColor: '#10213F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },

  medium: {
    shadowColor: '#10213F',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },

  large: {
    shadowColor: '#10213F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 7,
  },
} satisfies Record<string, ViewStyle>;