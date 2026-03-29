import * as Dialog from '@radix-ui/react-dialog';
import { useReducedMotion } from 'motion/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  type BridgeErrorDetail,
  type BridgeResultDetail,
  type BridgeStatusDetail,
  buildBridgeGenerateDetail,
  createBridgeNonce,
  dispatchBridgeGenerate,
} from '../features/bridge/events';
import {
  cloneCreatorSnapshot,
  getCreatorStoreSnapshot,
  getDefaultSnapshot,
  useCreatorStore,
} from '../features/creator/store';
import { useLibraryStore } from '../features/library/store';
import {
  aspectRatioOptions,
  getPromptModelProfile,
} from '../features/prompt/catalog';
import {
  buildPromptPackage,
  buildPromptSignature,
  type PromptPackage,
} from '../features/prompt/engine';
import { getVisibleFieldsForCategory } from '../features/rules/engine';
import { getCreatorSchema, getFieldById } from '../features/schema/registry';
import { PromptConfigSheet } from '../features/ui/PromptConfigSheet';
import { PromptPackagePanel } from '../features/ui/PromptPackagePanel';
import { RuleNotice } from '../features/ui/RuleNotice';
import { SchemaSection } from '../features/ui/SchemaSection';
import { StudioLibrarySheet } from '../features/ui/StudioLibrarySheet';
import { useSwipeNavigation } from '../features/ui/useSwipeNavigation';

const schema = getCreatorSchema();

type AppPage = 'home' | 'build' | 'gen' | 'gallery';
type ThemeMode = 'light' | 'dark' | 'amoled';
type ToastState = {
  tone: 'neutral' | 'success' | 'danger';
  message: string;
} | null;

const pageMeta: Record<AppPage, { path: string; label: string }> = {
  home: { path: '/', label: 'Home' },
  build: { path: '/build', label: 'Build' },
  gen: { path: '/gen', label: 'Gen' },
  gallery: { path: '/gallery', label: 'Gallery' },
};

function copyText(text: string) {
  if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
    throw new Error('Clipboard unavailable');
  }

  return navigator.clipboard.writeText(text);
}

function downloadFile(dataUrl: string, fileName: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  link.click();
}

function getCurrentPage(pathname: string): AppPage {
  const normalized = pathname === '/' ? pathname : pathname.replace(/\/$/, '');

  if (normalized === '/build') {
    return 'build';
  }

  if (normalized === '/gen') {
    return 'gen';
  }

  if (normalized === '/gallery') {
    return 'gallery';
  }

  return 'home';
}

function buildStarterSnapshots() {
  const female = cloneCreatorSnapshot(getDefaultSnapshot());
  const futa = cloneCreatorSnapshot(getDefaultSnapshot());

  futa.mode = 'futa';
  futa.formValues['identity.mode'] = ['futa'];

  return [
    {
      id: 'starter-female',
      name: 'Starter Female',
      note: 'Default female creator baseline.',
      snapshot: female,
    },
    {
      id: 'starter-futa',
      name: 'Starter Futa',
      note: 'Default futa-female creator baseline.',
      snapshot: futa,
    },
  ];
}

function LogoIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6 5.5h6.2a5.3 5.3 0 0 1 0 10.6H9.6V19H6z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 9h2.5a1.9 1.9 0 1 1 0 3.8H9.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ThemeIcon({ theme }: { theme: ThemeMode }) {
  if (theme === 'dark') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M17 15.5A6.5 6.5 0 0 1 8.5 7a7 7 0 1 0 8.5 8.5Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (theme === 'amoled') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle
          cx="12"
          cy="12"
          r="5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M12 2v3M12 19v3M2 12h3M19 12h3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle
        cx="12"
        cy="12"
        r="4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 1.8v2.8M12 19.4v2.8M4.1 4.1l2 2M17.9 17.9l2 2M1.8 12h2.8M19.4 12h2.8M4.1 19.9l2-2M17.9 6.1l2-2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a1.8 1.8 0 0 1-2.5 2.5l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a1.8 1.8 0 0 1-3.6 0v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a1.8 1.8 0 0 1-2.5-2.5l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a1.8 1.8 0 0 1 0-3.6h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a1.8 1.8 0 1 1 2.5-2.5l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a1.8 1.8 0 1 1 3.6 0v.2a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a1.8 1.8 0 1 1 2.5 2.5l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6h.2a1.8 1.8 0 0 1 0 3.6h-.2a1 1 0 0 0-.9.6Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NavIcon({ page }: { page: AppPage }) {
  if (page === 'build') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M4 18 18 4M11 4h7v7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (page === 'gen') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 3 6.5 12h4L9 21l8.5-11h-4z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (page === 'gallery') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect
          x="4"
          y="4"
          width="16"
          height="16"
          rx="3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="m7.5 15.5 2.8-2.8 2.2 2.2 3.8-4.1 2.2 2.7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 11.5 12 5l8 6.5V20H4z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FabIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 5v14M5 12h14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        className={open ? 'fab-icon__path is-open' : 'fab-icon__path'}
      />
    </svg>
  );
}

