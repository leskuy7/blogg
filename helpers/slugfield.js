const slugify = require('slugify');
const options = {
    replacement: '-',
    remove: undefined,
    lower: true,
    strict: true,
    locale: 'tr',
    trim: true
};

function slugField(str, id = '') {
    let slug = slugify(str, options);
    if (id) {
        slug += `-${id}`;
    }
    return slug;
}

module.exports = {
    slugField
};