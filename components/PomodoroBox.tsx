"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Pause, RotateCcw, Plus, X } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type TimerMode = "focus" | "shortBreak" | "longBreak";

type Template = {
    name: string;
    focus: number;
    shortBreak: number;
    longBreak: number;
};

const defaultTemplates: Template[] = [
    { name: "Short", focus: 25, shortBreak: 5, longBreak: 15 },
    { name: "Medium", focus: 40, shortBreak: 8, longBreak: 20 },
    { name: "Long", focus: 60, shortBreak: 10, longBreak: 25 },
];

interface PomodoroBoxProps {
    initialMinutes?: number;
    onComplete?: () => void;
}

export default function PomodoroBox() {
    const [templates, setTemplates] = useState<Template[]>(defaultTemplates);
    const [mode, setMode] = useState<TimerMode>("focus");
    const [template, setTemplate] = useState<Template>(templates[0]);
    const [timeLeft, setTimeLeft] = useState(template.focus * 60);
    const [isActive, setIsActive] = useState(false);
    const [focusCycles, setFocusCycles] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const [newTemplate, setNewTemplate] = useState<Template>({
        name: "",
        focus: 25,
        shortBreak: 5,
        longBreak: 15,
    });

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((time) => time - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            playSound();
            if (mode === "focus") {
                const newCycles = focusCycles + 1;
                setFocusCycles(newCycles);
                if (newCycles % 4 === 0) {
                    setMode("longBreak");
                    setTimeLeft(template.longBreak * 60);
                } else {
                    setMode("shortBreak");
                    setTimeLeft(template.shortBreak * 60);
                }
            } else {
                setMode("focus");
                setTimeLeft(template.focus * 60);
            }
            setShowControls(true);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, timeLeft, mode, focusCycles, template]);

    const playSound = () => {
        const audio = new Audio("/festive-melody-audio-sound-effect.mp3");
        audio.play();
    };

    const toggleTimer = () => {
        setIsActive(!isActive);
        setShowControls(false);
    };

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(template.focus * 60);
        setMode("focus");
        setFocusCycles(0);
        setShowControls(true);
    };

    const changeMode = (newMode: TimerMode) => {
        setMode(newMode);
        setTimeLeft(
            newMode === "focus"
                ? template.focus * 60
                : newMode === "shortBreak"
                ? template.shortBreak * 60
                : template.longBreak * 60
        );
        setIsActive(false);
    };

    const handleTemplateChange = (value: string) => {
        const newTemplate =
            templates.find((t) => t.name === value) || templates[0];
        setTemplate(newTemplate);
        setTimeLeft(newTemplate.focus * 60);
        setMode("focus");
        setIsActive(false);
        setFocusCycles(0);
    };

    const addNewTemplate = () => {
        if (
            newTemplate.name &&
            newTemplate.focus &&
            newTemplate.shortBreak &&
            newTemplate.longBreak
        ) {
            setTemplates([...templates, newTemplate]);
            setTemplate(newTemplate);
            setTimeLeft(newTemplate.focus * 60);
            setMode("focus");
            setIsActive(false);
            setFocusCycles(0);
            setNewTemplate({
                name: "",
                focus: 25,
                shortBreak: 5,
                longBreak: 15,
            });
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs
            .toString()
            .padStart(2, "0")}`;
    };

    const Timer = ({ initialMinutes = 25, onComplete }: PomodoroBoxProps) => {
        const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
        const [isActive, setIsActive] = useState(false);

        useEffect(() => {
            let interval: NodeJS.Timeout;

            if (isActive && timeLeft > 0) {
                interval = setInterval(() => {
                    setTimeLeft((time) => {
                        if (time <= 1) {
                            setIsActive(false);
                            onComplete?.();
                            return 0;
                        }
                        return time - 1;
                    });
                }, 1000);
            }

            return () => clearInterval(interval);
        }, [isActive, timeLeft, onComplete]);

        const formatTime = (seconds: number): string => {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
                .toString()
                .padStart(2, "0")}`;
        };

        const handleToggle = () => {
            setIsActive(!isActive);
        };

        const handleReset = () => {
            setIsActive(false);
            setTimeLeft(initialMinutes * 60);
        };

        return (
            <div className="p-4 border rounded-lg shadow-sm">
                <div className="text-4xl font-bold text-center mb-4">
                    {formatTime(timeLeft)}
                </div>
                <div className="flex justify-center gap-2">
                    <button
                        onClick={handleToggle}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        {isActive ? "Pause" : "Start"}
                    </button>
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                        Reset
                    </button>
                </div>
            </div>
        );
    };

    return (
        <Card className="h-full bg-card">
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>Pomodoro Timer</span>
                    <div className="flex items-center space-x-2">
                        <Select
                            value={template.name}
                            onValueChange={handleTemplateChange}
                        >
                            <SelectTrigger className="w-[140px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {templates.map((t) => (
                                    <SelectItem key={t.name} value={t.name}>
                                        {t.name} ({t.focus}min)
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col mt-7 lg:px-8 lg:pt-8">
                <div className="text-center space-y-6 flex-grow flex flex-col justify-center">
                    <div
                        className={`font-bold tracking-tighter transition-all ${
                            showControls
                                ? "text-4xl sm:text-6xl md:text-7xl lg:text-8xl"
                                : "text-5xl sm:text-7xl md:text-8xl lg:text-9xl"
                        }`}
                    >
                        {formatTime(timeLeft)}
                    </div>
                    {showControls && (
                        <>
                            <div className="text-xs sm:text-sm text-muted-foreground mb-4">
                                {mode === "focus"
                                    ? `Concentration Time: ${template.focus} minutes`
                                    : mode === "shortBreak"
                                    ? `Short Break: ${template.shortBreak} minutes`
                                    : `Long Break: ${template.longBreak} minutes`}
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <Button
                                    onClick={() => changeMode("focus")}
                                    variant={
                                        mode === "focus" ? "default" : "outline"
                                    }
                                    className="w-full"
                                >
                                    Focus
                                </Button>
                                <Button
                                    onClick={() => changeMode("shortBreak")}
                                    variant={
                                        mode === "shortBreak"
                                            ? "default"
                                            : "outline"
                                    }
                                    className="w-full"
                                >
                                    Short
                                </Button>
                                <Button
                                    onClick={() => changeMode("longBreak")}
                                    variant={
                                        mode === "longBreak"
                                            ? "default"
                                            : "outline"
                                    }
                                    className="w-full"
                                >
                                    Long
                                </Button>
                            </div>
                        </>
                    )}
                </div>
                <div className="flex justify-center space-x-4 mt-6">
                    <Button onClick={toggleTimer} size="lg" className="w-24">
                        {isActive ? (
                            <Pause className="h-4 w-4" />
                        ) : (
                            <Play className="h-4 w-4" />
                        )}
                    </Button>
                    <Button
                        onClick={resetTimer}
                        size="lg"
                        variant="outline"
                        className="w-24"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
