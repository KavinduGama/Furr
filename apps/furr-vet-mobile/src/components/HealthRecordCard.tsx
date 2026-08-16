import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { TimelineItem } from '@furr/core';
import { colors } from '@furr/ui';

export function HealthRecordCard({ item }: { item: TimelineItem }) {
  const getBadgeStyle = () => {
    switch (item.kind) {
      case 'vaccination':
        return { bg: '#E1F5FE', text: '#0288D1' };
      case 'medication':
        return { bg: '#F3E5F5', text: '#7B1FA2' };
      case 'weight':
        return { bg: '#E8F5E9', text: '#388E3C' };
      case 'observation':
        return { bg: '#FFF3E0', text: '#E65100' };
      default:
        return { bg: '#ECEFF1', text: '#455A64' };
    }
  };

  const badge = getBadgeStyle();

  const getTitle = () => {
    switch (item.kind) {
      case 'vaccination':
        return item.record.vaccineType === 'Other'
          ? item.record.customVaccineName
          : item.record.vaccineType;
      case 'medication':
        return item.plan.medicationName;
      case 'weight':
        return `Weight: ${item.entry.value} ${item.entry.unit}`;
      case 'observation':
        return item.observation.description;
      case 'document':
        return item.document.originalFileName;
    }
  };

  const getSubtitle = () => {
    switch (item.kind) {
      case 'vaccination':
        return item.record.nextDueOn ? `Next Due: ${item.record.nextDueOn}` : 'Booster up to date';
      case 'medication':
        return `${item.plan.doseInstruction} · ${item.plan.frequency.kind}`;
      case 'weight':
        return item.entry.note || 'Logged via Furr mobile';
      case 'observation':
        return `Severity: ${item.observation.severity || 'mild'}`;
      case 'document':
        return `Format: ${item.document.docType}`;
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.badgeText, { color: badge.text }]}>
            {item.kind.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.dateText}>{item.date}</Text>
      </View>

      <Text style={styles.titleText}>{getTitle()}</Text>
      <Text style={styles.subtitleText}>{getSubtitle()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: '600',
  },
  titleText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.ink,
    marginBottom: 2,
  },
  subtitleText: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 18,
  },
});
