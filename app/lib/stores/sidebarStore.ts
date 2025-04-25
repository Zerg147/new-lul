import { atom } from 'nanostores';

export const sidebarOpen = atom(false);

export function toggleSidebar() {
  sidebarOpen.set(!sidebarOpen.get());
}
