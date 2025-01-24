import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Task } from "@/types/kanban";

interface KanbanTaskProps {
    task: Task;
    isDragging: boolean;
    isDraggable: boolean;
    onMouseDown: () => void;
    onMouseUp: () => void;
    onDragStart: (e: React.DragEvent) => void;
    onDragEnd: (e: React.DragEvent) => void;
    onTaskClick: () => void;
    onDeleteClick: () => void;
}

export function KanbanTask({
    task,
    isDragging,
    isDraggable,
    onMouseDown,
    onMouseUp,
    onDragStart,
    onDragEnd,
    onTaskClick,
    onDeleteClick,
}: KanbanTaskProps) {
    return (
        <li
            draggable={isDraggable}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            className={`bg-card p-2 mb-2 rounded shadow flex justify-between items-center  ${
                isDragging ? "opacity-50" : ""
            }`}
        >
            <div className="flex-1 cursor-pointer" onClick={onTaskClick}>
                <p className="font-medium">{task.content}</p>
                {task.description && (
                    <p className="text-sm text-gray-400 line-clamp-2">
                        {task.description}
                    </p>
                )}
            </div>
            <Button variant="ghost" size="icon" onClick={onDeleteClick}>
                <Trash2 className="h-4 w-4" />
            </Button>
        </li>
    );
}
