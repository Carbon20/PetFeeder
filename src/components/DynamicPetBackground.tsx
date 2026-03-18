import React, { useEffect, useRef, useState } from 'react';
import { Animated, View } from 'react-native';

// ─── Time slots ───────────────────────────────────────────────────────────────
type TimeSlot = 'night' | 'dawn' | 'morning' | 'noon' | 'afternoon' | 'evening' | 'dusk';

function getTimeSlot(h: number): TimeSlot {
  if (h >= 21 || h < 5) return 'night';
  if (h >= 5 && h < 7) return 'dawn';
  if (h >= 7 && h < 11) return 'morning';
  if (h >= 11 && h < 14) return 'noon';
  if (h >= 14 && h < 18) return 'afternoon';
  if (h >= 18 && h < 20) return 'evening';
  return 'dusk'; // 20-21
}

// ─── Twinkling star ───────────────────────────────────────────────────────────
function Star({ top, left, size, delay = 0 }: { top: number; left: string; size: number; delay?: number }) {
  const anim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 0.25, duration: 900 + Math.random() * 600, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1, duration: 900 + Math.random() * 600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return (
    <Animated.View style={{
      position: 'absolute', top, left: left as any,
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: size >= 4 ? 'rgba(255,255,180,0.98)' : '#fff',
      opacity: anim,
      shadowColor: '#fff', shadowOpacity: size >= 4 ? 0.9 : 0.4, shadowRadius: size,
    }} />
  );
}

// ─── Stars field ──────────────────────────────────────────────────────────────
function StarsField() {
  const stars = [
    { top: 7, left: '8%', size: 3, delay: 0 },
    { top: 14, left: '22%', size: 2, delay: 200 },
    { top: 5, left: '35%', size: 4, delay: 500 },
    { top: 20, left: '48%', size: 2, delay: 800 },
    { top: 9, left: '60%', size: 3, delay: 300 },
    { top: 18, left: '75%', size: 2, delay: 700 },
    { top: 6, left: '88%', size: 3, delay: 100 },
    { top: 32, left: '12%', size: 2, delay: 600 },
    { top: 38, left: '30%', size: 2, delay: 400 },
    { top: 28, left: '55%', size: 2, delay: 150 },
    { top: 40, left: '70%', size: 2, delay: 900 },
    { top: 35, left: '90%', size: 3, delay: 250 },
    { top: 15, left: '42%', size: 2, delay: 1000 },
    { top: 45, left: '20%', size: 2, delay: 450 },
  ];
  return <>{stars.map((s, i) => <Star key={i} {...s} />)}</>;
}

// ─── Moon ────────────────────────────────────────────────────────────────────
function Moon() {
  return (
    <View style={{ position: 'absolute', top: 8, right: 18 }}>
      {/* Glow */}
      <View style={{
        position: 'absolute', top: -6, left: -6,
        width: 48, height: 48, borderRadius: 24,
        backgroundColor: 'rgba(255,255,180,0.12)',
      }} />
      {/* Moon body */}
      <View style={{
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: 'rgba(255,255,200,0.92)',
        overflow: 'hidden',
      }}>
        {/* Crescent shadow */}
        <View style={{
          position: 'absolute', top: -5, right: -10,
          width: 30, height: 30, borderRadius: 15,
          backgroundColor: '#1e2b5e',
        }} />
        {/* Crater details */}
        <View style={{ position: 'absolute', top: 18, left: 6, width: 5, height: 5, borderRadius: 3, backgroundColor: 'rgba(200,200,150,0.5)' }} />
        <View style={{ position: 'absolute', top: 10, left: 14, width: 3, height: 3, borderRadius: 2, backgroundColor: 'rgba(200,200,150,0.4)' }} />
      </View>
    </View>
  );
}

