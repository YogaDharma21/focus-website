"use client";

import { useState, useEffect } from "react";
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

    const onDragStart = (
        e: React.DragEvent,
        fromColumn: string,
        taskId: string
    ) => {
        e.dataTransfer.setData(
            "text/plain",
            JSON.stringify({ fromColumn, taskId })
        );
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const onDrop = (e: React.DragEvent, toColumn: string) => {
        e.preventDefault();
        const data = JSON.parse(e.dataTransfer.getData("text/plain"));
        const { fromColumn, taskId } = data;

        if (fromColumn === toColumn) return;

        const updatedColumns = columns.map((column) => {
            if (column.id === fromColumn) {
                return {
                    ...column,
                    tasks: column.tasks.filter((task) => task.id !== taskId),
                };
            }
            if (column.id === toColumn) {
                const [task] = columns
                    .find((col) => col.id === fromColumn)!
                    .tasks.filter((task) => task.id === taskId);
                return {
                    ...column,
                    tasks: [...column.tasks, task],
                };
            }
            return column;
        });

        setColumns(updatedColumns);
        saveToLocalStorage(updatedColumns);
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
                            onDragOver={onDragOver}
                            onDrop={(e) => onDrop(e, column.id)}
                        >
                            <h3 className="font-semibold mb-2">
                                {column.title}
                            </h3>
                            <ul className="min-h-[50px]">
                                {column.tasks.map((task) => (
                                    <li
                                        key={task.id}
                                        draggable
                                        onDragStart={(e) =>
                                            onDragStart(e, column.id, task.id)
                                        }
                                        className="bg-card p-2 mb-2 rounded shadow flex justify-between items-center cursor-move"
                                    >
                                        <span>{task.content}</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                deleteTask(column.id, task.id)
                                            }
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
