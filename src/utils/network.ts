// Basit network kontrolü - Firebase offline desteği zaten var
// Bu sadece kullanıcıya bilgi vermek için

export interface NetworkState {
  isConnected: boolean;
}

let currentNetworkState: NetworkState = {
  isConnected: true, // Varsayılan olarak true, Firebase offline desteği var
};

// Firebase hatalarından network hatası olup olmadığını kontrol et
export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();
    return (
      errorMessage.includes('network') ||
      errorMessage.includes('fetch') ||
      errorMessage.includes('connection') ||
      errorMessage.includes('offline') ||
      errorMessage.includes('timeout')
    );
  }
  return false;
};

// Network durumunu güncelle (Firebase hatalarından)
export const updateNetworkState = (isConnected: boolean): void => {
  currentNetworkState.isConnected = isConnected;
};

// İnternet bağlantısı var mı? (varsayılan true, Firebase offline desteği var)
export const isOnline = (): boolean => {
  return currentNetworkState.isConnected;
};
