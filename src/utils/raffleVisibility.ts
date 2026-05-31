export function isRaffleVisible(value: unknown): boolean {
    if (value === false || value === 'false' || value === 0 || value === '0') return false;
    if (value === true || value === 'true' || value === 1 || value === '1') return true;
    return true;
}
