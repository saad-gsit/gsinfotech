/**
 * Convert a string to a URL-friendly slug
 * @param {string} text - The text to convert to a slug
 * @returns {string} - The slugified text
 */
function slugify(text) {
    if (!text || typeof text !== 'string') {
        return '';
    }

    return text
        .toString()                     // Convert to string
        .toLowerCase()                  // Convert to lowercase
        .trim()                        // Remove whitespace from both ends
        .replace(/\s+/g, '-')          // Replace spaces with -
        .replace(/[^\w\-]+/g, '')      // Remove all non-word chars
        .replace(/\-\-+/g, '-')        // Replace multiple - with single -
        .replace(/^-+/, '')            // Trim - from start of text
        .replace(/-+$/, '');           // Trim - from end of text
}

module.exports = slugify;