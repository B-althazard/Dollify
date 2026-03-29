import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cloneCreatorSnapshot } from '../creator/store';
import type { PromptPackage } from '../prompt/engine';
import type { CreatorSnapshot } from '../schema/contracts';

type BridgeJobStatus = 'queued' | 'processing' | 'complete' | 'failed';

export interface SavedPreset {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  promptSignature: string;
  thumbnailDataUrl: string | null;
  summaryLines: string[];
  snapshot: CreatorSnapshot;
}

export interface GalleryEntry {
  id: string;
  nonce: string;
  provider: 'venice-userscript';
  status: BridgeJobStatus;
  createdAt: string;
  updatedAt: string;
  imageDataUrl: string | null;
  errorMessage: string | null;
  promptPackage: PromptPackage;
  snapshot: CreatorSnapshot;
}

export interface BridgePresence {
  connected: boolean;
  signal: 'idle' | 'connected' | 'warning';
  lastStatus: string;
  lastDetail: string;
  lastHeartbeatAt: string | null;
}

interface LibraryStoreState {
  presets: SavedPreset[];
  gallery: GalleryEntry[];
  bridge: BridgePresence;
  savePreset: (
    snapshot: CreatorSnapshot,
    promptPackage: PromptPackage,
  ) => SavedPreset;
  queueBridgeJob: (
    snapshot: CreatorSnapshot,
    promptPackage: PromptPackage,
    nonce: string,
  ) => void;
  markBridgeProcessing: (status?: string, detail?: string) => void;
  markBridgeConnected: () => void;
  updateBridgeStatus: (
    status?: string,
    detail?: string,
    connected?: boolean,
  ) => void;
  completeBridgeJob: (nonce: string, imageDataUrl: string) => void;
  failLatestBridgeJob: (message: string) => void;
  resetLibrary: () => void;
}

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `library-${Date.now()}-${Math.round(Math.random() * 1_000_000)}`;
}

function toIsoNow() {
  return new Date().toISOString();
}

function clonePromptPackage(promptPackage: PromptPackage): PromptPackage {
  return {
    ...promptPackage,
    summaryLines: [...promptPackage.summaryLines],
    warnings: [...promptPackage.warnings],
    modelHints: [...promptPackage.modelHints],
    guidanceLines: [...promptPackage.guidanceLines],
  };
}

function getPresetName(index: number, mode: CreatorSnapshot['mode']) {
  return `Preset ${String(index).padStart(2, '0')} - ${mode === 'futa' ? 'Futa' : 'Female'}`;
}

const defaultBridge: BridgePresence = {
  connected: false,
  signal: 'idle',
  lastStatus: 'Bridge standby',
  lastDetail: 'Waiting for Venice userscript heartbeat.',
  lastHeartbeatAt: null,
};

