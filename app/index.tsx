import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Dimensions,
  StatusBar,
  ScrollView,
} from 'react-native';
import Slider from '@react-native-community/slider';

const RemoteControl = () => {
  const [forwardBackward, setForwardBackward] = useState(0);
  const [leftRight, setLeftRight] = useState(0);
  const [host, setHost] = useState('http://192.168.18.250');
  const [statusMessage, setStatusMessage] = useState('Listo para conectar');
  const [isConnected, setIsConnected] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState(
    Dimensions.get('window')
  );

  useEffect(() => {
    const unlockScreenOerientation = async () => {
      await ScreenOrientation.unlockAsync();
    };
    unlockScreenOerientation();
  }, []);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setWindowDimensions(window);
    });
    StatusBar.setHidden(true);

    return () => subscription.remove();
  }, []);

  const isLandscape = windowDimensions.width > windowDimensions.height;

  const sendRequest = async (url: any) => {
    try {
      setStatusMessage(`Enviando: ${url}`);
      const response = await fetch(url, { method: 'GET' });
      const text = await response.text();
      console.log(text);
      setStatusMessage(`Último comando: ${url} - Respuesta: ${text}`);
      if (!isConnected) setIsConnected(true);
    } catch (error: any) {
      console.error('Error enviando solicitud:', error);
      setStatusMessage(`Error: ${error.message}`);
      setIsConnected(false);
    }
  };

  const processControl = (intensity: number, sides = false) => {
    if (!host.trim()) {
      setStatusMessage('Error: Dirección del host no válida');
      return;
    }

    if (!sides) {
      if (intensity > 0) {
        sendRequest(`${host}/forward?value=${intensity}`);
      } else if (intensity < 0) {
        sendRequest(`${host}/backward?value=${Math.abs(intensity)}`);
      } else {
        sendRequest(`${host}/stop`);
      }
    } else {
      if (intensity > 0) {
        sendRequest(`${host}/right?value=${intensity}`);
      } else if (intensity < 0) {
        sendRequest(`${host}/left?value=${Math.abs(intensity)}`);
      } else {
        sendRequest(`${host}/center`);
      }
    }
  };

  const testConnection = () => {
    if (!host.trim()) {
      setStatusMessage('Error: Dirección del host no válida');
      return;
    }
    sendRequest(`${host}/ping`);
  };

  const resetControls = () => {
    setForwardBackward(0);
    setLeftRight(0);
    processControl(0);
    processControl(0, true);
    setStatusMessage('Controles reseteados');
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      horizontal={false}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Control Remoto</Text>
          <View style={styles.hostContainer}>
            <Text style={styles.hostLabel}>Host:</Text>
            <TextInput
              style={[
                styles.hostInput,
                !isConnected && styles.hostDisconnected,
              ]}
              value={host}
              onChangeText={setHost}
              placeholder="Ingrese la dirección del host"
              placeholderTextColor="#999"
            />
            <View style={styles.buttonContainer}>
              <Text style={styles.connectButton} onPress={testConnection}>
                Conectar
              </Text>
              <Text style={styles.resetButton} onPress={resetControls}>
                Reset
              </Text>
            </View>
          </View>
        </View>

        <Text
          style={[styles.statusMessage, !isConnected && styles.statusError]}
        >
          {statusMessage}
        </Text>

        <View style={styles.controlsLayout}>
          <View style={styles.controlContainer}>
            <Text style={styles.sliderLabel}>
              Adelante/Atrás: {forwardBackward}
            </Text>
            <View style={styles.sliderWrapper}>
              <Slider
                style={styles.sliderVertical}
                minimumValue={-250}
                maximumValue={250}
                step={50}
                value={forwardBackward}
                minimumTrackTintColor="#4CAF50"
                maximumTrackTintColor="#FF5722"
                thumbTintColor="#2196F3"
                onValueChange={(value) => {
                  setForwardBackward(value);
                  processControl(value);
                }}
              />
              <View style={styles.sliderLabelsVertical}>
                <Text style={styles.sliderEndLabel}>Adelante</Text>
                <Text style={styles.sliderEndLabel}>Atrás</Text>
              </View>
            </View>
          </View>

          <View style={styles.controlContainer}>
            <Text style={styles.sliderLabel}>
              Izquierda/Derecha: {leftRight}
            </Text>
            <View style={styles.sliderWrapper}>
              <View style={styles.sliderLabelsHorizontal}>
                <Text style={styles.sliderEndLabel}>Izquierda</Text>
                <Text style={styles.sliderEndLabel}>Derecha</Text>
              </View>
              <Slider
                style={styles.sliderHorizontal}
                minimumValue={-250}
                maximumValue={250}
                step={50}
                value={leftRight}
                minimumTrackTintColor="#E91E63"
                maximumTrackTintColor="#2196F3"
                thumbTintColor="#FFC107"
                onValueChange={(value) => {
                  setLeftRight(value);
                  processControl(value, true);
                }}
              />
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 16,
    minHeight: '100%',
  },
  portraitWarning: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 20,
  },
  warningText: {
    color: '#FF5722',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  header: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  hostContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  hostLabel: {
    color: '#fff',
    fontSize: 16,
    marginRight: 8,
  },
  hostInput: {
    flex: 1,
    minWidth: 200,
    maxWidth: 400,
    backgroundColor: '#333',
    color: '#fff',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#555',
  },
  hostDisconnected: {
    borderColor: '#FF5722',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginLeft: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  connectButton: {
    backgroundColor: '#2196F3',
    color: '#fff',
    padding: 8,
    borderRadius: 8,
    textAlign: 'center',
    marginHorizontal: 4,
    marginVertical: 4,
    width: 80,
  },
  resetButton: {
    backgroundColor: '#FF5722',
    color: '#fff',
    padding: 8,
    borderRadius: 8,
    textAlign: 'center',
    marginHorizontal: 4,
    marginVertical: 4,
    width: 80,
  },
  statusMessage: {
    color: '#4CAF50',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  statusError: {
    color: '#FF5722',
  },
  controlsLayout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  controlContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderRadius: 9999,
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: '#333',
    margin: 16,
    minWidth: 200,
  },
  sliderLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  sliderWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  sliderHorizontal: {
    width: 240,
    height: 40,
  },
  sliderVertical: {
    width: 240,
    height: 240,
    transform: [{ rotate: '-90deg' }],
  },
  sliderLabelsHorizontal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 240,
    marginBottom: 8,
  },
  sliderLabelsVertical: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: 240,
    position: 'absolute',
    right: -60,
    top: 0,
  },
  sliderEndLabel: {
    color: '#aaa',
    fontSize: 12,
  },
});

export default RemoteControl;
