import { Ballot, Dashboard, Shield, Users } from '@/components/icons/Icons';
import UserMenu from '../components/layout/UserMenu';
import { SidebarLinkI } from './types';

export const SidebarDashboardLinks: SidebarLinkI[] = [
  {
    label: "Dashboard",
    icon: Dashboard(),
    href: "/dashboard"
  },
  {
    label: "Votaciones",
    icon: Ballot(),
    href: "/dashboard/ballot"
  },
  {
    label: "Usuarios",
    icon: Users(),
    href: "/dashboard/users"
  },
  {
    label: "Candidatos",
    icon: Shield(),
    href: "/dashboard/candidates",
  },
]

export const Links = [
  {
    "link": "/sign-in",
    "label": "Iniciar Sesión",
    "auth": false,
  },
  {
    "link": "/sign-up",
    "label": "Registrarse",
    "auth": false,
  },
  {
    "link": "/vote",
    "label": "Votar",
    "auth": true,
    "election": true
  },
  {
    "link": "/results",
    "label": "Resultados",
    "auth": true,
    "nonClean": true
  },
  {
    "link": "/candidates",
    "label": "Candidatos",
    "auth": true,
    "nonUsers": true,
    "election": false
  },
  {
    "link": "/profile",
    "label": "Perfil",
    "auth": true,
    "component": UserMenu
  },
]