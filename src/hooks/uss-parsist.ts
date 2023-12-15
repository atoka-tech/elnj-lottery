import { useState, useEffect } from "react";

export const usePersistedState = <T>(key: string, defaultValue: T) => {
  // Get from local storage then
  // parse stored json or if none return defaultValue
  const getSavedValue = (): T => {
    const savedValue = window.localStorage.getItem(key);
    if (savedValue) {
      return JSON.parse(savedValue);
    }
    return defaultValue;
  };

  const [value, setValue] = useState<T>(getSavedValue);

  // Listen for changes on the value, then store it
  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [value, key]);

  return [value, setValue] as const;
};
