export const titleCase = (text: string): string =>
    text
        .split(' ')
        .map(w => w[0].toUpperCase() + w.substring(1).toLowerCase())
        .join(' ')
