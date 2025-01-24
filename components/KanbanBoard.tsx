"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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

type Task = {
    id: string;
    content: string;
    description: string;
};

type Column = {
    id: string;
    title: string;
    tasks: Task[];
};

const TaskDetailForm = ({
    initialContent,
    initialDescription,
    onSave,
    onClose,
    isEditMode,
}: {
    initialContent: string;
    initialDescription: string;
    onSave: (content: string, description: string) => void;
    onClose: () => void;
    isEditMode: boolean;
}) => {
    const [content, setContent] = useState(initialContent);
    const [description, setDescription] = useState(initialDescription);

    useEffect(() => {
        setContent(initialContent);
        setDescription(initialDescription);
    }, [initialContent, initialDescription]);

    const handleSubmit = () => {
        if (!content.trim()) {
            return;
        }
        onSave(content, description);
        onClose();
    };

    return (
        <div className="p-4">
            <div className="space-y-4">
                <Input
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Task title"
                    autoFocus
                />
                <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Task description"
                    className="min-h-[100px]"
                />
                <Button className="w-full" onClick={handleSubmit}>
                    {isEditMode ? "Save Changes" : "Create Task"}
                </Button>
            </div>
        </div>
    );
};

export default function KanbanBoard() {
    const { toast } = useToast();
    const [columns, setColumns] = useState<Column[]>([]);
    const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
    const [dropIndicator, setDropIndicator] = useState<{
        columnId: string;
        index: number;
    } | null>(null);
    const [isDraggable, setIsDraggable] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [selectedColumnId, setSelectedColumnId] = useState<string | null>(
        null
    );
    const [isDesktop, setIsDesktop] = useState(true);

    useEffect(() => {
        const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
        checkDesktop();
        window.addEventListener("resize", checkDesktop);
        return () => window.removeEventListener("resize", checkDesktop);
    }, []);

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
                        ? {
                              ...task,
                              content,
                              description,
                          }
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

            const updatedColumns = columns.map((column) => {
                if (column.id === selectedColumnId) {
                    return { ...column, tasks: [...column.tasks, newTask] };
                }
                return column;
            });

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

    const onMouseDown = (taskId: string) => {
        setTimeout(() => setIsDraggable(true), 200);
    };

    const onMouseUp = () => setIsDraggable(false);

    const onDragStart = (
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
        dragPreview.style.width = "120px";
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
    };

    const onDragOver = (e: React.DragEvent, columnId: string) => {
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
    };

    const onDragEnd = (e: React.DragEvent) => {
        const taskElement = e.currentTarget as HTMLElement;
        const trashIcon = taskElement.querySelector("button");
        if (trashIcon) trashIcon.style.display = "inline-flex";
        setDraggingTaskId(null);
        setDropIndicator(null);
    };

    return (
        <Card className="h-full bg-card">
            <CardHeader>
                <CardTitle>Kanban Board</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {columns.map((column) => (
                        <div
                            key={column.id}
                            className="bg-muted p-2 rounded"
                            onDragOver={(e) => onDragOver(e, column.id)}
                            onDrop={(e) => onDrop(e, column.id)}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-semibold">
                                    {column.title}
                                </h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setSelectedColumnId(column.id);
                                        setSelectedTask(null);
                                    }}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <ul className="min-h-[50px]">
                                {column.tasks.map((task, index) => (
                                    <React.Fragment key={task.id}>
                                        {dropIndicator?.columnId ===
                                            column.id &&
                                            dropIndicator.index === index && (
                                                <div className="h-1 bg-red-500 my-1 rounded-full w-full" />
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
                                            <div
                                                className="flex-1 cursor-pointer"
                                                onClick={() => {
                                                    setSelectedTask(task);
                                                    setSelectedColumnId(null);
                                                }}
                                            >
                                                <p className="font-medium">
                                                    {task.content}
                                                </p>
                                                {task.description && (
                                                    <p className="text-sm text-gray-400 line-clamp-2">
                                                        {task.description}
                                                    </p>
                                                )}
                                            </div>
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
                                        <div className="h-1 bg-red-500 my-1 rounded-full w-full" />
                                    )}
                            </ul>
                        </div>
                    ))}
                </div>

                {(selectedTask || selectedColumnId) &&
                    (isDesktop ? (
                        <Dialog
                            open={true}
                            onOpenChange={(open) => {
                                if (!open) {
                                    setSelectedTask(null);
                                    setSelectedColumnId(null);
                                }
                            }}
                        >
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        {selectedTask
                                            ? "Edit Task"
                                            : "Create New Task"}
                                    </DialogTitle>
                                </DialogHeader>
                                <TaskDetailForm
                                    initialContent={selectedTask?.content || ""}
                                    initialDescription={
                                        selectedTask?.description || ""
                                    }
                                    onSave={handleSaveTask}
                                    onClose={() => {
                                        setSelectedTask(null);
                                        setSelectedColumnId(null);
                                    }}
                                    isEditMode={!!selectedTask}
                                />
                            </DialogContent>
                        </Dialog>
                    ) : (
                        <Drawer
                            open={true}
                            onOpenChange={(open) => {
                                if (!open) {
                                    setSelectedTask(null);
                                    setSelectedColumnId(null);
                                }
                            }}
                        >
                            <DrawerContent>
                                <DrawerHeader className="text-left">
                                    <DrawerTitle>
                                        {selectedTask
                                            ? "Edit Task"
                                            : "Create New Task"}
                                    </DrawerTitle>
                                </DrawerHeader>
                                <TaskDetailForm
                                    initialContent={selectedTask?.content || ""}
                                    initialDescription={
                                        selectedTask?.description || ""
                                    }
                                    onSave={handleSaveTask}
                                    onClose={() => {
                                        setSelectedTask(null);
                                        setSelectedColumnId(null);
                                    }}
                                    isEditMode={!!selectedTask}
                                />
                            </DrawerContent>
                        </Drawer>
                    ))}
            </CardContent>
        </Card>
    );
}
