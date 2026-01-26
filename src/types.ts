export type TaskRepeatType = "none" | "daily" | "weekly";

export type Task = {
  id: string;
  text: string;
  done: boolean;
  mamaValue: number;
  type: "küçük" | "orta" | "büyük" | "özel";
  date: string; 
  order?: number;
  repeat?: TaskRepeatType;
  remindAt?: number; 
  description?: string; 
};

export type PetType = "cat" | "dog";

export type Pet = {
  type: PetType;
  age: number; 
  mama: number; 
  name: string; 
};

export type ThemeColor = {
  key: string;
  label: string;
  main: string;
  bg: string;     // Arkaplan rengi (pastel)
  accent: string; // Koyu vurgu rengi (border/shadow için)
};

export type UserData = {
  uid: string;
  username: string;
  totalMama: number;
  isSponsor: boolean;
};

// Re-export component types
export * from './types/components';