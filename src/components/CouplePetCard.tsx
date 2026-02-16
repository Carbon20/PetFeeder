import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Pet } from '../types';
import PetPreview from './PetPreview';

interface PetCardSideProps {
  pet: Pet | null;
  label: string;
  progressPercent: number;
  hungerPercent: number;
  büyümeHedefi: number;
  completedToday: number;
  themeText: string;
  themeSubText: string;
  actionColor: string;
  t: Record<string, any>;
  loading?: boolean;
  isPartner?: boolean;
}

const PenguinAsset = require('../../assets/images/penguinn.png');

function PetCardSide({
  pet,
  label,
  progressPercent,
  hungerPercent,
  büyümeHedefi,
  completedToday,
  themeText,
  themeSubText,
  actionColor,
  t,
  loading,
  isPartner,
}: PetCardSideProps) {
  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 20 }}>
        <ActivityIndicator size="small" color={actionColor} />
      </View>
    );
  }

  if (!pet) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 20 }}>
        <Text allowFontScaling={false} style={{ fontSize: 32, marginBottom: 8 }}>👻</Text>
        <Text allowFontScaling={false} style={{ fontSize: 12, color: themeSubText, textAlign: 'center' }}>
          {isPartner ? 'Partner yok' : 'Pet yok'}
        </Text>
      </View>
    );
  }

  const ratio = progressPercent;
  let source;
  let previewType: "lottie" | "image" = "lottie";

  try {
    if (pet.type === "penguin") {
      previewType = "image";
      source = PenguinAsset;
    } else if (pet.type === "dog") {
      if (ratio < 30) source = require('../../assets/animations/dog_sad.json');
      else if (ratio < 70) source = require('../../assets/animations/dog_neutral.json');
      else source = require('../../assets/animations/dog_happy.json');
    } else {
      if (ratio < 30) source = require('../../assets/animations/cat_sad.json');
      else if (ratio < 70) source = require('../../assets/animations/cat_neutral.json');
      else source = require('../../assets/animations/cat_happy.json');
    }
  } catch (e) {
    source = null;
  }

  return (
    <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 8 }}>
      {/* Pet name */}
      <Text
        allowFontScaling={false}
        style={{
          fontSize: 16,
          fontWeight: '700',
          color: themeText,
          marginBottom: 8,
          textAlign: 'center',
        }}
      >
        {label}
      </Text>

      {/* Pet preview */}
      <View style={{ marginBottom: 12 }}>
        {source ? (
          <PetPreview type={previewType} source={source} size={110} />
        ) : (
          <Text allowFontScaling={false} style={{ fontSize: 48 }}>
            {ratio < 30 ? '😢' : ratio < 70 ? '😐' : '😸'}
          </Text>
        )}
      </View>

      {/* Stats */}
      <View style={{ width: '100%', alignItems: 'center' }}>
        {/* XP Progress */}
        <View style={{ width: '100%', marginBottom: 6 }}>
          <View
            style={{
              height: 8,
              backgroundColor: 'rgba(0,0,0,0.1)',
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                height: '100%',
                width: `${Math.min(progressPercent, 100)}%`,
                backgroundColor: actionColor,
              }}
            />
          </View>
          <Text
            allowFontScaling={false}
            style={{
              fontSize: 10,
              color: themeSubText,
              marginTop: 2,
              textAlign: 'center',
            }}
          >
            {pet.mama}/{büyümeHedefi} XP • Lvl {pet.age}
          </Text>
        </View>

        {/* Hunger */}
        <View
          style={{
            width: '100%',
            height: 6,
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderRadius: 3,
            overflow: 'hidden',
            marginBottom: 6,
          }}
        >
          <View
            style={{
              height: '100%',
              width: `${hungerPercent}%`,
              backgroundColor: hungerPercent > 50 ? '#10b981' : hungerPercent > 20 ? '#f59e0b' : '#ef4444',
            }}
          />
        </View>

        {/* Completed today */}
        <Text
          allowFontScaling={false}
          style={{
            fontSize: 11,
            fontWeight: '600',
            color: themeText,
            textAlign: 'center',
          }}
        >
          ✓ {completedToday} {t.tasksToday || 'görev'}
        </Text>
      </View>
    </View>
  );
}

interface CouplePetCardProps {
  myPet: Pet;
  myProgressPercent: number;
  myHungerPercent: number;
  myBüyümeHedefi: number;
  myCompletedToday: number;
  partnerPet: Pet | null;
  partnerName: string;
  partnerLoading: boolean;
  partnerCompletedToday: number;
  onHighFive?: () => void;
  themeCard: string;
  themeText: string;
  themeSubText: string;
  actionColor: string;
  t: Record<string, any>;
}

export default function CouplePetCard({
  myPet,
  myProgressPercent,
  myHungerPercent,
  myBüyümeHedefi,
  myCompletedToday,
  partnerPet,
  partnerName,
  partnerLoading,
  partnerCompletedToday,
  onHighFive,
  themeCard,
  themeText,
  themeSubText,
  actionColor,
  t,
}: CouplePetCardProps) {
  const partnerProgressPercent = partnerPet
    ? Math.min((partnerPet.mama / ((partnerPet.age + 1) * 50)) * 100, 100)
    : 0;
  const partnerBüyümeHedefi = partnerPet ? (partnerPet.age + 1) * 50 : 50;
  const partnerHungerPercent = 75; // Placeholder, gerçek değer partnerPet'ten gelmeli

  return (
    <View style={{ backgroundColor: themeCard, borderRadius: 16, overflow: 'hidden', marginBottom: 16 }}>
      {/* Header with high-five button */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: 'rgba(0,0,0,0.03)',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text allowFontScaling={false} style={{ fontSize: 14, fontWeight: '700', color: '#FF6B9D' }}>
            💑
          </Text>
          <Text allowFontScaling={false} style={{ fontSize: 14, fontWeight: '700', color: themeText }}>
            Çift Modu
          </Text>
        </View>

        {onHighFive && (
          <TouchableOpacity
            onPress={onHighFive}
            style={{
              backgroundColor: actionColor,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 12,
            }}
            activeOpacity={0.8}
          >
            <Text allowFontScaling={false} style={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>
              🙌 High-five
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Two pets side by side */}
      <View style={{ flexDirection: 'row', paddingVertical: 16 }}>
        {/* My pet (left) */}
        <PetCardSide
          pet={myPet}
          label={myPet.name}
          progressPercent={myProgressPercent}
          hungerPercent={myHungerPercent}
          büyümeHedefi={myBüyümeHedefi}
          completedToday={myCompletedToday}
          themeText={themeText}
          themeSubText={themeSubText}
          actionColor={actionColor}
          t={t}
        />

        {/* Divider */}
        <View
          style={{
            width: 1,
            backgroundColor: 'rgba(0,0,0,0.1)',
            marginHorizontal: 8,
          }}
        />

        {/* Partner pet (right) */}
        <PetCardSide
          pet={partnerPet}
          label={partnerName}
          progressPercent={partnerProgressPercent}
          hungerPercent={partnerHungerPercent}
          büyümeHedefi={partnerBüyümeHedefi}
          completedToday={partnerCompletedToday}
          themeText={themeText}
          themeSubText={themeSubText}
          actionColor={actionColor}
          t={t}
          loading={partnerLoading}
          isPartner={true}
        />
      </View>
    </View>
  );
}
