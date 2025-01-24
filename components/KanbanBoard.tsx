"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { KanbanTask } from "./KanbanTask";
import { useKanban } from "@/hooks/use-kanban";
import { TaskDetailDialog } from "./TaskDetailDialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function KanbanBoard() {
    const {
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
    } = useKanban();

    const [isDesktop, setIsDesktop] = useState(true);

    useEffect(() => {
        const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
        checkDesktop();
        window.addEventListener("resize", checkDesktop);
        return () => window.removeEventListener("resize", checkDesktop);
    }, []);

    const handleCloseDialog = () => {
        setSelectedTask(null);
        setSelectedColumnId(null);
    };

    return (
        <Card className="h-full bg-card">
            <CardHeader className="flex flex-row items-center justify-between w-full">
                <CardTitle className="flex-1 ">Kanban Board</CardTitle>
                <ThemeToggle />
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {columns.map((column) => (
                        <div
                            key={column.id}
                            className="bg-muted p-2 rounded"
                            onDragOver={(e) =>
                                dragHandlers.onDragOver(e, column.id)
                            }
                            onDrop={(e) => dragHandlers.onDrop(e, column.id)}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-semibold pl-2">
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
                            <ScrollArea className="h-[280px]">
                                <ul className="px-4">
                                    {column.tasks.map((task, index) => (
                                        <React.Fragment key={task.id}>
                                            {dropIndicator?.columnId ===
                                                column.id &&
                                                dropIndicator.index ===
                                                    index && (
                                                    <div className="h-1 bg-red-500 my-1 rounded-full w-full" />
                                                )}
                                            <KanbanTask
                                                task={task}
                                                isDragging={
                                                    draggingTaskId === task.id
                                                }
                                                isDraggable={true}
                                                onMouseDown={() =>
                                                    dragHandlers.onMouseDown(
                                                        task.id
                                                    )
                                                }
                                                onMouseUp={
                                                    dragHandlers.onMouseUp
                                                }
                                                onDragStart={(e) =>
                                                    dragHandlers.onDragStart(
                                                        e,
                                                        column.id,
                                                        task.id
                                                    )
                                                }
                                                onDragEnd={
                                                    dragHandlers.onDragEnd
                                                }
                                                onTaskClick={() =>
                                                    setSelectedTask(task)
                                                }
                                                onDeleteClick={() =>
                                                    deleteTask(
                                                        column.id,
                                                        task.id
                                                    )
                                                }
                                            />
                                        </React.Fragment>
                                    ))}
                                    {dropIndicator?.columnId === column.id &&
                                        dropIndicator.index ===
                                            column.tasks.length && (
                                            <div className="h-1 bg-red-500 my-1 rounded-full w-full" />
                                        )}
                                </ul>
                            </ScrollArea>
                        </div>
                    ))}
                </div>
                <TaskDetailDialog
                    isDesktop={isDesktop}
                    selectedTask={selectedTask}
                    selectedColumnId={selectedColumnId}
                    onClose={handleCloseDialog}
                    onSave={handleSaveTask}
                />
            </CardContent>
        </Card>
    );
}
