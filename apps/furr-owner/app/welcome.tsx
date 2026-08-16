import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, radius, space, Button } from '@furr/ui';

const maxHero = require('../assets/furr/max-hero-editorial.png');

export default function WelcomeScreen() {
  return (
    <View style={styles.page}>
      
      {/* Top Brand Section */}
      <View style={styles.brandContainer}>
        <Ionicons name="paw" size={48} color={colors.brand} style={styles.pawIcon} />
        <Text style={styles.wordmark}>Furr</Text>
        <Text style={styles.tagline}>A happier, healthier{'\n'}pet life</Text>
      </View>

      {/* Center Image */}
      <View style={styles.imageContainer}>
        <Image source={maxHero} style={styles.image} resizeMode="contain" />
      </View>

      {/* Bottom Actions */}
      <View style={styles.actionsContainer}>
        <Button 
          label="Get Started" 
          variant="primary" 
          onPress={() => router.push('/auth/phone' as never)} 
        />
        <Button 
          label="Log In" 
          variant="secondary" 
          onPress={() => router.push('/auth/phone' as never)} 
        />
        <Text style={styles.legal}>
          By continuing, you agree to our{'\n'}
          <Text style={styles.legalLink}>Terms & Privacy Policy</Text>
        </Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  page: { 
    flex: 1, 
    backgroundColor: colors.surface,
    paddingTop: 80,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  
  brandContainer: {
    alignItems: 'center',
    paddingHorizontal: space.xl,
  },
  pawIcon: {
    marginBottom: space.sm,
  },
  wordmark: { 
    color: colors.ink, 
    fontSize: 40, 
    letterSpacing: -1.5, 
    fontWeight: '900',
    marginBottom: space.xs,
  },
  tagline: {
    color: colors.muted,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '500',
    textAlign: 'center',
  },

  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: space.lg,
  },
  image: { 
    width: '100%', 
    height: '100%',
    maxHeight: 300,
  },

  actionsContainer: {
    paddingHorizontal: space.xl,
    gap: space.md,
  },
  legal: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: space.sm,
  },
  legalLink: {
    color: colors.brand,
    fontWeight: '700',
  },
});
