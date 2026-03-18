import { Utensils } from "lucide-react-native";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

interface HungerBarProps {
  /** Doyma yüzdesi 0–100 */
  percent: number;
  width?: number;
  height?: number;
}

export default function HungerBar({ percent, width = 120, height = 14 }: HungerBarProps) {
  const fillRatio = useSharedValue(0);

  useEffect(() => {
    const clamped = Math.max(0, Math.min(100, percent));
    fillRatio.value = withTiming(clamped / 100, { duration: 400 });
  }, [percent, fillRatio]);

  const fillStyle = useAnimatedStyle(() => ({
    width: width * fillRatio.value,
  }));

  // Color transitions: empty=red, mid=orange, full=green
  const fillColor =
    percent < 30 ? '#ef4444' :
      percent < 70 ? '#f97316' :
        '#22c55e';

  return (
    <View style={styles.outer}>
      <Utensils size={20} color={fillColor} />
      <View style={[styles.track, { width, height }]}>
        {/* Segment dividers */}
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: `${i * 20}%` as any,
              top: 0,
              bottom: 0,
              width: 2,
              backgroundColor: 'rgba(255,255,255,0.7)',
              zIndex: 2,
            }}
          />
        ))}
        <Animated.View style={[styles.fill, { height, backgroundColor: fillColor }, fillStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  track: {
    backgroundColor: "rgba(0,0,0,0.12)",
    borderRadius: 999,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(150,150,150,0.25)",
  },
  fill: {
    borderRadius: 999,
  },
});
