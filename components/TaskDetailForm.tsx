import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface TaskDetailFormProps {
    initialContent: string;
    initialDescription: string;
    onSave: (content: string, description: string) => void;
    onClose: () => void;
    isEditMode: boolean;
}

export function TaskDetailForm({
    initialContent,
    initialDescription,
    onSave,
    onClose,
    isEditMode,
}: TaskDetailFormProps) {
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
}
