import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import { ActiveStudentProvider } from './src/store/ActiveStudentProvider';
import QueryProvider from './src/providers/QueryProviders';
import { useEffect } from 'react';
import ImmersiveMode from 'react-native-immersive-mode';
import { AuthProvider } from './src/store/AuthProvider';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    ImmersiveMode.fullLayout(true)
    ImmersiveMode.setBarMode('FullSticky');
    return () => {
      ImmersiveMode.fullLayout(false)
    }
  }, [])

  return (

    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* < 
        templateFileName="App.tsx"
        safeAreaInsets={safeAreaInsets}
      /> */}
      <QueryProvider>
        <AuthProvider>
        <NavigationContainer>
          <ActiveStudentProvider>
            <RootNavigator />
          </ActiveStudentProvider>
        </NavigationContainer>
        </AuthProvider>
      </QueryProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
