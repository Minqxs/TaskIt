/// <reference types="expo/types" />

declare const process:
  | {
      env?: {
        EXPO_PUBLIC_API_URL?: string;
      };
    }
  | undefined;

declare const localStorage:
  | {
      getItem: (key: string) => string | null;
      setItem: (key: string, value: string) => void;
      removeItem: (key: string) => void;
    }
  | undefined;
