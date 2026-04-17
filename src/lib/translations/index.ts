export const translations: Record<string, any> = {
  en: {
    common: {
      dashboard: "Dashboard",
      tickets: "Tickets",
      clients: "Clients",
      teamChat: "Team Chat",
      manage: "Manage",
      proFeatures: "Pro Features",
      settings: "Settings",
      help: "Help & Support",
      newTicket: "New Ticket",
      views: "Views",
      allTickets: "All Tickets",
      assignedToMe: "Assigned to Me",
      open: "Open",
      pending: "Pending",
      onHold: "On Hold",
      solved: "Solved",
      tasks: "Tasks",
      calendar: "Calendar",
      reports: "Reports",
      teams: "Teams",
      tags: "Tags",
      remote: "Remote",
      scripts: "Scripts",
      adminPortal: "Admin Portal",
      active: "ACTIVE",
      locked: "LOCKED",
    },
    dashboard: {
      welcome: "Welcome back",
      overview: "Platform Overview",
    }
  },
  es: {
    common: {
      dashboard: "Tablero",
      tickets: "Tickets",
      clients: "Clientes",
      teamChat: "Chat de Equipo",
      manage: "Gestionar",
      proFeatures: "Funciones Pro",
      settings: "Ajustes",
      help: "Ayuda y Soporte",
      newTicket: "Nuevo Ticket",
      views: "Vistas",
      allTickets: "Todos los Tickets",
      assignedToMe: "Asignados a mí",
      open: "Abiertos",
      pending: "Pendientes",
      onHold: "En espera",
      solved: "Resueltos",
      tasks: "Tareas",
      calendar: "Calendario",
      reports: "Reportes",
      teams: "Equipos",
      tags: "Etiquetas",
      remote: "Remoto",
      scripts: "Scripts",
      adminPortal: "Portal Admin",
      active: "ACTIVO",
      locked: "BLOQUEADO",
    },
    dashboard: {
      welcome: "Bienvenido de nuevo",
      overview: "Resumen de la plataforma",
    }
  }
};

export type Locale = keyof typeof translations;

export function getTranslation(locale: string = "en", key: string) {
  const keys = key.split(".");
  let current = translations[locale] || translations.en;
  
  for (const k of keys) {
    if (!current[k]) return k; // Return key if not found
    current = current[k];
  }
  
  return current;
}
