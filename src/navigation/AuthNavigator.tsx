
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from
  '@react-navigation/native-stack';

import type { AuthStackParamList } from '../types/auth.type';
import SignInScreen from '../screens/auth/SignIn';
import SignUpScreen from '../screens/auth/SignUp';
import OtpScreen from '../screens/auth/Otp';
import ForgotPasswordScreen from '../screens/auth/ForgotPassword';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    // <NavigationContainer>
      <Stack.Navigator
        initialRouteName="SignIn"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: '#F5F7FB' },
        }}
      >
        <Stack.Screen name="SignIn" component={SignInScreen} />
        {/* <Stack.Screen name="SignUp" component={SignUpScreen} /> */}
        <Stack.Screen name="OTP" component={OtpScreen} />
        {/* <Stack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
        /> */}
      </Stack.Navigator>
    // </NavigationContainer>
  );
}
