import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { Utensils } from "lucide-react-native";

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

  return (
    <View style={styles.outer}>
      <Utensils size={20} color="#f97316" />
      <View style={[styles.track, { width, height }]}>
        <Animated.View style={[styles.fill, { height }, fillStyle]} />
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
    backgroundColor: "rgba(255,255,255,0.35)",
    borderRadius: 999,
    overflow: "hidden",
  },
  fill: {
    backgroundColor: "#f97316",
    borderRadius: 999,
  },
});
