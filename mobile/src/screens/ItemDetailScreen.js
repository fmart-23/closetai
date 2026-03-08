import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';

import Colors from '../constants/colors';
import { clothingAPI } from '../services/api';
import { capitalize, formatDate, getColorHex } from '../utils/helpers';
import { API_URL } from '../constants/config';

// ---------------------------------------------------------------------------
// Small label+value row in the attributes section
// ---------------------------------------------------------------------------
function AttributeRow({ label, value, color }) {
  if (!value) return null;
  return (
    <View style={styles.attrRow}>
      <Text style={styles.attrLabel}>{label}</Text>
      {color ? (
        <View style={styles.colorRow}>
          <View style={[styles.colorSwatch, { backgroundColor: color }]} />
          <Text style={styles.attrValue}>{capitalize(String(value))}</Text>
        </View>
      ) : (
        <View style={styles.attrChip}>
          <Text style={styles.attrValue}>{capitalize(String(value))}</Text>
        </View>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// ItemDetailScreen
// ---------------------------------------------------------------------------
export default function ItemDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { item: initialItem } = route.params;

  const [item, setItem] = useState(initialItem);
  const [editVisible, setEditVisible] = useState(false);
  const [editName, setEditName] = useState(item.name || '');
  const [editNotes, setEditNotes] = useState(item.notes || '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const imageUri = item.image_url
    ? item.image_url.startsWith('http')
      ? item.image_url
      : `${API_URL}${item.image_url}`
    : null;

  // ---- Edit ----
  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const updated = await clothingAPI.update(item.id, {
        name: editName,
        notes: editNotes,
      });
      setItem(updated);
      setEditVisible(false);
    } catch (err) {
      Alert.alert('Update failed', err.message);
    } finally {
      setSaving(false);
    }
  };

  // ---- Delete ----
  const handleDelete = () => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to remove "${item.name || capitalize(item.category)}" from your closet?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await clothingAPI.remove(item.id);
              navigation.goBack();
            } catch (err) {
              Alert.alert('Delete failed', err.message);
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  // ---- Share ----
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out my ${capitalize(item.color || '')} ${capitalize(item.category)} from my ClosetAI wardrobe! 👗✨`,
      });
    } catch {
      // user cancelled
    }
  };

  const colorHex = getColorHex(item.color);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ---- Image with gradient overlay ---- */}
        <View style={styles.imageContainer}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderEmoji}>👗</Text>
            </View>
          )}
          <LinearGradient
            colors={Colors.gradientOverlay}
            style={styles.imageOverlay}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
          {/* Item name over the image */}
          <View style={styles.imageNameRow}>
            <Text style={styles.imageName}>
              {item.name || capitalize(item.category)}
            </Text>
          </View>
        </View>

        {/* ---- Attributes ---- */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Details</Text>

          <AttributeRow label="Category" value={item.category} />
          <AttributeRow label="Color" value={item.color} color={colorHex} />
          <AttributeRow label="Pattern" value={item.pattern} />
          <AttributeRow label="Style" value={item.style} />
          <AttributeRow label="Season" value={item.season} />

          {item.notes ? (
            <View style={styles.notesBox}>
              <Text style={styles.attrLabel}>Notes</Text>
              <Text style={styles.notesText}>{item.notes}</Text>
            </View>
          ) : null}

          <Text style={styles.dateText}>Added {formatDate(item.created_at)}</Text>
        </View>

        {/* ---- Action buttons ---- */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.editBtn]}
            onPress={() => {
              setEditName(item.name || '');
              setEditNotes(item.notes || '');
              setEditVisible(true);
            }}
          >
            <Text style={styles.actionBtnText}>✏️ Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionBtn, styles.shareBtn]} onPress={handleShare}>
            <Text style={styles.actionBtnText}>🔗 Share</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.deleteBtn, deleting && styles.btnDisabled]}
            onPress={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <Text style={styles.actionBtnText}>🗑 Delete</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ---- Edit Modal ---- */}
      <Modal
        visible={editVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEditVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Edit Item</Text>

            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.input}
              value={editName}
              onChangeText={setEditName}
              placeholder="Item name"
              placeholderTextColor={Colors.textMuted}
              returnKeyType="next"
            />

            <Text style={styles.inputLabel}>Notes</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={editNotes}
              onChangeText={setEditNotes}
              placeholder="Add notes about this item…"
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={3}
              returnKeyType="done"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancelBtn]}
                onPress={() => setEditVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalSaveBtn, saving && styles.btnDisabled]}
                onPress={handleSaveEdit}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <Text style={styles.modalSaveText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { paddingBottom: 48 },

  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
    backgroundColor: Colors.surface,
  },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
  },
  placeholderEmoji: { fontSize: 80 },
  imageOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  imageNameRow: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  imageName: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  card: {
    margin: 16,
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },

  attrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  attrLabel: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  attrChip: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  attrValue: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '500',
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  colorSwatch: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  notesBox: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
  notesText: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  dateText: {
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },

  actions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtn: { backgroundColor: Colors.primary },
  shareBtn: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  deleteBtn: { backgroundColor: Colors.error },
  btnDisabled: { opacity: 0.6 },
  actionBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 14,
    paddingBottom: 40,
  },
  modalTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  inputLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: Colors.textPrimary,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputMultiline: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  modalBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCancelBtn: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalSaveBtn: { backgroundColor: Colors.primary },
  modalCancelText: { color: Colors.textSecondary, fontSize: 15, fontWeight: '700' },
  modalSaveText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
});
