import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { colors, motion, radius, shadows, typography } from '../tokens';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastOptions {
  message: string;
  variant?: ToastVariant;
  /** ms before auto-hide. Default 2400. */
  duration?: number;
}

type ShowToast = (options: ToastOptions) => void;

const ToastContext = createContext<ShowToast | null>(null);

export function useToast(): ShowToast {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

const VARIANT_STYLE: Record<ToastVariant, { bg: string; glyph: string }> = {
  success: { bg: colors.success, glyph: '✓' },
  error: { bg: colors.danger, glyph: '!' },
  info: { bg: colors.brand, glyph: 'i' },
};

interface ActiveToast extends ToastOptions {
  id: number;
}

export function ToastProvider({ children }: PropsWithChildren) {
  const [toast, setToast] = useState<ActiveToast | null>(null);
  const translateY = useSharedValue(-140);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();

  const hide = useCallback(() => {
    translateY.value = withTiming(-140, { duration: motion.durationBase, easing: Easing.in(Easing.cubic) });
  }, [translateY]);

  const show = useCallback<ShowToast>(
    (options) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setToast({ ...options, id: Date.now() });
      translateY.value = withSpring(0, motion.springSoft);
      timerRef.current = setTimeout(hide, options.duration ?? 2400);
    },
    [hide, translateY],
  );

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const value = useMemo(() => show, [show]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <ToastContext.Provider value={value}>
      {children}
      <View pointerEvents="none" style={styles.overlay}>
        <Animated.View
          key={toast?.id}
          style={[
            styles.toast,
            toast ? { backgroundColor: VARIANT_STYLE[toast.variant ?? 'info'].bg } : undefined,
            shadows.lg,
            containerStyle,
          ]}
          accessibilityLiveRegion="polite"
          accessibilityRole="alert"
        >
          {toast ? (
            <>
              <View style={styles.glyphCircle}>
                <Text style={styles.glyph}>{VARIANT_STYLE[toast.variant ?? 'info'].glyph}</Text>
              </View>
              <Text style={styles.message} numberOfLines={2}>
                {toast.message}
              </Text>
            </>
          ) : null}
        </Animated.View>
      </View>
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingTop: 52,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    maxWidth: '88%',
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.pill,
    marginBottom: 8,
  },
  glyphCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  message: {
    ...typography.label,
    color: '#FFFFFF',
    flexShrink: 1,
  },
});
