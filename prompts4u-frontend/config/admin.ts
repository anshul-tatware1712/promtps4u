// Admin configuration and constants

export const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "";

export const ADMIN_ROUTES = {
  COMPONENTS: "/admin/components",
  SCRAPE: "/admin/scrape",
  PAGES: "/admin/pages",
  MIX_MASTER: "/admin/mix-master",
} as const;

export const COMPONENT_CATEGORIES = [
  "navbar",
  "hero",
  "features",
  "pricing",
  "testimonials",
  "cta",
  "footer",
  "faq",
  "stats",
  "logo-cloud",
  "auth-form",
  "sidebar",
] as const;

export type ComponentCategory = (typeof COMPONENT_CATEGORIES)[number];

export const COMPONENT_TIERS = ["free", "pro"] as const;

export type ComponentTier = (typeof COMPONENT_TIERS)[number];

export const SCRAPE_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export const PROMPT_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  ARCHIVED: "archived",
} as const;

export const ADMIN_NAV_LINKS = [
  {
    href: ADMIN_ROUTES.COMPONENTS,
    label: "Components",
    icon: "Layers",
  },
  {
    href: ADMIN_ROUTES.SCRAPE,
    label: "Scrape Pages",
    icon: "Images",
  },
  {
    href: ADMIN_ROUTES.PAGES,
    label: "View All Pages",
    icon: "FileText",
  },
  {
    href: ADMIN_ROUTES.MIX_MASTER,
    label: "Mix Master",
    icon: "Blend",
  },
] as const;

export const formatCategory = (category: string) =>
  category.charAt(0).toUpperCase() + category.slice(1);

export const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString();

export const formatDateTime = (dateString: string) =>
  new Date(dateString).toLocaleString();
