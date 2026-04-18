// Two Steps Studio Translations
// Szablon: Dodaj nowy język przed closing brace }}
// Wszystkie języki muszą być kompletne (same level)

export interface BaseTranslations {
  settings: {
    title: string;
    subtitle: string;
    appearance: string;
    light: string;
    dark: string;
    system: string;
    colorTheme: string;
    language: string;
    notifications: string;
    news: string;
    newsDesc: string;
    esport: string;
    esportDesc: string;
    dev: string;
    devDesc: string;
    themes: Record<string, string>;
  };
  nav: {
    home: string;
    profile: string;
    games: string;
    esport: string;
    studio: string;
    dev: string;
    notifications: string;
    settings: string;
    login: string;
    stats: string;
    online: string;
    channels: string;
    mainMenu: string;
    searchPlaceholder: string;
    newProject: string;
    management: string;
  };
  sections: {
    games: {
      subtitle: string;
      preview: string;
      title: string;
      desc: string;
    };
    esport: {
      subtitle: string;
      upcoming: string;
      today: string;
      vs: string;
    };
    records: {
      subtitle: string;
      newRelease: string;
      listenNow: string;
    };
    dev: {
      subtitle: string;
      projects: string;
      status: string;
    };
  };
  home: {
    newsTitle: string;
    newsSubtitle: string;
    readMore: string;
    viewAll: string;
    newsletterTitle: string;
    newsletterSubtitle: string;
    emailPlaceholder: string;
    subscribe: string;
    subscribeSuccess: string;
    communityTitle: string;
    messagesToday: string;
    onlineNow: string;
    installApp: string;
    installAppDesc: string;
    prototypeBadge: string;
    prototypeVersion: string;
  };
  auth: {
    registerTitle: string;
    registerSubtitle: string;
    fullName: string;
    fullNamePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    password: string;
    passwordPlaceholder: string;
    registerButton: string;
    orContinueWith: string;
    alreadyHaveAccount: string;
    loginLink: string;
    registerSuccess: string;
    registerError: string;
    loginTitle: string;
    loginSubtitle: string;
    loginButton: string;
    forgotPassword: string;
    noAccount: string;
    registerLink: string;
    loginSuccess: string;
    loginError: string;
    oauthError: string;
  };
  profile: {
    level: string;
    rank: string;
    nextLevel: string;
    memberSince: string;
    personalInfo: string;
    username: string;
    saveChanges: string;
    recentActivity: string;
    management: string;
    dangerZone: string;
    logout: string;
    logoutDesc: string;
  };
  regulamin: {
    title: string;
    subtitle: string;
    accepted: string;
    acceptError: string;
  };
  rekrutacja: {
    title: string;
    subtitle: string;
    email: string;
    name: string;
    emailPlaceholder: string;
    namePlaceholder: string;
    discordRoles: string;
    backToHome: string;
  };
}

