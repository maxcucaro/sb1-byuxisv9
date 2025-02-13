// Date formatting utilities
export function formatDate(date) {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
}

export function toISOString(date) {
    if (!date) return null;
    return new Date(date).toISOString().split('T')[0];
}