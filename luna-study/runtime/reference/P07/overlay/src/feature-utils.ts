export const normalise = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
export const compare = (a: string | number, b: string | number) => a < b ? -1 : a > b ? 1 : 0
