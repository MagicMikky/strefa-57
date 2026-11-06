import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Paintball Strefa 29",
    short_name: "Strefa 29",
    description: "Terenowe pole paintballowe w Czaplach koło Gdańska.",
    start_url: "/",
    display: "standalone",
    background_color: "#111510",
    theme_color: "#111510",
    lang: "pl",
  };
}