export const useLibraryStore = create<LibraryStoreState>()(
  persist(
    (set, get) => ({
      presets: [],
      gallery: [],
      bridge: defaultBridge,
      savePreset: (snapshot, promptPackage) => {
        const now = toIsoNow();
        const nextPreset: SavedPreset = {
          id: createId(),
          name: getPresetName(get().presets.length + 1, snapshot.mode),
          createdAt: now,
          updatedAt: now,
          promptSignature: promptPackage.signature,
          thumbnailDataUrl:
            get().gallery.find(
              (entry) =>
                entry.promptPackage.signature === promptPackage.signature &&
                entry.status === 'complete' &&
                entry.imageDataUrl,
            )?.imageDataUrl ?? null,
          summaryLines: promptPackage.summaryLines.slice(0, 3),
          snapshot: cloneCreatorSnapshot(snapshot),
        };

        set((state) => ({
          presets: [nextPreset, ...state.presets].slice(0, 18),
        }));

        return nextPreset;
      },
      queueBridgeJob: (snapshot, promptPackage, nonce) =>
        set((state) => {
          const nextEntry: GalleryEntry = {
            id: createId(),
            nonce,
            provider: 'venice-userscript',
            status: 'queued',
            createdAt: toIsoNow(),
            updatedAt: toIsoNow(),
            imageDataUrl: null,
            errorMessage: null,
            promptPackage: clonePromptPackage(promptPackage),
            snapshot: cloneCreatorSnapshot(snapshot),
          };

          return {
            gallery: [nextEntry, ...state.gallery].slice(0, 24),
          };
        }),
      markBridgeProcessing: (status, detail) =>
        set((state) => ({
          bridge: {
            ...state.bridge,
            connected: true,
            signal: 'connected',
            lastStatus: status ?? state.bridge.lastStatus,
            lastDetail: detail ?? state.bridge.lastDetail,
            lastHeartbeatAt: state.bridge.lastHeartbeatAt ?? toIsoNow(),
          },
          gallery: state.gallery.map((entry, index) =>
            index === 0 &&
            (entry.status === 'queued' || entry.status === 'processing')
              ? {
                  ...entry,
                  status: 'processing',
                  updatedAt: toIsoNow(),
                }
              : entry,
          ),
        })),
      markBridgeConnected: () =>
        set((state) => ({
          bridge: {
            ...state.bridge,
            connected: true,
            signal: 'connected',
            lastHeartbeatAt: toIsoNow(),
            lastStatus:
              state.bridge.lastStatus === defaultBridge.lastStatus
                ? 'Bridge connected'
                : state.bridge.lastStatus,
          },
        })),
      updateBridgeStatus: (status, detail, connected) =>
        set((state) => ({
          bridge: {
            ...state.bridge,
            connected: connected ?? state.bridge.connected,
            signal:
              connected === false
                ? 'warning'
                : connected === true
                  ? 'connected'
                  : state.bridge.signal,
            lastStatus: status ?? state.bridge.lastStatus,
            lastDetail: detail ?? state.bridge.lastDetail,
            lastHeartbeatAt:
              connected === true ? toIsoNow() : state.bridge.lastHeartbeatAt,
          },
        })),
      completeBridgeJob: (nonce, imageDataUrl) =>
        set((state) => ({
          gallery: state.gallery.map((entry) =>
            entry.nonce === nonce
              ? {
                  ...entry,
                  status: 'complete',
                  updatedAt: toIsoNow(),
                  imageDataUrl,
                  errorMessage: null,
                }
              : entry,
          ),
          presets: state.presets.map((preset) => {
            const matchedGallery = state.gallery.find(
              (entry) =>
                entry.nonce === nonce &&
                entry.promptPackage.signature === preset.promptSignature,
            );

            if (!matchedGallery || preset.thumbnailDataUrl) {
              return preset;
            }

            return {
              ...preset,
              thumbnailDataUrl: imageDataUrl,
              updatedAt: toIsoNow(),
            };
          }),
          bridge: {
            ...state.bridge,
            connected: true,
            signal: 'connected',
            lastStatus: 'Image transferred',
            lastDetail: 'Latest Venice result saved into the gallery.',
            lastHeartbeatAt: toIsoNow(),
          },
        })),
      failLatestBridgeJob: (message) =>
        set((state) => {
          const failedEntry = state.gallery.find(
            (entry) =>
              entry.status === 'queued' || entry.status === 'processing',
          );

          return {
            gallery: state.gallery.map((entry) =>
              entry.id === failedEntry?.id
                ? {
                    ...entry,
                    status: 'failed',
                    errorMessage: message,
                    updatedAt: toIsoNow(),
                  }
                : entry,
            ),
            bridge: {
              ...state.bridge,
              connected: true,
              signal: 'warning',
              lastStatus: 'Bridge error',
              lastDetail: message,
              lastHeartbeatAt: state.bridge.lastHeartbeatAt ?? toIsoNow(),
            },
          };
        }),
      resetLibrary: () =>
        set({ presets: [], gallery: [], bridge: defaultBridge }),
    }),
    {
      name: 'dollify-library-v1',
    },
  ),
);
