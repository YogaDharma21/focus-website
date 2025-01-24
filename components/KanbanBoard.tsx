"use client";

import React, { useState, useEffect } from "react"; // Import React
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Task = {
    id: string;
    content: string;
};

type Column = {
    id: string;
    title: string;
    tasks: Task[];
};

export default function KanbanBoard() {
    const { toast } = useToast();
    const [columns, setColumns] = useState<Column[]>([]);
    const [newTask, setNewTask] = useState("");
    const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
    const [dropIndicator, setDropIndicator] = useState<{
        columnId: string;
        index: number;
    } | null>(null); // Track where to show the drop indicator
    const [isDraggable, setIsDraggable] = useState(false); // Track if the task is ready to be dragged

    useEffect(() => {
        // Load tasks from localStorage on mount
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

    const addTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTask.trim() !== "") {
            const updatedColumns = [...columns];
            updatedColumns[0].tasks.push({
                id: Date.now().toString(),
                content: newTask,
            });
            setColumns(updatedColumns);
            saveToLocalStorage(updatedColumns);
            setNewTask("");
        } else {
            toast({
                variant: "destructive",
                title: "Ada Masalah.",
                description: "Tolong berikan input yang sesuai.",
            });
        }
    };

    const deleteTask = (columnId: string, taskId: string) => {
        const updatedColumns = columns.map((column) => {
            if (column.id === columnId) {
                return {
                    ...column,
                    tasks: column.tasks.filter((task) => task.id !== taskId),
                };
            }
            return column;
        });
        setColumns(updatedColumns);
        saveToLocalStorage(updatedColumns);
    };

    const onMouseDown = (taskId: string) => {
        // Set a timeout to enable dragging after a short delay
        setTimeout(() => {
            setIsDraggable(true);
        }, 200); // 200ms delay
    };

    const onMouseUp = () => {
        setIsDraggable(false); // Disable dragging when the mouse is released
    };

    const onDragStart = (
        e: React.DragEvent,
        fromColumn: string,
        taskId: string
    ) => {
        if (!isDraggable) {
            e.preventDefault(); // Prevent dragging if not ready
            return;
        }

        const taskElement = e.currentTarget as HTMLElement;

        // Hide the trash icon while dragging
        const trashIcon = taskElement.querySelector("button");
        if (trashIcon) {
            trashIcon.style.display = "none";
        }

        // Clone the task card element
        const dragPreview = taskElement.cloneNode(true) as HTMLElement;

        // Set the background color of the drag preview to #09090B
        dragPreview.style.backgroundColor = "#09090B";
        dragPreview.style.color = "#fff";
        dragPreview.style.width = "120px";
        dragPreview.style.justifyContent = "center";

        // Position the drag preview off-screen
        dragPreview.style.position = "absolute";
        dragPreview.style.top = "-9999px"; // Move the preview off-screen
        dragPreview.style.opacity = "1"; // Ensure the preview is fully visible
        document.body.appendChild(dragPreview);

        // Set the custom drag preview
        e.dataTransfer.setData(
            "text/plain",
            JSON.stringify({ fromColumn, taskId })
        );
        e.dataTransfer.setDragImage(dragPreview, 0, 0); // Use the cloned element as the drag preview

        setDraggingTaskId(taskId);

        // Clean up the drag preview after the drag operation
        setTimeout(() => {
            document.body.removeChild(dragPreview);
        }, 0);
    };

    const onDragOver = (e: React.DragEvent, columnId: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";

        // Calculate the drop position
        const columnElement = e.currentTarget as HTMLElement;
        const tasks = columnElement.querySelectorAll("li");
        const { clientY } = e;

        let closestIndex = tasks.length; // Default to the end of the list
        let closestDistance = Infinity;

        tasks.forEach((task, index) => {
            const rect = task.getBoundingClientRect();
            const distanceToTop = Math.abs(clientY - rect.top);
            const distanceToBottom = Math.abs(clientY - rect.bottom);

            // Check if the mouse is closer to the top or bottom of the task
            if (distanceToTop < closestDistance) {
                closestDistance = distanceToTop;
                closestIndex = index; // Insert above this task
            }
            if (distanceToBottom < closestDistance) {
                closestDistance = distanceToBottom;
                closestIndex = index + 1; // Insert below this task
            }
        });

        // Update the drop indicator position
        setDropIndicator({ columnId, index: closestIndex });
    };

    const onDrop = (e: React.DragEvent, toColumn: string) => {
        e.preventDefault();
        const data = JSON.parse(e.dataTransfer.getData("text/plain"));
        const { fromColumn, taskId } = data;

        const sourceColumn = columns.find((col) => col.id === fromColumn);
        const destinationColumn = columns.find((col) => col.id === toColumn);

        if (!sourceColumn || !destinationColumn) return;

        const task = sourceColumn.tasks.find((task) => task.id === taskId);
        if (!task) return;

        const dropIndex =
            dropIndicator?.columnId === toColumn
                ? dropIndicator.index
                : destinationColumn.tasks.length;

        if (fromColumn === toColumn) {
            const updatedTasks = [...sourceColumn.tasks];
            updatedTasks.splice(
                updatedTasks.findIndex((t) => t.id === taskId),
                1
            );
            updatedTasks.splice(dropIndex, 0, task);

            const updatedColumns = columns.map((column) => {
                if (column.id === toColumn) {
                    return {
                        ...column,
                        tasks: updatedTasks,
                    };
                }
                return column;
            });

            setColumns(updatedColumns);
            saveToLocalStorage(updatedColumns);
        } else {
            const updatedColumns = columns.map((column) => {
                if (column.id === fromColumn) {
                    return {
                        ...column,
                        tasks: column.tasks.filter((t) => t.id !== taskId),
                    };
                }
                if (column.id === toColumn) {
                    const updatedTasks = [...column.tasks];
                    updatedTasks.splice(dropIndex, 0, task);
                    return {
                        ...column,
                        tasks: updatedTasks,
                    };
                }
                return column;
            });

            setColumns(updatedColumns);
            saveToLocalStorage(updatedColumns);
        }

        setDropIndicator(null); // Clear the drop indicator
        setDraggingTaskId(null);
    };

    const onDragEnd = (e: React.DragEvent) => {
        const taskElement = e.currentTarget as HTMLElement;

        // Show the trash icon again after dragging
        const trashIcon = taskElement.querySelector("button");
        if (trashIcon) {
            trashIcon.style.display = "inline-flex"; // Reset to default display
        }

        e.currentTarget.style.cursor = "grab";
        setDraggingTaskId(null);
        setDropIndicator(null); // Clear the drop indicator
    };

    return (
        <Card className="h-full bg-card">
            <CardHeader>
                <CardTitle>Kanban Board</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={addTask} className="flex mb-4">
                    <Input
                        type="text"
                        placeholder="Add a new task"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        className="mr-2 bg-input"
                    />
                    <Button type="submit">Add</Button>
                </form>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {columns.map((column) => (
                        <div
                            key={column.id}
                            className="bg-muted p-2 rounded"
                            onDragOver={(e) => onDragOver(e, column.id)}
                            onDrop={(e) => onDrop(e, column.id)}
                        >
                            <h3 className="font-semibold mb-2">
                                {column.title}
                            </h3>
                            <ul className="min-h-[50px]">
                                {column.tasks.map((task, index) => (
                                    <React.Fragment key={task.id}>
                                        {dropIndicator?.columnId ===
                                            column.id &&
                                            dropIndicator.index === index && (
                                                <div
                                                    className="h-1 bg-red-500 my-1 rounded-full"
                                                    style={{
                                                        width: "100%",
                                                    }}
                                                />
                                            )}
                                        <li
                                            draggable={isDraggable}
                                            onMouseDown={() =>
                                                onMouseDown(task.id)
                                            }
                                            onMouseUp={onMouseUp}
                                            onDragStart={(e) =>
                                                onDragStart(
                                                    e,
                                                    column.id,
                                                    task.id
                                                )
                                            }
                                            onDragEnd={onDragEnd}
                                            className={`bg-card p-2 mb-2 rounded shadow flex justify-between items-center cursor-grab ${
                                                draggingTaskId === task.id
                                                    ? "opacity-50 cursor-grabbing"
                                                    : ""
                                            }`}
                                        >
                                            <span>{task.content}</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    deleteTask(
                                                        column.id,
                                                        task.id
                                                    )
                                                }
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </li>
                                    </React.Fragment>
                                ))}
                                {dropIndicator?.columnId === column.id &&
                                    dropIndicator.index ===
                                        column.tasks.length && (
                                        <div
                                            className="h-1 bg-red-500 my-1 rounded-full"
                                            style={{
                                                width: "100%",
                                            }}
                                        />
                                    )}
                            </ul>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
