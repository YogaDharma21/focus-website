import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { TaskDetailForm } from "./TaskDetailForm";
import { Task } from "@/types/kanban";

interface TaskDetailDialogProps {
    isDesktop: boolean;
    selectedTask: Task | null;
    selectedColumnId: string | null;
    onClose: () => void;
    onSave: (content: string, description: string) => void;
}

export function TaskDetailDialog({
    isDesktop,
    selectedTask,
    selectedColumnId,
    onClose,
    onSave,
}: TaskDetailDialogProps) {
    if (!selectedTask && !selectedColumnId) return null;

    const DialogComponent = isDesktop ? Dialog : Drawer;
    const HeaderComponent = isDesktop ? DialogHeader : DrawerHeader;
    const TitleComponent = isDesktop ? DialogTitle : DrawerTitle;
    const ContentComponent = isDesktop ? DialogContent : DrawerContent;

    return (
        <DialogComponent
            open={true}
            onOpenChange={(open) => !open && onClose()}
        >
            <ContentComponent>
                <HeaderComponent>
                    <TitleComponent>
                        {selectedTask ? "Edit Task" : "Create New Task"}
                    </TitleComponent>
                </HeaderComponent>
                <TaskDetailForm
                    initialContent={selectedTask?.content || ""}
                    initialDescription={selectedTask?.description || ""}
                    onSave={onSave}
                    onClose={onClose}
                    isEditMode={!!selectedTask}
                />
            </ContentComponent>
        </DialogComponent>
    );
}
