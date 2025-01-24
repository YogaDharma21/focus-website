export type Task = {
    id: string;
    content: string;
    description: string;
};

export type Column = {
    id: string;
    title: string;
    tasks: Task[];
};

export type DropIndicator = {
    columnId: string;
    index: number;
} | null;
