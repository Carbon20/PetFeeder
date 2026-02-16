import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type ModernAlertButton = {
  text: string;
  onPress?: () => void;
  variant?: "default" | "primary" | "danger";
};

interface ModernAlertProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  buttons?: ModernAlertButton[];
  themeCard: string;
  themeText: string;
  themeSubText: string;
  actionColor: string;
}

export default function ModernAlert({
  visible,
  title,
  message,
  onClose,
  buttons,
  themeCard,
  themeText,
  themeSubText,
  actionColor,
}: ModernAlertProps) {
  const safeButtons =
    buttons && buttons.length > 0
      ? buttons
      : [{ text: "OK", onPress: onClose, variant: "primary" as const }];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: themeCard }]}>
          <Text style={[styles.title, { color: themeText }]}>{title}</Text>
          <Text style={[styles.message, { color: themeSubText }]}>{message}</Text>
          <View style={styles.actions}>
            {safeButtons.map((btn, idx) => {
              const isPrimary = btn.variant === "primary";
              const isDanger = btn.variant === "danger";
              const bgColor = isPrimary ? actionColor : isDanger ? "#ef4444" : "transparent";
              const textColor = isPrimary || isDanger ? "#fff" : themeText;
              return (
                <TouchableOpacity
                  key={`${btn.text}-${idx}`}
                  onPress={() => {
                    btn.onPress?.();
                    onClose();
                  }}
                  style={[
                    styles.button,
                    isPrimary || isDanger ? styles.buttonFilled : styles.buttonGhost,
                    { borderColor: actionColor, backgroundColor: bgColor },
                  ]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.buttonText, { color: textColor }]}>{btn.text}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 32,
    padding: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 16,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  buttonFilled: {
    borderColor: "transparent",
  },
  buttonGhost: {
    backgroundColor: "transparent",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "800",
  },
});
