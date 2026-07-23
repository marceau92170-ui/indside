import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { ALL_EXERCISES } from "@/lib/data/exercises";

// Pages publiques indexables (pas les pages derrière connexion).
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: {
    path: string;
    priority: number;
    freq: MetadataRoute.Sitemap[number]["changeFrequency"];
  }[] = [
    { path: "/", priority: 1, freq: "weekly" },
    { path: "/exercices", priority: 0.9, freq: "weekly" },
    { path: "/clubs", priority: 0.8, freq: "monthly" },
    { path: "/faq", priority: 0.8, freq: "monthly" },
    { path: "/connexion", priority: 0.5, freq: "monthly" },
    { path: "/cgu", priority: 0.3, freq: "yearly" },
    { path: "/cgv", priority: 0.3, freq: "yearly" },
    { path: "/mentions-legales", priority: 0.3, freq: "yearly" },
    { path: "/confidentialite", priority: 0.3, freq: "yearly" },
  ];

  const exerciseRoutes = ALL_EXERCISES.map((e) => ({
    path: `/exercices/${e.slug}`,
    priority: 0.7,
    freq: "monthly" as const,
  }));

  return [...staticRoutes, ...exerciseRoutes].map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.freq,
    priority: r.priority,
  }));
}
