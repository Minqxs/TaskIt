import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from './PrimaryButton';
import { theme } from '../theme';
import type { ReactNode } from 'react';

interface AppModalProps {
  title: string;
  visible: boolean;
  children: ReactNode;
  onClose: () => void;
}

export function AppModal({ title, visible, children, onClose }: AppModalProps) {
  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.overlay}>
        <Pressable accessibilityLabel="Close modal" onPress={onClose} style={styles.backdrop} />
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <PrimaryButton label="Close" onPress={onClose} variant="ghost" />
          </View>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(17, 24, 39, 0.42)',
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.md
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject
  },
  modal: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    maxHeight: '92%',
    maxWidth: 520,
    overflow: 'hidden',
    width: '100%',
    ...theme.shadow.card
  },
  header: {
    alignItems: 'center',
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md
  },
  title: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '800'
  },
  content: {
    gap: theme.spacing.md,
    padding: theme.spacing.lg
  }
});
