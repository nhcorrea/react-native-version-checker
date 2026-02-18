import { Text, View, StyleSheet } from 'react-native';
import {
  getCurrentVersion,
  getPackageName,
} from 'react-native-version-checker';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Package: {getPackageName()}</Text>
      <Text>Version: {getCurrentVersion()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
