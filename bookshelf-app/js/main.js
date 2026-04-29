const books = [];
const RENDER_EVENT = 'render-books';

let searchQuery = '';
let editingBookId = null;

document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('bookForm');
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        
        if (editingBookId !== null) {
            updateBook(editingBookId);
        } else {
            addBook();
        }
    });

    function addBook() {
        const bookTitle = document.getElementById('bookFormTitle').value;
        const bookAuthor = document.getElementById('bookFormAuthor').value;
        const bookYear = Number(document.getElementById('bookFormYear').value);
        const bookIsComplete =  document.getElementById('bookFormIsComplete').checked;
        
        const generatedID = generateId();
        const bookItem = generateBookItem(generatedID, bookTitle, bookAuthor, bookYear, bookIsComplete); // membuat object baru
        books.push(bookItem);
        
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();

        resetBookForm();

        showToast(`Berhasil menambahkan buku: "${bookItem.title}".`, 'success');
    }

    function generateId() {
        return +new Date();
    }
    
    function generateBookItem(id, title, author, year, isComplete) {
        return {
        id,
        title,
        author,
        year,
        isComplete
        };
    }

    function makeBookItem(bookItem) {
    const textTitle = document.createElement('h3');
    textTitle.innerText = bookItem.title;
     textTitle.setAttribute('data-testid', 'bookItemTitle');
    
    const textAuthor = document.createElement('p');
    textAuthor.innerText = `Penulis: ${bookItem.author}`;
    textAuthor.setAttribute('data-testid', 'bookItemAuthor');

    const textYear = document.createElement('p');
    textYear.innerText = `Tahun: ${bookItem.year}`;
    textYear.setAttribute('data-testid', 'bookItemYear');

    const container = document.createElement('div');
    container.classList.add('item', 'shadow');
    container.setAttribute('data-bookid', bookItem.id);
    container.setAttribute('data-testid', 'bookItem');
    
    // const textContainer = document.createElement('div');
    // textContainer.classList.add('inner');
    // textContainer.append(textTitle, textAuthor, textYear);

    // const container = document.createElement('div');
    // container.classList.add('item', 'shadow');
    // container.append(textContainer);
    // container.setAttribute('id', `book-${bookItem.id}`);
    
    const actionContainer = document.createElement('div');
    // actionContainer.classList.add('action-container');

        // if (bookItem.isComplete) {
    //     const undoButton = document.createElement('button');
    //     undoButton.classList.add('btn', 'btn-secondary', 'undo-button');
    //     undoButton.textContent = 'Baca ulang';
    //     undoButton.addEventListener('click', () => reReadBook(bookItem.id));

    //     actionContainer.append(undoButton, editButton, trashButton);
    // } else {
    //     const checkButton = document.createElement('button');
    //     checkButton.classList.add('btn', 'btn-secondary', 'check-button');
    //     checkButton.textContent = 'Selesai dibaca';
    //     checkButton.addEventListener('click', () => completeBook(bookItem.id));

    //     actionContainer.append(checkButton, editButton, trashButton);
    // }

    // const editButton = document.createElement('button');
    // editButton.classList.add('btn', 'btn-primary', 'edit-button');
    // editButton.textContent = 'Edit Buku';
    // editButton.addEventListener('click', () => {
    //     startEditBook(bookItem.id);
    // });

    // const trashButton = document.createElement('button');
    // trashButton.classList.add('btn', 'btn-danger', 'trash-button');
    // trashButton.textContent = 'Hapus Buku';
    // trashButton.addEventListener('click', () => {
    //     removeBook(bookItem.id);
    // });

    const completeBtn = document.createElement('button');
    completeBtn.setAttribute('data-testid', 'bookItemIsCompleteButton');
    
    if (bookItem.isComplete) {
        completeBtn.textContent = 'Baca ulang';
        completeBtn.addEventListener('click', () => reReadBook(bookItem.id));
    } else {
        completeBtn.textContent = 'Selesai dibaca';
        completeBtn.addEventListener('click', () => completeBook(bookItem.id));
    }

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Hapus Buku';
    deleteBtn.setAttribute('data-testid', 'bookItemDeleteButton');
    deleteBtn.addEventListener('click', () => removeBook(Number(bookItem.id)));

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit Buku';
    editBtn.setAttribute('data-testid', 'bookItemEditButton'); // if required by rubric
    editBtn.addEventListener('click', () => startEditBook(bookItem.id));

    container.append(textTitle, textAuthor, textYear);
    actionContainer.append(completeBtn, deleteBtn, editBtn);
    container.append(actionContainer);

    return container;

    // container.append(actionContainer);    
    // return container;
    } 

    function completeBook (bookId) {
        const bookTarget = findBook(bookId);
        
        if (bookTarget == null) return;
        
        bookTarget.isComplete = true;
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
        showToast(`Selamat, kamu berhasil menyelesaikan buku "${bookTarget.title}"!` , 'info');
    }

    function findBook(bookId) {
        for (const bookItem of books) {
            if (bookItem.id === bookId) {
                return bookItem;
            }
        }
        return null;
    }

    // async function removeBook(bookId) {
    async function removeBook(bookId) {
        const bookTarget = findBook(bookId);
        if (!bookTarget) return;

        // const ok = await confirmDialog(`Yakin mau mengeluarkan buku "${bookTarget.title}" dari rak?`);
        const ok = confirm(`Yakin mau mengeluarkan buku "${bookTarget.title}" dari rak?`);
        if (!ok) return;

        const index = findBookIndex(bookId);
        if (index === -1) return;

        books.splice(index, 1);
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();

        showToast(`Buku "${bookTarget.title}" berhasil dikeluarkan dari rak.`, 'warning');
    }

    // hapus uncompleted dari list completed
    function reReadBook(bookId) {
        const bookTarget = findBook(bookId);
    
        if (bookTarget == null) return;
    
        bookTarget.isComplete = false;
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();

        showToast(`Sepertinya kamu sangat menyukai buku "${bookTarget.title}" untuk membacanya kembali :D`, 'info');
    }

    function findBookIndex(bookId) {
        for (const index in books) {
            if (books[index].id === Number(bookId)) {
                return index;
            }
        }    
        return -1;
    }

    const searchForm = document.getElementById('searchBook');
    searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        searchQuery = document.getElementById('searchBookTitle').value.trim().toLowerCase();
        document.dispatchEvent(new Event(RENDER_EVENT));
    });

    document.getElementById('searchBookTitle').addEventListener('input', (e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        document.dispatchEvent(new Event(RENDER_EVENT));
    });

    function startEditBook(bookId) {
        const bookTarget = findBook(bookId);
        if (!bookTarget) return;

        editingBookId = bookId;

        document.getElementById('bookFormTitle').value = bookTarget.title;
        document.getElementById('bookFormAuthor').value = bookTarget.author;
        document.getElementById('bookFormYear').value = bookTarget.year;
        document.getElementById('bookFormIsComplete').checked = bookTarget.isComplete;

        const editHeader = document.getElementById('formHeader');
        editHeader.textContent = 'Edit Detail Buku';
        const submitBtn = document.getElementById('bookFormSubmit');
        submitBtn.textContent = 'Simpan Perubahan';

        document.getElementById('bookForm').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });

        document.getElementById('bookFormTitle').focus();
    }

    function updateBook(bookId) {
        const bookTarget = findBook(bookId);
        if (!bookTarget) return;

        bookTarget.title = document.getElementById('bookFormTitle').value;
        bookTarget.author = document.getElementById('bookFormAuthor').value;
        bookTarget.year = Number(document.getElementById('bookFormYear').value);
        bookTarget.isComplete = document.getElementById('bookFormIsComplete').checked;

        editingBookId = null;

        document.getElementById('formHeader').textContent = 'Tambah Buku Baru';
        document.getElementById('bookFormSubmit').textContent = 'Masukkan Buku ke Rak';

        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();

        resetBookForm();

        showToast(`Berhasil mengedit detail buku "${bookTarget.title}".`, 'success');
    }

    function resetBookForm() {
        const form = document.getElementById('bookForm');
        form.reset();
    }

    function showToast(message, variant = 'info', duration = 2500) {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.classList.add('toast', variant);

        const msg = document.createElement('div');
        msg.classList.add('msg');
        msg.textContent = message;

        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.setAttribute('aria-label', 'Close notification');
        closeBtn.textContent = '×';

        closeBtn.addEventListener('click', () => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 200);
        });

        toast.append(msg, closeBtn);
        container.append(toast);

        // trigger animation
        requestAnimationFrame(() => toast.classList.add('show'));

        // auto-dismiss
        setTimeout(() => {
            if (!toast.isConnected) return;
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 200);
        }, duration);
    }

    function confirmDialog(message) {
        return new Promise((resolve) => {
            const overlay = document.getElementById('confirmOverlay');
            const msgEl = document.getElementById('confirmMessage');
            const btnOk = document.getElementById('confirmOk');
            const btnCancel = document.getElementById('confirmCancel');

            msgEl.textContent = message;

            overlay.classList.remove('hidden');

            const cleanup = () => {
            overlay.classList.add('hidden');
            btnOk.removeEventListener('click', onOk);
            btnCancel.removeEventListener('click', onCancel);
            overlay.removeEventListener('click', onOverlayClick);
            };

            const onOk = () => { cleanup(); resolve(true); };
            const onCancel = () => { cleanup(); resolve(false); };
            const onOverlayClick = (e) => {
            if (e.target === overlay) onCancel(); // click outside = cancel
            };

            btnOk.addEventListener('click', onOk);
            btnCancel.addEventListener('click', onCancel);
            overlay.addEventListener('click', onOverlayClick);
        });
    }

    document.addEventListener(RENDER_EVENT, function () {
        const uncompletedBookList = document.getElementById('incompleteBookList');
        uncompletedBookList.innerHTML = '';

        const completedBookList = document.getElementById('completeBookList');
        completedBookList.innerHTML = '';

        for (const bookItem of books) {
            const q = searchQuery;

            const match =
                q === '' ||
                bookItem.title.toLowerCase().includes(q) ||
                bookItem.author.toLowerCase().includes(q);

            if (!match) continue;

            const bookElement = makeBookItem(bookItem);

            if (!bookItem.isComplete) {
                uncompletedBookList.append(bookElement);
            } else {
                completedBookList.append(bookElement);
            }
        }
    });

    // DATA STORAGE
    
    const SAVED_EVENT = 'saved-book';
    const STORAGE_KEY = 'BOOKSHELF_APPS';
    
    function isStorageExist() /* boolean */ {
        if (typeof (Storage) === undefined) {
            alert('Browser kamu tidak mendukung local storage');
            return false;
        }
        return true;
    }
    
    function saveData() {
        if (isStorageExist()) {
            const parsed = JSON.stringify(books);
            localStorage.setItem(STORAGE_KEY, parsed);
            document.dispatchEvent(new Event(SAVED_EVENT));
        }
    }

    document.addEventListener(SAVED_EVENT, function () {
        console.log(localStorage.getItem(STORAGE_KEY));
        // window.alert("Data berhasil diperbarui.");
    });

    function loadDataFromStorage() {
        const serializedData = localStorage.getItem(STORAGE_KEY);
        const data = JSON.parse(serializedData);
    
        if (data !== null) {
            for (const book of data) {
                book.year = Number(book.year);
                books.push(book);
            }
        }
    
        document.dispatchEvent(new Event(RENDER_EVENT));
    }

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});