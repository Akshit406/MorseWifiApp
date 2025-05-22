import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  PermissionsAndroid,
  Platform,
  Alert,
  StyleSheet,
} from "react-native";
import WifiManager from "react-native-wifi-reborn";

export default function App() {
  const [message, setMessage] = useState<string>("");

  const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,

      ]);
      return Object.values(granted).every(
        (g) => g === PermissionsAndroid.RESULTS.GRANTED
      );
    }
    return true;
  };

  const calculateMorseDelay = (text: string): number => {
    const unit = 200; // ms per dot unit
    const morseMap: Record<string, string> = {
      A: ".-",
      B: "-...",
      C: "-.-.",
      D: "-..",
      E: ".",
      F: "..-.",
      G: "--.",
      H: "....",
      I: "..",
      J: ".---",
      K: "-.-",
      L: ".-..",
      M: "--",
      N: "-.",
      O: "---",
      P: ".--.",
      Q: "--.-",
      R: ".-.",
      S: "...",
      T: "-",
      U: "..-",
      V: "...-",
      W: ".--",
      X: "-..-",
      Y: "-.--",
      Z: "--..",
      "0": "-----",
      "1": ".----",
      "2": "..---",
      "3": "...--",
      "4": "....-",
      "5": ".....",
      "6": "-....",
      "7": "--...",
      "8": "---..",
      "9": "----.",
    };

    let totalUnits = 0;
    for (const char of text.toUpperCase()) {
      const morse = morseMap[char];
      if (morse) {
        for (const symbol of morse) {
          totalUnits += symbol === "." ? 1 : 3; // dot=1, dash=3 units
          totalUnits += 1; // space between parts of a letter
        }
        totalUnits += 2; // space between letters
      }
    }
    return totalUnits * unit;
  };

  const sendMessage = async () => {
    if (!message.trim()) {
      Alert.alert("Please enter a message.");
      return;
    }

    const hasPerm = await requestPermissions();
    if (!hasPerm) {
      Alert.alert("Permissions required.");
      return;
    }

    try {
      // Connect to morse transmitter Wi-Fi
      await WifiManager.connectToProtectedSSID(
        "morse transmitter",
        "12345678",
        false,
        false
      );
      Alert.alert("Connected to morse transmitter");

      // Send message to transmitter
      const url1 = `http://192.168.4.1/send?msg=${encodeURIComponent(message)}`;
      await fetch(url1);
      Alert.alert("Message sent to transmitter");

      // Connect to iphone 17 Wi-Fi
      await WifiManager.connectToProtectedSSID(
        "iphone 17",
        "ballu1234",
        false,
        false
      );
      Alert.alert("");

      // Wait delay based on Morse code timing
      const delay = calculateMorseDelay(message);
      console.log("Waiting delay (ms):", delay);
      await new Promise((res) => setTimeout(res, delay));

      // Send message again to receiver
      const url2 = `http://192.168.4.1/send?msg=${encodeURIComponent(message)}`;
      await fetch(url2);
      Alert.alert("Message sent to receiver");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Unknown error");
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>MORSE CODE TRANSMITER</Text>
      <TextInput
        style={styles.input}
        placeholder="Type message here"
        value={message}
        onChangeText={setMessage}
      />
      <Button title="Send Morse Message" onPress={sendMessage} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#666",
    padding: 10,
    marginBottom: 20,
    borderRadius: 6,
  },
});
