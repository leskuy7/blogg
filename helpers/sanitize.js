const createDOMPurify = require('isomorphic-dompurify');

// HTML içeriğini temizlemek için DOMPurify kullan
const sanitizeHtml = (html) => {
    if (!html) return '';
    
    // İzin verilen etiketler ve nitelikler
    const config = {
        ALLOWED_TAGS: [
            'p', 'br', 'strong', 'em', 'u', 'strike', 'del', 'ins',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li',
            'blockquote', 'pre', 'code',
            'a', 'img',
            'table', 'thead', 'tbody', 'tr', 'th', 'td',
            'div', 'span'
        ],
        ALLOWED_ATTR: [
            'href', 'title', 'alt', 'src', 'width', 'height',
            'class', 'id', 'style'
        ],
        ALLOW_DATA_ATTR: false,
        ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|xxx):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
    };
    
    return createDOMPurify.sanitize(html, config);
};

// Sadece metin içeriğini almak için (etiketleri kaldır)
const stripHtml = (html) => {
    if (!html) return '';
    return createDOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
};

// Blog içeriği için özel temizleme
const sanitizeBlogContent = (content) => {
    if (!content) return '';
    
    const config = {
        ALLOWED_TAGS: [
            'p', 'br', 'strong', 'em', 'u', 'strike', 'del', 'ins',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li',
            'blockquote', 'pre', 'code',
            'a', 'img',
            'table', 'thead', 'tbody', 'tr', 'th', 'td'
        ],
        ALLOWED_ATTR: {
            'a': ['href', 'title', 'target'],
            'img': ['src', 'alt', 'title', 'width', 'height'],
            'blockquote': ['cite'],
            '*': ['class']
        },
        ALLOW_DATA_ATTR: false,
        ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
        FORBID_TAGS: ['script', 'object', 'embed', 'iframe', 'form', 'input'],
        FORBID_ATTR: ['style', 'onerror', 'onload', 'onclick']
    };
    
    return createDOMPurify.sanitize(content, config);
};

// Çok kısa bir özet oluşturmak için
const createExcerpt = (content, maxLength = 150) => {
    if (!content) return '';
    
    const plainText = stripHtml(content);
    if (plainText.length <= maxLength) {
        return plainText;
    }
    
    return plainText.substring(0, maxLength).trim() + '...';
};

module.exports = {
    sanitizeHtml,
    stripHtml,
    sanitizeBlogContent,
    createExcerpt
};
