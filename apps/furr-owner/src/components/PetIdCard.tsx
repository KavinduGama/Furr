import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, Dimensions } from 'react-native';
import type { Pet } from '@furr/core';
import { colors, radius, space, shadows } from '@furr/ui';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');
// Card width is screen width minus padding on both sides, ensuring a peek effect for next card
export const CARD_WIDTH = width * 0.85;

interface PetIdCardProps {
  pet: Pet;
  isActive: boolean;
}

export function PetIdCard({ pet, isActive }: PetIdCardProps) {
  // Calculate Age
  let ageString = 'Unknown age';
  if (pet.birthDate) {
    const dob = new Date(pet.birthDate);
    const diffMs = Date.now() - dob.getTime();
    const ageDate = new Date(diffMs); 
    const years = Math.abs(ageDate.getUTCFullYear() - 1970);
    const months = ageDate.getUTCMonth();
    if (years > 0) {
      ageString = `${years} yr${years !== 1 ? 's' : ''}`;
    } else if (months > 0) {
      ageString = `${months} mo${months !== 1 ? 's' : ''}`;
    } else {
      ageString = 'Puppy/Kitten';
    }
  }

  return (
    <Pressable 
      onPress={() => router.push('/pet-detail' as never)}
      style={[styles.card, isActive && styles.cardActive]}
    >
      {/* Background decoration */}
      <View style={styles.decorationCircle1} />
      <View style={styles.decorationCircle2} />

      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>FURR IDENTIFICATION</Text>
        <Ionicons name="shield-checkmark" size={16} color="rgba(255,255,255,0.7)" />
      </View>

      <View style={styles.mainContent}>
        {/* Photo / Avatar */}
        <View style={styles.photoWrap}>
          {pet.photoPath ? (
            <Image source={{ uri: pet.photoPath }} style={styles.photo} />
          ) : (
            <View style={styles.emojiWrap}>
              <Text style={styles.emoji}>{pet.species === 'cat' ? '🐈' : '🐕'}</Text>
            </View>
          )}
        </View>

        {/* Details */}
        <View style={styles.details}>
          <Text style={styles.name} numberOfLines={1}>{pet.name}</Text>
          <Text style={styles.breed} numberOfLines={1}>{pet.breed || 'Mixed Breed'}</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>AGE</Text>
              <Text style={styles.infoValue}>{ageString}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>SEX</Text>
              <Text style={styles.infoValue}>{pet.sex === 'male' ? 'M' : pet.sex === 'female' ? 'F' : '?'}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Footer / ID Number */}
      <View style={styles.footer}>
        <Text style={styles.idNumber}>{pet.id.toUpperCase().substring(0, 12)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: 200,
    backgroundColor: colors.brand,
    borderRadius: radius.xl,
    padding: space.lg,
    overflow: 'hidden',
    position: 'relative',
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
    
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  cardActive: {
    opacity: 1,
    transform: [{ scale: 1 }],
  },
  
  decorationCircle1: {
    position: 'absolute',
    top: -50,
    right: -20,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  decorationCircle2: {
    position: 'absolute',
    bottom: -80,
    left: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space.md,
  },
  headerTitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },

  mainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
    flex: 1,
  },
  
  photoWrap: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  emojiWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 36,
  },

  details: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  breed: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
    marginBottom: 8,
  },
  
  infoRow: {
    flexDirection: 'row',
    gap: space.md,
  },
  infoBox: {},
  infoLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 2,
  },
  infoValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  footer: {
    marginTop: space.sm,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  idNumber: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '600',
    letterSpacing: 2,
  },
});
