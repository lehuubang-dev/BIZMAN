import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { enableScreens } from 'react-native-screens';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';


import TabNavigator from './navigation/TabNavigator';
import { store } from './store';
import { authService } from './services';
import { ActivityIndicator, View } from 'react-native';

enableScreens();

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load token from storage when app starts
    const loadToken = async () => {
      await authService.loadToken();
      setLoading(false);
    };
    loadToken();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#2196F3' }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <NavigationContainer>
          <TabNavigator />
          <StatusBar style="light" />
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
};

export default App;
