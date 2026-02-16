# Firebase Realtime Database Güvenlik Kuralları

## Permission Denied Hatası Çözümü

Eğer "Davet Kodu Oluştur" butonuna bastığınızda **"Permission Denied"** hatası alıyorsanız, Firebase Console'da güvenlik kurallarını güncellemeniz gerekiyor.

### Adımlar:

1. [Firebase Console](https://console.firebase.google.com) → Projeniz **petfeeder-todo**
2. **Build** → **Realtime Database**
3. **Rules** sekmesine gidin
4. Aşağıdaki kuralları yapıştırın:

```json
{
  "rules": {
    "households": {
      "$householdId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    },
    "inviteCodes": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

5. **Publish** butonuna tıklayın

### Açıklama:

- `auth != null`: Sadece giriş yapmış kullanıcılar okuyabilir/yazabilir
- `households`: Ev (household) verileri için izin
- `inviteCodes`: Davet kodları için izin

Bu kurallar ile:
- ✅ Giriş yapmış kullanıcılar ev oluşturabilir
- ✅ Giriş yapmış kullanıcılar davet kodları oluşturabilir/okuyabilir
- ✅ Giriş yapmış kullanıcılar evlere katılabilir
- ❌ Giriş yapmamış kullanıcılar hiçbir şey yapamaz

### Test Modu (Geliştirme için - DİKKATLİ KULLANIN):

Eğer hızlı test için herkesin erişebilmesini istiyorsanız (sadece geliştirme için):

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

⚠️ **UYARI**: Bu kurallar herkesin verilerinize erişmesine izin verir! Sadece test için kullanın, production'da kullanmayın!
