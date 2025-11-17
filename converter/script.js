// State aplikasi
let images = [];
let isConverting = false;
let conversionCanceled = false;
let allSelected = false;
let showPreview = true;
let isAscending = true;
let isProcessingFiles = false;

// Inisialisasi aplikasi
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    console.log('Initializing app...');
    
    // Inisialisasi elemen DOM
    const dropArea = document.getElementById('dropArea');
    const fileInput = document.getElementById('fileInput');
    const preview = document.getElementById('preview');
    
    if (!fileInput || !preview || !dropArea) {
        console.error('Required elements not found');
        return;
    }

    // Event listeners untuk file upload
    fileInput.addEventListener('change', handleFileSelect);
    console.log('File input listener added');

    // Click pada drop area untuk trigger file input - PERBAIKAN
    dropArea.addEventListener('click', function(e) {
        // Hanya trigger jika klik langsung pada drop area, bukan pada child elements
        if (e.target === dropArea || e.target.classList.contains('upload-icon') || 
            e.target.classList.contains('fa-cloud-upload-alt')) {
            console.log('Drop area clicked directly');
            if (!isProcessingFiles) {
                fileInput.click();
            }
        }
    });

    // Drag and drop functionality
    dropArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        dropArea.classList.add('dragover');
    });

    dropArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        // Only remove class if leaving the drop area itself, not its children
        if (e.target === dropArea) {
            dropArea.classList.remove('dragover');
        }
    });

    dropArea.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        dropArea.classList.remove('dragover');
        console.log('Files dropped:', e.dataTransfer.files.length);
        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    });

    // Event listeners untuk tombol-tombol
    const sortAzBtn = document.getElementById('sortAzBtn');
    const sortZaBtn = document.getElementById('sortZaBtn');
    const selectAllBtn = document.getElementById('selectAllBtn');
    const rotateSelectedBtn = document.getElementById('rotateSelectedBtn');
    const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const generateBtn = document.getElementById('generateBtn');
    const togglePreviewBtn = document.getElementById('togglePreviewBtn');
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');

    if (sortAzBtn) sortAzBtn.addEventListener('click', () => toggleSort(true));
    if (sortZaBtn) sortZaBtn.addEventListener('click', () => toggleSort(false));
    if (selectAllBtn) selectAllBtn.addEventListener('click', toggleSelectAll);
    if (rotateSelectedBtn) rotateSelectedBtn.addEventListener('click', rotateSelectedImages);
    if (deleteSelectedBtn) deleteSelectedBtn.addEventListener('click', deleteSelectedImages);
    if (clearAllBtn) clearAllBtn.addEventListener('click', resetAll);
    if (generateBtn) generateBtn.addEventListener('click', generatePDF);
    if (togglePreviewBtn) togglePreviewBtn.addEventListener('click', togglePreviewMode);
    
    // Mobile menu toggle
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }

    // Set nama file default
    const pdfFilenameInput = document.getElementById('pdfFilename');
    if (pdfFilenameInput) {
        const now = new Date();
        const dateString = now.toISOString().slice(0, 10).replace(/-/g, '');
        pdfFilenameInput.value = `dokumen_${dateString}`;
        
        // Validasi input nama file
        pdfFilenameInput.addEventListener('input', function() {
            this.value = this.value.replace(/[<>:"/\\|?*]/g, '');
            if (this.value.length > 100) {
                this.value = this.value.substring(0, 100);
            }
        });
    }

    console.log('App initialized successfully');
    
    // Update tombol untuk tampilan mobile
    updateButtonTexts();
}

// Fungsi untuk menangani file yang dipilih
function handleFileSelect(e) {
    console.log('File selected:', e.target.files.length);
    if (e.target.files.length === 0 || isProcessingFiles) return;
    const files = Array.from(e.target.files);
    handleFiles(files);
}

// Fungsi utama untuk memproses file
function handleFiles(files) {
    console.log('Processing files:', files.length);
    
    if (files.length === 0 || isProcessingFiles) {
        console.log('No files to process or already processing');
        return;
    }
    
    isProcessingFiles = true;
    
    // Filter hanya file gambar
    const imageFiles = files.filter(file => {
        const isImage = file.type.startsWith('image/');
        console.log('File:', file.name, 'Type:', file.type, 'IsImage:', isImage);
        return isImage;
    });
    
    console.log('Valid image files:', imageFiles.length);
    
    if (imageFiles.length === 0) {
        showError('Tidak ada file gambar yang valid. Format yang didukung: JPG, PNG, GIF, WEBP');
        isProcessingFiles = false;
        return;
    }

    let filesProcessed = 0;
    const totalFiles = imageFiles.length;
    const newImages = [];

    console.log('Starting to read files...');

    imageFiles.forEach(file => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            console.log('File read successfully:', file.name);
            const imgSrc = e.target.result;
            newImages.push({ 
                name: file.name, 
                src: imgSrc, 
                rotation: 0, 
                selected: false 
            });
            
            filesProcessed++;
            console.log(`Files processed: ${filesProcessed}/${totalFiles}`);
            
            if (filesProcessed === totalFiles) {
                console.log('All files processed, updating images array');
                isProcessingFiles = false;
                images = [...images, ...newImages];
                sortImages(isAscending);
                renderPreview();
                
                // Reset file input
                const fileInput = document.getElementById('fileInput');
                if (fileInput) fileInput.value = '';
                
                showSuccess(`Berhasil menambahkan ${newImages.length} gambar`);
            }
        };
        
        reader.onerror = (e) => {
            console.error('Error reading file:', file.name, e);
            filesProcessed++;
            if (filesProcessed === totalFiles) {
                isProcessingFiles = false;
                images = [...images, ...newImages];
                sortImages(isAscending);
                renderPreview();
                const fileInput = document.getElementById('fileInput');
                if (fileInput) fileInput.value = '';
            }
        };
        
        reader.onabort = (e) => {
            console.error('File reading aborted:', file.name);
            filesProcessed++;
            if (filesProcessed === totalFiles) {
                isProcessingFiles = false;
                images = [...images, ...newImages];
                sortImages(isAscending);
                renderPreview();
                const fileInput = document.getElementById('fileInput');
                if (fileInput) fileInput.value = '';
            }
        };
        
        // Mulai membaca file
        try {
            reader.readAsDataURL(file);
            console.log('Started reading file:', file.name);
        } catch (error) {
            console.error('Error starting file read:', error);
            filesProcessed++;
        }
    });
}

