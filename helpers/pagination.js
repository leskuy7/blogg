async function paginate(model, page, limit, options = {}) {
    const offset = (page - 1) * limit;
    const { rows, count } = await model.findAndCountAll({
        ...options,
        limit,
        offset,
        distinct: true
    });
    const totalPages = Math.ceil(count / limit) || 1;
    return { rows, count, totalPages };
}

module.exports = { paginate };