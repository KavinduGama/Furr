import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { CelebrationBurst, colors, motion, radius, space, typography } from '@furr/ui';
import { useRoutines } from '../context/routines';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function DailyChecklist() {
  const { tasks, toggleTask } = useRoutines();
  const [burst, setBurst] = useState(0);
  const wasComplete = useRef(false);

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.isCompleted === b.isCompleted) return 0;
    return a.isCompleted ? 1 : -1;
  });

  const total = tasks.length;
  const completed = tasks.filter((t) => t.isCompleted).length;
  const progress = total === 0 ? 0 : completed / total;
  const isComplete = total > 0 && completed === total;

  useEffect(() => {
    if (isComplete && !wasComplete.current) {
      wasComplete.current = true;
      setBurst((n) => n + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
    if (!isComplete) wasComplete.current = false;
  }, [isComplete]);

  const progressValue = useSharedValue(progress);
  useEffect(() => {
    progressValue.value = withTiming(progress, {
      duration: motion.durationSlow,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, progressValue]);

  const CIRCLE_RADIUS = 24;
  const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset:
      CIRCLE_CIRCUMFERENCE - progressValue.value * CIRCLE_CIRCUMFERENCE,
  }));

  if (total === 0) return null;

  return (
    <View style={styles.container}>
      <CelebrationBurst trigger={burst} />
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={typography.heading}>Daily Checklist</Text>
          <Text style={styles.subtitle}>
            {isComplete ? 'Perfect day — all done!' : `${completed} of ${total} completed today`}
          </Text>
        </View>
        <View style={styles.ringContainer}>
          <Svg width={60} height={60} viewBox="0 0 60 60">
            <Circle
              cx={30}
              cy={30}
              r={CIRCLE_RADIUS}
              stroke={colors.line}
              strokeWidth={5}
              fill="none"
            />
            <AnimatedCircle
              cx={30}
              cy={30}
              r={CIRCLE_RADIUS}
              stroke={colors.brand}
              strokeWidth={5}
              fill="none"
              strokeDasharray={CIRCLE_CIRCUMFERENCE}
              animatedProps={animatedProps}
              strokeLinecap="round"
              transform="rotate(-90 30 30)"
            />
          </Svg>
          <View style={styles.ringTextContainer}>
            <Text style={styles.ringText}>{Math.round(progress * 100)}%</Text>
          </View>
        </View>
      </View>

      <View style={styles.taskList}>
        {sortedTasks.map((task) => (
          <TaskRow
            key={task.id}
            title={task.title}
            isCompleted={task.isCompleted}
            onToggle={() => toggleTask(task.id, !task.isCompleted)}
          />
        ))}
      </View>
    </View>
  );
}

function TaskRow({
  title,
  isCompleted,
  onToggle,
}: {
  title: string;
  isCompleted: boolean;
  onToggle: () => void;
}) {
  const checkScale = useSharedValue(1);
  const checkboxStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    backgroundColor: withTiming(isCompleted ? colors.brand : 'transparent', {
      duration: motion.durationFast,
    }),
    borderColor: withTiming(isCompleted ? colors.brand : colors.line, {
      duration: motion.durationFast,
    }),
  }));

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isCompleted }}
      accessibilityLabel={title}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        checkScale.value = withSpring(1.25, { damping: 10, stiffness: 300 }, () => {
          checkScale.value = withSpring(1, motion.spring);
        });
        onToggle();
      }}
      style={[styles.taskItem, isCompleted && styles.taskItemCompleted]}
    >
      <Animated.View style={[styles.checkbox, checkboxStyle]}>
        {isCompleted && <Ionicons name="checkmark" size={16} color="#fff" />}
      </Animated.View>
      <View style={styles.taskContent}>
        <Text style={[styles.taskTitle, isCompleted && styles.taskTitleCompleted]}>
          {title}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.lg,
    marginHorizontal: space.lg,
    marginTop: space.md,
    overflow: 'hidden',
    shadowColor: colors.ink,
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: space.lg,
  },
  subtitle: {
    ...typography.caption,
    color: colors.muted,
    marginTop: 2,
  },
  ringContainer: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.ink,
  },
  taskList: {
    gap: space.md,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: space.xs,
  },
  taskItemCompleted: {
    opacity: 0.7,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: space.md,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.muted,
  },
});
