export type Validation = ValidationItem[];

export type ValidationItem = { type: "error" | "warning"; message: string };

export function buildValidationError(message: string): ValidationItem {
    return { type: "error", message };
}

export function buildValidationWarning(message: string): ValidationItem {
    return { type: "warning", message };
}

export function getMessages(validationResult: Validation) {
    const errors = validationResult.filter(v => v.type === "error").map(v => v.message);
    const warnings = validationResult.filter(v => v.type === "warning").map(v => v.message);
    return { errors, warnings };
}
