import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardTypeOptions,
  ViewStyle,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';

interface InputFieldProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
  icon?: React.ReactNode;
  multiline?: boolean;
  numberOfLines?: number;
  style?: ViewStyle;
  editable?: boolean;
  suffix?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error,
  icon,
  multiline = false,
  numberOfLines = 1,
  style,
  editable = true,
  suffix,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.focusedBorder,
          error ? styles.errorBorder : null,
          multiline && { minHeight: 96, alignItems: 'flex-start' },
        ]}
      >
        {icon && <View style={styles.leadingIcon}>{icon}</View>}
        <TextInput
          style={[styles.input, multiline && styles.multilineInput]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textPlaceholder}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
        />
        {suffix && <Text style={styles.suffix}>{suffix}</Text>}
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            activeOpacity={0.7}
          >
            {isPasswordVisible ? (
              <EyeOff size={18} color={Colors.textMuted} />
            ) : (
              <Eye size={18} color={Colors.textMuted} />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md + 2,
  },
  label: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '700',
    color: Colors.charcoal,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1.2,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    minHeight: 50,
  },
  focusedBorder: {
    borderColor: Colors.freshGreen,
    borderWidth: 1.5,
    backgroundColor: Colors.white,
  },
  errorBorder: {
    borderColor: Colors.softRed,
    borderWidth: 1.5,
    backgroundColor: Colors.redLight,
  },
  input: {
    flex: 1,
    ...Typography.body,
    fontSize: 15,
    color: Colors.charcoal,
    paddingVertical: Spacing.sm,
  },
  multilineInput: {
    paddingTop: Spacing.sm,
    textAlignVertical: 'top',
  },
  leadingIcon: {
    marginRight: Spacing.sm,
  },
  suffix: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.textMuted,
    marginLeft: Spacing.xs,
  },
  eyeBtn: {
    padding: Spacing.xs,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.softRed,
    marginTop: 4,
    fontWeight: '600',
  },
});
