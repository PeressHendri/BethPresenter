import { contextBridge, ipcRenderer } from 'electron';

const allowedChannels = [
  'ping', 'app:set-live-state',
  'bible:listBooks', 'bible:getBooks', 'bible:getChapters', 'bible:getVerses',
  'bible:getChapter', 'bible:hasTranslation', 'bible:getTranslations',
  'bible:search', 'bible:jumpTo', 'bible:importZefania',
  'song:getAll', 'song:create', 'song:update', 'song:delete',
  'song:duplicate', 'song:bulkDelete', 'song:importFromText', 'song:importFromEasyWorship',
  'tag:getAll',
  'presentation:getAll', 'presentation:save',
  'config:update',
  'media:selectAndImport', 'media:getAll', 'media:delete', 'media:getAsBase64', 'media:getFileUrl',
  'setting:get', 'setting:set',
  'output:open', 'output:send-slide', 'output:send-bible', 'output:send-formatting',
  'output:send-background', 'output:send-blank', 'output:control', 'output:toggle-fullscreen',
  'output:video:play', 'output:video:pause', 'output:video:stop', 'output:video:setLoop', 'output:video:setMuted',
  'timer:start', 'timer:stop', 'timer:pause', 'timer:resume',
  'stage:open', 'stage:close', 'stage:send-slide', 'stage:send-message', 'stage:is-open',
  'remote:start', 'remote:stop', 'remote:get-info', 'remote:sync-slides', 'remote:sync-current',
  'backup:export', 'backup:import',
  'window:minimize', 'window:maximize-toggle', 'window:close',
  'log:error', 'output:clear-bg'
];

const allowedOnChannels = [
  'display-slide', 'display-bible', 'apply-formatting', 'set-background',
  'set-blank', 'output-action', 'output:hideText', 'video:play', 'video:pause', 'video:stop',
  'video:setLoop', 'video:setMuted', 'media:video-progress',
  'timer-start', 'timer-stop', 'timer-pause', 'timer-resume',
  'stage:timer-update', 'stage:update-slide', 'stage:set-message',
  'remote:client-count',
  'bible:import-progress',
  'config:updated',
  'window:maximized-state',
  'updater:available', 'updater:ready'
];

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    invoke: (channel: string, ...args: any[]) => {
      if (allowedChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, ...args);
      }
      return Promise.reject(`IPC Channel ${channel} is not allowed`);
    },
    on: (channel: string, listener: (...args: any[]) => void) => {
      if (allowedOnChannels.includes(channel)) {
        const subscription = (_event: any, ...args: any[]) => listener(...args);
        ipcRenderer.on(channel, subscription);
        return () => ipcRenderer.removeListener(channel, subscription);
      }
    },
    send: (channel: string, ...args: any[]) => {
      if (allowedChannels.includes(channel)) {
        ipcRenderer.send(channel, ...args);
      }
    },
  },
});
