import LottieView from 'lottie-react-native';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

interface HeartPopProps {
  visible: boolean;
  size?: number;
}

const HeartPop: React.FC<HeartPopProps> = React.memo(({ visible, size = 120 }) => {
  const lottieRef = useRef<LottieView>(null);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animasyonu başlat
      lottieRef.current?.play();
      
      // Scale ve opacity animasyonları
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Animasyon bitişinde fade out
      const hideTimer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Reset
          scaleAnim.setValue(0);
          opacityAnim.setValue(0);
        });
      }, 800);

      return () => clearTimeout(hideTimer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
      pointerEvents="none"
    >
      <LottieView
        ref={lottieRef}
        source={require('../../assets/animations/heart.json')}
        style={{ width: size, height: size }}
        loop={false}
        autoPlay={false}
        speed={1.2}
      />
    </Animated.View>
  );
});

HeartPop.displayName = 'HeartPop';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '35%',
    alignSelf: 'center',
    zIndex: 9999,
  },
});

export default HeartPop;
