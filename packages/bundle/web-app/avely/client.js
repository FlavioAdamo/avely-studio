// DSH loads client plugins through its shared module table, including React.
window.__ModuleLoader__.load({
  id: '@avely/harness',
  factory(require) {
    const { createElement: h } = require('react')
    function Mark({ size }) {
      return h('svg', { width: size, height: size, viewBox: '0 0 40 40', fill: 'currentColor', 'aria-hidden': true },
        h('path', { d: 'M21.8116 2.11022C26.7318 1.63215 29.1919 1.39316 31.1635 2.16816C32.8977 2.84988 34.3711 4.06333 35.3727 5.63467C36.5112 7.42103 36.7482 9.88138 37.2223 14.8019L37.8952 21.7863C38.3693 26.7069 38.6063 29.1672 37.8298 31.1396C37.1468 32.8746 35.9323 34.3493 34.3604 35.3523C33.3781 35.979 32.1924 36.3334 30.5065 36.605L30.205 35.2312C30.1636 34.9919 30.1105 34.7544 30.0453 34.5188C29.9122 33.9991 29.8042 33.5074 29.7213 33.0438C29.6509 32.5865 29.7025 32.1823 29.8762 31.8312C29.9693 31.6431 30.0874 31.4517 30.2304 31.2573C30.3859 31.069 30.5539 30.8558 30.7342 30.6174C30.9333 30.3727 31.1416 30.0778 31.3591 29.733C31.5891 29.3942 31.8219 28.9866 32.0577 28.51C33.108 26.3867 33.5145 24.5102 33.2769 22.8805L33.2533 22.7257C32.9961 21.1029 32.1823 19.6419 30.8121 18.3426C29.4201 17.0227 27.5285 15.7662 25.1371 14.5731C23.9853 13.9985 22.812 13.5303 21.6171 13.1688C20.441 12.8009 19.3217 12.5865 18.2592 12.5255C17.2029 12.4519 16.2754 12.5755 15.4766 12.8963C14.6842 13.2046 14.1018 13.735 13.7295 14.4875C13.3325 15.2901 13.3572 16.0451 13.8033 16.7524C14.2557 17.4472 15.0578 18.0819 16.2097 18.6566C16.8857 18.9939 17.5928 19.2528 18.3308 19.4334C19.0813 19.6202 19.8381 19.8101 20.6012 20.0032C21.3642 20.1962 22.0964 20.4677 22.7975 20.8174C23.3483 21.0923 23.8306 21.3955 24.2442 21.7269C24.6578 22.0583 24.9621 22.4056 25.1571 22.7688C25.2702 22.9503 25.346 23.1444 25.3842 23.3511C25.4224 23.5578 25.4263 23.7709 25.3959 23.9902C25.3654 24.2096 25.2912 24.4384 25.1734 24.6766C25.0617 24.9024 24.9247 25.0373 24.7624 25.0814C24.6188 25.1192 24.403 25.0663 24.115 24.9226C23.9523 24.8415 23.7363 24.7258 23.4671 24.5759C23.2041 24.4133 22.9129 24.2447 22.5935 24.0697C22.2804 23.8823 21.9611 23.7073 21.6356 23.5449C20.3335 22.8953 19.0224 22.3585 17.7024 21.9345C16.4011 21.5041 15.1598 21.2679 13.9787 21.2259C12.7976 21.1839 11.736 21.3892 10.794 21.8418C9.86458 22.3006 9.1237 23.0881 8.57159 24.2043C8.01326 25.333 7.789 26.4016 7.89885 27.4103C8.00869 28.4189 8.3589 29.352 8.94936 30.2095C9.5461 31.0857 10.3113 31.874 11.2449 32.5743C12.1722 33.2871 13.1681 33.9091 14.2323 34.44C15.5093 35.0771 16.6606 35.4952 17.6861 35.6942C18.7117 35.893 19.618 35.97 20.4052 35.9249C21.1987 35.8986 21.8547 35.8505 22.3731 35.7808C22.8103 35.7175 23.1789 35.6824 23.4788 35.6757C23.7912 35.6752 24.0476 35.725 24.2479 35.8249C24.3767 35.8892 24.4859 35.9796 24.5753 36.0961L24.9527 37.2329L18.1887 37.8902C13.2686 38.3683 10.8085 38.6072 8.83693 37.8323C7.10275 37.1506 5.62931 35.937 4.62777 34.3657C3.48918 32.5794 3.2521 30.1191 2.77804 25.1986L2.10515 18.214C1.63109 13.2935 1.39407 10.8332 2.17053 8.86077C2.85353 7.12576 4.06803 5.65112 5.63991 4.64817C7.4269 3.50797 9.88695 3.26893 14.8072 2.79085L21.8116 2.11022ZM16.6958 26.1466C17.2265 26.0205 17.8108 26.0383 18.4488 26.2003C19.093 26.3496 19.7281 26.5805 20.354 26.8928C20.9049 27.1677 21.3527 27.4301 21.6973 27.6802C22.0544 27.9366 22.2958 28.1899 22.4218 28.4404C22.5476 28.6908 22.533 28.9728 22.3779 29.2864C22.1732 29.7002 21.8743 30.0202 21.4815 30.2464C21.0886 30.4726 20.6424 30.6174 20.1427 30.6808C19.6492 30.7317 19.143 30.7136 18.624 30.6267C18.1113 30.5273 17.6233 30.362 17.1601 30.1309C16.6843 29.8936 16.2865 29.6247 15.9667 29.3244C15.6532 29.0116 15.4458 28.6736 15.3445 28.3104C15.2557 27.9534 15.3106 27.5742 15.5091 27.1728C15.7821 26.6211 16.1777 26.279 16.6958 26.1466Z' }))
    }
    const italian = {
      conversation: {
        'hero.headline': 'Cosa creiamo oggi?', 'hero.preview': 'Anteprima',
        'placeholder.hero': 'Descrivi la tua idea o scegli una clip del progetto…',
        'placeholder.default': 'Scrivi ad Ave…', 'placeholder.workspace': 'Scegli una cartella per iniziare',
        'hero.chooseWorkspace': 'Scegli una cartella', 'input.send': 'Invia',
      },
      'schedule.catalog': { 'trigger.label': 'Attività programmate' },
      'schedule.manager': { panel: 'Attività programmate', title: 'Attività programmate' },
      pluginManager: { panel: 'Estensioni', title: 'Estensioni' },
      model: { 'trigger.fallback': 'Scegli modello', 'trigger.selectAria': 'Scegli modello' },
      'permission.access': { 'preset.workspaceWrite': 'Modifica nel progetto', 'preset.readOnly': 'Sola lettura', 'preset.fullAccess': 'Accesso completo' },
      'settings.account': { loginTitle: 'Collega il tuo account', close: 'Chiudi',
        loginDescription: 'Per inviare messaggi ad Ave accedi a DeepSeek o aggiungi una chiave API.',
        signIn: 'Accedi', addApiKey: 'Aggiungi chiave API', more: 'Altro' },
      'settings.models': {
        welcomeTitle: 'Benvenuto in Avely',
        welcomeBody: 'Scegli la cartella di un progetto per lavorare con Ave. Puoi preparare testi per una campagna o ricavare un reel dalle clip sul computer.',
        welcomeContinue: 'Continua', onboardingTitle: 'Collega il modello per usare la chat',
        onboardingDescription: 'Per questa anteprima puoi usare la tua chiave API DeepSeek.',
        onboardingLater: 'Configura più tardi', onboardingSave: 'Salva e continua',
      },
      sidebar: { 'session.new': 'Nuova chat', 'session.new.label': 'Nuova chat', 'panels.more': 'Altro' },
      workspace: { 'session.new': 'Nuova chat', 'session.untitled': 'Senza titolo',
        'section.workspaces': 'Progetti', 'section.sessions': 'Conversazioni', 'empty.none': 'Nessuna conversazione' },
      common: { 'brand.localBuild': 'Avely', 'workspace.defaultName': 'Progetto locale', cancel: 'Annulla', close: 'Chiudi', more: 'Altro' },
    }
    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        for (const [slot, component] of [
          ['sidebar.brand.mark', Mark],
          ['sidebar.brand.name', () => h('strong', { style: { fontWeight: 500 } }, 'Avely')],
          ['conversation.hero.brand.mark', Mark],
        ]) ctx.slots.inject(slot, () => ctx.slots.register({ name: slot }, component))
        ctx.effect(() => ctx.locale.addLanguage({ id: 'it', label: 'Italiano', fallback: 'en' }))
        for (const [ns, entries] of Object.entries(italian)) {
          ctx.effect(() => ctx.locale.register(ns, 'it', entries))
        }
      },
    }
  },
})
