import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ruler, Check, Plus, CheckCircle2 } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { InputField } from '../../components/forms/InputField';
import { Button } from '../../components/buttons/Button';

const DEFAULT_UNITS = [
  { name: 'Pieces / Single Units', code: 'pcs' },
  { name: 'Kilograms', code: 'kg' },
  { name: 'Boxes', code: 'boxes' },
  { name: 'Cartons', code: 'cartons' },
  { name: 'Litres', code: 'litres' },
  { name: 'Packs / Bundles', code: 'packs' },
  { name: 'Bottles', code: 'bottles' },
  { name: 'Sachets', code: 'sachets' },
];

export default function MeasurementUnitsScreen() {
  const { settings, updateSettings } = useApp();

  const [selectedUnit, setSelectedUnit] = useState(settings.defaultMeasurementUnit || 'pcs');
  const [customUnit, setCustomUnit] = useState('');
  const [unitsList, setUnitsList] = useState(DEFAULT_UNITS);
  const [isSaved, setIsSaved] = useState(false);

  const handleSelectUnit = (code: string) => {
    setSelectedUnit(code);
    updateSettings({ defaultMeasurementUnit: code });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleAddCustomUnit = () => {
    if (customUnit.trim()) {
      const newCode = customUnit.trim().toLowerCase();
      if (!unitsList.some((u) => u.code === newCode)) {
        setUnitsList((prev) => [...prev, { name: customUnit.trim(), code: newCode }]);
      }
      handleSelectUnit(newCode);
      setCustomUnit('');
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isSaved && (
          <View style={styles.successBanner}>
            <CheckCircle2 size={16} color={Colors.freshGreen} />
            <Text style={styles.successText}>Default unit updated successfully!</Text>
          </View>
        )}

        <View style={styles.headerBox}>
          <Text style={styles.headerTitle}>Measurement Units</Text>
          <Text style={styles.headerSubtitle}>
            Configure standard units used for counting and measuring product stock quantities.
          </Text>
        </View>

        <View style={styles.unitsCard}>
          {unitsList.map((unit) => {
            const isSelected = selectedUnit === unit.code;
            return (
              <TouchableOpacity
                key={unit.code}
                style={[styles.unitItem, isSelected && styles.selectedItem]}
                onPress={() => handleSelectUnit(unit.code)}
                activeOpacity={0.7}
              >
                <View style={styles.unitInfo}>
                  <Text style={styles.unitName}>{unit.name}</Text>
                  <Text style={styles.unitCode}>Abbreviation: {unit.code}</Text>
                </View>

                {isSelected && <Check size={20} color={Colors.freshGreen} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Add custom unit */}
        <View style={styles.customCard}>
          <Text style={styles.customTitle}>Add Custom Measurement Unit</Text>
          <Text style={styles.customDesc}>
            e.g. crate, bag, tin, meter, roll
          </Text>

          <View style={styles.customRow}>
            <InputField
              value={customUnit}
              onChangeText={setCustomUnit}
              placeholder="Unit name"
              style={{ flex: 1, marginBottom: 0 }}
            />
            <Button
              title="Add"
              icon={<Plus size={16} color={Colors.white} />}
              onPress={handleAddCustomUnit}
              style={{ minWidth: 80 }}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: Colors.softBackground,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.md,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.emeraldLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.freshGreen,
  },
  successText: {
    ...Typography.bodySmall,
    color: Colors.deepEmerald,
    fontWeight: '600',
  },
  headerBox: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  headerTitle: {
    ...Typography.h4,
    color: Colors.charcoal,
  },
  headerSubtitle: {
    ...Typography.caption,
    color: Colors.textMuted,
    lineHeight: 18,
    marginTop: 2,
  },
  unitsCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
  },
  unitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  selectedItem: {
    backgroundColor: Colors.emeraldLight,
  },
  unitInfo: {
    flex: 1,
  },
  unitName: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  unitCode: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 1,
  },
  customCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  customTitle: {
    ...Typography.h4,
    color: Colors.charcoal,
  },
  customDesc: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
    marginBottom: Spacing.md,
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
});
