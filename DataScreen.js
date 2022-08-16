import React from 'react';
import { StyleSheet, Text, View, Button, Alert, Image, TouchableOpacity, ActivityIndicator, BackHandler } from 'react-native';
import { useEffect, useState } from 'react';

import { Audio } from 'expo-av';
import { CommonActions } from '@react-navigation/native';

const DataScreen = ({ navigation, route }) => {

    const [isLoading, setIsloading] = useState(true);
    const [itemData, setItemData] = useState(null);
    const [scannedSound, setScannedSound] = useState(null);

    useEffect(() => {
        (async () => {

            const { awaitSound } = await Audio.Sound.createAsync(
                require('./assets/scanned.mp3'),
                {
                    shouldPlay: true,
                    rate: 1.0,
                    shouldCorrectPitch: false,
                    volume: 1.0,
                    isMuted: false,
                    isLooping: false,
                },
              );
            
              if(scannedSound && isLoading){
                await awaitSound.playAsync();
                await awaitSound.unloadAsync();
              }
            
              const barcode = route.params.barcode;

              try{

                const result = await fetch(`https://blind-guide.herokuapp.com/api/mobile/get-product-details/${barcode}`);
                const data = await result.json();
          
                if(data.message === "Could not find product for the provided id"){
                  Alert.alert(
                    "Greška",
                    "This product does not exist",
                    [
                      {text: "Scan again.",onPress: () => {
                        const resetAction = CommonActions.reset({
                            index:0,
                            routes: [{name: 'Scan'}]
                        });
                        navigation.dispatch(resetAction);
                      }, style: "cancel"}
                    ]
                  );
                }
                else{
                  setItemData(data);
          
                  const audioFileArray = data.product.audioLink.split('/'); 
                  const audioFile = audioFileArray[audioFileArray.length - 1];

                  const { productSound } = await Audio.Sound.createAsync(
                      {uri: 'https://blind-guide.herokuapp.com/storage/audio/' + audioFile},
                      {
                          shouldPlay: true,
                          rate: 1.0,
                          shouldCorrectPitch: false,
                          volume: 1.0,
                          isMuted: false,
                          isLooping: false,
                      },
                  );

                  setScannedSound(productSound);
          
                  await scannedSound.playAsync();
                }
              } catch(e){
                console.log(e);
              }
              setIsloading(false);

          })();
    }, [route.params.barcode]);

    BackHandler.addEventListener('hardwareBackPress', function(){
      setScannedSound(null);
    })

    if(isLoading){
        return(
            <View style={{width: '100%', height: '100%', flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <ActivityIndicator style={{width: 200, height: 200, marginBottom: 120}} size='large' />
                <Text style={{color:'#408cc8', fontSize:20, fontWeight:'bold'}}>Loading</Text>
            </View>
        )
    }

    if(itemData === null){
        return(
            <View>
              <Button title={'Skeniraj ponovno'} onPress={() => {navigation.navigate('Scan', {reset:true})}}/>
            </View>
        )
    }

    return(
        <View style={{width: '100%', height: '100%', flex: 1}}>
            <View style={{width: '100%', height: '100%', backgroundColor: '#ff914e', padding: 20}}>

            <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 26, marginBottom: 20}}>{itemData.product.productName}</Text>
            <Text style={{color: '#fff', fontSize: 22, marginBottom: 20}}>{itemData.product.productDescription}</Text>
            <Text style={{color: '#fff', fontSize: 22, marginBottom: 20}}>{itemData.product.productPrice} KM</Text>

            <TouchableOpacity onPress={async () => {if(scannedSound){await scannedSound.stopAsync(); await scannedSound.playAsync()}}}>
                <View style={{marginTop: 80, marginLeft: 'auto', marginRight: 'auto', width: 80, height: 80, backgroundColor: '#408cc8', borderRadius: 40, justifyContent: 'center', alignItems: 'center'}}>
                <Image style={{width: 40, height: 40}} source={require('./assets/audio_image.png')} />
                </View>
            </TouchableOpacity>
            </View>
        </View>
    )
} 

export default DataScreen;