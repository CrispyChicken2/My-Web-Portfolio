// =====================================================================
//  INTERFACE STRINGS — bilingual (en / fr)
//  The words of the Room and the Screen themselves: the loader, the
//  overlay, the desktop, its windows and its Terminal. The portfolio's
//  own content stays in content.js and is not repeated here.
//  Both dictionaries share the same shape (src/data/interface.test.js).
// =====================================================================

const en = {
  loader: {
    firmware: 'OH-27 workstation, firmware 26.10',
    copyright: '© 2026 Oscar Hunaut',
    memory: 'Memory check',
    loading: 'Setting up the desk',
    done: 'done',
    ready: 'Everything is in place.',
    failed: 'The 3D room could not start on this device. The plain version has everything in it.',
    parts: {
      engine: 'Rendering engine',
      lighting: 'Lighting',
      room: 'Room',
      desk: 'Desk',
      monitor: 'Monitor',
      keyboard: 'Keyboard',
      computer: 'Computer',
      chair: 'Chair',
      props: 'Desk objects',
      screen: 'Screen',
      shaders: 'Shaders',
    },
  },

  start: {
    title: 'A desk, a computer, and the work I have shipped.',
    body: 'Point at the monitor to use it. Move away from it to step back.',
    sound: 'This page plays sound. You can mute it at any time.',
    start: 'Start',
    plain: 'Open the plain version',
  },

  hud: {
    mute: 'Mute sound',
    unmute: 'Turn sound on',
    language: 'Language',
    plain: 'Plain version',
    help: 'Click anywhere to begin',
    helpTouch: 'Tap the monitor to use it',
  },

  screen: {
    login: {
      welcome: 'Welcome',
    },
    apps: {
      portfolio: 'Portfolio',
      terminal: 'Terminal',
      contact: 'Mail',
      recycle: 'Recycle Bin',
      github: 'GitHub',
      linkedin: 'LinkedIn',
    },
    window: {
      minimize: 'Minimize',
      maximize: 'Maximize',
      restore: 'Restore',
      close: 'Close',
    },
    taskbar: {
      start: 'Start',
      search: 'Search',
      soundOn: 'Sound is on',
      soundOff: 'Sound is off',
      language: 'Input language: English. Switch to French',
    },
    start: {
      search: 'Search for apps, settings and documents',
      pinned: 'Pinned',
      recommended: 'Recommended',
      restart: 'Restart',
    },
    recycle: {
      empty: 'This folder is empty.',
      items: '0 items',
    },
    showcase: {
      home: 'Home',
      sections: 'Sections',
      openRepository: 'Open the repository on GitHub',
      emailMe: 'Email me',
    },
    terminal: {
      welcome: 'Type help to see what this terminal can show you.',
      helpTitle: 'Commands',
      commands: {
        whoami: 'who I am',
        about: 'a few words about me',
        skills: 'what I work with',
        projects: 'the projects I finished',
        open: 'open a project’s repository, e.g. open 2',
        experience: 'where I have been',
        contact: 'how to reach me',
        lang: 'switch language, e.g. lang fr',
        clear: 'clear the terminal',
      },
      notFound: 'command not found: {cmd}. Type help.',
      openUsage: 'usage: open <project number, 1 to {total}>',
      opening: 'Opening {title}…',
      langUsage: 'usage: lang en | lang fr',
      langSet: 'Language set to English.',
      sudo: 'Permission denied. Nice try, though.',
    },
  },
}

const fr = {
  loader: {
    firmware: 'Station OH-27, micrologiciel 26.10',
    copyright: '© 2026 Oscar Hunaut',
    memory: 'Test mémoire',
    loading: 'Installation du bureau',
    done: 'ok',
    ready: 'Tout est en place.',
    failed: 'La pièce en 3D n’a pas pu démarrer sur cet appareil. La version simple contient tout.',
    parts: {
      engine: 'Moteur de rendu',
      lighting: 'Éclairage',
      room: 'Pièce',
      desk: 'Bureau',
      monitor: 'Écran',
      keyboard: 'Clavier',
      computer: 'Ordinateur',
      chair: 'Chaise',
      props: 'Objets du bureau',
      screen: 'Affichage',
      shaders: 'Shaders',
    },
  },

  start: {
    title: 'Un bureau, un ordinateur, et les projets que j’ai menés à bout.',
    body: 'Pointez l’écran pour l’utiliser. Éloignez-vous pour prendre du recul.',
    sound: 'Cette page joue du son. Vous pouvez le couper à tout moment.',
    start: 'Commencer',
    plain: 'Ouvrir la version simple',
  },

  hud: {
    mute: 'Couper le son',
    unmute: 'Activer le son',
    language: 'Langue',
    plain: 'Version simple',
    help: 'Cliquez n’importe où pour commencer',
    helpTouch: 'Touchez l’écran pour l’utiliser',
  },

  screen: {
    login: {
      welcome: 'Bienvenue',
    },
    apps: {
      portfolio: 'Portfolio',
      terminal: 'Terminal',
      contact: 'Courrier',
      recycle: 'Corbeille',
      github: 'GitHub',
      linkedin: 'LinkedIn',
    },
    window: {
      minimize: 'Réduire',
      maximize: 'Agrandir',
      restore: 'Restaurer',
      close: 'Fermer',
    },
    taskbar: {
      start: 'Démarrer',
      search: 'Rechercher',
      soundOn: 'Le son est activé',
      soundOff: 'Le son est coupé',
      language: 'Langue de saisie : français. Passer à l’anglais',
    },
    start: {
      search: 'Rechercher des applications, des paramètres et des documents',
      pinned: 'Épinglé',
      recommended: 'Recommandé',
      restart: 'Redémarrer',
    },
    recycle: {
      empty: 'Ce dossier est vide.',
      items: '0 élément',
    },
    showcase: {
      home: 'Accueil',
      sections: 'Rubriques',
      openRepository: 'Ouvrir le dépôt sur GitHub',
      emailMe: 'M’écrire',
    },
    terminal: {
      welcome: 'Tapez help pour voir ce que ce terminal peut vous montrer.',
      helpTitle: 'Commandes',
      commands: {
        whoami: 'qui je suis',
        about: 'quelques mots sur moi',
        skills: 'ce que j’utilise',
        projects: 'les projets que j’ai terminés',
        open: 'ouvrir le dépôt d’un projet, par ex. open 2',
        experience: 'mon parcours',
        contact: 'comment me joindre',
        lang: 'changer de langue, par ex. lang en',
        clear: 'effacer le terminal',
      },
      notFound: 'commande introuvable : {cmd}. Tapez help.',
      openUsage: 'usage : open <numéro du projet, de 1 à {total}>',
      opening: 'Ouverture de {title}…',
      langUsage: 'usage : lang en | lang fr',
      langSet: 'Langue réglée sur le français.',
      sudo: 'Permission refusée. Bien essayé, cela dit.',
    },
  },
}

export const interfaceStrings = { en, fr }
