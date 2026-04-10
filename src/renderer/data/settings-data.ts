export const DEFAULT_SETTINGS = {
  general: {
    language: 'English',
    theme: 'Dark',
    showTooltips: true,
    autoSave: true,
    timeFormat: '12h'
  },
  output: {
    device: 'Display 2 (HDMI)',
    resolution: '1920x1080',
    scaling: 1.0,
    backgroundColor: '#000000',
    safeMargin: true
  },
  stage: {
    enabled: true,
    monitor: 'Display 1 (Internal)',
    template: 'Current + Next',
    fontSize: 48,
    showChords: true
  },
  songs: {
    alignment: 'Center',
    font: 'Montserrat',
    autoSection: true,
    pasteBehavior: 'Auto-Split'
  },
  scripture: {
    defaultTranslation: 'KJV',
    autoFit: true,
    compareMode: 'Side by Side'
  },
  media: {
    path: '/Users/mac/Documents/G-Presenter/Media',
    autoCopy: true,
    autoThumb: true
  },
  license: {
    tier: 'Pro',
    status: 'Activated',
    deviceLimit: '3 / 5'
  }
};

export const SETTINGS_CATEGORIES = [
  { id: 'general', label: 'General', icon: 'settings' },
  { id: 'output', label: 'Output', icon: 'monitor' },
  { id: 'stage', label: 'Stage Display', icon: 'layout' },
  { id: 'songs', label: 'Songs', icon: 'music' },
  { id: 'scripture', label: 'Scripture', icon: 'book' },
  { id: 'media', label: 'Media', icon: 'film' },
  { id: 'countdown', label: 'Countdown', icon: 'clock' },
  { id: 'shortcuts', label: 'Shortcuts', icon: 'keyboard' },
  { id: 'account', label: 'Account / License', icon: 'user' },
];