export function AppShell() {
  const reducedMotion = useReducedMotion();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPage = getCurrentPage(location.pathname);
  const {
    activeCategoryId,
    applySnapshot,
    detailSheetFieldId,
    derived,
    fieldLocks,
    formValues,
    mode,
    openDetailSheet,
    promptConfig,
    randomizeCreator,
    resetCreator,
    setActiveCategory,
    setMode,
    setFieldValue,
    setPromptConfig,
    toggleFieldLock,
  } = useCreatorStore();
  const [promptPackage, setPromptPackage] = useState<PromptPackage | null>(
    null,
  );
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [promptConfigOpen, setPromptConfigOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [openFieldId, setOpenFieldId] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [toast, setToast] = useState<ToastState>(null);
  const bridge = useLibraryStore((state) => state.bridge);
  const gallery = useLibraryStore((state) => state.gallery);
  const presets = useLibraryStore((state) => state.presets);
  const completeBridgeJob = useLibraryStore((state) => state.completeBridgeJob);
  const deleteGalleryEntry = useLibraryStore(
    (state) => state.deleteGalleryEntry,
  );
  const failLatestBridgeJob = useLibraryStore(
    (state) => state.failLatestBridgeJob,
  );
  const markBridgeConnected = useLibraryStore(
    (state) => state.markBridgeConnected,
  );
  const markBridgeProcessing = useLibraryStore(
    (state) => state.markBridgeProcessing,
  );
  const queueBridgeJob = useLibraryStore((state) => state.queueBridgeJob);
  const savePreset = useLibraryStore((state) => state.savePreset);
  const updateBridgeStatus = useLibraryStore(
    (state) => state.updateBridgeStatus,
  );
  const starterSnapshots = useMemo(() => buildStarterSnapshots(), []);

  const activeCategory =
    schema.categories.find((category) => category.id === activeCategoryId) ??
    schema.categories[0];
  const visibleFields = getVisibleFieldsForCategory(
    schema,
    derived,
    activeCategory.id,
  );
  const sheetField = detailSheetFieldId
    ? getFieldById(detailSheetFieldId)
    : undefined;
  const currentSignature = useMemo(
    () => buildPromptSignature(derived, promptConfig),
    [derived, promptConfig],
  );
  const packageIsStale = promptPackage?.signature !== currentSignature;
  const latestGalleryEntry = gallery[0] ?? null;
  const latestCompletedEntry =
    gallery.find(
      (entry) => entry.status === 'complete' && entry.imageDataUrl,
    ) ?? null;
  const latestImageEntry = latestCompletedEntry ?? latestGalleryEntry;
  const wordCount = promptPackage?.positivePrompt
    .split(/\s+/)
    .filter(Boolean).length;
  const modelProfile = getPromptModelProfile(promptConfig.modelId);
  const ratioProfile = aspectRatioOptions.find(
    (option) => option.id === promptConfig.aspectRatio,
  );
  const swipeHandlers = useSwipeNavigation({
    itemIds: schema.categories.map((category) => category.id),
    activeId: activeCategory.id,
    onNavigate: (nextCategoryId) => {
      setActiveCategory(nextCategoryId);
      setOpenFieldId(null);
    },
  });

  const showToast = useCallback((nextToast: ToastState) => {
    setToast(nextToast);

    if (nextToast) {
      window.setTimeout(() => {
        setToast((currentToast) =>
          currentToast?.message === nextToast.message ? null : currentToast,
        );
      }, 1800);
    }
  }, []);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem('dollify-theme');

    if (
      storedTheme === 'light' ||
      storedTheme === 'dark' ||
      storedTheme === 'amoled'
    ) {
      setTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('dollify-theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleBridgeReady = () => {
      markBridgeConnected();
    };

    const handleBridgeHeartbeat = () => {
      markBridgeConnected();
    };

    const handleBridgeStatus = (event: Event) => {
      const detail = (event as CustomEvent<BridgeStatusDetail>).detail;
      updateBridgeStatus(detail?.status, detail?.detail, detail?.connected);

      if (detail?.status) {
        markBridgeProcessing(detail.status, detail.detail);
      }
    };

    const handleBridgeImage = (event: Event) => {
      const detail = (event as CustomEvent<BridgeResultDetail>).detail;

      if (!detail?.nonce || !detail.dataUrl) {
        return;
      }

      completeBridgeJob(detail.nonce, detail.dataUrl);
      showToast({
        tone: 'success',
        message: 'Venice render saved to gallery.',
      });
    };

    const handleBridgeError = (event: Event) => {
      const detail = (event as CustomEvent<BridgeErrorDetail>).detail;
      failLatestBridgeJob(
        detail?.message ?? 'Bridge reported an unknown error.',
      );
      showToast({
        tone: 'danger',
        message: detail?.message ?? 'Bridge reported an unknown error.',
      });
    };

    window.addEventListener('xgen:bridge-ready', handleBridgeReady);
    window.addEventListener('xgen:bridge-heartbeat', handleBridgeHeartbeat);
    window.addEventListener('xgen:status-update', handleBridgeStatus);
    window.addEventListener('xgen:image-received', handleBridgeImage);
    window.addEventListener('xgen:generation-error', handleBridgeError);

    return () => {
      window.removeEventListener('xgen:bridge-ready', handleBridgeReady);
      window.removeEventListener(
        'xgen:bridge-heartbeat',
        handleBridgeHeartbeat,
      );
      window.removeEventListener('xgen:status-update', handleBridgeStatus);
      window.removeEventListener('xgen:image-received', handleBridgeImage);
      window.removeEventListener('xgen:generation-error', handleBridgeError);
    };
  }, [
    completeBridgeJob,
    failLatestBridgeJob,
    markBridgeConnected,
    markBridgeProcessing,
    showToast,
    updateBridgeStatus,
  ]);

  const generatePackage = useCallback(() => {
    const nextPackage = buildPromptPackage(schema, derived, promptConfig);
    setPromptPackage(nextPackage);
    return nextPackage;
  }, [derived, promptConfig]);

  const handleCopyPackage = useCallback(
    async (source: 'manual' | 'auto', nextPackage = promptPackage) => {
      if (!nextPackage) {
        return;
      }

      try {
        await copyText(nextPackage.positivePrompt);
        showToast({
          tone: 'success',
          message:
            source === 'auto'
              ? 'Fresh positive prompt copied automatically.'
              : 'Positive prompt copied.',
        });
      } catch {
        showToast({
          tone: 'danger',
          message: 'Clipboard failed. Prompt stays visible for manual copy.',
        });
      }
    },
    [promptPackage, showToast],
  );

  const handlePrepareGenerator = async () => {
    const nextPackage = generatePackage();
    await handleCopyPackage('auto', nextPackage);
    navigate(pageMeta.gen.path);
  };

  const handleRandomize = async () => {
    randomizeCreator();
    const nextState = useCreatorStore.getState();
    const nextPackage = buildPromptPackage(
      schema,
      nextState.derived,
      nextState.promptConfig,
    );

    setPromptPackage(nextPackage);
    await handleCopyPackage('auto', nextPackage);
    showToast({ tone: 'success', message: 'Creation Kit randomized.' });
  };

  const handleReset = () => {
    resetCreator();
    setPromptPackage(null);
    setOpenFieldId(null);
    showToast({ tone: 'success', message: 'Creation Kit reset.' });
  };

  const handleSavePreset = () => {
    const nextPackage =
      !promptPackage || packageIsStale ? generatePackage() : promptPackage;
    const snapshot = getCreatorStoreSnapshot(useCreatorStore.getState());
    const preset = savePreset(snapshot, nextPackage);

    showToast({
      tone: 'success',
      message: `${preset.name} saved to your vault.`,
    });
  };

  const handleLoadPreset = (presetId: string) => {
    const preset = presets.find((entry) => entry.id === presetId);

    if (!preset) {
      return;
    }

    applySnapshot(preset.snapshot);
    setLibraryOpen(false);
    navigate(pageMeta.build.path);
    showToast({ tone: 'success', message: `${preset.name} restored.` });
  };

  const handleLoadGalleryEntry = (entryId: string) => {
    const entry = gallery.find((item) => item.id === entryId);

    if (!entry) {
      return;
    }

    applySnapshot(entry.snapshot);
    setLibraryOpen(false);
    navigate(pageMeta.build.path);
    showToast({ tone: 'success', message: 'Generation state restored.' });
  };

  const handleSendToBridge = () => {
    const nextPackage =
      !promptPackage || packageIsStale ? generatePackage() : promptPackage;
    const snapshot = getCreatorStoreSnapshot(useCreatorStore.getState());
    const nonce = createBridgeNonce();

    queueBridgeJob(snapshot, nextPackage, nonce);

    const wasDispatched = dispatchBridgeGenerate(
      buildBridgeGenerateDetail(snapshot, nextPackage, nonce),
    );

    showToast({
      tone: wasDispatched ? 'success' : 'danger',
      message: wasDispatched
        ? 'Prompt sent to the Venice bridge.'
        : 'Bridge dispatch failed in this environment.',
    });
  };

  const cycleTheme = () => {
    setTheme((currentTheme) => {
      if (currentTheme === 'light') {
        return 'dark';
      }

      if (currentTheme === 'dark') {
        return 'amoled';
      }

      return 'light';
    });
  };

  const pageActions = (
    <>
      <div className={`fab-menu ${fabOpen ? 'is-open' : ''}`}>
        <button
          type="button"
          className="fab-pill"
          onClick={() => {
            void handleCopyPackage('manual');
            setFabOpen(false);
          }}
          disabled={!promptPackage}
        >
          Copy
        </button>
        <button
          type="button"
          className="fab-pill"
          onClick={() => {
            handleReset();
            setFabOpen(false);
          }}
        >
          Reset
        </button>
        <button
          type="button"
          className="fab-pill"
          disabled={!derived.isValid}
          onClick={() => {
            void handleRandomize();
            setFabOpen(false);
          }}
        >
          Random
        </button>
      </div>
      <button
        type="button"
        className="fab-button"
        onClick={() => setFabOpen((currentOpen) => !currentOpen)}
        aria-label={fabOpen ? 'Close actions' : 'Open actions'}
        aria-expanded={fabOpen}
      >
        <FabIcon open={fabOpen} />
      </button>
    </>
  );

  return (
    <main className="app-frame">
      <div className="app-shell">
        <header className="top-bar card-surface">
          <div className="top-bar__brand">
            <span className="logo-badge" aria-hidden="true">
              <LogoIcon />
            </span>
            <div>
              <strong>Dollify</strong>
              <span>v{__APP_VERSION__}</span>
            </div>
          </div>
          <p className="top-bar__title">{pageMeta[currentPage].label}</p>
          <div className="top-bar__actions">
            <button
              type="button"
              className="icon-button"
              onClick={cycleTheme}
              aria-label={`Theme: ${theme}`}
            >
              <ThemeIcon theme={theme} />
            </button>
            <button
              type="button"
              className="icon-button"
              onClick={() => setSettingsOpen(true)}
              aria-label="Open settings"
            >
              <SettingsIcon />
            </button>
          </div>
        </header>

        <div className="toast-stack" aria-live="polite">
          {toast ? (
            <div className="toast-shell">
              <RuleNotice tone={toast.tone}>{toast.message}</RuleNotice>
            </div>
          ) : null}
          {derived.notices.length > 0 ? (
            <div className="toast-shell toast-shell--notice">
              <RuleNotice>{derived.notices[0]}</RuleNotice>
            </div>
          ) : null}
        </div>

        {currentPage === 'home' ? (
          <section className="page-stack">
            <section className="home-hero card-surface">
              <div>
                <p className="section-label">Mobile-first creator</p>
                <h1>Build repeatable dolls without writing prompts.</h1>
              </div>
              <p>
                Jump into a starter kit, reopen saved dolls, or move straight
                into the generator lane.
              </p>
              <div className="home-hero__meta">
                <article>
                  <strong>{schema.categories.length}</strong>
                  <span>Creation lanes</span>
                </article>
                <article>
                  <strong>{presets.length}</strong>
                  <span>Vault presets</span>
                </article>
                <article>
                  <strong>{gallery.length}</strong>
                  <span>Local renders</span>
                </article>
              </div>
            </section>

            <section className="page-section">
              <div className="section-head">
                <div>
                  <p className="section-label">Default presets</p>
                  <h2>Starter kits</h2>
                </div>
              </div>
              <div className="preset-grid">
                {starterSnapshots.map((starter) => (
                  <button
                    key={starter.id}
                    type="button"
                    className="preset-panel card-surface"
                    onClick={() => {
                      applySnapshot(starter.snapshot);
                      navigate(pageMeta.build.path);
                    }}
                  >
                    <span className="preset-panel__art" />
                    <strong>{starter.name}</strong>
                    <p>{starter.note}</p>
                  </button>
                ))}
              </div>
            </section>

            <section className="page-section">
              <div className="section-head">
                <div>
                  <p className="section-label">User presets</p>
                  <h2>Saved dolls</h2>
                </div>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => setLibraryOpen(true)}
                >
                  Open vault
                </button>
              </div>
              <div className="preset-grid">
                {presets.length > 0 ? (
                  presets.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      className="preset-panel card-surface"
                      onClick={() => handleLoadPreset(preset.id)}
                    >
                      <span
                        className="preset-panel__art is-image"
                        style={
                          preset.thumbnailDataUrl
                            ? {
                                backgroundImage: `linear-gradient(rgba(12, 11, 18, 0.18), rgba(12, 11, 18, 0.68)), url(${preset.thumbnailDataUrl})`,
                              }
                            : undefined
                        }
                      />
                      <strong>{preset.name}</strong>
                      <p>{preset.summaryLines.join(' | ')}</p>
                    </button>
                  ))
                ) : (
                  <div className="empty-card card-surface">
                    <h3>No presets yet</h3>
                    <p>Save a doll from the Gen page to fill your home grid.</p>
                  </div>
                )}
              </div>
            </section>
          </section>
        ) : null}

        {currentPage === 'build' ? (
          <section className="page-stack page-stack--build">
            <section className="build-header card-surface">
              <div>
                <p className="section-label">Creation kit</p>
                <h2>{activeCategory.label}</h2>
                <p>{activeCategory.description}</p>
              </div>
              <fieldset className="mode-switch">
                <legend className="sr-only">Creator mode</legend>
                <button
                  type="button"
                  className={`mode-pill ${mode === 'female' ? 'is-active' : ''}`}
                  onClick={() => setMode('female')}
                >
                  Female
                </button>
                <button
                  type="button"
                  className={`mode-pill ${mode === 'futa' ? 'is-active' : ''}`}
                  onClick={() => setMode('futa')}
                >
                  Futa-Female
                </button>
              </fieldset>
              <nav className="category-rail" aria-label="Creation categories">
                {schema.categories.map((category) => {
                  const state = derived.categoryStates[category.id];

                  return (
                    <button
                      key={category.id}
                      type="button"
                      className={`category-chip ${category.id === activeCategory.id ? 'is-active' : ''}`}
                      onClick={() => {
                        setActiveCategory(category.id);
                        setOpenFieldId(null);
                      }}
                    >
                      <span className="category-chip__body">
                        <strong>{category.label}</strong>
                        <small>{state.status}</small>
                      </span>
                    </button>
                  );
                })}
              </nav>
            </section>

            <SchemaSection
              category={activeCategory}
              fields={visibleFields}
              derived={derived}
              fieldLocks={fieldLocks}
              formValues={formValues}
              openFieldId={openFieldId}
              onChangeField={setFieldValue}
              onInspectOption={(message) =>
                showToast({ tone: 'neutral', message })
              }
              onSetOpenField={setOpenFieldId}
              onToggleFieldLock={toggleFieldLock}
              onOpenSheet={(fieldId) => openDetailSheet(fieldId)}
              reducedMotion={Boolean(reducedMotion)}
              swipeHandlers={swipeHandlers}
            />

            <section className="build-footer card-surface">
              <div>
                <p className="section-label">Next step</p>
                <h3>Move this state into the Gen page.</h3>
              </div>
              <button
                type="button"
                className="primary-button build-footer__button"
                disabled={!derived.isValid}
                onClick={() => {
                  void handlePrepareGenerator();
                }}
              >
                Generate package
              </button>
            </section>
          </section>
        ) : null}

        {currentPage === 'gen' ? (
          <section className="page-stack">
            <section className="render-stage card-surface">
              <div className="render-stage__frame">
                {latestImageEntry?.imageDataUrl ? (
                  <img
                    src={latestImageEntry.imageDataUrl}
                    alt="Latest generated render"
                    className="render-stage__image"
                  />
                ) : (
                  <div className="render-stage__placeholder">
                    <h2>Render preview</h2>
                    <p>
                      Send the current package to Venice to populate this stage.
                    </p>
                  </div>
                )}
              </div>
              <div className="render-stage__actions">
                <button
                  type="button"
                  className="ghost-button"
                  disabled={!latestImageEntry?.imageDataUrl}
                  onClick={() => {
                    if (latestImageEntry?.imageDataUrl) {
                      downloadFile(
                        latestImageEntry.imageDataUrl,
                        'dollify-render.png',
                      );
                    }
                  }}
                >
                  Save to device
                </button>
                <button
                  type="button"
                  className="ghost-button"
                  disabled={!latestImageEntry?.imageDataUrl}
                  onClick={() => {
                    if (latestImageEntry?.imageDataUrl) {
                      window.open(
                        latestImageEntry.imageDataUrl,
                        '_blank',
                        'noopener,noreferrer',
                      );
                    }
                  }}
                >
                  Full-screen
                </button>
                <button
                  type="button"
                  className="ghost-button"
                  disabled={!latestImageEntry}
                  onClick={() => {
                    if (latestImageEntry) {
                      deleteGalleryEntry(latestImageEntry.id);
                      showToast({
                        tone: 'success',
                        message: 'Latest gallery entry deleted.',
                      });
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </section>

            <section className="page-section">
              <div className="section-head">
                <div>
                  <p className="section-label">Prompt box</p>
                  <h2>Generated prompt</h2>
                </div>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => {
                    const nextPackage = generatePackage();
                    void handleCopyPackage('auto', nextPackage);
                  }}
                >
                  Refresh package
                </button>
              </div>
              {promptPackage ? (
                <PromptPackagePanel
                  promptPackage={promptPackage}
                  onCopyPositive={() => {
                    void handleCopyPackage('manual');
                  }}
                />
              ) : (
                <div className="empty-card card-surface">
                  <h3>No package yet</h3>
                  <p>Generate a package from Build or refresh one here.</p>
                </div>
              )}
            </section>

            <section className="stats-grid">
              <article className="stats-card card-surface">
                <span>Words used</span>
                <strong>{wordCount ?? 0}</strong>
              </article>
              <article className="stats-card card-surface">
                <span>Mode</span>
                <strong>{mode === 'futa' ? 'Futa' : 'Female'}</strong>
              </article>
              <article className="stats-card card-surface">
                <span>Model used</span>
                <strong>{modelProfile?.label ?? 'None'}</strong>
              </article>
              <article className="stats-card card-surface">
                <span>Canvas</span>
                <strong>
                  {ratioProfile?.label ?? promptConfig.aspectRatio}
                </strong>
              </article>
            </section>

            <button
              type="button"
              className="primary-button generate-button"
              onClick={handleSendToBridge}
            >
              Push to Venice Bridge
            </button>

            <section className="quick-grid">
              <button
                type="button"
                className="quick-grid__button card-surface"
                onClick={() => navigate(pageMeta.build.path)}
              >
                Edit
              </button>
              <button
                type="button"
                className="quick-grid__button card-surface"
                onClick={handleSavePreset}
              >
                Save doll
              </button>
              <button
                type="button"
                className="quick-grid__button card-surface"
                disabled={!derived.isValid}
                onClick={() => {
                  void handleRandomize();
                }}
              >
                Random
              </button>
              <button
                type="button"
                className="quick-grid__button card-surface"
                onClick={handleReset}
              >
                Reset
              </button>
            </section>
          </section>
        ) : null}

        {currentPage === 'gallery' ? (
          <section className="page-stack">
            <section className="page-section">
              <div className="section-head">
                <div>
                  <p className="section-label">Local renders</p>
                  <h2>Gallery</h2>
                </div>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => setLibraryOpen(true)}
                >
                  Open vault
                </button>
              </div>
              <div className="gallery-grid">
                {gallery.length > 0 ? (
                  gallery.map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      className="gallery-card card-surface"
                      onClick={() => handleLoadGalleryEntry(entry.id)}
                    >
                      <span
                        className="gallery-card__image"
                        style={
                          entry.imageDataUrl
                            ? {
                                backgroundImage: `linear-gradient(rgba(12, 11, 18, 0.08), rgba(12, 11, 18, 0.56)), url(${entry.imageDataUrl})`,
                              }
                            : undefined
                        }
                      >
                        {!entry.imageDataUrl ? entry.status : null}
                      </span>
                      <strong>
                        {entry.promptPackage.summaryLines[0] ?? 'Saved state'}
                      </strong>
                      <p>Tap to load this render back into the Creation Kit.</p>
                    </button>
                  ))
                ) : (
                  <div className="empty-card card-surface">
                    <h3>No gallery entries yet</h3>
                    <p>
                      Your Venice results will appear here after generation.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </section>
        ) : null}

        <nav className="floating-nav card-surface" aria-label="Primary pages">
          {(Object.keys(pageMeta) as AppPage[]).map((page) => (
            <button
              key={page}
              type="button"
              className={`floating-nav__button ${currentPage === page ? 'is-active' : ''}`}
              onClick={() => navigate(pageMeta[page].path)}
              aria-label={pageMeta[page].label}
            >
              <NavIcon page={page} />
            </button>
          ))}
        </nav>

        <div className="floating-fab">{pageActions}</div>

        <Dialog.Root open={settingsOpen} onOpenChange={setSettingsOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="sheet-overlay" />
            <Dialog.Content
              className="bottom-sheet"
              aria-describedby={undefined}
            >
              <div className="sheet-handle" />
              <div className="sheet-header">
                <div>
                  <Dialog.Title>Settings</Dialog.Title>
                  <p>Metrics, prompt setup, and local vault controls.</p>
                </div>
                <Dialog.Close className="sheet-close">Close</Dialog.Close>
              </div>
              <section className="settings-grid">
                <article className="stats-card card-surface">
                  <span>Studio lanes</span>
                  <strong>{schema.categories.length}</strong>
                </article>
                <article className="stats-card card-surface">
                  <span>Vault presets</span>
                  <strong>{presets.length}</strong>
                </article>
                <article className="stats-card card-surface">
                  <span>Local renders</span>
                  <strong>{gallery.length}</strong>
                </article>
                <article className="stats-card card-surface">
                  <span>Bridge</span>
                  <strong>{bridge.connected ? 'Ready' : 'Waiting'}</strong>
                </article>
              </section>
              <div className="settings-actions">
                <button
                  type="button"
                  className="secondary-button prompt-action-button"
                  onClick={() => {
                    setSettingsOpen(false);
                    setPromptConfigOpen(true);
                  }}
                >
                  Prompt setup
                </button>
                <button
                  type="button"
                  className="ghost-button prompt-action-button"
                  onClick={() => {
                    setSettingsOpen(false);
                    setLibraryOpen(true);
                  }}
                >
                  Open vault
                </button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        <Dialog.Root
          open={Boolean(sheetField)}
          onOpenChange={(open) =>
            openDetailSheet(open ? detailSheetFieldId : null)
          }
        >
          <Dialog.Portal>
            <Dialog.Overlay className="sheet-overlay" />
            <Dialog.Content
              className="bottom-sheet"
              aria-describedby={undefined}
            >
              <div className="sheet-handle" />
              <div className="sheet-header">
                <div>
                  <Dialog.Title>{sheetField?.label ?? 'Options'}</Dialog.Title>
                  <p>
                    {sheetField?.description ?? 'Browse all available options.'}
                  </p>
                </div>
                <Dialog.Close className="sheet-close">Close</Dialog.Close>
              </div>
              {sheetField ? (
                <SchemaSection
                  category={activeCategory}
                  fields={[sheetField]}
                  derived={derived}
                  fieldLocks={fieldLocks}
                  formValues={formValues}
                  openFieldId={sheetField.id}
                  onChangeField={setFieldValue}
                  onInspectOption={(message) =>
                    showToast({ tone: 'neutral', message })
                  }
                  onSetOpenField={() => undefined}
                  onToggleFieldLock={toggleFieldLock}
                  onOpenSheet={(fieldId) => openDetailSheet(fieldId)}
                  reducedMotion={true}
                  swipeHandlers={{
                    onTouchStart: () => undefined,
                    onTouchEnd: () => undefined,
                  }}
                />
              ) : null}
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        <PromptConfigSheet
          open={promptConfigOpen}
          config={promptConfig}
          onOpenChange={setPromptConfigOpen}
          onChange={setPromptConfig}
        />

        <StudioLibrarySheet
          open={libraryOpen}
          presets={presets}
          gallery={gallery}
          bridge={bridge}
          onOpenChange={setLibraryOpen}
          onLoadPreset={handleLoadPreset}
          onLoadGalleryEntry={handleLoadGalleryEntry}
        />
      </div>
    </main>
  );
}
