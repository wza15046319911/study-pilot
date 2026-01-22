import { Header } from "@/components/layout/Header";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { NotFoundPage } from "@/components/ui/NotFoundPage";

export default async function QuestionPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f0f4fc]">
      <AmbientBackground />
      <Header user={{ username: "Guest" }} />
      <div className="flex-grow flex items-center justify-center">
        <NotFoundPage
          title="Question Sharing Disabled"
          description="Question sharing is temporarily unavailable. Please return to the library."
          backLink="/library"
          backText="Back to Library"
        />
      </div>
    </div>
  );
}
