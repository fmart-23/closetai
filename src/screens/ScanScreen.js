/**
 * ScanScreen — Camera + photo picker with on-device AI classification
 * and manual attribute editor before saving to closet
 */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Platform,
  Dimensions,
  Image,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import COLORS from '../constants/colors';
import { SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../constants/config';
import { useCloset } from '../hooks/useCloset';
import CategoryPicker from '../components/CategoryPicker';
import ColorPicker from '../components/ColorPicker';
import LoadingSpinner from '../components/LoadingSpinner';
import { PATTERNS, STYLES, SEASONS } from '../constants/categories';
import { toTitleCase } from '../utils/helpers';
import { analyzeClothingImage } from '../services/classifier';

const { width, height } = Dimensions.get('window');

const STEPS = {
  CAPTURE: 'capture',
  CLASSIFY: 'classify',
  DETAILS: 'details',
};

export default function ScanScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { addItem } = useCloset();

  const [step, setStep] = useState(STEPS.CAPTURE);
  const [imageUri, setImageUri] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [attributes, setAttributes] = useState({
    name: '',
    type: 'tshirt',
    color: 'black',
    pattern: 'solid',
    style: 'casual',
    season: 'all',
    brand: '',
    notes: '',
  });

  const updateAttribute = (key, value) => {
    setAttributes(prev => ({ ...prev, [key]: value }));
  };

  // ─── Image Selection ─────────────────────────────────────────────────────────

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera access is needed to take photos of your clothing.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]) {
      await handleImageSelected(result.assets[0].uri);
    }
  };

  const pickFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Photo library access is needed to select clothing photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]) {
      await handleImageSelected(result.assets[0].uri);
    }
  };

  const handleImageSelected = async (uri) => {
    setImageUri(uri);
    setStep(STEPS.CLASSIFY);
    setAnalyzing(true);

    try {
      const analysis = await analyzeClothingImage(uri);
      if (analysis?.attributes?.type) {
        setAttributes(prev => ({
          ...prev,
          ...analysis.attributes,
        }));
      }
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setAnalyzing(false);
      setStep(STEPS.DETAILS);
    }
  };

  // ─── Save Item ────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!attributes.type) {
      Alert.alert('Missing Info', 'Please select a clothing type.');
      return;
    }

    setSaving(true);
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const newItem = await addItem(attributes, imageUri);

      Alert.alert(
        '✨ Item Added!',
        `${attributes.name || toTitleCase(attributes.type)} has been added to your closet.`,
        [
          { text: 'Add Another', onPress: resetScan },
          { text: 'View in Closet', onPress: () => navigation.navigate('Closet') },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save item. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const resetScan = () => {
    setImageUri(null);
    setStep(STEPS.CAPTURE);
    setAttributes({
      name: '',
      type: 'tshirt',
      color: 'black',
      pattern: 'solid',
      style: 'casual',
      season: 'all',
      brand: '',
      notes: '',
    });
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {step === STEPS.CAPTURE ? '📷 Scan Item' :
           step === STEPS.CLASSIFY ? '🔍 Analyzing...' :
           '✏️ Add Details'}
        </Text>
        {step !== STEPS.CAPTURE && (
          <TouchableOpacity onPress={resetScan} style={styles.resetButton}>
            <Text style={styles.resetButtonText}>Retake</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Step: Capture */}
      {step === STEPS.CAPTURE && (
        <View style={styles.captureContainer}>
          <View style={styles.cameraPlaceholder}>
            <Text style={styles.cameraIcon}>📷</Text>
            <Text style={styles.cameraText}>Take a photo or select from your library</Text>
          </View>

          <View style={styles.captureButtons}>
            <TouchableOpacity style={styles.captureButton} onPress={takePhoto} activeOpacity={0.8}>
              <Text style={styles.captureButtonIcon}>📷</Text>
              <Text style={styles.captureButtonText}>Take Photo</Text>
              <Text style={styles.captureButtonSubtext}>Open camera</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.captureButton, styles.captureButtonSecondary]} onPress={pickFromLibrary} activeOpacity={0.8}>
              <Text style={styles.captureButtonIcon}>🖼️</Text>
              <Text style={styles.captureButtonText}>Photo Library</Text>
              <Text style={styles.captureButtonSubtext}>Choose existing</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.captureHint}>
            💡 Tip: Use natural lighting for best results
          </Text>
        </View>
      )}

      {/* Step: Analyzing */}
      {step === STEPS.CLASSIFY && (
        <View style={styles.analyzingContainer}>
          {imageUri && (
            <Image source={{ uri: imageUri }} style={styles.previewImageSmall} resizeMode="cover" />
          )}
          <LoadingSpinner message="Analyzing your clothing item..." size="large" />
        </View>
      )}

      {/* Step: Details */}
      {step === STEPS.DETAILS && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.detailsContainer}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.detailsScrollContent}
          >
            {/* Image Preview */}
            {imageUri && (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
                <TouchableOpacity style={styles.retakeOverlay} onPress={resetScan}>
                  <Text style={styles.retakeText}>Retake</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Name */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Name (optional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., Favorite Blue Jeans"
                placeholderTextColor={COLORS.textTertiary}
                value={attributes.name}
                onChangeText={(text) => updateAttribute('name', text)}
              />
            </View>

            {/* Type */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Type *</Text>
              <CategoryPicker
                selectedType={attributes.type}
                onSelectType={(type) => updateAttribute('type', type)}
              />
            </View>

            {/* Color */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Color</Text>
              <ColorPicker
                selected={attributes.color}
                onSelect={(color) => updateAttribute('color', color)}
              />
            </View>

            {/* Pattern */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Pattern</Text>
              <PickerRow
                options={PATTERNS}
                selected={attributes.pattern}
                onSelect={(v) => updateAttribute('pattern', v)}
              />
            </View>

            {/* Style */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Style</Text>
              <PickerRow
                options={STYLES}
                selected={attributes.style}
                onSelect={(v) => updateAttribute('style', v)}
              />
            </View>

            {/* Season */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Season</Text>
              <PickerRow
                options={SEASONS}
                selected={attributes.season}
                onSelect={(v) => updateAttribute('season', v)}
              />
            </View>

            {/* Brand */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Brand (optional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., Zara, H&M, Nike"
                placeholderTextColor={COLORS.textTertiary}
                value={attributes.brand}
                onChangeText={(text) => updateAttribute('brand', text)}
              />
            </View>

            {/* Notes */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Notes (optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textInputMultiline]}
                placeholder="Any notes about this item..."
                placeholderTextColor={COLORS.textTertiary}
                value={attributes.notes}
                onChangeText={(text) => updateAttribute('notes', text)}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.8}
            >
              {saving ? (
                <LoadingSpinner size="small" style={{ padding: 0 }} />
              ) : (
                <Text style={styles.saveButtonText}>✨ Add to Closet</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

// ─── Picker Row ────────────────────────────────────────────────────────────────

function PickerRow({ options, selected, onSelect }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pickerRow}>
      {options.map(option => {
        const isSelected = selected === option.id;
        return (
          <TouchableOpacity
            key={option.id}
            style={[styles.pickerChip, isSelected && styles.pickerChipSelected]}
            onPress={() => onSelect(option.id)}
            activeOpacity={0.7}
          >
            {option.icon && <Text style={styles.pickerChipIcon}>{option.icon}</Text>}
            <Text style={[styles.pickerChipText, isSelected && styles.pickerChipTextSelected]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  resetButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primaryTransparent,
  },
  resetButtonText: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  captureContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  cameraPlaceholder: {
    width: '100%',
    height: height * 0.3,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  cameraIcon: {
    fontSize: 56,
    marginBottom: SPACING.md,
  },
  cameraText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textTertiary,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
  captureButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    width: '100%',
    marginBottom: SPACING.xl,
  },
  captureButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  captureButtonSecondary: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  captureButtonIcon: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  captureButtonText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textOnPrimary,
    marginBottom: 2,
  },
  captureButtonSubtext: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: 'rgba(255,255,255,0.8)',
  },
  captureHint: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
  analyzingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImageSmall: {
    width: 120,
    height: 160,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.xl,
  },
  detailsContainer: {
    flex: 1,
  },
  detailsScrollContent: {
    padding: SPACING.base,
    paddingBottom: SPACING['3xl'],
  },
  imagePreviewContainer: {
    width: '100%',
    height: 220,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.xl,
    position: 'relative',
    ...SHADOWS.md,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  retakeOverlay: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.blackTransparent,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  retakeText: {
    color: COLORS.surface,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  fieldContainer: {
    marginBottom: SPACING.xl,
  },
  fieldLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.surface,
  },
  textInputMultiline: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerRow: {
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  pickerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    gap: SPACING.xs,
  },
  pickerChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pickerChipIcon: {
    fontSize: 14,
  },
  pickerChipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textSecondary,
  },
  pickerChipTextSelected: {
    color: COLORS.textOnPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    marginTop: SPACING.base,
    ...SHADOWS.md,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: COLORS.textOnPrimary,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
});
