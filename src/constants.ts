import { ThemeColor } from "./types";

export const CURRENT_APP_VERSION = "3.0.0"; 
export const STORE_URL = "https://play.google.com/store/apps/details?id=com.arslanstdioh.petfeeder"; 
export const REVENUECAT_API_KEY = "goog_rEaMOfTSaUylfUmosaPOTAkxUzW"; 

// Storage Keys
export const STORAGE_KEYS = {
  TASKS: "petfeeder_tasks",
  PET: "petfeeder_pet",
  DARKMODE: "petfeeder_dark_mode",
  COLOR_THEME: "petfeeder_theme_color",
  COLOR_ONBOARD_SHOWN: "petfeeder_color_onboard_shown",
  LANGUAGE: "petfeeder_language",
  WEEKLY_RANDOM_IDS: "petfeeder_weekly_random_ids",
  WEEKLY_RANDOM_TS: "petfeeder_weekly_random_ts",
  SIMPLE_MODE: "petfeeder_simple_mode",
  SOUND_ENABLED: "petfeeder_sound_enabled",
  PURCHASE_UNLIMITED_NAME: "petfeeder_purchase_unlimited_name",
  PURCHASE_OWNED_THEMES: "petfeeder_purchase_owned_themes",
  PURCHASE_BOOSTER_END_TIME: "petfeeder_purchase_booster_end_time",
  SETTINGS_ACTIVE_THEME: "petfeeder_settings_active_theme",
  FREE_NAME_CHANGE_USED: "petfeeder_free_name_change_used",
  PET_TYPE: "petfeeder_pet_type",
  ONBOARD_SHOWN: "petfeeder_onboard_shown",
  IS_GUEST: "petfeeder_is_guest",
  USER_ID: "petfeeder_user_id"
};

// SKU IDs
export const SKUS = {
  UNLIMITED_NAME_CHANGE: 'petfeeder_unlimited_name_change',
  THEME_PACK_1: 'petfeeder_theme_pack_1',
  BOOSTER_24H: 'petfeeder_booster_24h',
  SPONSOR_MEETING: 'petfeeder_sponsor_meeting'
};

