import 'react-native-gesture-handler';
import { StyleSheet, Text, View, Button, Alert, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import React, { useEffect, useState } from 'react';

import AppNavigator from './AppNavigator';


export default function App() {
  return(
    <AppNavigator />
  );
}
