import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { User, Notification, TicketFilters, TicketStatus, Toast } from "@/types";

interface AppState {
  // User state
  user: User | null;
  setUser: (user: User | null) => void;

  // Sidebar state
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  collapseSidebar: (collapsed: boolean) => void;

  // Notifications
  notifications: Notification[];
  unreadCount: number;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;

  // Ticket filters
  ticketFilters: TicketFilters;
  setTicketFilters: (filters: Partial<TicketFilters>) => void;
  clearFilters: () => void;

  // Active view
  activeView: string;
  setActiveView: (view: string) => void;

  // Quick stats for header
  ticketCounts: Record<TicketStatus, number>;
  setTicketCounts: (counts: Record<TicketStatus, number>) => void;

  // Theme
  theme: "dark" | "light";
  toggleTheme: () => void;

  // Command palette
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  // Toasts
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const defaultFilters: TicketFilters = {
  status: undefined,
  priority: undefined,
  type: undefined,
  assigneeId: undefined,
  teamId: undefined,
  tags: undefined,
  search: undefined,
};

const defaultCounts: Record<TicketStatus, number> = {
  OPEN: 0,
  PENDING: 0,
  ON_HOLD: 0,
  SOLVED: 0,
  CLOSED: 0,
};

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        // User
        user: null,
        setUser: (user) => set({ user }),

        // Sidebar
        sidebarOpen: true,
        sidebarCollapsed: false,
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        collapseSidebar: (collapsed) => set({ sidebarCollapsed: collapsed }),

        // Notifications
        notifications: [],
        unreadCount: 0,
        setNotifications: (notifications) =>
          set({
            notifications,
            unreadCount: notifications.filter((n) => !n.isRead).length,
          }),
        addNotification: (notification) =>
          set((state) => ({
            notifications: [notification, ...state.notifications],
            unreadCount: state.unreadCount + 1,
          })),
        markAsRead: (id) =>
          set((state) => ({
            notifications: state.notifications.map((n) =>
              n.id === id ? { ...n, isRead: true } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
          })),
        markAllAsRead: () =>
          set((state) => ({
            notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
            unreadCount: 0,
          })),

        // Filters
        ticketFilters: defaultFilters,
        setTicketFilters: (filters) =>
          set((state) => ({
            ticketFilters: { ...state.ticketFilters, ...filters },
          })),
        clearFilters: () => set({ ticketFilters: defaultFilters }),

        // Active view
        activeView: "all",
        setActiveView: (view) => set({ activeView: view }),

        // Ticket counts
        ticketCounts: defaultCounts,
        setTicketCounts: (counts) => set({ ticketCounts: counts }),

        // Theme
        theme: "light",
        toggleTheme: () =>
          set((state) => ({
            theme: state.theme === "dark" ? "light" : "dark",
          })),

        // Command palette
        commandPaletteOpen: false,
        setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

        // Toasts
        toasts: [],
        addToast: (toast) => {
          const id = Math.random().toString(36).substring(2, 9);
          set((state) => ({
            toasts: [...state.toasts, { ...toast, id }],
          }));
        },
        removeToast: (id) =>
          set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
          })),
      }),
      {
        name: "clearq-storage",
        partialize: (state) => ({
          sidebarCollapsed: state.sidebarCollapsed,
          theme: state.theme,
          activeView: state.activeView,
        }),
      }
    )
  )
);



