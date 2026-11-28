export interface Project {
  name: string;
  href: string;
  /** Where the project lives, shown under its name. */
  location: string;
  /** Two-letter monogram used on the card. */
  mark: string;
  /** Card accent colour. */
  accent: string;
  /** External projects open in a new tab. */
  external?: boolean;
}

/**
 * The project index. Internal entries use a relative URL so the site keeps
 * working if it is ever served from a sub-path.
 */
export const projects: Project[] = [
  {
    name: 'Loto',
    href: 'https://mapcar.alwaysdata.net/loto',
    location: 'mapcar.alwaysdata.net',
    mark: 'LO',
    accent: '#c8a24a',
    external: true
  },
  {
    name: 'Turnir',
    href: 'https://mapcar.alwaysdata.net/turnir',
    location: 'mapcar.alwaysdata.net',
    mark: 'TU',
    accent: '#7ea6e0',
    external: true
  },
  {
    name: 'Events',
    href: 'https://whenis.app',
    location: 'whenis.app',
    mark: 'EV',
    accent: '#38b6a6',
    external: true
  },
  {
    name: 'EventLab Team',
    href: 'https://eventlab.dev/',
    location: 'eventlab.dev',
    mark: 'EL',
    accent: '#b98be0',
    external: true
  },
  {
    name: 'PoE Eldritch Mods',
    href: 'mods/',
    location: '/mods/',
    mark: 'EM',
    accent: '#e2683f'
  },
  {
    name: 'PoE Corrupted Mods',
    href: 'corrupted/',
    location: '/corrupted/',
    mark: 'CM',
    accent: '#c77be5'
  }
];
