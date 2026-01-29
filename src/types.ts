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
  bg: string;     
  accent: string; 
};

export type UserData = {
  uid: string;
  username: string;
  totalMama: number;
  isSponsor: boolean;
};


export * from './types/components';
