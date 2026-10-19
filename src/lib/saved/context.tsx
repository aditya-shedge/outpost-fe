"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { toast } from "sonner";

const SAVED_ITEMS_KEY = "outpost_saved_items";

export interface SavedItem {
  id: string;
  type: "grant" | "challenge";
  name: string;
  savedAt: string;
}

interface SavedItemsContextType {
  savedItems: SavedItem[];
  isSaved: (id: string) => boolean;
  toggleSave: (item: Omit<SavedItem, "savedAt">) => void;
  removeSaved: (id: string) => void;
  clearAll: () => void;
}

const SavedItemsContext = createContext<SavedItemsContextType | undefined>(
  undefined
);

export function SavedItemsProvider({ children }: { children: ReactNode }) {
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved items from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(SAVED_ITEMS_KEY);
    if (stored) {
      try {
        setSavedItems(JSON.parse(stored));
      } catch {
        setSavedItems([]);
      }
    }
    setIsLoaded(true);
  }, []);

  // Persist to localStorage when saved items change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(SAVED_ITEMS_KEY, JSON.stringify(savedItems));
    }
  }, [savedItems, isLoaded]);

  const isSaved = useCallback(
    (id: string) => {
      return savedItems.some((item) => item.id === id);
    },
    [savedItems]
  );

  const toggleSave = useCallback(
    (item: Omit<SavedItem, "savedAt">) => {
      const exists = savedItems.find((s) => s.id === item.id);

      if (exists) {
        // Remove from saved
        setSavedItems((prev) => prev.filter((s) => s.id !== item.id));
        toast.success("Removed from saved items");
      } else {
        // Add to saved
        const newItem: SavedItem = {
          ...item,
          savedAt: new Date().toISOString(),
        };
        setSavedItems((prev) => [newItem, ...prev]);
        toast.success("Saved for later");
      }
    },
    [savedItems]
  );

  const removeSaved = useCallback((id: string) => {
    setSavedItems((prev) => prev.filter((s) => s.id !== id));
    toast.success("Removed from saved items");
  }, []);

  const clearAll = useCallback(() => {
    setSavedItems([]);
    toast.success("Cleared all saved items");
  }, []);

  return (
    <SavedItemsContext.Provider
      value={{ savedItems, isSaved, toggleSave, removeSaved, clearAll }}
    >
      {children}
    </SavedItemsContext.Provider>
  );
}

export function useSavedItems() {
  const context = useContext(SavedItemsContext);
  if (context === undefined) {
    throw new Error("useSavedItems must be used within a SavedItemsProvider");
  }
  return context;
}
