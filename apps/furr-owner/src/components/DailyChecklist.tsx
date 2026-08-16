import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedProps, useSharedValue, withTiming, Easing, withSpring } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { useRoutines } from '../context/routines';
import { colors, radius, space } from '@furr/ui';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function DailyChecklist() {
  const { tasks, toggleTask } = useRoutines();
  
  // Sort tasks: uncompleted first, then completed
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.isCompleted === b.isCompleted) return 0;
    return a.isCompleted ? 1 : -1;
  });

  const total = tasks.length;
  const completed = tasks.filter(t => t.isCompleted).length;
  const progress = total === 0 ? 0 : completed / total;

  // Animation for the progress ring
  const progressValue = useSharedValue(progress);
  useEffect(() => {
    progressValue.value = withTiming(progress, { duration: 600, easing: Easing.out(Easing.cubic) });
  }, [progress, progressValue]);

  const CIRCLE_RADIUS = 24;
  const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = CIRCLE_CIRCUMFERENCE - progressValue.value * CIRCLE_CIRCUMFERENCE;
    return {
      strokeDashoffset,
    };
  });

  if (total === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Daily Checklist</Text>
          <Text style={styles.subtitle}>{completed} of {total} completed today</Text>
        </View>
        <View style={styles.ringContainer}>
          <Svg width={60} height={60} viewBox="0 0 60 60">
            {/* Background ring */}
            <Circle
              cx={30}
              cy={30}
              r={CIRCLE_RADIUS}
              stroke={colors.line}
              strokeWidth={5}
              fill="none"
            />
            {/* Animated progress ring */}
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
        {sortedTasks.map(task => (
          <Pressable
            key={task.id}
            style={[styles.taskItem, task.isCompleted && styles.taskItemCompleted]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              toggleTask(task.id, !task.isCompleted);
            }}
          >
            <View style={[styles.checkbox, task.isCompleted && styles.checkboxChecked]}>
              {task.isCompleted && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
            <View style={styles.taskContent}>
              <Text style={[styles.taskTitle, task.isCompleted && styles.taskTitleCompleted]}>
                {task.title}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.lg,
    marginHorizontal: space.lg,
    shadowColor: colors.ink,
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    marginTop: space.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: space.lg,
  },
  title: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 13,
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
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: space.md,
  },
  checkboxChecked: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
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
  taskDesc: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
  },
});
