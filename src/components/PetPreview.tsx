import LottieView from "lottie-react-native";
import React, { useEffect } from "react";
import { ImageStyle, StyleProp, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

type PetPreviewProps = {
  type: "lottie" | "image";
  source: any;
  size: number;
  style?: StyleProp<ViewStyle | ImageStyle>;
};

export default function PetPreview({
  type,
  source,
  size,
  style,
}: PetPreviewProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (type !== "image") return;
    scale.value = withRepeat(withTiming(1.05, { duration: 1000 }), -1, true);
  }, [type, scale]);

  const imageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (type === "lottie") {
    return (
      <LottieView
        source={source}
        autoPlay
        loop
        style={[{ width: size, height: size }, style]}
        resizeMode="contain"
      />
    );
  }

  return (
    <Animated.Image
      source={source}
      style={[{ width: size, height: size }, imageStyle, style]}
      resizeMode="contain"
    />
  );
}