// Fungsi render preview
function renderPreview() {
    const preview = document.getElementById('preview');
    if (!preview) {
        console.error('Preview element not found');
        return;
    }

    console.log('Rendering preview with', images.length, 'images');
    
    // Hapus empty state jika ada
    const emptyState = preview.querySelector('.converter-empty-state');
    if (emptyState) {
        emptyState.remove();
    }
    
    preview.innerHTML = '';

    if (images.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'converter-empty-state';
        emptyState.innerHTML = `
            <i class="fas fa-images"></i>
            <p>Belum ada gambar yang diunggah</p>
        `;
        preview.appendChild(emptyState);
        updateUploadArea();
        return;
    }

    images.forEach((image, index) => {
        const container = document.createElement('div');
        container.className = `preview-item ${image.selected ? 'selected' : ''}`;
        container.dataset.index = index;

        if (showPreview) {
            container.innerHTML = `
                <div class="preview-checkbox">
                    <input type="checkbox" class="img-checkbox" ${image.selected ? 'checked' : ''}>
                </div>
                <img src="${image.src}" alt="${image.name}" class="preview-image" loading="lazy" style="transform: rotate(${image.rotation}deg)">
                <div class="preview-name">${image.name}</div>
                <div class="preview-actions">
                    <button class="preview-action-btn rotate-btn" title="Putar gambar">
                        <i class="fas fa-redo"></i>
                    </button>
                    <button class="preview-action-btn delete-btn" title="Hapus gambar">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="preview-checkbox">
                    <input type="checkbox" class="img-checkbox" ${image.selected ? 'checked' : ''}>
                </div>
                <div class="preview-name">${image.name}</div>
                <div class="preview-actions">
                    <button class="preview-action-btn rotate-btn" title="Putar gambar">
                        <i class="fas fa-redo"></i>
                    </button>
                    <button class="preview-action-btn delete-btn" title="Hapus gambar">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        }

        // Event listeners untuk elemen dalam preview
        const checkbox = container.querySelector('.img-checkbox');
        const rotateBtn = container.querySelector('.rotate-btn');
        const deleteBtn = container.querySelector('.delete-btn');

        checkbox.addEventListener('change', () => toggleImageSelection(index));
        rotateBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            rotateImage(index);
        });
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteSingleImage(index);
        });

        preview.appendChild(container);
    });
    
    updateUploadArea();
    
    // Initialize Sortable jika belum ada
    if (!preview.sortable && typeof Sortable !== 'undefined') {
        preview.sortable = new Sortable(preview, {
            animation: 150,
            delay: 100,
            onEnd: () => {
                const newImages = [];
                const containers = document.querySelectorAll('.preview-item');
                containers.forEach(container => {
                    const index = parseInt(container.dataset.index);
                    newImages.push(images[index]);
                });
                images = newImages;
                isAscending = false; // Reset sorting karena manual reorder
                updateSortButtons();
                renderPreview();
            }
        });
    }
}

function updateUploadArea() {
    const dropArea = document.getElementById('dropArea');
    const fileInfo = document.getElementById('fileInfo');
    
    if (dropArea && fileInfo) {
        if (images.length > 0) {
            dropArea.classList.add('has-file');
            fileInfo.textContent = `${images.length} gambar dipilih`;
        } else {
            dropArea.classList.remove('has-file');
            fileInfo.textContent = 'Format yang didukung: JPG, PNG, GIF, WEBP';
        }
    }
}

function toggleImageSelection(index) {
    images[index].selected = !images[index].selected;
    renderPreview();
}

function toggleSelectAll() {
    const selectAllBtn = document.getElementById('selectAllBtn');
    
    allSelected = !allSelected;
    images.forEach(img => {
        img.selected = allSelected;
    });
    
    if (selectAllBtn) {
        selectAllBtn.innerHTML = allSelected ? 
            '<i class="fas fa-times-circle"></i><span class="btn-text">Batal Pilih Semua</span>' : 
            '<i class="fas fa-object-group"></i><span class="btn-text">Pilih Semua</span>';
    }
        
    renderPreview();
}

function rotateImage(index) {
    images[index].rotation = (images[index].rotation + 90) % 360;
    renderPreview();
}

function rotateSelectedImages() {
    const hasSelected = images.some(img => img.selected);
    
    if (!hasSelected) {
        showError('Pilih setidaknya satu gambar untuk diputar.');
        return;
    }
    
    images.forEach((img, index) => {
        if (img.selected) {
            images[index].rotation = (img.rotation + 90) % 360;
        }
    });
    
    renderPreview();
}

function deleteSingleImage(index) {
    if (confirm(`Apakah Anda yakin ingin menghapus gambar ${images[index].name}?`)) {
        images.splice(index, 1);
        renderPreview();
    }
}

function deleteSelectedImages() {
    const hasSelected = images.some(img => img.selected);
    
    if (!hasSelected) {
        showError('Pilih setidaknya satu gambar untuk dihapus.');
        return;
    }
    
    if (confirm('Apakah Anda yakin ingin menghapus gambar yang dipilih?')) {
        images = images.filter(img => !img.selected);
        allSelected = false;
        const selectAllBtn = document.getElementById('selectAllBtn');
        if (selectAllBtn) {
            selectAllBtn.innerHTML = '<i class="fas fa-object-group"></i><span class="btn-text">Pilih Semua</span>';
        }
        renderPreview();
    }
}

function sortImages(ascending = true) {
    if (images.length === 0) return;
    
    images.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        if (nameA < nameB) return ascending ? -1 : 1;
        if (nameA > nameB) return ascending ? 1 : -1;
        return 0;
    });
    renderPreview();
}

function resetAll() {
    if (images.length === 0) return;
    
    if (confirm('Apakah Anda yakin ingin menghapus semua gambar?')) {
        images = [];
        allSelected = false;
        const fileInput = document.getElementById('fileInput');
        if (fileInput) fileInput.value = '';
        isAscending = true;
        updateSortButtons();
        const selectAllBtn = document.getElementById('selectAllBtn');
        if (selectAllBtn) {
            selectAllBtn.innerHTML = '<i class="fas fa-object-group"></i><span class="btn-text">Pilih Semua</span>';
        }
        renderPreview();
        showSuccess('Semua gambar telah dihapus.');
    }
}

function togglePreviewMode() {
    showPreview = !showPreview;
    updateToggleButton();
    renderPreview();
}

function updateToggleButton() {
    const togglePreviewBtn = document.getElementById('togglePreviewBtn');
    if (!togglePreviewBtn) return;

    if (showPreview) {
        togglePreviewBtn.innerHTML = '<i class="fas fa-eye-slash"></i><span class="btn-text">Hide Preview</span>';
        togglePreviewBtn.classList.remove('hide-mode');
    } else {
        togglePreviewBtn.innerHTML = '<i class="fas fa-eye"></i><span class="btn-text">Show Preview</span>';
        togglePreviewBtn.classList.add('hide-mode');
    }
}

function toggleSort(ascending) {
    if ((ascending && isAscending) || (!ascending && !isAscending)) {
        return;
    }
    
    isAscending = ascending;
    updateSortButtons();
    sortImages(isAscending);
}

function updateSortButtons() {
    const sortAzBtn = document.getElementById('sortAzBtn');
    const sortZaBtn = document.getElementById('sortZaBtn');
    
    if (sortAzBtn && sortZaBtn) {
        if (isAscending) {
            sortAzBtn.classList.add('active');
            sortZaBtn.classList.remove('active');
        } else {
            sortAzBtn.classList.remove('active');
            sortZaBtn.classList.add('active');
        }
    }
}

// Fungsi untuk menampilkan pesan error
function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    } else {
        alert(message);
    }
    console.error('Error:', message);
}

// Fungsi untuk menampilkan pesan sukses
function showSuccess(message) {
    const successMessage = document.getElementById('successMessage');
    if (successMessage) {
        successMessage.textContent = message;
        successMessage.style.display = 'block';
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 5000);
    } else {
        alert(message);
    }
    console.log('Success:', message);
}

// Fungsi generatePDF
async function generatePDF() {
    if (images.length === 0) {
        showError('Silakan unggah setidaknya satu gambar terlebih dahulu.');
        return;
    }
    
    const pdfFilenameInput = document.getElementById('pdfFilename');
    let filename = pdfFilenameInput ? pdfFilenameInput.value.trim() : '';
    
    if (filename === '') {
        showError('Silakan masukkan nama file PDF.');
        if (pdfFilenameInput) pdfFilenameInput.focus();
        return;
    }
    
    if (!filename.toLowerCase().endsWith('.pdf')) {
        filename += '.pdf';
    }
    
    isConverting = true;
    conversionCanceled = false;
    
    const generateBtn = document.getElementById('generateBtn');
    if (generateBtn) generateBtn.disabled = true;
    
    showProgress();
    updateProgress(0, 'Mempersiapkan...');
    
    if (typeof jspdf === 'undefined') {
        showError('Library jsPDF tidak ditemukan. Pastikan library sudah dimuat.');
        hideProgress();
        if (generateBtn) generateBtn.disabled = false;
        isConverting = false;
        return;
    }

    const { jsPDF } = window.jspdf;

    const sizeMap = {
        F4: [210, 330],
        A4: [210, 297],
        A3: [297, 420],
        Legal: [216, 356],
        Letter: [216, 279]
    };

    const paperSizeSelect = document.getElementById('paperSize');
    const paperOrientationSelect = document.getElementById('paperOrientation');
    
    const selectedSize = paperSizeSelect ? paperSizeSelect.value : 'F4';
    const selectedOrientation = paperOrientationSelect ? paperOrientationSelect.value : 'adaptif';
    const pageSize = sizeMap[selectedSize] || sizeMap['F4'];
    
    const totalImages = images.length;
    let pdf = null;
    
    try {
        for (let i = 0; i < totalImages; i++) {
            if (conversionCanceled) break;
            
            updateProgress((i / totalImages) * 100, `Memproses gambar ${i+1} dari ${totalImages}`);
            
            await new Promise(resolve => setTimeout(resolve, 300));
            
            let pageOrientation;
            let pdfPageSize;
            
            switch (selectedOrientation) {
                case 'portrait':
                    pageOrientation = 'portrait';
                    pdfPageSize = pageSize;
                    break;
                    
                case 'landscape':
                    pageOrientation = 'landscape';
                    pdfPageSize = [pageSize[1], pageSize[0]];
                    break;
                    
                case 'adaptif':
                default:
                    const isLandscape = images[i].rotation === 90 || images[i].rotation === 270;
                    pageOrientation = isLandscape ? 'landscape' : 'portrait';
                    pdfPageSize = pageOrientation === 'landscape' ? [pageSize[1], pageSize[0]] : pageSize;
                    break;
            }
            
            if (i === 0) {
                pdf = new jsPDF({
                    orientation: pageOrientation,
                    unit: 'mm',
                    format: pdfPageSize
                });
            } else {
                pdf.addPage(pdfPageSize, pageOrientation);
            }
            
            const rotatedImg = await rotateImageToCanvas(images[i].src, images[i].rotation);
            await addImageToPDF(pdf, rotatedImg, pdfPageSize[0], pdfPageSize[1]);
        }
        
        if (!conversionCanceled && pdf) {
            updateProgress(100, 'Menyimpan PDF...');
            await new Promise(resolve => setTimeout(resolve, 500));
            
            pdf.save(filename);
            hideProgress();
            if (generateBtn) generateBtn.disabled = false;
            isConverting = false;
            
            showSuccess(`PDF berhasil dibuat dan diunduh dengan nama "${filename}"!`);
        }
    } catch (error) {
        console.error('Error generating PDF:', error);
        showError('Terjadi kesalahan saat membuat PDF. Silakan coba lagi.');
        hideProgress();
        if (generateBtn) generateBtn.disabled = false;
        isConverting = false;
    }
}

function showProgress() {
    const progressContainer = document.getElementById('progressContainer');
    if (progressContainer) progressContainer.style.display = 'block';
}

function hideProgress() {
    const progressContainer = document.getElementById('progressContainer');
    if (progressContainer) progressContainer.style.display = 'none';
}

function updateProgress(percent, text) {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const progressPercent = document.getElementById('progressPercent');
    
    if (progressFill) progressFill.style.width = `${percent}%`;
    if (progressText) progressText.textContent = text;
    if (progressPercent) progressPercent.textContent = `${Math.round(percent)}%`;
}

async function addImageToPDF(pdf, imgData, pageWidth = 210, pageHeight = 330) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = function () {
            let imgWidth = img.width;
            let imgHeight = img.height;
            const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
            imgWidth *= ratio;
            imgHeight *= ratio;
            const x = (pageWidth - imgWidth) / 2;
            const y = (pageHeight - imgHeight) / 2;
            pdf.addImage(img, 'JPEG', x, y, imgWidth, imgHeight);
            resolve();
        };
        img.src = imgData;
    });
}

function rotateImageToCanvas(src, rotation) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = function () {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (rotation === 90 || rotation === 270) {
                canvas.width = img.height;
                canvas.height = img.width;
            } else {
                canvas.width = img.width;
                canvas.height = img.height;
            }
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(rotation * Math.PI / 180);
            ctx.drawImage(img, -img.width / 2, -img.height / 2);
            
            ctx.restore();
            
            resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = src;
    });
}

// Update untuk tampilan mobile
function updateButtonTexts() {
    const isMobileView = window.innerWidth <= 576;
    const buttons = document.querySelectorAll('.btn-prev');
    
    buttons.forEach(btn => {
        const textSpan = btn.querySelector('.btn-text');
        
        if (isMobileView && textSpan) {
            textSpan.style.display = 'none';
            btn.title = textSpan.textContent;
        } else if (textSpan) {
            textSpan.style.display = 'inline';
            btn.title = '';
        }
    });
}

window.addEventListener('resize', updateButtonTexts);