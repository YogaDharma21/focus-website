export interface PomodoroSettings {
    workDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    sessionsBeforeLongBreak: number;
}

export const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4,
};

export enum PomodoroPhase {
    WORK = "work",
    SHORT_BREAK = "shortBreak",
    LONG_BREAK = "longBreak",
}

export const getNextPhase = (
    currentPhase: PomodoroPhase,
    completedSessions: number,
    settings: PomodoroSettings = DEFAULT_POMODORO_SETTINGS
): PomodoroPhase => {
    if (currentPhase === PomodoroPhase.WORK) {
        return (completedSessions + 1) % settings.sessionsBeforeLongBreak === 0
            ? PomodoroPhase.LONG_BREAK
            : PomodoroPhase.SHORT_BREAK;
    }
    return PomodoroPhase.WORK;
};

export const getPhaseDuration = (
    phase: PomodoroPhase,
    settings: PomodoroSettings = DEFAULT_POMODORO_SETTINGS
): number => {
    switch (phase) {
        case PomodoroPhase.WORK:
            return settings.workDuration;
        case PomodoroPhase.SHORT_BREAK:
            return settings.shortBreakDuration;
        case PomodoroPhase.LONG_BREAK:
            return settings.longBreakDuration;
    }
};
