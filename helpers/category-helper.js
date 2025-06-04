async function setBlogCategories(blog, categoryIds) {
    if (categoryIds) {
        // Convert to array if it's a single value
        const ids = Array.isArray(categoryIds) ? categoryIds.map(id => parseInt(id)) : [parseInt(categoryIds)];
        console.log(`Setting categories for blog ID ${blog.blogId}:`, ids);
        
        // Use force: true to ensure proper association update
        await blog.setCategories(ids, { force: true });
        
        // Verify the associations were made
        const updatedCategories = await blog.getCategories();
        console.log(`Blog ID ${blog.blogId} now has categories:`, 
            updatedCategories.map(c => ({id: c.categoryId, name: c.name}))
        );
    } else {
        console.log(`Clearing all categories for blog ID ${blog.blogId}`);
        await blog.setCategories([], { force: true });
    }
}

module.exports = { setBlogCategories };