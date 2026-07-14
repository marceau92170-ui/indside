import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Pages publiques indexables (pas les pages derrière connexion).
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = [
    { path: "/", priority: 1 },
    { path: "/faq", priority: 0.8 },
    { path: "/connexion", priority: 0.6 },
    { path: "/cgu", priority: 0.3 },
    { path: "/confidentialite", priority: 0.3 },
  ];
  return routes.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: r.priority,
  }));
}
