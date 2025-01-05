"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Note = {
    id: string;
    content: string;
};

export default function NotesBox() {
    const { toast } = useToast();
    const [notes, setNotes] = useState<Note[]>([]);
    const [currentNote, setCurrentNote] = useState("");

    const addNote = () => {
        if (currentNote.trim() !== "") {
            setNotes([
                ...notes,
                { id: Date.now().toString(), content: currentNote },
            ]);
            setCurrentNote("");
        } else {
            toast({
                variant: "destructive",
                title: "Ada Masalah.",
                description: "Tolong berikan input yang sesuai.",
            });
        }
    };

    const deleteNote = (id: string) => {
        setNotes(notes.filter((note) => note.id !== id));
    };

    return (
        <Card className="h-full bg-card">
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>Notes</span>
                    <Button variant="outline" size="icon" onClick={addNote}>
                        <PlusCircle className="h-4 w-4" />
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Textarea
                    placeholder="Type your notes here..."
                    value={currentNote}
                    onChange={(e) => setCurrentNote(e.target.value)}
                    className="mb-4 h-[150px] bg-input resize-none"
                />
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {notes.map((note) => (
                        <div
                            key={note.id}
                            className="p-3 bg-muted rounded-lg shadow flex justify-between items-start"
                        >
                            <p className="text-sm flex-grow mr-2">
                                {note.content}
                            </p>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteNote(note.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
