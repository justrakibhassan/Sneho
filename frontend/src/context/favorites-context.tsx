"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "@/hooks/use-auth";
import axiosInstance from "@/lib/axios";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";

interface FavoriteAnimation {
  id: number;
  startX: number;
  startY: number;
}

interface FavoritesContextType {
  favoritesCount: number;
  favoriteIds: number[];
  updateFavorites: () => Promise<void>;
  triggerHeartAnimation: (x: number, y: number) => void;
  toggleFavorite: (
    sitterId: number,
    startX?: number,
    startY?: number
  ) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined
);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [animations, setAnimations] = useState<FavoriteAnimation[]>([]);

  const updateFavorites = useCallback(async () => {
    if (!isAuthenticated || user?.role !== "PARENT") {
      setFavoriteIds([]);
      return;
    }
    try {
      const res = await axiosInstance.get("/favorites");
      if (res.data.success) {
        setFavoriteIds(res.data.favorites.map((f: { id: number }) => f.id));
      }
    } catch (error) {
      console.error("Error updating favorites:", error);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    updateFavorites(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [updateFavorites]);

  const triggerHeartAnimation = (x: number, y: number) => {
    const id = Date.now();
    setAnimations((prev) => [...prev, { id, startX: x, startY: y }]);
    setTimeout(() => {
      setAnimations((prev) => prev.filter((a) => a.id !== id));
    }, 1000);
  };

  const toggleFavorite = async (
    sitterId: number,
    startX?: number,
    startY?: number
  ) => {
    if (!isAuthenticated || user?.role !== "PARENT") return;

    const isAdding = !favoriteIds.includes(sitterId);
    if (isAdding && startX !== undefined && startY !== undefined) {
      triggerHeartAnimation(startX, startY);
    }

    try {
      const res = await axiosInstance.post("/favorites/toggle", {
        babysitterId: sitterId,
      });
      if (res.data.success) {
        if (res.data.isFavorited) {
          setFavoriteIds((prev) => [...new Set([...prev, sitterId])]);
        } else {
          setFavoriteIds((prev) => prev.filter((id) => id !== sitterId));
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favoritesCount: favoriteIds.length,
        favoriteIds,
        updateFavorites,
        triggerHeartAnimation,
        toggleFavorite,
      }}
    >
      {children}

      {/* Flight Animations Overlay */}
      <div className="fixed inset-0 pointer-events-none z-100 overflow-hidden">
        <AnimatePresence>
          {animations.map((animation) => (
            <FlyingHeart
              key={animation.id}
              startX={animation.startX}
              startY={animation.startY}
            />
          ))}
        </AnimatePresence>
      </div>
    </FavoritesContext.Provider>
  );
};

const FlyingHeart: React.FC<{ startX: number; startY: number }> = ({
  startX,
  startY,
}) => {
  const [target, setTarget] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const navbarHeart = document.getElementById("navbar-favorites-icon");
    if (navbarHeart) {
      const rect = navbarHeart.getBoundingClientRect();
      setTarget({ // eslint-disable-line react-hooks/set-state-in-effect
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    } else {
      setTarget({ x: window.innerWidth - 100, y: 50 }); // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, []);

  return (
    <motion.div
      initial={{ x: startX, y: startY, scale: 0.5, opacity: 1 }}
      animate={{
        x: target.x,
        y: target.y,
        scale: [1, 1.8, 0.4],
        opacity: [1, 1, 0],
      }}
      transition={{
        duration: 0.8,
        ease: [0.45, 0, 0.55, 1],
        times: [0, 0.3, 1],
      }}
      style={{ position: "fixed", left: 0, top: 0 }}
      className="text-rose-500"
    >
      <Heart className="fill-current w-8 h-8 drop-shadow-lg" />
    </motion.div>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};
