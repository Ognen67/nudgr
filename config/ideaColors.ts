/**
 * Idea Colors Configuration
 * Vibrant color palette for 3D mind map idea visualization
 */

export const IDEA_COLORS = [
    '#FF6B35', // vibrant orange (signature)
    '#4ECDC4', // bright teal
    '#45B7D1', // sky blue
    '#96CEB4', // mint green
    '#FFEAA7', // warm yellow
    '#DDA0DD', // plum
    '#98D8C8', // seafoam
    '#F7DC6F', // golden yellow
    '#BB8FCE', // lavender
    '#85C1E9', // light blue
    '#F8C471', // peach
    '#82E0AA', // light green
    '#F1948A', // coral pink
    '#AED6F1', // powder blue
    '#D7BDE2', // light purple
    '#A3E4D7', // mint
    '#FAD7A0', // cream
    '#E8DAEF', // lilac
    '#D5DBDB', // light gray
    '#FADBD8', // blush
    '#D0ECE7', // pale teal
    '#FCF3CF', // light yellow
    '#EBDEF0', // pale lavender
    '#D6EAF8', // ice blue
    '#E8F8F5', // very pale mint
];

/**
 * Get color for a given index (cycles through the palette)
 */
export const getColorForIndex = (index: number): string => {
    return IDEA_COLORS[index % IDEA_COLORS.length];
}; 