import KanbanBoard from "@/components/KanbanBoard";
import YouTubePlayer from "@/components/YouTubePlayer";
import NotesBox from "@/components/NotesBox";
import PomodoroBox from "@/components/PomodoroBox";

export default function BentoBox() {
    return (
        <div className="min-h-screen dark bg-background">
            <div className="container mx-auto p-4">
                <iframe
                    width="420"
                    height="315"
                    src="https://www.youtube.com/embed/tgbNymZ7vqY"
                ></iframe>
                <div className="grid grid-cols-1 gap-4 max-w-4xl mx-auto">
                    <KanbanBoard />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <YouTubePlayer />
                        <PomodoroBox />
                    </div>
                    <NotesBox />
                </div>
            </div>
        </div>
    );
}
