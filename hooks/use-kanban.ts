import { useState, useEffect } from "react";
import { Column, Task, DropIndicator } from "@/types/kanban";
import { useToast } from "@/hooks/use-toast";

export function useKanban() {
    const { toast } = useToast();
    const [columns, setColumns] = useState<Column[]>([]);
    const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
    const [dropIndicator, setDropIndicator] = useState<DropIndicator>(null);
    const [isDraggable, setIsDraggable] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [selectedColumnId, setSelectedColumnId] = useState<string | null>(
        null
    );

    useEffect(() => {
        const storedColumns = localStorage.getItem("kanbanColumns");
        if (storedColumns) {
            setColumns(JSON.parse(storedColumns));
        } else {
            setColumns([
                { id: "todo", title: "To Do", tasks: [] },
                { id: "inProgress", title: "In Progress", tasks: [] },
                { id: "done", title: "Done", tasks: [] },
            ]);
        }
    }, []);

    const saveToLocalStorage = (updatedColumns: Column[]) => {
        localStorage.setItem("kanbanColumns", JSON.stringify(updatedColumns));
    };

    const handleSaveTask = (content: string, description: string) => {
        if (selectedTask) {
            const updatedColumns = columns.map((column) => ({
                ...column,
                tasks: column.tasks.map((task) =>
                    task.id === selectedTask.id
                        ? { ...task, content, description }
                        : task
                ),
            }));
            setColumns(updatedColumns);
            saveToLocalStorage(updatedColumns);
        } else if (selectedColumnId) {
            if (!content.trim()) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Task title cannot be empty",
                });
                return;
            }

            const newTask = {
                id: Date.now().toString(),
                content,
                description,
            };

            const updatedColumns = columns.map((column) =>
                column.id === selectedColumnId
                    ? { ...column, tasks: [...column.tasks, newTask] }
                    : column
            );

            setColumns(updatedColumns);
            saveToLocalStorage(updatedColumns);
        }
    };

    const deleteTask = (columnId: string, taskId: string) => {
        const updatedColumns = columns.map((column) =>
            column.id === columnId
                ? {
                      ...column,
                      tasks: column.tasks.filter((task) => task.id !== taskId),
                  }
                : column
        );
        setColumns(updatedColumns);
        saveToLocalStorage(updatedColumns);
    };

    const dragHandlers = {
        onMouseDown: (taskId: string) => {
            setTimeout(() => setIsDraggable(true), 200);
        },
        onMouseUp: () => setIsDraggable(false),
        onDragStart: (
            e: React.DragEvent,
            fromColumn: string,
            taskId: string
        ) => {
            if (!isDraggable) {
                e.preventDefault();
                return;
            }

            const taskElement = e.currentTarget as HTMLElement;
            const trashIcon = taskElement.querySelector("button");
            if (trashIcon) trashIcon.style.display = "none";

            const dragPreview = taskElement.cloneNode(true) as HTMLElement;
            dragPreview.style.backgroundColor = "#09090B";
            dragPreview.style.color = "#fff";
            dragPreview.style.width = "200px";
            dragPreview.style.position = "absolute";
            dragPreview.style.top = "-9999px";
            document.body.appendChild(dragPreview);

            e.dataTransfer.setData(
                "text/plain",
                JSON.stringify({ fromColumn, taskId })
            );
            e.dataTransfer.setDragImage(dragPreview, 0, 0);

            setDraggingTaskId(taskId);
            setTimeout(() => document.body.removeChild(dragPreview), 0);
        },
        onDragOver: (e: React.DragEvent, columnId: string) => {
            e.preventDefault();
            const columnElement = e.currentTarget as HTMLElement;
            const tasks = columnElement.querySelectorAll("li");
            const { clientY } = e;

            let closestIndex = tasks.length;
            let closestDistance = Infinity;

            tasks.forEach((task, index) => {
                const rect = task.getBoundingClientRect();
                const distanceToTop = Math.abs(clientY - rect.top);
                const distanceToBottom = Math.abs(clientY - rect.bottom);

                if (distanceToTop < closestDistance) {
                    closestDistance = distanceToTop;
                    closestIndex = index;
                }
                if (distanceToBottom < closestDistance) {
                    closestDistance = distanceToBottom;
                    closestIndex = index + 1;
                }
            });

            setDropIndicator({ columnId, index: closestIndex });
        },
        onDrop: (e: React.DragEvent, toColumn: string) => {
            e.preventDefault();
            const data = JSON.parse(e.dataTransfer.getData("text/plain"));
            const { fromColumn, taskId } = data;

            const sourceColumn = columns.find((col) => col.id === fromColumn);
            const destinationColumn = columns.find(
                (col) => col.id === toColumn
            );
            if (!sourceColumn || !destinationColumn) return;

            const task = sourceColumn.tasks.find((task) => task.id === taskId);
            if (!task) return;

            const dropIndex =
                dropIndicator?.columnId === toColumn
                    ? dropIndicator.index
                    : destinationColumn.tasks.length;

            const updatedColumns = columns.map((column) => {
                if (column.id === fromColumn && column.id === toColumn) {
                    const updatedTasks = [...column.tasks];
                    updatedTasks.splice(
                        updatedTasks.findIndex((t) => t.id === taskId),
                        1
                    );
                    updatedTasks.splice(dropIndex, 0, task);
                    return { ...column, tasks: updatedTasks };
                }
                if (column.id === fromColumn) {
                    return {
                        ...column,
                        tasks: column.tasks.filter((t) => t.id !== taskId),
                    };
                }
                if (column.id === toColumn) {
                    const updatedTasks = [...column.tasks];
                    updatedTasks.splice(dropIndex, 0, task);
                    return { ...column, tasks: updatedTasks };
                }
                return column;
            });

            setColumns(updatedColumns);
            saveToLocalStorage(updatedColumns);
            setDropIndicator(null);
            setDraggingTaskId(null);
        },
        onDragEnd: (e: React.DragEvent) => {
            const taskElement = e.currentTarget as HTMLElement;
            const trashIcon = taskElement.querySelector("button");
            if (trashIcon) trashIcon.style.display = "inline-flex";
            setDraggingTaskId(null);
            setDropIndicator(null);
        },
    };

    return {
        columns,
        draggingTaskId,
        dropIndicator,
        selectedTask,
        selectedColumnId,
        setSelectedTask,
        setSelectedColumnId,
        handleSaveTask,
        deleteTask,
        dragHandlers,
    };
}
