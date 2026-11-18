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
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
