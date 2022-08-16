import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackNavigationOptions, TransitionPresets } from '@react-navigation/stack';

import ScanScreen from './ScanScreen';
import DataScreen from './DataScreen';

const Stack = createStackNavigator();

function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName='Scan'>
                <Stack.Screen name="Scan" component={ScanScreen} />
                <Stack.Screen name="Data" component={DataScreen} options={{title: 'BlindGuide'}}/>
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default AppNavigator;