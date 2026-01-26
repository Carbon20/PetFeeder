import React, { useState, useEffect } from 'react';
import { View } from 'react-native';

const DynamicPetBackground = ({ children }: { children: React.ReactNode }) => {
  const [currentHour, setCurrentHour] = useState(new Date().getHours());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 60000); 
    return () => clearInterval(interval);
  }, []);

  let bgColor;
  if (currentHour >= 6 && currentHour < 12) {
    bgColor = '#F97316'; 
  } else if (currentHour >= 12 && currentHour < 18) {
    bgColor = '#4CC9F0'; 
  } else {
    bgColor = '#3F37C9'; 
  }

  return (
    <View style={{ borderRadius: 24, overflow: 'hidden', width: '100%', alignItems:'center', position: 'relative', backgroundColor: bgColor, padding: 16 }}>
      <View style={{position:'absolute', top: -50, right: -50, width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(255,255,255,0.1)'}} />
      <View style={{position:'absolute', bottom: -30, left: -20, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(0,0,0,0.05)'}} />
      
      <View style={{ width: '100%', alignItems: 'center' }}>
        {children}
      </View>
    </View>
  );
};

export default DynamicPetBackground;