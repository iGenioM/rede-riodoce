import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Producer } from "../types";
import { PRODUCERS } from "../mockData";

interface ProducersState {
  producers: Producer[];
  updateRadius: (producerId: string, km: number) => void;
  updateProfile: (producerId: string, patch: Partial<Producer>) => void;
}

function withMockPhotos(producers: Producer[]): Producer[] {
  return producers.map((p) => {
    const fresh = PRODUCERS.find((f) => f.id === p.id);
    if (!fresh) return p;
    return {
      ...p,
      avatarSeed: {
        ...p.avatarSeed,
        photoUrl: fresh.avatarSeed.photoUrl ?? p.avatarSeed.photoUrl,
      },
      coverSeed: {
        ...p.coverSeed,
        photoUrl: fresh.coverSeed.photoUrl ?? p.coverSeed.photoUrl,
      },
    };
  });
}

export const useProducersStore = create<ProducersState>()(
  persist(
    (set, get) => ({
      producers: PRODUCERS,
      updateRadius: (producerId, km) =>
        set({
          producers: get().producers.map((p) =>
            p.id === producerId ? { ...p, radiusKm: km } : p
          ),
        }),
      updateProfile: (producerId, patch) =>
        set({
          producers: get().producers.map((p) =>
            p.id === producerId ? { ...p, ...patch } : p
          ),
        }),
    }),
    {
      name: "ceasa-producers",
      version: 2,
      storage: createJSONStorage(() => localStorage),
      migrate: (persisted) => {
        const stored = persisted as ProducersState;
        return {
          ...stored,
          producers: withMockPhotos(stored.producers ?? PRODUCERS),
        };
      },
      merge: (persisted, current) => {
        const stored = (persisted as Partial<ProducersState> | undefined) ?? {};
        return {
          ...current,
          ...stored,
          producers: withMockPhotos(stored.producers ?? current.producers),
        };
      },
    }
  )
);
