import { Image } from "expo-image";
import React from "react";
import { StyleSheet, View } from "react-native";

export interface IslandProps {
  source: number | { uri: string };
  widthPercent?: number;
  marginTop?: number;
  style?: object;
}

export default function Island({
  source,
  widthPercent = 85,
  marginTop = 0,
  style,
}: IslandProps) {
  return (
    <View style={[styles.wrapper, { marginTop }]}>
      <Image
        source={source}
        style={[styles.image, { width: `${widthPercent}%` }]}
        contentFit="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: "center",
  },
  image: {
    aspectRatio: 1.5,
    maxWidth: "100%",
  },
});
