import { Image } from "expo-image";
import { Coins, Lock } from "lucide-react-native";
import React, { useEffect } from "react";
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HungerBar from "../../src/components/HungerBar";
import Island from "../../src/components/Island";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Ada ekranı kaplasın, taşmasın (en-boy oranı 1.5)
const ISLAND_ASPECT = 1.5;
const islandWidth = Math.min(SCREEN_WIDTH * 1.80, SCREEN_HEIGHT * ISLAND_ASPECT * 1.0);
const islandHeight = islandWidth / ISLAND_ASPECT;
// Penguen adaya oranla büyük, ortada
const penguinSize = Math.round(islandWidth * 0.2);
const penguinBottom = Math.max(24, islandHeight * 0.40);

const isPaired = true;
const partnerAvatarPlaceholder = require("../../assets/images/icon.png");

/** Coins displayed in garden (0 for now) */
const GARDEN_COINS = 0;

export interface GardenScreenProps {
  hungerPercent?: number;
}

export default function GardenScreen({ hungerPercent = 0 }: GardenScreenProps = {}) {
  const insets = useSafeAreaInsets();

  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1200 }),
        withTiming(1, { duration: 1200 })
      ),
      -1,
      true
    );
    translateY.value = withRepeat(
      withSequence(
        withTiming(5, { duration: 1500 }),
        withTiming(-5, { duration: 1500 })
      ),
      -1,
      true
    );
  }, [scale, translateY]);

  const penguinAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/background.png")}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />

      {/* Top bar: only coins, 0 */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <View style={styles.glassChip}>
          <Coins size={18} color="#f59e0b" />
          <Text style={styles.hudText}>{GARDEN_COINS}</Text>
        </View>
      </View>

      {isPaired && (
        <View style={[styles.partnerAvatarWrap, { top: insets.top + 8 }]}>
          <Image
            source={partnerAvatarPlaceholder}
            style={styles.partnerAvatar}
          />
          <View style={styles.onlineDot} />
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
      >
        {/* Slide 1: Ice island — ekranı kaplayan büyük ada, penguen oranlı ve ortada */}
        <View style={[styles.slide, { height: SCREEN_HEIGHT }]}>
          <View style={[styles.iceIslandWrap, { width: islandWidth, height: islandHeight }]}>
            <Island
              source={require("../../assets/images/island_ice.png")}
              widthPercent={100}
              marginTop={0}
            />
            <Animated.View
              style={[
                styles.penguinWrap,
                { bottom: penguinBottom },
                penguinAnimatedStyle,
              ]}
              pointerEvents="none"
            >
              <View style={styles.heartBarWrap}>
                <HungerBar
                  percent={hungerPercent}
                  width={Math.min(160, penguinSize * 1.6)}
                  height={14}
                />
              </View>
              <Image
                source={require("../../assets/images/penguin.png")}
                style={[styles.penguin, { width: penguinSize, height: penguinSize }]}
                contentFit="contain"
              />
            </Animated.View>
          </View>
        </View>

        {/* Slide 2: Sand island — aşağı kaydırınca görünür, kilitli */}
        <View style={[styles.slide, { height: SCREEN_HEIGHT }]}>
          <View style={styles.lockedIslandWrap}>
            <View style={styles.smallIsland}>
              <Island
                source={require("../../assets/images/island_sand.png")}
                widthPercent={100}
                marginTop={0}
              />
              <View style={styles.lockedOverlay}>
                <Lock size={32} color="#fff" />
                <Text style={styles.lockedText}>COMING SOON</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Slide 3: Forest island — aşağı kaydırınca görünür, kilitli */}
        <View style={[styles.slide, { height: SCREEN_HEIGHT }]}>
          <View style={styles.lockedIslandWrap}>
            <View style={styles.smallIsland}>
              <Island
                source={require("../../assets/images/island_forest.png")}
                widthPercent={100}
                marginTop={0}
              />
              <View style={styles.lockedOverlay}>
                <Lock size={32} color="#fff" />
                <Text style={styles.lockedText}>COMING SOON</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    alignItems: "center",
  },
  slide: {
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 40,
  },
  topBar: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    zIndex: 10,
  },
  glassChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    ...(Platform.OS === "ios" ? { overflow: "hidden" as const } : {}),
  },
  hudText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  partnerAvatarWrap: {
    position: "absolute",
    left: 16,
    zIndex: 11,
  },
  partnerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.6)",
  },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#22c55e",
    borderWidth: 2,
    borderColor: "#0f172a",
  },
  iceIslandWrap: {
    alignSelf: "center",
    position: "relative",
  },
  penguinWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  heartBarWrap: {
    marginBottom: 8,
  },
  penguin: {
    alignSelf: "center",
  },
  lockedIslandWrap: {
    alignSelf: "center",
    width: SCREEN_WIDTH * 0.5,
  },
  smallIsland: {
    position: "relative",
    opacity: 0.95,
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  lockedText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center",
  },
});
