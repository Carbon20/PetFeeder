import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemeColor } from '../types';

const PatternBackground = React.memo(({ darkMode, color }: { darkMode: boolean, color: ThemeColor }) => {
  if (darkMode) return null; 
  
  const items = [
    { txt: "🐾", t: 50, l: 20 }, { txt: "🦴", t: 150, r: -20, rot: 20 },
    { txt: "🐾", t: 300, l: -10, rot: 10 }, { txt: "☁️", t: 80, r: 80 },
    { txt: "🐾", t: 500, r: 30, rot: -15 }, { txt: "🐟", t: 600, l: 40, rot: 45 },
    { txt: "🐾", t: 750, l: -20, rot: 10 }, { txt: "🦴", t: 200, l: 150, rot: 90 },
    { txt: "⭐️", t: 400, r: 100 }, { txt: "🐾", b: 50, r: 50, rot: -10 }
  ];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {items.map((it: { txt: string; t?: number; b?: number; l?: number; r?: number; rot?: number }, i: number) => (
        <Text key={i} style={{
          position: 'absolute',
          top: it.t, bottom: it.b, left: it.l, right: it.r,
          fontSize: 34,
          opacity: 0.08, 
          transform: [{ rotate: `${it.rot || 0}deg` }],
          color: '#000'
        }}>
          {it.txt}
        </Text>
      ))}
    </View>
  );
});

export default PatternBackground;