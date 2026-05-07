import { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { colors } from '../theme/colors';

export default function AutocompleteInput({
  label,
  data,
  searchKey,
  onSelect,
  placeholder,
  value,
  error
}) {
  const [query, setQuery] = useState(value || '');
  const [filteredData, setFilteredData] = useState([]);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    if (query && isFocused) {
      const filtered = data
        .filter(item => item[searchKey] && item[searchKey].toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => a[searchKey].localeCompare(b[searchKey]));
      setFilteredData(filtered);
    } else {
      if (isFocused && !query && data) {
        setFilteredData([...data].sort((a, b) => a[searchKey].localeCompare(b[searchKey])));
      } else {
        setFilteredData([]);
      }
    }
  }, [query, data, searchKey, isFocused]);

  const handleSelect = (item) => {
    setQuery(item[searchKey]);
    setFilteredData([]);
    setIsFocused(false);
    onSelect(item);
  };

  return (
    <View style={[styles.container, { zIndex: isFocused ? 100 : 1 }]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError]}
        value={query}
        onChangeText={(text) => {
          setQuery(text);
          if (!text) onSelect(null);
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setTimeout(() => setIsFocused(false), 200);
        }}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedText}
      />
      {error && <Text style={styles.error}>{error}</Text>}

      {isFocused && filteredData.length > 0 && (
        <View style={styles.dropdownContainer}>
          <ScrollView style={styles.dropdown} keyboardShouldPersistTaps="handled">
            {filteredData.map((item, index) => (
              <TouchableOpacity
                key={item.id || index}
                style={[styles.item, index === filteredData.length - 1 && styles.lastItem]}
                onPress={() => handleSelect(item)}
              >
                <Text style={styles.itemText}>{item[searchKey]}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
    position: 'relative',
  },
  label: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.roseGold,
  },
  error: {
    marginTop: 4,
    fontSize: 12,
    color: colors.roseGold,
  },
  dropdownContainer: {
    position: 'absolute',
    top: 75,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    maxHeight: 200,
    ...Platform.select({
      web: { zIndex: 1000 },
    }),
  },
  dropdown: {
    maxHeight: 200,
  },
  item: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  itemText: {
    fontSize: 14,
    color: colors.text,
  }
});
