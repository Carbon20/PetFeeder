import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { ModernButtonProps } from '../types/components';

const ModernButton = ({ title, onPress, color, style, disabled }: ModernButtonProps) => (
  <TouchableOpacity 
    onPress={onPress} 
    activeOpacity={0.7}
    disabled={disabled}
    style={[{
      backgroundColor: disabled ? '#ccc' : color,
      paddingVertical: 14,
      borderRadius: 16,
      borderBottomWidth: disabled ? 0 : 4,
      borderBottomColor: 'rgba(0,0,0,0.2)', 
      alignItems: 'center',
      justifyContent: 'center',
    }, style]}
  >
    <Text allowFontScaling={false} style={{color: '#fff', fontWeight: '800', fontSize: 16}}>{title}</Text>
  </TouchableOpacity>
);

export default ModernButton;