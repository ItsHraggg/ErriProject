/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useState} from 'react';
import type {Node} from 'react';
import {BleManager, Characteristic} from 'react-native-ble-plx';
import {
  Image,
  ImageBackground, Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

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
  const [High, setHigh] = useState(true);
  const [Device, setDevice] = useState(null);
  const [DeviceId, setDeviceId] = useState(null);
  const [SwitchCase, setSwitchCase] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [FlameIntensity, setFlameIntensity] = useState(false);

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
                        ///////HERE SHOULD GO THE INITIAL STATE OF THE DEVICE
                        manager.readCharacteristicForDevice(connectedDevice.id, characteristic.serviceUUID, characteristic.uuid).then((characteristic) => {
                          if (characteristic.value[0] === 'On') {
                            setOn(True)
                          } else if (characteristic.value[0] === 'Off') {
                            setOn(False)
                          }
                            if (characteristic.value[1] === 'High') {
                                setHigh(True)
                            } else if (characteristic.value[1] === 'Low') {
                                setHigh(False)
                            }
                            if (characteristic.value[2] === '0') {
                                setLevel(0)
                            } else if (characteristic.value[2] === '25') {
                                setLevel(25)
                            } else if (characteristic.value[2] === '50') {
                                setLevel(50)
                            } else if (characteristic.value[2] === '75') {
                                setLevel(75)
                            } else if (characteristic.value[2] === '100') {
                                setLevel(100)
                            }
                        })

                        console.log('Initial request Sent');
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
        getServicesAndCharacteristics(device).then(characteristic => {
            Device.writeCharacteristicWithResponseForService(
            characteristic.serviceUUID,
            characteristic.uuid,
            'EA==',
            )
              .then((characteristic) => {
                manager.readCharacteristicForDevice(DeviceId, characteristic.serviceUUID, characteristic.uuid).then((characteristic) => {
                  if (characteristic.value === 'EA==') {
                    setOn(!On);
                  }
                })
              })
            .catch(error => {
                console.log(error);
            });

        });
        });
    };

    const sendValue2 = () => {
        if (!isConnected) {
        console.log('not connected');
        return;
        }
        Device.discoverAllServicesAndCharacteristics().then(device => {
        getServicesAndCharacteristics(device).then(characteristic => {
            Device.writeCharacteristicWithResponseForService(
            characteristic.serviceUUID,
            characteristic.uuid,
            'IA==',
            )
            .then((characteristic) => {
                manager.readCharacteristicForDevice(DeviceId, characteristic.serviceUUID, characteristic.uuid).then((characteristic) => {
                    if (characteristic.value === 'IA==') {
                        setHigh(!High);
                    }
                })
            })
            .catch(error => {
                console.log(error);
            });
        });
        });
    };




    const getData = () => {
      if (!isConnected) {
        console.log('not connected');
        return;
      }
      Device.discoverAllServicesAndCharacteristics().then(device => {
        getServicesAndCharacteristics(device).then(characteristic => {
          const subscription = Device.monitorCharacteristicForService(
            characteristic.serviceUUID,
            characteristic.uuid,
            (error, characteristic) => {
              MonitorSet.add(characteristic.value)
              if (MonitorSet.has("EA==")) {
                setOn(!On);
                MonitorSet.clear()
              } else if (MonitorSet.has("IA==")) {
                setHigh(!High);
                MonitorSet.clear()
              }
                subscription.remove()
            });
        });
      });
    };

    if (Device) {
      getData();
    }

  React.useEffect(() => {
    const subscription = manager.onStateChange(async state => {
      const permission_android = await request(
        PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
      );
      const permission_ios = await request(
        PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL,
      );
      if (permission_ios || permission_android) {
        if (state === 'PoweredOff') {
          if (Platform.OS === 'android') {
            if (Platform.Version >= 29) {
              await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
            } else {
              await request(PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION);
            }
            await manager.enable();
          } else if (Platform.OS === 'ios') {
            await Linking.openURL('App-Prefs:root=Bluetooth');
          }
        }
      }
      connectToDevice();
    }, true);

  });

  return (
    <View>
      <ImageBackground
        source={require('./assets/Background.png')}
        style={styles.image}
        imageStyle={styles.image_imageStyle}>
        <TouchableOpacity
          style={styles.image11}
          activeOpacity={0.2}
          // onPress={() => {
          //   setOn(!On);
          // }}

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
                  : require('./assets/Percentage100.png')
              }
              resizeMode="contain"
              style={styles.image4}
            />
            <Text style={styles.waterLevel}>WATER{'\n'}LEVEL</Text>
          </View>
          <TouchableOpacity
            style={styles.image12}
            activeOpacity={0.1}
            // onPress={() => {
            //   setHigh(!High);
            // }}
            onPress={() => {
              // setHigh(!High);
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
              style={styles.image3}
            />
          </TouchableOpacity>
          <Text style={styles.flameIntensity}>FLAME{'\n'}INTENSITY</Text>
        </View>
        <Image
          source={require('./assets/Logo.png')}
          resizeMode="contain"
          style={styles.image5}
        />
      </ImageBackground>
    </View>
  );
};


const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
  image_imageStyle: {},
  image11: {
    width: '50%',
    height: '40%',
    top: '10%',
    resizeMode: 'stretch',
  },
  image2: {
    width: '150%',
    height: '100%',
    left: '25%',
    top: '-10%',
  },
  flameIntensity: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    fontSize: 16,
    position: 'absolute',
    bottom: '90%',
    left: '85%',
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
  },
  image12: {
    width: '50%',
    height: '100%',
    top: '4%',
    left: '100%',
    resizeMode: 'center',
  },

  //fix flame power
  image4StackRow: {
    height: '13%',
    width: '100%',
    flexDirection: 'row',
    right: '7.5%',
    top: '10%',
  },
  image5: {
    width: '30%',
    height: '30%',
    top: '20%',
    left: '35%',
    opacity: 0.7,
  },
});

export default App;
