// Stato condiviso tra schermate: feed capi REALI (GET /api/v1/garments),
// "like" REALE (POST /api/v1/gallery/{id}/toggle-favorite = salva in
// guardaroba, coerente con l'handoff: "SALVATI" in Armadio = capi con like),
// piu' filtro/taglia/colore in prova (ancora locali, non persistiti).
// Il fetch iniziale parte solo quando isAuthenticated diventa true (le
// schermate Auth sono montate comunque dentro questo stesso Provider).
import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import { getGallery, listGarments, toggleFavorite as apiToggleFavorite } from '../api/garments';
import { toFeedItem } from '../data/garmentVisuals';
import { SIZES, TRYON_COLORS } from '../data/mockData';
import { FeedItem } from '../data/models';
import { useAuth } from './AuthContext';

interface AppState {
  items: FeedItem[];
  liked: Record<string, boolean>;
  loading: boolean;
  error: string | null;
  filter: string;
  tryItemId: string | number | null;
  trySize: (typeof SIZES)[number];
  tryColorIndex: number;
  scanBannerVisible: boolean;
}

type AppAction =
  | { type: 'SET_LOADING' }
  | { type: 'SET_FEED'; items: FeedItem[]; liked: Record<string, boolean> }
  | { type: 'SET_ERROR'; error: string }
  | { type: 'SET_LIKED'; id: string; value: boolean }
  | { type: 'RESET' }
  | { type: 'SET_FILTER'; filter: string }
  | { type: 'SET_TRY_ITEM'; id: string | number }
  | { type: 'SET_TRY_SIZE'; size: (typeof SIZES)[number] }
  | { type: 'SET_TRY_COLOR'; index: number }
  | { type: 'DISMISS_SCAN_BANNER' };

const initialState: AppState = {
  items: [],
  liked: {},
  loading: true,
  error: null,
  filter: 'Per te',
  tryItemId: null,
  trySize: 'M',
  tryColorIndex: 0,
  scanBannerVisible: true,
};

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: true, error: null };
    case 'SET_FEED':
      return { ...state, items: action.items, liked: action.liked, loading: false, error: null };
    case 'SET_ERROR':
      return { ...state, loading: false, error: action.error };
    case 'SET_LIKED':
      return { ...state, liked: { ...state.liked, [action.id]: action.value } };
    case 'RESET':
      return initialState;
    case 'SET_FILTER':
      return { ...state, filter: action.filter };
    case 'SET_TRY_ITEM':
      return { ...state, tryItemId: action.id };
    case 'SET_TRY_SIZE':
      return { ...state, trySize: action.size };
    case 'SET_TRY_COLOR':
      return { ...state, tryColorIndex: action.index };
    case 'DISMISS_SCAN_BANNER':
      return { ...state, scanBannerVisible: false };
    default:
      return state;
  }
}

interface AppStateContextValue extends AppState {
  toggleLike: (id: string | number) => void;
  setFilter: (filter: string) => void;
  setTryItem: (id: string | number) => void;
  setTrySize: (size: (typeof SIZES)[number]) => void;
  setTryColor: (index: number) => void;
  dismissScanBanner: () => void;
  reload: () => void;
  likedCount: number;
  likedItems: FeedItem[];
  tryColor: string;
  getItem: (id: string | number) => FeedItem | undefined;
}

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);

  const reload = useCallback(() => {
    dispatch({ type: 'SET_LOADING' });
    listGarments()
      .then((page) => {
        const items = page.content.map(toFeedItem);
        const liked: Record<string, boolean> = {};
        page.content.forEach((g) => {
          liked[g.id] = g.preferito;
        });
        dispatch({ type: 'SET_FEED', items, liked });
      })
      .catch(() => {
        dispatch({ type: 'SET_ERROR', error: 'Impossibile caricare il feed. Riprova più tardi.' });
      });
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      reload();
    } else {
      dispatch({ type: 'RESET' });
    }
  }, [isAuthenticated, reload]);

  const value = useMemo<AppStateContextValue>(() => {
    const likedItems = state.items.filter((it) => state.liked[String(it.id)]);
    return {
      ...state,
      likedItems,
      likedCount: likedItems.length,
      tryColor: TRYON_COLORS[state.tryColorIndex],
      reload,
      getItem: (id) => state.items.find((it) => String(it.id) === String(id)),
      toggleLike: (id) => {
        const garmentId = String(id);
        const wasLiked = !!state.liked[garmentId];
        // Ottimistico: il cuore cambia subito, si annulla solo se la chiamata fallisce.
        dispatch({ type: 'SET_LIKED', id: garmentId, value: !wasLiked });
        apiToggleFavorite(garmentId).catch(() => {
          dispatch({ type: 'SET_LIKED', id: garmentId, value: wasLiked });
        });
      },
      setFilter: (filter) => dispatch({ type: 'SET_FILTER', filter }),
      setTryItem: (id) => dispatch({ type: 'SET_TRY_ITEM', id }),
      setTrySize: (size) => dispatch({ type: 'SET_TRY_SIZE', size }),
      setTryColor: (index) => dispatch({ type: 'SET_TRY_COLOR', index }),
      dismissScanBanner: () => dispatch({ type: 'DISMISS_SCAN_BANNER' }),
    };
  }, [state, reload]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateContextValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error('useAppState deve essere usato dentro AppStateProvider');
  }
  return ctx;
}

// Riesportato per WardrobeScreen (guardaroba reale via GET /api/v1/gallery,
// usato solo se in futuro servira' un dato piu' ricco delle sole card feed).
export { getGallery };
