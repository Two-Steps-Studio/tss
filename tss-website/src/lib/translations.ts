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
    codAnalyzer: {
      title: string;
      desc: string;
      stats: string;
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
      },
      codAnalyzer: {
        title: "COD Analyzer",
        desc: "Analityk taktyczny.",
        stats: "Dostępny"
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
      },
      codAnalyzer: {
        title: "COD Analyzer",
        desc: "Tactical analyst.",
        stats: "Available"
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
      },
      codAnalyzer: {
        title: "COD Analyzer",
        desc: "Taktischer Analyst.",
        stats: "Verfügbar"
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

// Nowe języki - Rosyjski
export const ru = {
  settings: {
    title: "Настройки",
    subtitle: "Персонализируйте свой интерфейс Two Steps Studio.",
    appearance: "Внешний вид",
    light: "Светлый",
    dark: "Тёмный",
    system: "Системный",
    colorTheme: "Цветовая тема",
    language: "Язык / Language",
    notifications: "Уведомления и предпочтения",
    news: "Новости и объявления",
    newsDesc: "Информация о новых играх и проектах.",
    esport: "Обновления e-sпорта",
    esportDesc: "Результаты матчей и уведомления о турнирах.",
    dev: "DEV обновления",
    devDesc: "Уведомления о новых инструментах и прогрессе проектов.",
    themes: {
      default: "Бирюзовый (По умолчанию)",
      cyberpunk: "Киберпанк",
      midnight: "Миднайт",
      nature: "Природа",
      gold: "Золото",
      sunset: "Закат"
    }
  },
  nav: {
    home: "Главная",
    profile: "Профиль",
    games: "Игры",
    esport: "e-sport",
    studio: "Студия",
    dev: "Dev",
    notifications: "Уведомления",
    settings: "Настройки",
    login: "Войти",
    stats: "Статистика",
    online: "Онлайн",
    channels: "Каналы",
    mainMenu: "Главное меню",
    searchPlaceholder: "Поиск проектов, игр...",
    newProject: "Сообщения",
    management: "Менеджмент"
  },
  sections: {
    games: {
      subtitle: "Откройте для себя новейшие новинки и отзывы.",
      preview: "Предпросмотр игры",
      title: "Название игры",
      desc: "Краткое описание игры и её основные функции."
    },
    esport: {
      subtitle: "Отслеживайте матчи и рейтинги наших команд.",
      upcoming: "Состоящие матчи",
      today: "Сегодня",
      vs: "vs"
    },
    records: {
      subtitle: "Наши музыкальные произведения и записи.",
      newRelease: "Новое выпуск",
      listenNow: "Слушать сейчас"
    },
    dev: {
      subtitle: "Наши проекты и инструменты разработки.",
      projects: "Проекты",
      status: "Статус"
    }
  },
  home: {
    newsTitle: "Новости Студии",
    newsSubtitle: "Будьте в курсе наших новейших проектов и мероприятий.",
    readMore: "Читать далее",
    viewAll: "Все посты",
    newsletterTitle: "Будьте в курсе событий",
    newsletterSubtitle: "Подпишитесь на нашу рассылку, чтобы получать новости о запусках и турнирах.",
    emailPlaceholder: "Ваш адрес электронной почты...",
    subscribe: "Подписаться",
    subscribeSuccess: "Спасибо! Вы подписались.",
    communityTitle: "Наше сообщество",
    messagesToday: "Сообщений сегодня",
    onlineNow: "Онлайн сейчас",
    installApp: "Скачать приложение",
    installAppDesc: "Установите приложение Two Steps Studio на свой компьютер.",
    prototypeBadge: "ПРОТОТИП",
    prototypeVersion: "ПРОТОТИП ВЕРСИЯ"
  },
  auth: {
    registerTitle: "Присоединяйтесь к нам",
    registerSubtitle: "Создайте аккаунт в Two Steps Studio.",
    fullName: "Полное имя / Ник",
    fullNamePlaceholder: "Ваше имя",
    email: "Электронная почта",
    emailPlaceholder: "ваш@email.com",
    password: "Пароль",
    passwordPlaceholder: "••••••••",
    registerButton: "ЗАРЕГИСТРИРОВАТЬСЯ",
    orContinueWith: "ИЛИ ПРОДОЛЖИТЬ ЧЕРЕЗ",
    alreadyHaveAccount: "Уже есть аккаунт?",
    loginLink: "ВОЙТИ",
    registerSuccess: "Регистрация успешна! Проверьте электронную почту для подтверждения аккаунта.",
    registerError: "Ошибка регистрации",
    loginTitle: "С возвращением",
    loginSubtitle: "Войдите, чтобы получить доступ к панели Two Steps Studio.",
    loginButton: "ВОЙТИ",
    forgotPassword: "Забыли?",
    noAccount: "Ещё нет аккаунта?",
    registerLink: "ЗАРЕГИСТРИРОВАТЬСЯ",
    loginSuccess: "Успешный вход!",
    loginError: "Ошибка входа",
    oauthError: "Ошибка входа через"
  },
  profile: {
    level: "Уровень",
    rank: "Ранг",
    nextLevel: "До следующего уровня",
    memberSince: "Участник с",
    personalInfo: "Личная информация",
    username: "Имя пользователя",
    saveChanges: "Сохранить изменения",
    recentActivity: "Последняя активность",
    management: "Управление",
    dangerZone: "Зона опасности",
    logout: "Выйти",
    logoutDesc: "Безопасно выйти из своего аккаунта."
  },
  regulamin: {
    title: "Условия Two Steps Studio",
    subtitle: "Внимательно прочитайте перед регистрацией.",
    accepted: "Условия приняты!",
    acceptError: "Ошибка принятия условий"
  },
  rekrutacja: {
    title: "Регистрация в студию",
    subtitle: "Присоединяйтесь к нашей команде!",
    email: "Электронная почта",
    name: "Имя",
    emailPlaceholder: "ваш@email.com",
    namePlaceholder: "Ваш ник",
    discordRoles: "Требуются роли Discord:",
    backToHome: "Вернуться на главную"
  }
} as const;

// Hiszpański
export const es = {
  settings: {
    title: "Configuración",
    subtitle: "Personaliza tu interfaz de Two Steps Studio.",
    appearance: "Apariencia",
    light: "Claro",
    dark: "Oscuro",
    system: "Sistema",
    colorTheme: "Tema de color",
    language: "Idioma / Język",
    notifications: "Notificaciones y preferencias",
    news: "Noticias y anuncios",
    newsDesc: "Información sobre nuevos juegos y proyectos.",
    esport: "actualizaciones de e-sports",
    esportDesc: "Resultados de partidos y notificaciones de torneos.",
    dev: "actualizaciones DEV",
    devDesc: "Notificaciones sobre nuevas herramientas y progreso de proyectos.",
    themes: {
      default: "Turquesa (Predeterminado)",
      cyberpunk: "Cyberpunk",
      midnight: "Medianoche",
      nature: "Naturaleza",
      gold: "Oro",
      sunset: "Atardecer"
    }
  },
  nav: {
    home: "Inicio",
    profile: "Perfil",
    games: "Juegos",
    esport: "E-sport",
    studio: "Estudio",
    dev: "Dev",
    notifications: "Notificaciones",
    settings: "Configuración",
    login: "Iniciar sesión",
    stats: "Estadísticas",
    online: "En línea",
    channels: "Canales",
    mainMenu: "Menú principal",
    searchPlaceholder: "Buscar proyectos, juegos...",
    newProject: "Mensajes",
    management: "Administración"
  },
  sections: {
    games: {
      subtitle: "Descubre los últimos títulos y reseñas.",
      preview: "Vista previa del juego",
      title: "Título del juego",
      desc: "Descripción corta del juego y sus principales características."
    },
    esport: {
      subtitle: "Sigue los partidos y clasificaciones de nuestros equipos.",
      upcoming: "Partidos próximos",
      today: "Hoy",
      vs: "vs"
    },
    records: {
      subtitle: "Nuestras producciones musicales y registros.",
      newRelease: "Nuevo lanzamiento",
      listenNow: "Escucha ahora"
    },
    dev: {
      subtitle: "Nuestros proyectos y herramientas de desarrollo.",
      projects: "Proyectos",
      status: "Estado"
    }
  },
  home: {
    newsTitle: "Noticias del Estudio",
    newsSubtitle: "Mantente al día con nuestros últimos proyectos y eventos.",
    readMore: "Leer más",
    viewAll: "Ver todas las entradas",
    newsletterTitle: "Mantente al día",
    newsletterSubtitle: "Suscríbete a nuestro boletín para actualizaciones de lanzamientos y noticias de torneos.",
    emailPlaceholder: "Tu dirección de correo electrónico...",
    subscribe: "Suscribirse",
    subscribeSuccess: "¡Gracias! Te has suscrito.",
    communityTitle: "Nuestra comunidad",
    messagesToday: "Mensajes hoy",
    onlineNow: "En línea ahora",
    installApp: "Descargar aplicación",
    installAppDesc: "Instala la aplicación de Two Steps Studio en tu computadora.",
    prototypeBadge: "PROTOTIPO",
    prototypeVersion: "VERSIÓN DE PROTOTIPO"
  },
  auth: {
    registerTitle: "Únete a nosotros",
    registerSubtitle: "Crea una cuenta en Two Steps Studio.",
    fullName: "Nombre completo / Apodo",
    fullNamePlaceholder: "Tu nombre",
    email: "Correo electrónico",
    emailPlaceholder: "tu@email.com",
    password: "Contraseña",
    passwordPlaceholder: "••••••••",
    registerButton: "REGISTRARSE",
    orContinueWith: "O CONTINUAR CON",
    alreadyHaveAccount: "¿Ya tienes una cuenta?",
    loginLink: "INICIAR SESIÓN",
    registerSuccess: "¡Registro exitoso! Verifica tu correo electrónico para confirmar tu cuenta.",
    registerError: "Error de registro",
    loginTitle: "Bienvenido de nuevo",
    loginSubtitle: "Inicia sesión para acceder al panel de Two Steps Studio.",
    loginButton: "INICIAR SESIÓN",
    forgotPassword: "¿Olvidaste?",
    noAccount: "¿Aún no tienes una cuenta?",
    registerLink: "REGISTRARSE",
    loginSuccess: "¡Sesión iniciada con éxito!",
    loginError: "Error de inicio de sesión",
    oauthError: "Error de inicio de sesión a través de"
  },
  profile: {
    level: "Nivel",
    rank: "Rango",
    nextLevel: "Al siguiente nivel",
    memberSince: "Miembro desde",
    personalInfo: "Información personal",
    username: "Nombre de usuario",
    saveChanges: "Guardar cambios",
    recentActivity: "Actividad reciente",
    management: "Administración",
    dangerZone: "Zona de peligro",
    logout: "Cerrar sesión",
    logoutDesc: "Cerrar sesión de forma segura de tu cuenta."
  },
  regulamin: {
    title: "Reglamentos Two Steps Studio",
    subtitle: "Lee cuidadosamente antes de registrarte.",
    accepted: "¡Reglamentos aceptados!",
    acceptError: "Error al aceptar los reglamentos"
  },
  rekrutacja: {
    title: "Reclutación del Estudio",
    subtitle: "¡Únete a nuestro equipo!",
    email: "Correo electrónico",
    name: "Nombre",
    emailPlaceholder: "tu@email.com",
    namePlaceholder: "Tu apodo",
    discordRoles: "Roles de Discord requeridos:",
    backToHome: "Volver al inicio"
  }
} as const;

// Francuski
export const fr = {
  settings: {
    title: "Paramètres",
    subtitle: "Personnalisez votre interface Two Steps Studio.",
    appearance: "Apparence",
    light: "Clair",
    dark: "Sombre",
    system: "Système",
    colorTheme: "Thème de couleur",
    language: "Langue / Język",
    notifications: "Notifications et Préférences",
    news: "Actualités et Annonces",
    newsDesc: "Informations sur les nouveaux jeux et projets.",
    esport: "Mises à jour e-sport",
    esportDesc: "Résultats de matchs et notifications de tournois.",
    dev: "Mises à jour DEV",
    devDesc: "Notifications sur les nouveaux outils et la progression des projets.",
    themes: {
      default: "Bleu-vert (Par défaut)",
      cyberpunk: "Cyberpunk",
      midnight: "Minuit",
      nature: "Nature",
      gold: "Or",
      sunset: "Coucher de soleil"
    }
  },
  nav: {
    home: "Accueil",
    profile: "Profil",
    games: "Jeux",
    esport: "E-sport",
    studio: "Studio",
    dev: "Dev",
    notifications: "Notifications",
    settings: "Paramètres",
    login: "Se connecter",
    stats: "Statistiques",
    online: "En ligne",
    channels: "Canaux",
    mainMenu: "Menu principal",
    searchPlaceholder: "Rechercher des projets, des jeux...",
    newProject: "Messages",
    management: "Management"
  },
  sections: {
    games: {
      subtitle: "Découvrez les derniers titres et critiques.",
      preview: "Aperçu du jeu",
      title: "Titre du jeu",
      desc: "Courte description du jeu et de ses fonctionnalités principales."
    },
    esport: {
      subtitle: "Suivez les matchs et classements de nos équipes.",
      upcoming: "Prochains matchs",
      today: "Aujourd'hui",
      vs: "vs"
    },
    records: {
      subtitle: "Nos productions musicales et disques.",
      newRelease: "Nouvelle sortie",
      listenNow: "Écouter maintenant"
    },
    dev: {
      subtitle: "Nos projets et outils de développement.",
      projects: "Projets",
      status: "Statut"
    }
  },
  home: {
    newsTitle: "Actualités du Studio",
    newsSubtitle: "Restez informé de nos derniers projets et événements.",
    readMore: "Lire la suite",
    viewAll: "Voir tous les articles",
    newsletterTitle: "Restez informé",
    newsletterSubtitle: "Abonnez-vous à notre newsletter pour les mises à jour de lancement et les actualités des tournois.",
    emailPlaceholder: "Votre adresse email...",
    subscribe: "S'abonner",
    subscribeSuccess: "Merci ! Vous vous êtes abonné.",
    communityTitle: "Notre communauté",
    messagesToday: "Messages aujourd'hui",
    onlineNow: "En ligne maintenant",
    installApp: "Télécharger l'application",
    installAppDesc: "Installez l'application Two Steps Studio sur votre ordinateur.",
    prototypeBadge: "PROTOTYPE",
    prototypeVersion: "VERSION DE PROTOTYPE"
  },
  auth: {
    registerTitle: "Rejoignez-nous",
    registerSubtitle: "Créez un compte sur Two Steps Studio.",
    fullName: "Nom complet / Surnom",
    fullNamePlaceholder: "Votre nom",
    email: "Email",
    emailPlaceholder: "votre@email.com",
    password: "Mot de passe",
    passwordPlaceholder: "••••••••",
    registerButton: "S'INSCRIRE",
    orContinueWith: "OU CONTINUER AVEC",
    alreadyHaveAccount: "Vous avez déjà un compte ?",
    loginLink: "SE CONNECTER",
    registerSuccess: "Inscription réussie ! Vérifiez votre email pour confirmer votre compte.",
    registerError: "Erreur d'inscription",
    loginTitle: "Bon retour",
    loginSubtitle: "Connectez-vous pour accéder au panneau Two Steps Studio.",
    loginButton: "SE CONNECTER",
    forgotPassword: "Oublié ?",
    noAccount: "Vous n'avez pas encore de compte ?",
    registerLink: "S'INSCRIRE",
    loginSuccess: "Connecté avec succès !",
    loginError: "Erreur de connexion",
    oauthError: "Erreur de connexion via"
  },
  profile: {
    level: "Niveau",
    rank: "Rang",
    nextLevel: "Au niveau suivant",
    memberSince: "Membre depuis",
    personalInfo: "Informations personnelles",
    username: "Nom d'utilisateur",
    saveChanges: "Enregistrer les modifications",
    recentActivity: "Activité récente",
    management: "Gestion",
    dangerZone: "Zone de danger",
    logout: "Se déconnecter",
    logoutDesc: "Déconnectez-vous en toute sécurité de votre compte."
  },
  regulamin: {
    title: "Règlement Two Steps Studio",
    subtitle: "Lisez attentivement avant de vous inscrire.",
    accepted: "Règlement accepté !",
    acceptError: "Erreur d'acceptation du règlement"
  },
  rekrutacja: {
    title: "Recrutement du Studio",
    subtitle: "Rejoignez notre équipe !",
    email: "Email",
    name: "Nom",
    emailPlaceholder: "votre@email.com",
    namePlaceholder: "Votre surnom",
    discordRoles: "Rôles Discord requis :",
    backToHome: "Retour à l'accueil"
  }
} as const;

// Włoski
export const it = {
  settings: {
    title: "Impostazioni",
    subtitle: "Personalizza l'interfaccia di Two Steps Studio.",
    appearance: "Aspetto",
    light: "Chiaro",
    dark: "Scuro",
    system: "Sistema",
    colorTheme: "Tema colore",
    language: "Lingua / Język",
    notifications: "Notifiche e Preferenze",
    news: "Notizie e Annunci",
    newsDesc: "Informazioni sui nuovi giochi e progetti.",
    esport: "aggiornamenti e-sport",
    esportDesc: "Risultati delle partite e notifiche sui tornei.",
    dev: "aggiornamenti DEV",
    devDesc: "Notifiche sugli nuovi strumenti e il progresso dei progetti.",
    themes: {
      default: "Verde (Predefinito)",
      cyberpunk: "Cyberpunk",
      midnight: "Mezzanotte",
      nature: "Natura",
      gold: "Oro",
      sunset: "Tramonto"
    }
  },
  nav: {
    home: "Home",
    profile: "Profilo",
    games: "Giochi",
    esport: "E-sport",
    studio: "Studio",
    dev: "Dev",
    notifications: "Notifiche",
    settings: "Impostazioni",
    login: "Accedi",
    stats: "Statistiche",
    online: "Online",
    channels: "Canali",
    mainMenu: "Menu principale",
    searchPlaceholder: "Cerca progetti, giochi...",
    newProject: "Messaggi",
    management: "Gestione"
  },
  sections: {
    games: {
      subtitle: "Scopri gli ultimi titoli e recensioni.",
      preview: "Anteprima gioco",
      title: "Titolo del gioco",
      desc: "Breve descrizione del gioco e delle sue caratteristiche principali."
    },
    esport: {
      subtitle: "Segui le partite e le classifiche delle nostre squadre.",
      upcoming: "Prossime partite",
      today: "Oggi",
      vs: "vs"
    },
    records: {
      subtitle: "Le nostre produzioni musicali e singoli.",
      newRelease: "Nuovo rilascio",
      listenNow: "Ascolta ora"
    },
    dev: {
      subtitle: "I nostri progetti e strumenti di sviluppo.",
      projects: "Progetti",
      status: "Stato"
    }
  },
  home: {
    newsTitle: "Novità dello Studio",
    newsSubtitle: "Mantieni il passo con i nostri ultimi progetti ed eventi.",
    readMore: "Leggi di più",
    viewAll: "Vedi tutti i post",
    newsletterTitle: "Mantieni il contatto",
    newsletterSubtitle: "Iscriviti alla nostra newsletter per le novità dei lanci e le notizie sui tornei.",
    emailPlaceholder: "Il tuo indirizzo email...",
    subscribe: "Iscriviti",
    subscribeSuccess: "Grazie! Ti sei iscritto.",
    communityTitle: "La nostra comunità",
    messagesToday: "Messaggi oggi",
    onlineNow: "Online ora",
    installApp: "Scarica l'app",
    installAppDesc: "Installa l'app Two Steps Studio sul tuo computer.",
    prototypeBadge: "PROTOTIPO",
    prototypeVersion: "VERSIONE PROTOTIPO"
  },
  auth: {
    registerTitle: "Unisciti a noi",
    registerSubtitle: "Crea un account su Two Steps Studio.",
    fullName: "Nome completo / Nickname",
    fullNamePlaceholder: "Il tuo nome",
    email: "Email",
    emailPlaceholder: "tuo@email.com",
    password: "Password",
    passwordPlaceholder: "••••••••",
    registerButton: "ISCRIVITI",
    orContinueWith: "O CONTINUA CON",
    alreadyHaveAccount: "Hai già un account?",
    loginLink: "ACCEDE",
    registerSuccess: "Iscrizione riuscita! Controlla la tua email per confermare il tuo account.",
    registerError: "Errore di iscrizione",
    loginTitle: "Ben tornato",
    loginSubtitle: "Accedi per accedere al pannello Two Steps Studio.",
    loginButton: "ACCEDE",
    forgotPassword: "Dimenticato?",
    noAccount: "Non hai ancora un account?",
    registerLink: "ISCRIVITI",
    loginSuccess: "Accesso riuscito!",
    loginError: "Errore di accesso",
    oauthError: "Errore di accesso tramite"
  },
  profile: {
    level: "Livello",
    rank: "Rank",
    nextLevel: "Al livello successivo",
    memberSince: "Membro dal",
    personalInfo: "Informazioni personali",
    username: "Nome utente",
    saveChanges: "Salva modifiche",
    recentActivity: "Attività recente",
    management: "Gestione",
    dangerZone: "Zona pericolosa",
    logout: "Esci",
    logoutDesc: "Disconnettiti in sicurezza dal tuo account."
  },
  regulamin: {
    title: "Regolamento Two Steps Studio",
    subtitle: "Leggi attentamente prima di registrarti.",
    accepted: "Regolamento accettato!",
    acceptError: "Errore nell'accettare il regolamento"
  },
  rekrutacja: {
    title: "Reclutazione Studio",
    subtitle: "Unisciti al nostro team!",
    email: "Email",
    name: "Nome",
    emailPlaceholder: "tuo@email.com",
    namePlaceholder: "Il tuo nickname",
    discordRoles: "Ruoli Discord richiesti:",
    backToHome: "Torna alla home"
  }
} as const;