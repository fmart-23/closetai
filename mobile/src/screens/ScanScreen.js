import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

import Colors from '../constants/colors';
import { clothingAPI } from '../services/api';
import { capitalize } from '../utils/helpers';

// ---------------------------------------------------------------------------
// Attribute chip displayed in the result section
// ---------------------------------------------------------------------------
function AttributeChip({ label, value }) {
  if (!value) return null;
  return (
    <View style={styles.attrChip}>
      <Text style={styles.attrLabel}>{label}</Text>
      <Text style={styles.attrValue}>{capitalize(String(value))}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// ScanScreen
// ---------------------------------------------------------------------------
export default function ScanScreen() {
  const [imageUri, setImageUri] = useState(null);
  const [classification, setClassification] = useState(null);
  const [itemName, setItemName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [classifying, setClassifying] = useState(false);
  const [saved, setSaved] = useState(false);

  // ---- pick image helpers ----
  const pickFromLibrary = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo library access in Settings.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      resetState();
      setImageUri(result.assets[0].uri);
    }
  }, []);

  const pickFromCamera = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow camera access in Settings.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      resetState();
      setImageUri(result.assets[0].uri);
    }
  }, []);

  const resetState = () => {
    setClassification(null);
    setItemName('');
    setSaved(false);
  };

  // ---- classify with backend vision service ----
  const handleClassify = useCallback(async () => {
    if (!imageUri) return;
    setClassifying(true);
    try {
      const formData = new FormData();
      const filename = imageUri.split('/').pop();
      const ext = filename.split('.').pop() || 'jpg';
      formData.append('image', {
        uri: imageUri,
        name: filename,
        type: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
      });
      // Uploads the image, classifies it, and creates a draft item in the DB.
      // The item name is updated after the user confirms in handleSave().
      const result = await clothingAPI.create(formData);
      setClassification(result);
      setItemName(result.name || capitalize(result.category) || '');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      Alert.alert('Classification failed', err.message || 'Please try again.');
    } finally {
      setClassifying(false);
    }
  }, [imageUri]);

  // ---- save item ----
  const handleSave = useCallback(async () => {
    if (!classification) return;
    setUploading(true);
    try {
      await clothingAPI.update(classification.id, { name: itemName });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSaved(true);
    } catch (err) {
      Alert.alert('Save failed', err.message || 'Please try again.');
    } finally {
      setUploading(false);
    }
  }, [classification, itemName]);

  const handleReset = () => {
    setImageUri(null);
    resetState();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Text style={styles.heading}>Scan Clothing</Text>
          <Text style={styles.subheading}>
            Take a photo or choose from your library to identify and add a piece.
          </Text>

          {/* Image preview / picker */}
          {imageUri ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
              <TouchableOpacity style={styles.retakeBtn} onPress={handleReset}>
                <Text style={styles.retakeBtnText}>✕ Remove</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.pickerRow}>
              <TouchableOpacity style={styles.pickerBtn} onPress={pickFromCamera} activeOpacity={0.8}>
                <LinearGradient
                  colors={Colors.gradientPurple}
                  style={styles.pickerBtnGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.pickerBtnEmoji}>📷</Text>
                  <Text style={styles.pickerBtnText}>Camera</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.pickerBtn} onPress={pickFromLibrary} activeOpacity={0.8}>
                <LinearGradient
                  colors={['#252540', '#1A1A2E']}
                  style={styles.pickerBtnGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.pickerBtnEmoji}>🖼️</Text>
                  <Text style={styles.pickerBtnText}>Library</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* Classify button */}
          {imageUri && !classification && !saved && (
            <TouchableOpacity
              style={[styles.actionBtn, classifying && styles.actionBtnDisabled]}
              onPress={handleClassify}
              disabled={classifying}
              activeOpacity={0.85}
            >
              {classifying ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color={Colors.white} size="small" />
                  <Text style={styles.actionBtnText}>Identifying…</Text>
                </View>
              ) : (
                <Text style={styles.actionBtnText}>🔍 Identify Item</Text>
              )}
            </TouchableOpacity>
          )}

          {/* Classification results */}
          {classification && !saved && (
            <View style={styles.resultsCard}>
              <Text style={styles.resultsTitle}>✅ AI Classification</Text>

              {/* Attribute chips */}
              <View style={styles.attrGrid}>
                <AttributeChip label="Type" value={classification.category} />
                <AttributeChip label="Color" value={classification.color} />
                <AttributeChip label="Pattern" value={classification.pattern} />
                <AttributeChip label="Style" value={classification.style} />
                <AttributeChip label="Season" value={classification.season} />
              </View>

              {/* Name editor */}
              <Text style={styles.nameLabel}>Item Name</Text>
              <TextInput
                style={styles.nameInput}
                value={itemName}
                onChangeText={setItemName}
                placeholder="e.g. Blue Denim Jacket"
                placeholderTextColor={Colors.textMuted}
                returnKeyType="done"
              />

              {/* Save */}
              <TouchableOpacity
                style={[styles.saveBtn, uploading && styles.actionBtnDisabled]}
                onPress={handleSave}
                disabled={uploading}
                activeOpacity={0.85}
              >
                {uploading ? (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator color={Colors.white} size="small" />
                    <Text style={styles.saveBtnText}>Saving…</Text>
                  </View>
                ) : (
                  <Text style={styles.saveBtnText}>💾 Save to Closet</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Success state */}
          {saved && (
            <View style={styles.successCard}>
              <Text style={styles.successEmoji}>🎉</Text>
              <Text style={styles.successTitle}>Added to Closet!</Text>
              <Text style={styles.successSub}>
                "{itemName}" has been saved to your wardrobe.
              </Text>
              <TouchableOpacity style={styles.scanAnotherBtn} onPress={handleReset}>
                <Text style={styles.scanAnotherText}>Scan Another Item</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 48 },

  heading: {
    color: Colors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 6,
  },
  subheading: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },

  pickerRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 24,
  },
  pickerBtn: { flex: 1 },
  pickerBtnGradient: {
    borderRadius: 16,
    paddingVertical: 28,
    alignItems: 'center',
    gap: 8,
  },
  pickerBtnEmoji: { fontSize: 36 },
  pickerBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },

  previewContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  preview: {
    width: '100%',
    aspectRatio: 1,
  },
  retakeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  retakeBtnText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '600',
  },

  actionBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  actionBtnDisabled: { opacity: 0.6 },
  actionBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  resultsCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resultsTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  attrGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  attrChip: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 2,
    minWidth: 80,
  },
  attrLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  attrValue: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },

  nameLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  nameInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: Colors.textPrimary,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  saveBtn: {
    backgroundColor: Colors.secondary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },

  successCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.success + '50',
    marginTop: 10,
  },
  successEmoji: { fontSize: 52 },
  successTitle: {
    color: Colors.success,
    fontSize: 22,
    fontWeight: '800',
  },
  successSub: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  scanAnotherBtn: {
    marginTop: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  scanAnotherText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
