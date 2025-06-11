document.addEventListener('DOMContentLoaded', () => {
    const titleInput = document.getElementById('title');
    const slugInput = document.getElementById('slug');

    if (titleInput) {
        titleInput.addEventListener('blur', async () => {
            const val = titleInput.value.trim();
            if (!val) return;
            try {
                const response = await fetch(`/admin/blog/check-slug?slug=${encodeURIComponent(val)}`);
                const data = await response.json();
                if (data.exists) {
                    alert('Bu başlık veya slug zaten kullanılıyor!');
                } else {
                    slugInput.value = val.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                }
            } catch (error) {
                console.error('Slug kontrol hatası:', error);
            }
        });
    }

    if (slugInput) {
        slugInput.addEventListener('blur', async () => {
            const val = slugInput.value.trim();
            if (!val) return;
            try {
                const response = await fetch(`/admin/blog/check-slug?slug=${encodeURIComponent(val)}`);
                const data = await response.json();
                if (data.exists) {
                    alert('Bu slug zaten kullanılıyor!');
                }
            } catch (error) {
                console.error('Slug kontrol hatası:', error);
            }
        });
    }
});
