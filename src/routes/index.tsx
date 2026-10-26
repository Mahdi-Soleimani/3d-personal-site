import { createFileRoute } from "@tanstack/react-router";
import { HomeFilm } from "@/components/home-film";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "مهدی سلیمانی | معمار راهکارهای هوشمند" },
      {
        name: "description",
        content:
          "طراحی و اجرای اتوماسیون، ایجنت هوش مصنوعی و بینایی ماشین. مهدی سلیمانی، نجف‌آباد.",
      },
    ],
  }),
});

function Home() {
  return <HomeFilm />;
}
