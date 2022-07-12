import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Alert, Image, TouchableOpacity } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useEffect, useState } from 'react';

import { Audio } from 'expo-av';


export default function App() {

  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [itemData, setItemData] = useState(null);
  const [sound, setSound] = useState(null);
  const [introSound, setIntroSound] = useState(null);
  const [isLoading, setIsloading] = useState(false);

  useEffect(() => {

    (async () => {

      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');

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

      await introSound.playAsync();
      await introSound.unloadAsync();
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    
    fetchBarcodeData(data);
  };

  const fetchBarcodeData = async(barcode) => {
    setIsloading(true);
    try{
      const result = await fetch(`https://blind-guide.herokuapp.com/api/mobile/get-product-details/${barcode}`);
      const data = await result.json();
      if(data.message === "Could not find product for the provided id"){
        Alert.alert(
          "Greška",
          "Ovaj proizvod nije pronađen",
          [
            {text: "Skeniraj ponovno.",onPress: () => setScanned(false),style: "cancel"}
          ]
        );
      }
      else{
        setItemData(data);

        const audioFileArray = data.product.audioLink.split('/'); 
        const audioFile = audioFileArray[audioFileArray.length - 1];
        await Audio.setAudioModeAsync({
          staysActiveInBackground: true,
        });
        const { sound } = await Audio.Sound.createAsync(
            {uri: 'https://blind-guide.herokuapp.com/storage/audio/' + audioFile},
            //require('../assets/zelda.mp3'), <--this works
            {
                shouldPlay: true,
                rate: 1.0,
                shouldCorrectPitch: false,
                volume: 1.0,
                isMuted: false,
                isLooping: false,
            },
        );
        setSound(sound);
        await sound.playAsync();
      }
    } catch(e){
      console.log(e);
    }
    setIsloading(false);
  }

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

  if(isLoading){
    return(
      <View style={{width: '100%', height: '100%', flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Image source={require('./assets/loading.jpg')} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {!scanned && <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />}
      {scanned && itemData === null &&
      <View>
        <Button title={'Skeniraj ponovno'} onPress={setScanned(false)} />
      </View>
      }
      {scanned && itemData !== null &&
      <View style={{width: '100%', height: '100%', flex: 1}}>
        <View style={{flexDirection:'row', maxHeight: 50, marginTop: 30, alignItems: 'center', backgroundColor: '#fff'}}>
          <TouchableOpacity onPress={() => {setScanned(false); sound.unloadAsync(); setItemData(null)}} style={{width: 40, height: 40, marginLeft: 20}}>
            <Image style={{width: 40, height: 40}} source={require('./assets/left-arrow.png')} />
          </TouchableOpacity>
          <Text style={{color: '#408cc8', fontWeight: 'bold', fontSize: 26, width: '100%', textAlign: 'center', marginLeft: -50}}>BlindGuide</Text>
        </View>
        <View style={{width: '100%', height: '100%', backgroundColor: '#ff914e', padding: 50, marginTop: 40}}>

          <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 26}}>{itemData.product.productName}</Text>
          <Text style={{color: '#fff', fontSize: 22}}>{itemData.product.productDescription}</Text>
          <Text style={{color: '#fff', fontSize: 22}}>{itemData.product.productPrice} KM</Text>

          <View style={{marginTop: 80, marginLeft: 'auto', marginRight: 'auto', width: 80, height: 80, backgroundColor: '#408cc8', borderRadius: 40, justifyContent: 'center', alignItems: 'center'}}>
            <Image style={{width: 40, height: 40}} source={require('./assets/audio_image.png')} />
          </View>

        </View>
      </View>
      }
    </View>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
  },
});