// ─── Sun ─────────────────────────────────────────────────────────────────────
function Sun({ color = '#fef3c7', glowColor = '#fde68a', size = 28, top = 8, right = 18 }:
  { color?: string; glowColor?: string; size?: number; top?: number; right?: number }) {
  const rayAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(rayAnim, { toValue: 1.15, duration: 1800, useNativeDriver: true }),
        Animated.timing(rayAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  const rays = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
  return (
    <View style={{ position: 'absolute', top, right, alignItems: 'center', justifyContent: 'center', width: size + 28, height: size + 28 }}>
      {/* Outer glow */}
      <View style={{ position: 'absolute', width: size + 22, height: size + 22, borderRadius: (size + 22) / 2, backgroundColor: glowColor + '28' }} />
      {/* Ray ring */}
      <Animated.View style={{ position: 'absolute', width: size + 28, height: size + 28, alignItems: 'center', justifyContent: 'center', transform: [{ scale: rayAnim }] }}>
        {rays.map((deg, i) => (
          <View key={i} style={{
            position: 'absolute',
            width: 2, height: size * 0.5,
            borderRadius: 1,
            backgroundColor: 'rgba(255,255,255,0.55)',
            transform: [{ rotate: `${deg}deg` }, { translateY: -(size / 2 + 9) }],
          }} />
        ))}
      </Animated.View>
      {/* Sun core */}
      <View style={{
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: color,
        shadowColor: glowColor, shadowOpacity: 0.95, shadowRadius: 14,
      }} />
    </View>
  );
}

// ─── Single cloud ─────────────────────────────────────────────────────────────
function Cloud({ top, left, scale = 1, opacity = 0.9, drift = true }:
  { top: number; left: string; scale?: number; opacity?: number; drift?: boolean }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!drift) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 6, duration: 4000 + Math.random() * 2000, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 4000 + Math.random() * 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={{
      position: 'absolute', top, left: left as any,
      transform: [{ scale }, { translateX: anim }],
      opacity,
    }}>
      {/* Shadow layer */}
      <View style={{ position: 'absolute', top: 6, left: 6, right: -2, bottom: -6, opacity: 0.15 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
          <View style={{ width: 26, height: 14, borderRadius: 10, backgroundColor: '#000' }} />
          <View style={{ width: 38, height: 22, borderRadius: 16, backgroundColor: '#000', marginLeft: -8 }} />
          <View style={{ width: 22, height: 14, borderRadius: 10, backgroundColor: '#000', marginLeft: -6 }} />
        </View>
      </View>
      {/* Cloud body */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
        <View style={{ width: 26, height: 16, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.92)' }} />
        <View style={{ width: 18, height: 22, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.96)', marginLeft: -8, marginBottom: 4 }} />
        <View style={{ width: 38, height: 26, borderRadius: 16, backgroundColor: '#fff', marginLeft: -10 }} />
        <View style={{ width: 22, height: 18, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.94)', marginLeft: -8, marginBottom: 2 }} />
        <View style={{ width: 16, height: 12, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.88)', marginLeft: -6 }} />
      </View>
    </Animated.View>
  );
}

// ─── Flying birds ─────────────────────────────────────────────────────────────
function Birds({ color = 'rgba(255,255,255,0.8)' }: { color?: string }) {
  const fly1 = useRef(new Animated.Value(0)).current;
  const fly2 = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fly1, { toValue: -3, duration: 500, useNativeDriver: true }),
        Animated.timing(fly1, { toValue: 0, duration: 500, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.delay(250),
        Animated.timing(fly2, { toValue: -3, duration: 500, useNativeDriver: true }),
        Animated.timing(fly2, { toValue: 0, duration: 500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // V-shape bird using two small arcs
  const BirdShape = ({ anim }: { anim: Animated.Value }) => (
    <Animated.View style={{ flexDirection: 'row', transform: [{ translateY: anim }] }}>
      {/* Left wing */}
      <View style={{ width: 10, height: 5, borderTopLeftRadius: 6, borderTopRightRadius: 3, borderTopWidth: 2, borderColor: color, backgroundColor: 'transparent' }} />
      {/* Right wing */}
      <View style={{ width: 10, height: 5, borderTopLeftRadius: 3, borderTopRightRadius: 6, borderTopWidth: 2, borderColor: color, backgroundColor: 'transparent', marginLeft: 1 }} />
    </Animated.View>
  );

  return (
    <>
      <View style={{ position: 'absolute', top: 22, left: '22%', flexDirection: 'row', gap: 8 }}>
        <BirdShape anim={fly1} />
        <BirdShape anim={fly2} />
        <BirdShape anim={fly1} />
      </View>
      <View style={{ position: 'absolute', top: 32, left: '38%', flexDirection: 'row', gap: 6 }}>
        <BirdShape anim={fly2} />
        <BirdShape anim={fly1} />
      </View>
    </>
  );
}

// ─── Shooting star ─────────────────────────────────────────────────────────────
function ShootingStar() {
  const anim = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(3000 + Math.random() * 5000),
        Animated.parallel([
          Animated.timing(anim, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(opacity, { toValue: 1, duration: 100, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: true }),
          ]),
        ]),
        Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return (
    <Animated.View style={{
      position: 'absolute', top: 25, left: '20%',
      width: 60, height: 2, borderRadius: 1,
      backgroundColor: '#fff',
      opacity,
      transform: [
        { rotate: '-30deg' },
        { translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [0, 80] }) },
        { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, 40] }) },
      ],
    }} />
  );
}

// ─── Theme definitions ────────────────────────────────────────────────────────
function buildTheme(slot: TimeSlot) {
  switch (slot) {
    case 'night':
      return {
        bg: '#0f172a',
        topBg: '#1e293b',
        decorations: (
          <>
            <StarsField />
            <ShootingStar />
            <Moon />
            {/* Milky way */}
            <View style={{ position: 'absolute', top: 8, left: '-10%', width: '120%', height: 28, borderRadius: 14, backgroundColor: 'rgba(148,163,184,0.07)', transform: [{ rotate: '-12deg' }] }} />
          </>
        ),
      };

    case 'dawn':
      return {
        bg: '#4c1d95',
        topBg: '#7c3aed',
        decorations: (
          <>
            <StarsField />
            {/* Horizon glow */}
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 50, backgroundColor: 'rgba(251,146,60,0.35)', borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }} />
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 20, backgroundColor: 'rgba(251,146,60,0.55)', borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }} />
            {/* Rising sun peek */}
            <View style={{ position: 'absolute', bottom: -14, alignSelf: 'center' }}>
              <View style={{ width: 60, height: 30, borderRadius: 30, backgroundColor: 'rgba(252,211,77,0.85)', overflow: 'hidden', borderTopLeftRadius: 30, borderTopRightRadius: 30 }} />
            </View>
          </>
        ),
      };

    case 'morning':
      return {
        bg: '#ea580c',
        topBg: '#f97316',
        decorations: (
          <>
            <Sun color="#fef3c7" glowColor="#fde68a" size={30} top={6} right={16} />
            <Cloud top={16} left="4%" scale={0.9} />
            <Cloud top={28} left="48%" scale={0.7} opacity={0.85} />
            <Cloud top={10} left="72%" scale={0.55} opacity={0.8} />
            <Birds color="rgba(255,255,255,0.85)" />
          </>
        ),
      };

    case 'noon':
      return {
        bg: '#0284c7',
        topBg: '#38bdf8',
        decorations: (
          <>
            {/* Bright overhead sun */}
            <View style={{ position: 'absolute', top: 6, left: '44%' }}>
              <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,180,0.98)', shadowColor: '#fff', shadowOpacity: 1, shadowRadius: 16 }} />
            </View>
            <Cloud top={10} left="5%" scale={1.05} />
            <Cloud top={18} left="55%" scale={0.8} opacity={0.9} />
            <Cloud top={6} left="30%" scale={0.55} opacity={0.85} />
            <Cloud top={32} left="75%" scale={0.65} opacity={0.8} />
            <Birds color="rgba(30,80,180,0.7)" />
          </>
        ),
      };

    case 'afternoon':
      return {
        bg: '#0369a1',
        topBg: '#0ea5e9',
        decorations: (
          <>
            <Sun color="#fde68a" glowColor="#fcd34d" size={26} top={10} right={20} />
            <Cloud top={14} left="5%" scale={0.95} />
            <Cloud top={26} left="52%" scale={0.72} />
            <Cloud top={8} left="35%" scale={0.5} opacity={0.75} />
            <Birds color="rgba(255,255,255,0.8)" />
          </>
        ),
      };

    case 'evening':
      return {
        bg: '#c2410c',
        topBg: '#ea580c',
        decorations: (
          <>
            {/* Setting sun on horizon */}
            <View style={{ position: 'absolute', bottom: -16, right: 24 }}>
              <View style={{ width: 58, height: 58, borderRadius: 29, backgroundColor: 'rgba(250,204,21,0.9)', shadowColor: '#f97316', shadowOpacity: 0.8, shadowRadius: 20, overflow: 'hidden' }}>
                {/* Horizon cut */}
                <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 28, backgroundColor: '#c2410c' }} />
              </View>
            </View>
            {/* Sky bands */}
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 30, backgroundColor: 'rgba(180,10,10,0.25)', borderTopLeftRadius: 24, borderTopRightRadius: 24 }} />
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 35, backgroundColor: 'rgba(249,115,22,0.22)', borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }} />
            <Cloud top={14} left="8%" scale={0.85} opacity={0.6} />
            <Cloud top={22} left="50%" scale={0.65} opacity={0.55} />
            {/* Orange-tinted birds */}
            <Birds color="rgba(20,20,20,0.5)" />
          </>
        ),
      };

    case 'dusk':
      return {
        bg: '#7c2d12',
        topBg: '#9a3412',
        decorations: (
          <>
            <StarsField />
            {/* Last light on horizon */}
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 30, backgroundColor: 'rgba(249,115,22,0.3)', borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }} />
            <Moon />
            <Cloud top={18} left="10%" scale={0.7} opacity={0.45} drift={false} />
          </>
        ),
      };
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────
const DynamicPetBackground = ({ children }: { children: React.ReactNode }) => {
  const [currentHour, setCurrentHour] = useState(new Date().getHours());

  useEffect(() => {
    const interval = setInterval(() => setCurrentHour(new Date().getHours()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const slot = getTimeSlot(currentHour);
  const theme = buildTheme(slot);

  return (
    <View style={{
      borderRadius: 24,
      overflow: 'hidden',
      width: '100%',
      alignItems: 'center',
      position: 'relative',
      backgroundColor: theme.bg,
      padding: 16,
      minHeight: 120,
    }}>
      {/* Top sky gradient strip */}
      <View style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 60,
        backgroundColor: theme.topBg,
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        opacity: 0.6,
      }} />

      {theme.decorations}

      {/* Bottom depth overlay */}
      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 40,
        backgroundColor: 'rgba(0,0,0,0.15)',
        borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
      }} />

      <View style={{ width: '100%', alignItems: 'center', zIndex: 1 }}>
        {children}
      </View>
    </View>
  );
};

export default DynamicPetBackground;