/**
 * MainLayout — Re-exports AppShell as a drop-in replacement.
 * All routes that used <MainLayout> now automatically get the
 * full AppShell (TitleBar + collapsible Sidebar + ControlBar + StatusBar).
 */
export { AppShell as MainLayout } from './AppShell';
