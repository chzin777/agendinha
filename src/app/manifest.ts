import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Agendinha - Agenda Acadêmica",
    short_name: "Agendinha",
    description: "Gerencie provas, trabalhos e eventos da faculdade",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#edf5ee",
    theme_color: "#f7faf7",
    lang: "pt-BR",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
