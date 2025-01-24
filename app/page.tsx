import KanbanBoard from "@/components/KanbanBoard";
import YouTubePlayer from "@/components/YouTubePlayer";
import PomodoroBox from "@/components/PomodoroBox";

export default function BentoBox() {
    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto p-4">
                <div className="grid grid-cols-1 gap-4 max-w-6xl mx-auto">
                    <KanbanBoard />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <YouTubePlayer />
                        <PomodoroBox />
                    </div>
                </div>
            </div>
        </div>
    );
}
