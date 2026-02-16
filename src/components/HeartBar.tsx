import { Heart } from "lucide-react-native";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from "react-native-reanimated";

interface HeartBarProps {
  /** Shared pet health 0–100 */
  percent: number;
  width?: number;
  height?: number;
}

export default function HeartBar({
  percent,
  width = 120,
  height = 14,
}: HeartBarProps) {
  const fillWidth = useSharedValue(0);

  useEffect(() => {
    fillWidth.value = withTiming(Math.max(0, Math.min(100, percent)) / 100, {
      duration: 400,
    });
  }, [percent, fillWidth]);

  const fillStyle = useAnimatedStyle(() => ({
    width: width * fillWidth.value,
  }));

  return (
    <View style={styles.outer}>
      <Heart size={20} color="#e11d48" fill="#e11d48" />
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
    backgroundColor: "rgba(255,255,255,0.4)",
    borderRadius: 999,
    overflow: "hidden",
  },
  fill: {
    backgroundColor: "#e11d48",
    borderRadius: 999,
  },
});
