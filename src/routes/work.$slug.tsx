import { createFileRoute } from "@tanstack/react-router";
import { CaseView } from "@/components/case-view";
import { getProject } from "@/data/profile";

export const Route = createFileRoute("/work/$slug")({
  loader: ({ params }) => getProject(params.slug),
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.title} | مهدی سلیمانی`
          : "نمونه کار | مهدی سلیمانی",
      },
      {
        name: "description",
        content: loaderData?.summary ?? "نمونه کار مهدی سلیمانی، معمار راهکارهای هوشمند.",
      },
    ],
  }),
  component: CasePage,
});

function CasePage() {
  const { slug } = Route.useParams();
  return <CaseView slug={slug} />;
}
