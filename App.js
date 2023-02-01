import React, {Component, useState} from 'react';
import type {Node} from 'react';
import {BleManager, Characteristic} from 'react-native-ble-plx';
import {
  Button,
  Image,
  ImageBackground, Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert, TouchableWithoutFeedback,
} from 'react-native';
import {NetInfo} from '@react-native-community/netinfo';

import {request, PERMISSIONS} from 'react-native-permissions';
import {
  openSettings,
  requestToEnable,
} from 'react-native-bluetooth-state-manager';
export const manager = new BleManager();

const App: () => Node = () => {


  const MonitorSet = new Set([]);
  const [On, setOn] = useState(false);
  const [Level, setLevel] = useState(0);
  const [Boo, setBoo] = useState(false);
  const [High, setHigh] = useState(true);
  const [Device, setDevice] = useState(null);
  const [DeviceId, setDeviceId] = useState(null);
  const [SwitchCase, setSwitchCase] = useState(false);
  const [NotConnectedDialog, setNotConnectedDialog] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [OverfillDialog, setOverfillDialog] = useState(null);
  const [FlameIntensity, setFlameIntensity] = useState(false);
  const [PreviousState, setPreviousState] = useState(null);

  const getServicesAndCharacteristics = device => {
    return new Promise((resolve, reject) => {
      device.services().then(services => {
        const characteristics = [];

        services.forEach((service, i) => {
          service.characteristics().then(c => {
            characteristics.push(c);

            if (i === services.length - 1) {
              const temp = characteristics.reduce((acc, current) => {
                return [...acc, ...current];
              }, []);
              const dialog = temp.find(
                  characteristic => characteristic.isWritableWithoutResponse,
              );
              if (!dialog) {
                reject('NOT Writable characteristic');
              }
              resolve(dialog);
            }
          });
        });
      });
    });
  };

  const connectToDevice = () => {
    manager.startDeviceScan(null, null, (error, foundDevice) => {
      if (error) {
        console.log(error);
        return;
      }
      if (foundDevice.name === 'BT05') {
        manager.stopDeviceScan();
        foundDevice
            .connect()
            .then(connectedDevice => {
              connectedDevice
                  .discoverAllServicesAndCharacteristics()
                  .then(device => {
                    getServicesAndCharacteristics(device)
                        .then(characteristic => {
                          device
                              .writeCharacteristicWithResponseForService(
                                  characteristic.serviceUUID,
                                  characteristic.uuid,
                                  'MA==',
                              )
                              .then(() => {
                                device.monitorCharacteristicForService(
                                    characteristic.serviceUUID,
                                    characteristic.uuid,
                                    (error, characteristic) => {
                                      if (characteristic) {
                                        MonitorSet.add(characteristic.value.split('///')[0]);

                                        if (MonitorSet.has('cDEucGljPTP')) {
                                          setOn(true);
                                          MonitorSet.clear();
                                        } else if (MonitorSet.has('cDEucGljPTT')) {
                                          setOn(false);
                                          MonitorSet.clear();
                                        } else if (MonitorSet.has('cDIucGljPTb')) {
                                          setHigh(true);
                                          MonitorSet.clear();
                                        } else if (MonitorSet.has('cDIucGljPTX')) {
                                          setHigh(false);
                                          MonitorSet.clear();
                                        } else if (MonitorSet.has('cDAucGljPTf')) {
                                          setLevel(0);
                                          MonitorSet.clear();
                                        } else if (MonitorSet.has('cDAucGljPTj')) {
                                          setLevel(25);
                                          MonitorSet.clear();
                                        } else if (MonitorSet.has('cDAucGljPTn')) {
                                          setLevel(50);
                                          MonitorSet.clear();
                                        } else if (MonitorSet.has('cDAucGljPTEw')) {
                                          setLevel(75);
                                          MonitorSet.clear();
                                        } else if (MonitorSet.has('cDAucGljPTEx')) {
                                          setLevel(100);
                                          MonitorSet.clear();
                                        } else if (MonitorSet.has('cGFnZSBwYWdlMv')) {
                                          setOverfillDialog(true)
                                          setBoo(true);
                                          MonitorSet.clear();
                                        }
                                      } else {
                                        console.log('no value');
                                        setIsConnected(false);
                                      }
                                    },
                                );
                              })
                              .catch(error => {
                                console.log(error);
                              });
                        })
                        .catch(error => {
                          console.log(error);
                        });
                  })
                  .catch(error => {
                    console.log(error);
                  });
              setDeviceId(connectedDevice.id);
              setIsConnected(true);
              setNotConnectedDialog(false)
              setDevice(connectedDevice);
            })
            .catch(error => {
              console.log(error);
            });
      }
    });
  };


  const sendValue1 = () => {
    if (!isConnected) {
      console.log('not connected');
      return;
    }
    Device.discoverAllServicesAndCharacteristics().then(device => {
      getServicesAndCharacteristics(device)
          .then(characteristic => {
            Device.writeCharacteristicWithResponseForService(
                characteristic.serviceUUID,
                characteristic.uuid,
                'EA==',
            );
          })
          .catch(error => {
            console.log(error);
          });
    });
  };

  const sendValue2 = () => {
    if (!isConnected) {
      console.log('not connected');
      return;
    }
    Device.discoverAllServicesAndCharacteristics().then(device => {
      getServicesAndCharacteristics(device)
          .then(characteristic => {
            Device.writeCharacteristicWithResponseForService(
                characteristic.serviceUUID,
                characteristic.uuid,
                'IA==',
            );
          })
          .catch(error => {
            console.log(error);
          });
    });
  };




  // const getData = () => {
  //   if (!isConnected) {
  //     console.log('not connected');
  //     return;
  //   }
  //   Device.discoverAllServicesAndCharacteristics().then(device => {
  //     getServicesAndCharacteristics(device).then(characteristic => {
  //       const subscription = Device.monitorCharacteristicForService(
  //           characteristic.serviceUUID,
  //           characteristic.uuid,
  //           (error, characteristic) => {
  //             if (characteristic) {
  //               MonitorSet.add(characteristic.value.split('///')[0]);
  //               MonitorSet.add(characteristic.value.split('///')[1]);
  //
  //               if (MonitorSet.has('cDEucGljPTP')) {
  //                 setOn(true);
  //                 MonitorSet.clear();
  //               } else if (MonitorSet.has('cDEucGljPTT')) {
  //                 setOn(false);
  //                 MonitorSet.clear();
  //               } else if (MonitorSet.has('cDIucGljPTb')) {
  //                 setHigh(true);
  //                 MonitorSet.clear();
  //               } else if (MonitorSet.has('cDIucGljPTX')) {
  //                 setHigh(false);
  //                 MonitorSet.clear();
  //               } else if (MonitorSet.has('cDAucGljPTf')) {
  //                 setLevel(0);
  //                 MonitorSet.clear();
  //               } else if (MonitorSet.has('cDAucGljPTj')) {
  //                 setLevel(25);
  //                 MonitorSet.clear();
  //               } else if (MonitorSet.has('cDAucGljPTn')) {
  //                 setLevel(50);
  //                 MonitorSet.clear();
  //               } else if (MonitorSet.has('cDAucGljPTEw')) {
  //                 setLevel(75);
  //                 MonitorSet.clear();
  //               } else if (MonitorSet.has('cDAucGljPTEx')) {
  //                 setLevel(100);
  //                 MonitorSet.clear();
  //               } else if (MonitorSet.has('cGFnZSBwYWdlMv')) {
  //                 console.log('overfill22222222');
  //                 MonitorSet.clear();
  //               }
  //             } else {
  //               console.log('no value');
  //             }
  //             subscription.remove()
  //           });
  //     });
  //   });
  // };
  //
  // if (Device) {
  //   getData();
  // }

  const SetInitial = () => {
    setOn(false);
    setLevel(0);
  };

  const CheckState = () => {
      manager.onStateChange(state => {
        const permission_android = request(
            PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
        );
        const permission_ios = request(
            PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL,
        );

        if (permission_ios || permission_android) {
          if (state === 'PoweredOff') {
            SetInitial()
            Alert.alert(
                'Bluetooth is off',
                'Please turn on bluetooth to use this app',
                [
                  {
                    text: 'OK', onPress: () => {
                      if (Platform.OS === 'android') {
                        manager.enable();
                      } else if (Platform.OS === 'ios') {
                        Linking.openURL('App-Prefs:root=Bluetooth');
                      }
                    }
                  },
                ],
            );
            if (Platform.OS === 'android') {
              if (Platform.Version >= 29) {
                request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
              } else {
                request(PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION);
              }
            }
          }
        }
        connectToDevice();
      }, true);
    }


    onBluetoothDisconnected = () => {
      console.log('disconnected');
      setOn(false);
      setLevel(0);
      setHigh(false);
      setOverfillDialog(false);
      setBoo(true);
      setConnected(false);
    };




  const seeChange = () => {
    if (manager.isDeviceConnected(DeviceId)) {
      console.log('connected');
    } else {
      console.log('disconnected');
      setConnected(false);
    }
  }

  if (OverfillDialog) {
    seeChange()
  }

  const showOverfillDialog = () => {
    if (OverfillDialog && Boo) {
      Alert.alert(
          'OVERFILL',
          'Drain Excess Water',
          [
            {
              text: 'OK', onPress: () => {
                setOverfillDialog(false);
              }
            },
          ])
      setBoo(false)

    }
  }

if (OverfillDialog) {
  showOverfillDialog()
}

  const handlePress = () => {
    Linking.openURL('https://www.facebook.com/people/Erri-Fireplaces/100063587050379/');
  };

  React.useEffect(() => {
    CheckState()
  }, []);

  React.useEffect(() => {
    setPreviousState(isConnected);
  }, [isConnected]);

  React.useEffect(() => {
    if (isConnected !== PreviousState) {
      console.log(`count has changed from ${PreviousState} to ${isConnected}`);
      if (isConnected === false && PreviousState === true) {
        SetInitial()
        connectToDevice()
      }
    }
  }, [isConnected, PreviousState]);

  return (
  <View>
        <ImageBackground
            source={require('./assets/Background.png')}
            style={styles.image}
            imageStyle={styles.image_imageStyle}>
          <TouchableOpacity
              style={styles.image11}
              activeOpacity={0.3}
              onPress={() => {
                sendValue1();
              }}
              hitSlop={{top: -20, bottom: -20, left: -70, right: 150}}>
            <Image
                source={
                  On
                      ? require('./assets/ButtonOn.png')
                      : require('./assets/ButtonOff.png')
                }
                resizeMode="contain"
                style={styles.image2}
            />
          </TouchableOpacity>

          <View style={styles.image4StackRow}>
            <View style={styles.image4Stack}>
              <Image
                  source={
                Level === 0
                    ? require('./assets/Percentage0.png')
                   : Level === 25
                        ? require('./assets/Percentage25.png')
                        : Level === 50
                            ? require('./assets/Percentage50.png')
                            : Level === 75
                                ? require('./assets/Percentage75.png')
                                : Level === 100
                                    ? require('./assets/Percentage100.png')
                                    : require('./assets/Percentage0.png')
                  }
                  resizeMode="contain"
                  style={styles.image4}
              />
              <Text style={styles.waterLevel}>WATER{'\n'}LEVEL</Text>
            </View>
            <TouchableOpacity
                style={styles.image12}
                activeOpacity={0.2}
                disabled={!On}
                onPress={() => {
                  sendValue2();
                }}
                hitSlop={{left: 0, bottom: -25, top: 0, right: -130}}>
              <Image
                  source={
                    High
                        ? require('./assets/FlameHigh.png')
                        : require('./assets/FlameLow.png')
                  }
                  resizeMode="contain"
                  style={On ? styles.image3 : styles.image3Off}
              />
            </TouchableOpacity>
            <Text style={On ? styles.flameIntensity : styles.flameIntensityOff}>
              FLAME{'\n'}INTENSITY
            </Text>
          </View>
          <TouchableOpacity
              style={styles.image5Touch}
              activeOpacity={0.7}
              onPress={handlePress}>
            <Image
                source={require('./assets/Logo.png')}
                resizeMode="contain"
                style={styles.image5}
            />
            </TouchableOpacity>
        </ImageBackground>
      </View>
  );
};

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
  OverfillDialog: {
    width: '100%',
    height: '100%',
  },
  image_imageStyle: {},
  image11: {
    width: '40%',
    height: '30%',
    top: '10%',
    left: '2%',
    resizeMode: 'stretch',
  },
  image2: {
    width: '200%',
    height: '115%',
    left: '20%',
    bottom: '10%',
  },
  flameIntensity: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    fontSize: 16,
    position: 'absolute',
    bottom: '90%',
    left: '85%',
  },
  flameIntensityOff: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    fontSize: 16,
    position: 'absolute',
    bottom: '90%',
    left: '85%',
    opacity: 0.3,
  },
  image4: {
    top: '0%',
    left: '50%',
    width: '85%',
    height: '85%',
    position: 'absolute',
    opacity: 0.9,
  },
  waterLevel: {
    top: '75%',
    left: '75%',
    position: 'absolute',
    color: 'rgba(255,255,255,1)',
    textAlign: 'center',
    width: '100%',
    height: '100%',
    fontSize: 16,
    opacity: 0.7,
  },
  image4Stack: {
    width: '50%',
    height: '110%',
    top: '20%',
  },
  image3: {
    width: '40%',
    height: '80%',
    resizeMode: 'contain',
    right: '3%',
    bottom: '3%',
  },
  image3Off: {
    width: '40%',
    height: '80%',
    resizeMode: 'contain',
    right: '3%',
    bottom: '3%',
    opacity: 0.3,
  },
  image12: {
    width: '50%',
    height: '85%',
    top: '6%',
    left: '110%',
    resizeMode: 'center',
  },

  image12Off: {
    width: '50%',
    height: '100%',
    top: '4%',
    left: '100%',
    resizeMode: 'center',
    opacity: 0.3,
  },
  //fix flame power
  image4StackRow: {
    height: '13%',
    width: '100%',
    flexDirection: 'row',
    right: '7.5%',
    top: '30%',
  },

  image5: {
    width: '140%',
    height: '110%',
    bottom: '20%',
    right: '20%',
    opacity: 0.7,
  },
  image5Touch: {
    width: '32.5%',
    height: '8%',
    alignSelf: "center",
    top: '37.5%',
    right: '0%',
  },
  image6: {
    width: "10%",
    height: "10%",
    bottom: '92.5%',
    left: '0%',
    position: 'absolute',
  },
});

export default App;
