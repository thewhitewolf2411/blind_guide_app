import React from 'react';
import { StyleSheet, Text, View, Button, Alert, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useEffect, useState } from 'react';

import { Audio } from 'expo-av';

const ScanScreen = ({navigation, route}) => {

    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);
    const [introSound, setIntroSound] = useState(null);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            setScanned(false);
        });

        return unsubscribe;
    }, [navigation]);

    useEffect(() => {

        setScanned(false);

        (async () => {

          if(hasPermission !== 'granted'){
            const { sound } = await Audio.Sound.createAsync(
                require('./assets/welcome.mp3'),
                {
                    shouldPlay: true,
                    rate: 1.0,
                    shouldCorrectPitch: false,
                    volume: 1.0,
                    isMuted: false,
                    isLooping: false,
                },
              );
          
              setIntroSound(sound);
        
              await sound.playAsync();
              await sound.unloadAsync();
          }
    
          const { status } = await BarCodeScanner.requestPermissionsAsync();
          setHasPermission(status === 'granted');

        })();
      }, []);

    if(introSound){
        introSound.playAsync();
    }

    const delay = (time) => {
        return new Promise(function(resolve, reject){
            setTimeout(() => resolve(), time);
        })
    }

    const handleBarCodeScanned = async ({ type, data }) => {
        setScanned(true);
        await delay(500);
        if(scanned){
            return;
        }
        else{
            navigation.navigate('Data', { barcode: data })
        }
    };

    if (hasPermission === null) {

        return (
          <View style={{width: '100%', height: '100%', flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text>Molimo dozvolite pristup kameri.</Text>
          </View>
        )
    }

    if (hasPermission === false) {
        return <Text>No access to camera</Text>;
    }

    return(
        <BarCodeScanner
            onBarCodeScanned={handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
        />
    )
} 

export default ScanScreen;