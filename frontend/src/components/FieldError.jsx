import { Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function FieldError({ message }) {
  if (!message) return null;
  return <Text style={styles.error}>{message}</Text>;
}

const styles = StyleSheet.create({
  error: {
    color: '#D32F2F',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
  },
});
