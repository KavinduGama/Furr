import React, { useEffect, useMemo } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { colors } from '../tokens';

const PARTICLE_COUNT = 16;
const PALETTE = [colors.brand, colors.brandSoft, colors.accent, colors.success, '#EC4899'];
const GLYPHS = ['●', '●', '♥', '●', '✦'];

interface ParticleConfig {
  angleDeg: number;
  distance: number;
  size: number;
  color: string;
  glyph: string;
}

function makeParticles(count: number): ParticleConfig[] {
  const width = Dimensions.get('window').width;
  return Array.from({ length: count }, (_, i) => ({
    angleDeg: -30 + (240 / (count - 1)) * i + (i % 2 === 0 ? -6 : 6),
    distance: width * (0.12 + ((i * 37) % 40) / 400),
    size: 5 + ((i * 13) % 7),
    color: PALETTE[i % PALETTE.length],
    glyph: GLYPHS[i % GLYPHS.length],
  }));
}

interface ParticleProps {
  config: ParticleConfig;
  progress: SharedValue<number>;
}

function Particle({ config, progress }: ParticleProps) {
  const rad = (config.angleDeg * Math.PI) / 180;

  const animatedStyle = useAnimatedStyle(() => {
    const drift = progress.value * config.distance;
    const rise = progress.value * config.distance * 0.55;
    return {
      transform: [
        { translateX: Math.cos(rad) * drift },
        { translateY: Math.sin(rad) * drift * 0.4 - rise },
        { scale: interpolate(progress.value, [0, 0.2, 1], [0.4, 1.1, 0.7]) },
      ],
      opacity: interpolate(progress.value, [0, 0.08, 0.75, 1], [0, 1, 1, 0]),
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.particle, animatedStyle]}
    >
      <Text style={[styles.glyph, { fontSize: config.size + 4, color: config.color }]}>
        {config.glyph}
      </Text>
    </Animated.View>
  );
}

export interface CelebrationBurstProps {
  /** Increment this number to fire a burst. */
  trigger: number;
}

/**
 * Abstract confetti burst (dots, hearts, sparks). Renders nothing until triggered.
 * Place inside a relatively-positioned container; bursts from top-center.
 */
export function CelebrationBurst({ trigger }: CelebrationBurstProps) {
  const progress = useSharedValue(0);
  const particles = useMemo(() => makeParticles(PARTICLE_COUNT), []);

  useEffect(() => {
    if (!trigger) return;
    progress.value = 0;
    progress.value = withTiming(1, { duration: 950, easing: Easing.out(Easing.cubic) });
  }, [trigger, progress]);

  if (!trigger) return null;

  return (
    <View pointerEvents="none" style={styles.container}>
      {particles.map((config, index) => (
        <Particle key={index} config={config} progress={progress} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingTop: 24,
    zIndex: 20,
    elevation: 20,
  },
  particle: {
    position: 'absolute',
  },
  glyph: {
    fontWeight: '900',
  },
});