export const translations = {
  // POLSKI (PL)
  pl: {
    settings: {
      title: "Ustawienia",
      subtitle: "Spersonalizuj swój interfejs Two Steps Studio.",
      appearance: "Wygląd",
      light: "Jasny",
      dark: "Ciemny",
      system: "System",
      colorTheme: "Motyw Koloru",
      language: "Język / Language",
      notifications: "Powiadomienia i Preferencje",
      news: "Nowości i Ogłoszenia",
      newsDesc: "Informacje o nowych grach i projektach.",
      esport: "Aktualizacje E-sport",
      esportDesc: "Wyniki meczów i powiadomienia o turniejach.",
      dev: "DEV updates",
      devDesc: "Powiadomienia o nowych narzędziach i postępach w projektach.",
      themes: {
        default: "Morski (Domyślny)",
        cyberpunk: "Cyberpunk",
        midnight: "Midnight",
        nature: "Nature",
        gold: "Gold",
        sunset: "Sunset"
      }
    },
    nav: {
      home: "Strona główna",
      profile: "Profil",
      games: "Games",
      esport: "E-sport",
      studio: "Studio",
      dev: "Dev",
      notifications: "Powiadomienia",
      settings: "Ustawienia",
      login: "Zaloguj się",
      stats: "Statystyki",
      online: "Online",
      channels: "Kanały",
      mainMenu: "Menu Główne",
      searchPlaceholder: "Szukaj projektów, gier...",
      newProject: "Wiadomości",
      management: "Management"
    },
    sections: {
      games: {
        subtitle: "Odkryj najnowsze tytuły i recenzje.",
        preview: "Podgląd Gry",
        title: "Tytuł Gry",
        desc: "Krótki opis gry i jej najważniejszych cech."
      },
      esport: {
        subtitle: "Śledź rozgrywki i rankingi naszych drużyn.",
        upcoming: "Nadchodzące Mecze",
        today: "Dzisiaj",
        vs: "vs"
      },
      records: {
        subtitle: "Nasze produkcje muzyczne i rekordy.",
        newRelease: "Nowe Wydanie",
        listenNow: "Słuchaj Teraz"
      },
      dev: {
        subtitle: "Nasze projekty i narzędzia deweloperskie.",
        projects: "Projekty",
        status: "Status"
      }
    },
    home: {
      newsTitle: "Nowości ze Studia",
      newsSubtitle: "Bądź na bieżąco z naszymi najnowszymi projektami i wydarzeniami.",
      readMore: "Czytaj więcej",
      viewAll: "Wszystkie wpisy",
      newsletterTitle: "Bądź w pętli",
      newsletterSubtitle: "Zapisz się do newslettera, aby otrzymywać powiadomienia o premierach i turniejach.",
      emailPlaceholder: "Twój adres email...",
      subscribe: "Zapisz się",
      subscribeSuccess: "Dziękujemy! Zostałeś zapisany.",
      communityTitle: "Nasza Społeczność",
      messagesToday: "Wiadomości dzisiaj",
      onlineNow: "Osób online",
      installApp: "Pobierz aplikację",
      installAppDesc: "Zainstaluj aplikację Two Steps Studio na swoim komputerze.",
      prototypeBadge: "PROTOTYP",
      prototypeVersion: "WERSJA PROTOTYPOWA"
    },
    auth: {
      registerTitle: "Dołącz do nas",
      registerSubtitle: "Stwórz konto w Two Steps Studio.",
      fullName: "Imię i Nazwisko / Nick",
      fullNamePlaceholder: "Twoja Nazwa",
      email: "Email",
      emailPlaceholder: "twoj@email.com",
      password: "Hasło",
      passwordPlaceholder: "••••••••",
      registerButton: "ZAREJESTRUJ SIĘ",
      orContinueWith: "LUB KONTYNUUJ PRZEZ",
      alreadyHaveAccount: "Masz już konto?",
      loginLink: "ZALOGUJ SIĘ",
      registerSuccess: "Rejestracja pomyślna! Sprawdź email, aby potwierdzić konto.",
      registerError: "Błąd rejestracji",
      loginTitle: "Witaj Ponownie",
      loginSubtitle: "Zaloguj się, aby uzyskać dostęp do panelu Two Steps Studio.",
      loginButton: "ZALOGUJ SIĘ",
      forgotPassword: "Zapomniałeś?",
      noAccount: "Nie masz jeszcze konta?",
      registerLink: "ZAREJESTRUJ SIĘ",
      loginSuccess: "Zalogowano pomyślnie!",
      loginError: "Błąd logowania",
      oauthError: "Błąd logowania przez"
    },
    profile: {
      level: "Poziom",
      rank: "Ranga",
      nextLevel: "Do następnego poziomu",
      memberSince: "Użytkownik od",
      personalInfo: "Informacje Osobiste",
      username: "Nazwa Użytkownika",
      saveChanges: "Zapisz Zmiany",
      recentActivity: "Ostatnia Aktywność",
      management: "Zarządzanie",
      dangerZone: "Strefa Niebezpieczna",
      logout: "Wyloguj Się",
      logoutDesc: "Bezpiecznie wyloguj się z konta."
    },
    regulamin: {
      title: "Regulamin Two Steps Studio",
      subtitle: "Przeczytaj uważnie przed rejestracją konta.",
      accepted: "Regulamin zaakceptowany!",
      acceptError: "Błąd akceptacji regulaminu"
    },
    rekrutacja: {
      title: "Rekrutacja do Studia",
      subtitle: "Dołącz do naszego zespołu!",
      email: "Email",
      name: "Imię i Nazwisko",
      emailPlaceholder: "twój@email.com",
      namePlaceholder: "Twój nick",
      discordRoles: "Wymagane role na Discordzie:",
      backToHome: "Wróć na stronę główną"
    }
  },

  // ANGIELSKI (EN)
  en: {
    settings: {
      title: "Settings",
      subtitle: "Personalize your Two Steps Studio interface.",
      appearance: "Appearance",
      light: "Light",
      dark: "Dark",
      system: "System",
      colorTheme: "Color Theme",
      language: "Language / Język",
      notifications: "Notifications & Preferences",
      news: "News & Announcements",
      newsDesc: "Information about new games and projects.",
      esport: "e-sport updates",
      esportDesc: "Match results and tournament notifications.",
      dev: "DEV updates",
      devDesc: "Notifications about new tools and project progress.",
      themes: {
        default: "Teal (Default)",
        cyberpunk: "Cyberpunk",
        midnight: "Midnight",
        nature: "Nature",
        gold: "Gold",
        sunset: "Sunset"
      }
    },
    nav: {
      home: "Home",
      profile: "Profile",
      games: "Games",
      esport: "E-sport",
      studio: "Studio",
      dev: "Dev",
      notifications: "Notifications",
      settings: "Settings",
      login: "Login",
      stats: "Statistics",
      online: "Online",
      channels: "Channels",
      mainMenu: "Main Menu",
      searchPlaceholder: "Search projects, games...",
      newProject: "Messages",
      management: "Management"
    },
    sections: {
      games: {
        subtitle: "Discover the latest titles and reviews.",
        preview: "Game Preview",
        title: "Game Title",
        desc: "Short description of the game and its main features."
      },
      esport: {
        subtitle: "Track matches and rankings of our teams.",
        upcoming: "Upcoming Matches",
        today: "Today",
        vs: "vs"
      },
      records: {
        subtitle: "Our music productions and records.",
        newRelease: "New Release",
        listenNow: "Listen Now"
      },
      dev: {
        subtitle: "Our projects and development tools.",
        projects: "Projects",
        status: "Status"
      }
    },
    home: {
      newsTitle: "Studio News",
      newsSubtitle: "Stay updated with our latest projects and events.",
      readMore: "Read more",
      viewAll: "View all posts",
      newsletterTitle: "Stay in the loop",
      newsletterSubtitle: "Subscribe to our newsletter for launch updates and tournament news.",
      emailPlaceholder: "Your email address...",
      subscribe: "Subscribe",
      subscribeSuccess: "Thank you! You have been subscribed.",
      communityTitle: "Our Community",
      messagesToday: "Messages today",
      onlineNow: "Online now",
      installApp: "Download App",
      installAppDesc: "Install the Two Steps Studio app on your computer.",
      prototypeBadge: "PROTOTYPE",
      prototypeVersion: "PROTOTYPE VERSION"
    },
    auth: {
      registerTitle: "Join us",
      registerSubtitle: "Create an account at Two Steps Studio.",
      fullName: "Full Name / Nickname",
      fullNamePlaceholder: "Your Name",
      email: "Email",
      emailPlaceholder: "your@email.com",
      password: "Password",
      passwordPlaceholder: "••••••••",
      registerButton: "SIGN UP",
      orContinueWith: "OR CONTINUE WITH",
      alreadyHaveAccount: "Already have an account?",
      loginLink: "LOG IN",
      registerSuccess: "Registration successful! Check your email to confirm your account.",
      registerError: "Registration error",
      loginTitle: "Welcome Back",
      loginSubtitle: "Log in to access the Two Steps Studio panel.",
      loginButton: "LOG IN",
      forgotPassword: "Forgot?",
      noAccount: "Don't have an account yet?",
      registerLink: "SIGN UP",
      loginSuccess: "Logged in successfully!",
      loginError: "Login error",
      oauthError: "Login error via"
    },
    profile: {
      level: "Level",
      rank: "Rank",
      nextLevel: "To Next Level",
      memberSince: "Member Since",
      personalInfo: "Personal Information",
      username: "Username",
      saveChanges: "Save Changes",
      recentActivity: "Recent Activity",
      management: "Management",
      dangerZone: "Danger Zone",
      logout: "Log Out",
      logoutDesc: "Safely sign out of your account."
    },
    regulamin: {
      title: "Regulations",
      subtitle: "Read carefully before registering.",
      accepted: "Regulations accepted!",
      acceptError: "Error accepting regulations"
    },
    rekrutacja: {
      title: "Studio Recruitment",
      subtitle: "Join our team!",
      email: "Email",
      name: "Name",
      emailPlaceholder: "your@email.com",
      namePlaceholder: "Your name",
      discordRoles: "Required Discord roles:",
      backToHome: "Back to home"
    }
  },

  // NIEMIECKI (DE)
  de: {
    settings: {
      title: "Einstellungen",
      subtitle: "Personalisieren Sie Ihre Two Steps Studio-Oberfläche.",
      appearance: "Aussehen",
      light: "Hell",
      dark: "Dunkel",
      system: "System",
      colorTheme: "Farbthema",
      language: "Sprache / Język",
      notifications: "Benachrichtigungen und Einstellungen",
      news: "Nachrichten & Ankündigungen",
      newsDesc: "Informationen zu neuen Spielen und Projekten.",
      esport: "E-Sport-Updates",
      esportDesc: "Endergebnisse von Matches und Turnierbenachrichtigungen.",
      dev: "DEV-Updates",
      devDesc: "Benachrichtigungen über neue Tools und Projektfortschritt.",
      themes: {
        default: "Grün (Standard)",
        cyberpunk: "Cyberpunk",
        midnight: "Mitternacht",
        nature: "Natur",
        gold: "Gold",
        sunset: "Sonnenuntergang"
      }
    },
    nav: {
      home: "Startseite",
      profile: "Profil",
      games: "Games",
      esport: "E-Sport",
      studio: "Studio",
      dev: "Dev",
      notifications: "Benachrichtigungen",
      settings: "Einstellungen",
      login: "Anmelden",
      stats: "Statistiken",
      online: "Online",
      channels: "Kanäle",
      mainMenu: "Hauptmenü",
      searchPlaceholder: "Projekte, Spiele suchen...",
      newProject: "Nachrichten",
      management: "Management"
    },
    sections: {
      games: {
        subtitle: "Entdecken Sie die neuesten Titel und Bewertungen.",
        preview: "Spielvorschau",
        title: "Spieldurchschnitt",
        desc: "Kurze Beschreibung des Spiels und seiner Hauptmerkmale."
      },
      esport: {
        subtitle: "Verfolgen Sie Matches und Rankings unserer Teams.",
        upcoming: "Kommende Matches",
        today: "Heute",
        vs: "vs"
      },
      records: {
        subtitle: "Unsere Musikproduktionen und Singles.",
        newRelease: "Neuerschau",
        listenNow: "Jetzt anhören"
      },
      dev: {
        subtitle: "Unsere Projekte und Entwicklungstools.",
        projects: "Projekte",
        status: "Status"
      }
    },
    home: {
      newsTitle: "Studio-News",
      newsSubtitle: "Halten Sie sich auf dem Laufenden mit unseren neuesten Projekten und Ereignissen.",
      readMore: "Weiterlesen",
      viewAll: "Alle Beiträge anzeigen",
      newsletterTitle: "Im Bilde bleiben",
      newsletterSubtitle: "Abonnieren Sie unseren Newsletter für Startnachrichten und Turniernachrichten.",
      emailPlaceholder: "Ihre E-Mail-Adresse...",
      subscribe: "Abonnieren",
      subscribeSuccess: "Danke! Sie haben abonniert.",
      communityTitle: "Unsere Gemeinschaft",
      messagesToday: "Nachrichten heute",
      onlineNow: "Aktuell online",
      installApp: "App herunterladen",
      installAppDesc: "Installieren Sie die Two Steps Studio-App auf Ihrem Computer.",
      prototypeBadge: "PROTOTYP",
      prototypeVersion: "PROTOTYP-VERSION"
    },
    auth: {
      registerTitle: "Treten Sie uns bei",
      registerSubtitle: "Erstellen Sie ein Konto bei Two Steps Studio.",
      fullName: "Vollständiger Name / Nickname",
      fullNamePlaceholder: "Ihr Name",
      email: "E-Mail",
      emailPlaceholder: "ihre@email.com",
      password: "Passwort",
      passwordPlaceholder: "••••••••",
      registerButton: "ANMELDEN",
      orContinueWith: "ODER KONTINUIEREN MIT",
      alreadyHaveAccount: "Haben Sie bereits ein Konto?",
      loginLink: "ANMELDEN",
      registerSuccess: "Registrierung erfolgreich! Überprüfen Sie Ihre E-Mail, um Ihr Konto zu bestätigen.",
      registerError: "Registrierungsfehler",
      loginTitle: "Willkommen zurück",
      loginSubtitle: "Melden Sie sich an, um auf das Two Steps Studio-Panel zuzugreifen.",
      loginButton: "ANMELDEN",
      forgotPassword: "Vergessen?",
      noAccount: "Noch kein Konto?",
      registerLink: "ANMELDEN",
      loginSuccess: "Erfolgreich angemeldet!",
      loginError: "Anmeldefehler",
      oauthError: "Anmeldefehler via"
    },
    profile: {
      level: "Level",
      rank: "Rang",
      nextLevel: "Zum nächsten Level",
      memberSince: "Mitglied seit",
      personalInfo: "Persönliche Informationen",
      username: "Benutzername",
      saveChanges: "Änderungen speichern",
      recentActivity: "Aktuelle Aktivität",
      management: "Management",
      dangerZone: "Gefahrenzone",
      logout: "Abmelden",
      logoutDesc: "Melden Sie sich sicher von Ihrem Konto ab."
    },
    regulamin: {
      title: "Geschäftsbedingungen Two Steps Studio",
      subtitle: "Lesen Sie sorgfältig vor der Registrierung.",
      accepted: "Geschäftsbedingungen akzeptiert!",
      acceptError: "Fehler beim Akzeptieren der Geschäftsbedingungen"
    },
    rekrutacja: {
      title: "Studio-Rekrutierung",
      subtitle: "Treten Sie unserem Team bei!",
      email: "E-Mail",
      name: "Name",
      emailPlaceholder: "ihre@email.com",
      namePlaceholder: "Ihr Name",
      discordRoles: "Erforderliche Discord-Rollen:",
      backToHome: "Zurück zur Startseite"
    }
  }
} as const;

// Wygenerowany typ na podstawie powyższego obiektu - obejmuje wszystkie dostępne języki
export type TranslationKey = typeof translations.pl;