import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

import HomeScreen from './src/screens/HomeScreen';
import UploadScreen from './src/screens/UploadScreen';
import DrawScreen from './src/screens/DrawScreen';
import DrawMaskScreen from './src/screens/DrawMaskScreen';
import MaterialsScreen from './src/screens/MaterialsScreen';

export type RootStackParamList = {
  Home: undefined;
  Upload: undefined;
  Draw: { imageUri?: string };
  DrawMask: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#0A0A0A' },
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Upload" component={UploadScreen} />
          <Stack.Screen name="Draw" component={DrawScreen} />
          <Stack.Screen name="DrawMask" component={DrawMaskScreen} />
          <Stack.Screen name="Materials" component={MaterialsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});