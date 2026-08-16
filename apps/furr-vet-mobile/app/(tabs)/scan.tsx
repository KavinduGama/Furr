import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@furr/ui';
import { useVetGrants } from '@/src/context/grants';

export default function VetScanScreen() {
  const { redeemCode, isLoading } = useVetGrants();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleRedeem = async () => {
    if (!code.trim()) return;
    setError(null);
    try {
      const grant = await redeemCode(code.trim());
      router.push(`/pet/${grant.petId}` as any);
      setCode('');
    } catch {
      setError('Could not redeem code. Please verify and try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Patient Admission &amp; Intake</Text>
          <Text style={styles.subTitle}>
            Enter the 6-character grant code shown on the owner&apos;s Furr mobile app.
          </Text>
        </View>

        {/* Optical Scanner Preview Simulation */}
        <View style={styles.cameraBox}>
          <View style={styles.targetFrame}>
            <Ionicons name="scan-outline" size={80} color="#006B78" />
          </View>
          <Text style={styles.scanHint}>Align QR Code within frame</Text>
        </View>

        {/* Manual Input Form */}
        <View style={styles.card}>
          <Text style={styles.inputLabel}>OR ENTER 6-DIGIT REDEMPTION CODE</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. TEST12"
            placeholderTextColor="#9E9E9E"
            value={code}
            onChangeText={(t) => setCode(t.toUpperCase())}
            autoCapitalize="characters"
            maxLength={10}
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <Pressable
            onPress={handleRedeem}
            disabled={isLoading || !code.trim()}
            style={({ pressed }) => [
              styles.button,
              (!code.trim() || isLoading) && styles.buttonDisabled,
              pressed && { opacity: 0.8 },
            ]}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Unlock &amp; View Medical Record</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
    paddingBottom: 90,
  },
  header: {
    marginTop: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#10242D',
  },
  subTitle: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 4,
    lineHeight: 18,
  },
  cameraBox: {
    height: 220,
    backgroundColor: '#0F172A',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  targetFrame: {
    width: 140,
    height: 140,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#006B78',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 107, 120, 0.1)',
  },
  scanHint: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '700',
    marginTop: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#006B78',
    letterSpacing: 1,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#CFD8DC',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '900',
    color: '#10242D',
    letterSpacing: 3,
    textAlign: 'center',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 12,
    color: '#D32F2F',
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#006B78',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#B0BEC5',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
