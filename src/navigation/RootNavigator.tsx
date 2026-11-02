import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { colors } from '../theme';
import { useAuth } from '../store/AuthProvider';
import { SplashView } from '../components/SplashView';

export default function RootNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { status } = useAuth();

  useEffect(() => {
    const checkAuthSession = async () => {
      try {
        // TODO: Check the saved authentication token here.
        // Example: retrieve the token from react-native-keychain.
        //
        // If a valid token exists:
        // setIsAuthenticated(true);
        //
        // Otherwise:
        // setIsAuthenticated(false);

        setIsAuthenticated(false);
      } catch (error) {
        console.error('Failed to restore authentication session:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthSession();
  }, []);

  if (status === 'loading') {
    return (
      <SplashView/>
      // <View style={styles.loadingContainer}>
      //   <ActivityIndicator size="large" color={colors.primary} />
      // </View>
    );
  }

  return status == 'signedIn' ? <MainNavigator /> : <AuthNavigator />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