export const TRANSLATIONS = {
  tr: {
    appName: "🐾 PetFeeder",
    subtitle: "Görevlerini yap, hayvanını büyüt ve mutlu et!",
    madeBy: "",
    navGarden: "Petlerim", navHome: "Ana", navTasks: "Görevler", navCalendar: "Takvim", navSettings: "Ayarlar",
    growth: "Büyüme", growthStats: "{current} / {target} Büyüme • Yaş {age}",
    addTaskBtn: "Görev Ekle", timerBtn: "Sayaç", quickAddTitle: "Hızlı Görev Ekle", quickAddPlace: "Görev adını yaz...",
    add: "Ekle", todayTasks: "Bugünkü Görevlerin", noTaskToday: "Bugün için görevin yok. Bir tane ekle! 🐾",
    ourSponsors: "✨ Altın Destekçilerimiz ✨", noSponsorsYet: "Henüz sponsor yok. İlk sen ol!",
    allTasks: "Tüm Görevler", calendarMonth: "{month} {year}", dayTasks: "{date} Görevleri", noTaskDay: "Görev yok.",
    store: "Mağaza", booster: "Hızlandırıcı", boosterBtn: "24 Saatlik 2x Büyüme Al (50 TL)", boosterActive: "Hızlandırıcınız aktif! Kalan süre: {hours} saat",
    petNameTitle: "Evcil Hayvan Adı", petNamePlace: "Evcil hayvanının adı", updateNameBtn: "İsmi Güncelle", updateNameFreeBtn: "İsmi Güncelle (1 Ücretsiz Hakkın Var)",
    buyNameBtn: "Sınırsız İsim Değiştirme Al ", personalization: "Kişiselleştirme", themeTitle: "Yuva Teması",
    themeDefault: "Varsayılan Tema (Bedava)", themeBeach: "Kumsal Teması (Kullan)", buyThemeBeach: "Kumsal Teması Satın Al (300 TL)",
    generalSettings: "Genel Ayarlar", whichPet: "Hangisini besliyorsun?", dog: "Köpek", cat: "Kedi", penguin: "Penguen", darkMode: "Karanlık Mod",
    mainColor: "Ana Tema Rengi", resetAll: "Her Şeyi Sıfırla", sponsorTitle: "Sponsorluk & Geliştirici",
    sponsorBtn: "Sponsor Ol & Geliştiriciyle Tanış (500 TL)", sponsorThanksTitle: "Harikasın! 🌟",
    sponsorThanksMsg: "Desteğin için teşekkürler! Adın ana ekrana eklendi. Geliştirici ile görüşme planlamak için lütfen mail at: support@petfeeder.com",
    account: "Hesap", notLoggedIn: "Giriş yapılmadı (Misafir Modu)", loggedInAs: "Giriş yapıldı: {username}",
    loginOrRegister: "Giriş Yap / Kayıt Ol", logout: "Çıkış Yap", authTitle: "Aileye Katıl!", authDesc: "Verilerini korumak ve sponsor olmak için giriş yap.",
    emailPlace: "E-posta", passPlace: "Şifre", usernamePlace: "Kullanıcı Adı (Örn: KediBabası)", loginBtn: "Giriş Yap", registerBtn: "Kayıt Ol",
    guestBtn: "Şimdilik Geç (Misafir)", toggleToRegister: "Hesabın yok mu? Kayıt Ol", toggleToLogin: "Zaten hesabın var mı? Giriş Yap",
    authSuccess: "Başarıyla giriş yapıldı!", authError: "Bir hata oluştu: ", themeSelectTitle: "Tema Seç",
    themeSelectDesc: "Favori rengi seç ve uygulama içi ana buton ve ögelerde etkin olsun!", continue: "Devam Et",
    themeNote: "Ayarlar'dan tekrar değiştirebilirsin.", petSelectTitle: "Hayvanı Seç", petSelectDesc: "Hangi evcil hayvanı beslemek istiyorsun?",
    petNameLabel: "Bir de isim ver:", petNameInputPlace: "İsim (boş bırakırsan 'Sonny' olur)", languageSelect: "Dil / Language",
    addTaskTitle: "Görev Ekle", addTaskPlace: "Örn: Mama ver / su kabını doldur", addDescPlace: "Açıklama (opsiyonel)", taskType: "Görev Tipi",
    repeat: "Tekrar", repeatNone: "Yok", repeatDaily: "Her Gün", repeatWeekly: "Her Hafta", setReminder: "Bu görev için zaman seç (bildirim)",
    dateTime: "Tarih ve Saat", dateLabel: "Tarih", timeLabel: "Saat", cancel: "Vazgeç", save: "Kaydet", timerTitle: "Zamanlayıcı", start: "Başlat", pause: "Duraklat", reset: "Sıfırla",
    timerRunning: "Sayaç Devam Ediyor", timerClose: "Kapat (sayaç arka planda devam eder)", onboardTitle: "Hoş geldin!",
    onboardDesc: "Görevlerini gir, tamamla, ve evcil dostunu mutlu et!", onboardSub: "Kedi veya Köpeği — ayarlardan seç. Her görev tamamlandığında seçtiğin hayvana göre ses çıkar.",
    startBtn: "Başla", alertWarning: "Uyarı", alertTaskEmpty: "Görev adı boş olamaz", alertUsernameEmpty: "Kullanıcı adı boş olamaz!",
    alertBoosterActive: "Hızlandırıcı Aktif!", alertBoosterMsg: "2x Mama kazandın: {gain} (normalde {base})", alertSuccess: "Başarılı",
    alertNameUpdated: "Evcil hayvanının adı {name} olarak güncellendi!", alertPurchaseFail: "Satın alma işlemi başarısız oldu.",
    alertError: "Hata", alertResetConfirm: "Tüm görevler ve mama puanı sıfırlansın mı?", yes: "Evet", no: "Hayır", alertOk: "Tamam",
    updateTitle: "Güncelleme Gerekli", updateMsg: "Uygulamanın yeni bir sürümü mevcut. Devam etmek için lütfen güncelle.", updateBtn: "Güncelle",
    simpleMode: "Sade Mod (Evcil Hayvanı Gizle)", soundEffects: "Ses Efektleri", simpleModeHeader: "TO-DO",
    types: { kucuk: "Küçük", orta: "Orta", buyuk: "Büyük", ozel: "Özel" },
    toastTaskCompleted: "Görev tamamlandı", toastTaskDeleted: "Görev silindi", toastUndo: "Geri Al",
    today: "Bugün", tomorrow: "Yarın", yesterday: "Dün", routines: "Rutinler",
    support: "Destek", supportTitle: "Destek ve Talepler", supportDesc: "Sorunlarınız, önerileriniz veya talepleriniz için geliştiriciyle iletişime geçin", supportBtn: "Geliştiriciyle İletişime Geç", supportModalTitle: "Mesaj Gönder", supportMessagePlace: "Mesajınızı buraya yazın...", supportSendBtn: "Gönder", supportSuccess: "Mesajınız başarıyla gönderildi! Teşekkürler.", supportError: "Mesaj gönderilirken bir hata oluştu.", supportMessageEmpty: "Lütfen bir mesaj yazın.",
    coupleMode: "Çift Modu", coupleModeDesc: "Partnerinizle ortak bir evcil hayvan paylaşın.", openCoupleMode: "Çift Modu / Partner Eşleş", coupleModeTitle: "Çift Modu", coupleModeSubtitle: "Partnerinizle ortak bir evcil hayvan paylaşın.", createInviteCode: "Davet Kodu Oluştur", createInviteDesc: "Davet kodunu partnerinizle paylaşın; kodla eve katılsın.", inviteCodePlaceholder: "000000", joinWithCode: "Davet kodu ile katıl", joinWithCodeDesc: "Partnerinizin verdiği 6 haneli kodu girin.", join: "Katıl", yourInviteCode: "Davet kodunuz", shareCodeHint: "Bu kodu partnerinizle paylaşın; eşleşene kadar bekleyin.", yourPartner: "Partnerin", sharedPet: "Ortak hayvanınız", loading: "Yükleniyor...", signInToPair: "Partnerinizle eşleşmek için giriş yapmalısınız.", partnerDefaultName: "Eş", level: "Seviye", hunger: "Açlık",
    ageUpTitle: "Tebrikler!", ageUpMsg: "Yaş {age} tebrikler!",
    buyCoins: "Para Satın Al", buyCoinsDesc: "Bahçe parası satın almak için kullanın.", animalNotPurchased: "Hayvan henüz satın alınmadı",
    otherPets: "Diğer Hayvanlar", buyPet: "Satın Al", coin: "Coin"
  },
  en: {
    appName: "🐾 PetFeeder", subtitle: "Write tasks, complete them, make your pet happy!", madeBy: "",
    navGarden: "My Pets", navHome: "Home", navTasks: "Tasks", navCalendar: "Calendar", navSettings: "Settings",
    growth: "Growth", growthStats: "{current} / {target} Growth • Age {age}",
    addTaskBtn: "Add Task", timerBtn: "Timer", quickAddTitle: "Quick Add Task", quickAddPlace: "Write task name...",
    add: "Add", todayTasks: "Today's Tasks", noTaskToday: "No tasks for today. Add one! 🐾",
    ourSponsors: "✨ Our Gold Sponsors ✨", noSponsorsYet: "No sponsors yet. Be the first!",
    allTasks: "All Tasks", calendarMonth: "{month} {year}", dayTasks: "Tasks for {date}", noTaskDay: "No tasks.",
    store: "Store", booster: "Booster", boosterBtn: "Buy 24h 2x Growth (50 TL)", boosterActive: "Booster active! Time left: {hours} hours",
    petNameTitle: "Pet Name", petNamePlace: "Pet's name", updateNameBtn: "Update Name", updateNameFreeBtn: "Update Name (1 Free Right)",
    buyNameBtn: "Buy Unlimited Name Change", personalization: "Personalization", themeTitle: "Home Theme",
    themeDefault: "Default Theme (Free)", themeBeach: "Beach Theme (Use)", buyThemeBeach: "Buy Beach Theme (300 TL)",
    generalSettings: "General Settings", whichPet: "Which one are you feeding?", dog: "Dog", cat: "Cat", penguin: "Penguin", darkMode: "Dark Mode",
    mainColor: "Main Theme Color", resetAll: "Reset Everything", sponsorTitle: "Sponsorship & Developer",
    sponsorBtn: "Become Sponsor & Meet Dev (500 TL)", sponsorThanksTitle: "You Rock! 🌟",
    sponsorThanksMsg: "Thanks for support! Your name is now on the home screen. To schedule your meeting, please email: support@petfeeder.com",
    account: "Account", notLoggedIn: "Not logged in (Guest Mode)", loggedInAs: "Logged in as: {username}",
    loginOrRegister: "Login / Register", logout: "Log Out", authTitle: "Join the Family!", authDesc: "Sign in to keep data safe and become a sponsor.",
    emailPlace: "Email", passPlace: "Password", usernamePlace: "Username (e.g. CatDad)", loginBtn: "Login", registerBtn: "Register",
    guestBtn: "Skip for Now (Guest)", toggleToRegister: "No account? Register", toggleToLogin: "Have an account? Login",
    authSuccess: "Successfully logged in!", authError: "An error occurred: ", themeSelectTitle: "Select Theme",
    themeSelectDesc: "Choose your favorite color to apply on buttons and elements!", continue: "Continue",
    themeNote: "You can change this later in Settings.", petSelectTitle: "Choose Your Pet", petSelectDesc: "Which pet do you want to feed?",
    petNameLabel: "Give it a name:", petNameInputPlace: "Name (default 'Sonny')", languageSelect: "Dil / Language",
    addTaskTitle: "Add Task", addTaskPlace: "E.g. Feed pet / Fill water", addDescPlace: "Description (optional)", taskType: "Task Type",
    repeat: "Repeat", repeatNone: "None", repeatDaily: "Daily", repeatWeekly: "Weekly", setReminder: "Set time for this task (notification)",
    dateTime: "Date and Time", dateLabel: "Date", timeLabel: "Time", cancel: "Cancel", save: "Save", timerTitle: "Timer", start: "Start", pause: "Pause", reset: "Reset",
    timerRunning: "Timer Running", timerClose: "Close (timer continues in background)", onboardTitle: "Welcome!",
    onboardDesc: "Enter tasks, complete them, and make your pet happy!", onboardSub: "Choose Cat or Dog in settings. Sounds play based on your choice.",
    startBtn: "Start", alertWarning: "Warning", alertTaskEmpty: "Task name cannot be empty", alertUsernameEmpty: "Username cannot be empty!",
    alertBoosterActive: "Booster Active!", alertBoosterMsg: "You gained 2x Food: {gain} (normally {base})", alertSuccess: "Success",
    alertNameUpdated: "Your pet's name updated to {name}!", alertPurchaseFail: "Purchase failed.", alertError: "Error",
    alertResetConfirm: "Reset all tasks and pet points?", yes: "Yes", no: "No", alertOk: "OK",
    updateTitle: "Update Required", updateMsg: "A new version of the app is available. Please update to continue.", updateBtn: "Update",
    simpleMode: "Simple Mode (Hide Pet)", soundEffects: "Sound Effects", simpleModeHeader: "📝 To-Do List",
    types: { kucuk: "Small", orta: "Medium", buyuk: "Large", ozel: "Special" },
    toastTaskCompleted: "Task completed", toastTaskDeleted: "Task deleted", toastUndo: "Undo",
    today: "Today", tomorrow: "Tomorrow", yesterday: "Yesterday", routines: "Routines",
    support: "Support", supportTitle: "Support & Requests", supportDesc: "Contact the developer for issues, suggestions, or requests", supportBtn: "Contact Developer", supportModalTitle: "Send Message", supportMessagePlace: "Write your message here...", supportSendBtn: "Send", supportSuccess: "Your message has been sent successfully! Thank you.", supportError: "An error occurred while sending the message.", supportMessageEmpty: "Please write a message.",
    coupleMode: "Couple Mode", coupleModeDesc: "Share a pet with your partner.", openCoupleMode: "Couple Mode / Pair with Partner", coupleModeTitle: "Couple Mode", coupleModeSubtitle: "Share a pet with your partner.", createInviteCode: "Create Invite Code", createInviteDesc: "Share the invite code with your partner so they can join.", inviteCodePlaceholder: "000000", joinWithCode: "Join with invite code", joinWithCodeDesc: "Enter the 6-digit code your partner gave you.", join: "Join", yourInviteCode: "Your invite code", shareCodeHint: "Share this code with your partner and wait until they join.", yourPartner: "Your partner", sharedPet: "Your shared pet", loading: "Loading...", signInToPair: "Sign in to pair with your partner.", partnerDefaultName: "Partner", level: "Level", hunger: "Hunger",
    ageUpTitle: "Congrats!", ageUpMsg: "Level {age} reached!",
    buyCoins: "Buy Coins", buyCoinsDesc: "Purchase coins for the garden.", animalNotPurchased: "Animal not purchased yet",
    otherPets: "Other Pets", buyPet: "Buy", coin: "Coin"
  }
};

export const THEME_COLORS: ThemeColor[] = [
  { key: "mavi", label: "M", main: "#4CC9F0", bg: "#dcfce7", accent: "#4361EE" }, 
  { key: "yesil", label: "G", main: "#58CC02", bg: "#E5F7D0", accent: "#46A302" }, 
  { key: "mor", label: "P", main: "#B5179E", bg: "#FAE0F4", accent: "#7209B7" },
  { key: "buz", label: "S", main: "#90A4AE", bg: "#ECEFF1", accent: "#546E7A" },
  { key: "turuncu", label: "O", main: "#F77F00", bg: "#FFE8D6", accent: "#D62828" },
  { key: "pembe", label: "R", main: "#FF4D6D", bg: "#FFE5EC", accent: "#C9184A" },
  { key: "gul", label: "R", main: "#f08080", bg: "#FFF0F0", accent: "#E53935" },
];

export const monthNamesTr = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
export const monthNamesEn = ["January","February","March","April","May","June","July","August","September","October","November","December"];
export const weekdayShortTr = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
export const weekdayShortEn = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];