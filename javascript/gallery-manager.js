// ============================================
// GALLERY MANAGER - LIGHTBOX & FEATURES
// ============================================

class GalleryManager {
    constructor() {
        this.currentImageIndex = 0;
        this.galleryItems = [];
        this.filteredItems = [];
        this.currentSort = 'newest';
        this.initLightbox();
        this.initSearch();
        this.initSort();
    }

    // ============================================
    // LIGHTBOX FUNCTIONALITY
    // ============================================

    initLightbox() {
        const lightbox = document.getElementById('lightbox');
        const close = document.getElementById('lightboxClose');
        const prev = document.getElementById('lightboxPrev');
        const next = document.getElementById('lightboxNext');

        if (lightbox) {
            close?.addEventListener('click', () => this.closeLightbox());
            prev?.addEventListener('click', () => this.showPrevious());
            next?.addEventListener('click', () => this.showNext());

            // Keyboard navigation
            document.addEventListener('keydown', (e) => {
                if (!lightbox.classList.contains('active')) return;
                if (e.key === 'ArrowLeft') this.showPrevious();
                if (e.key === 'ArrowRight') this.showNext();
                if (e.key === 'Escape') this.closeLightbox();
            });

            // Close on overlay click
            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) this.closeLightbox();
            });
        }
    }

    openLightbox(index, items) {
        const lightbox = document.getElementById('lightbox');
        if (!lightbox) return;

        this.galleryItems = items;
        this.currentImageIndex = index;
        this.updateLightboxImage();
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeLightbox() {
        const lightbox = document.getElementById('lightbox');
        if (lightbox) {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    showNext() {
        if (this.currentImageIndex < this.galleryItems.length - 1) {
            this.currentImageIndex++;
            this.updateLightboxImage();
        }
    }

    showPrevious() {
        if (this.currentImageIndex > 0) {
            this.currentImageIndex--;
            this.updateLightboxImage();
        }
    }

    updateLightboxImage() {
        const item = this.galleryItems[this.currentImageIndex];
        const image = document.getElementById('lightboxImage');
        const title = document.getElementById('lightboxTitle');
        const counter = document.getElementById('lightboxCounter');

        if (image) {
            image.src = item.image_url;
            image.alt = item.title;
        }
        if (title) {
            title.textContent = item.title;
        }
        if (counter) {
            counter.textContent = `${this.currentImageIndex + 1} من ${this.galleryItems.length}`;
        }
    }

    attachLightboxListener(gallery) {
        if (!gallery) return;

        const items = Array.from(gallery.querySelectorAll('.gallery-item'));
        items.forEach((item, index) => {
            item.addEventListener('click', () => {
                this.openLightbox(index, this.filteredItems);
            });
            // Keyboard accessibility
            item.setAttribute('tabindex', '0');
            item.setAttribute('role', 'button');
            item.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    this.openLightbox(index, this.filteredItems);
                }
            });
        });
    }

    // ============================================
    // SEARCH & FILTER
    // ============================================

    initSearch() {
        const searchInput = document.getElementById('gallerySearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterGallery(e.target.value);
            });
        }
    }

    filterGallery(searchTerm) {
        const term = searchTerm.toLowerCase();
        this.filteredItems = this.galleryItems.filter(item =>
            item.title.toLowerCase().includes(term) ||
            (item.description && item.description.toLowerCase().includes(term))
        );
        this.sortGallery();
        this.renderGallery();
    }

    // ============================================
    // SORTING
    // ============================================

    initSort() {
        const sortButtons = document.querySelectorAll('.sort-btn');
        sortButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remove active class from all buttons
                sortButtons.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                e.target.classList.add('active');
                // Update sort
                this.currentSort = e.target.dataset.sort;
                this.sortGallery();
                this.renderGallery();
            });
        });
    }

    sortGallery() {
        const items = [...this.filteredItems];

        switch (this.currentSort) {
            case 'newest':
                return this.filteredItems = items.sort((a, b) =>
                    new Date(b.created_at) - new Date(a.created_at)
                );
            case 'oldest':
                return this.filteredItems = items.sort((a, b) =>
                    new Date(a.created_at) - new Date(b.created_at)
                );
            case 'a-z':
                return this.filteredItems = items.sort((a, b) =>
                    a.title.localeCompare(b.title, 'ar')
                );
            default:
                return this.filteredItems = items;
        }
    }

    // ============================================
    // RENDERING
    // ============================================

    renderGallery() {
        const gallery = document.getElementById('galleryGrid');
        if (!gallery) return;

        if (this.filteredItems.length === 0) {
            gallery.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px;">لا توجد صور مطابقة</p>';
            return;
        }

        gallery.innerHTML = this.filteredItems.map((item, index) => `
            <div class="gallery-item" data-index="${index}" style="cursor: pointer;" tabindex="0" role="button" aria-label="انقر لفتح ${item.title}">
                <img 
                    src="${item.image_url}" 
                    alt="${item.title}"
                    loading="lazy"
                    style="width: 100%; height: 100%; object-fit: cover;"
                />
                <div class="gallery-overlay">
                    <p>${item.title}</p>
                    ${item.description ? `<small>${item.description}</small>` : ''}
                </div>
            </div>
        `).join('');

        this.attachLightboxListener(gallery);
    }

    setGalleryItems(items) {
        this.galleryItems = items;
        this.filteredItems = [...items];
        this.sortGallery();
        this.renderGallery();
    }
}

// ============================================
// CONFIRMATION DIALOG
// ============================================

class ConfirmDialog {
    static show(title = 'هل أنت متأكد؟', message = 'هذا الإجراء لا يمكن التراجع عنه.') {
        return new Promise((resolve) => {
            const dialog = document.getElementById('confirmDialog');
            const titleEl = document.getElementById('confirmTitle');
            const messageEl = document.getElementById('confirmMessage');
            const yesBtn = document.getElementById('confirmYes');
            const noBtn = document.getElementById('confirmNo');

            if (!dialog) {
                resolve(false);
                return;
            }

            titleEl.textContent = title;
            messageEl.textContent = message;

            const handleYes = () => {
                dialog.classList.remove('active');
                cleanup();
                resolve(true);
            };

            const handleNo = () => {
                dialog.classList.remove('active');
                cleanup();
                resolve(false);
            };

            const cleanup = () => {
                yesBtn?.removeEventListener('click', handleYes);
                noBtn?.removeEventListener('click', handleNo);
                document.removeEventListener('keydown', handleEscape);
            };

            const handleEscape = (e) => {
                if (e.key === 'Escape') handleNo();
            };

            yesBtn?.addEventListener('click', handleYes);
            noBtn?.addEventListener('click', handleNo);
            document.addEventListener('keydown', handleEscape);

            dialog.classList.add('active');
        });
    }
}

// ============================================
// UPLOAD PROGRESS & PREVIEW
// ============================================

class FileUploadHelper {
    static showProgress(container, percent) {
        let progressContainer = container.querySelector('.upload-progress-container');
        if (!progressContainer) {
            progressContainer = document.createElement('div');
            progressContainer.className = 'upload-progress-container active';
            progressContainer.innerHTML = `
                <div class="upload-progress-bar">
                    <div class="upload-progress-fill" style="width: 0%"></div>
                </div>
                <div class="upload-progress-text">0%</div>
            `;
            container.appendChild(progressContainer);
        } else {
            progressContainer.classList.add('active');
        }

        const fill = progressContainer.querySelector('.upload-progress-fill');
        const text = progressContainer.querySelector('.upload-progress-text');
        if (fill) fill.style.width = percent + '%';
        if (text) text.textContent = Math.round(percent) + '%';
    }

    static hideProgress(container) {
        const progressContainer = container.querySelector('.upload-progress-container');
        if (progressContainer) {
            progressContainer.classList.remove('active');
        }
    }

    static showPreview(container, file) {
        const reader = new FileReader();

        reader.onload = (e) => {
            let preview = container.querySelector('.image-preview');
            if (!preview) {
                preview = document.createElement('div');
                preview.className = 'image-preview active';
                container.appendChild(preview);
            } else {
                preview.classList.add('active');
            }

            const fileSize = (file.size / 1024 / 1024).toFixed(2);
            preview.innerHTML = `
                <img src="${e.target.result}" alt="معاينة">
                <div class="image-preview-info">${file.name} - ${fileSize} MB</div>
            `;
        };

        reader.readAsDataURL(file);
    }

    static removePreview(container) {
        const preview = container.querySelector('.image-preview');
        if (preview) {
            preview.classList.remove('active');
        }
    }
}

// ============================================
// LAZY LOADING
// ============================================

class LazyLoader {
    static init() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        observer.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }
}

// ============================================
// IMAGE COMPRESSION
// ============================================

class ImageCompressor {
    static async compress(file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Calculate new dimensions
                    if (width > height) {
                        if (width > maxWidth) {
                            height *= maxWidth / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width *= maxHeight / height;
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                        });

                        console.log(`Compressed: ${(file.size / 1024).toFixed(2)}KB → ${(compressedFile.size / 1024).toFixed(2)}KB`);
                        resolve(compressedFile);
                    }, 'image/jpeg', quality);
                };

                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = e.target.result;
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }
}

// ============================================
// INITIALIZE ON DOM READY
// ============================================

let galleryManager = null;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Gallery Manager
    galleryManager = new GalleryManager();

    // Initialize Lazy Loading
    LazyLoader.init();

    console.log('Gallery Manager initialized');
});
