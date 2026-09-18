<<<<<<< HEAD
document.addEventListener('DOMContentLoaded', () => {
    const page = document.title;

    const setText = (selector, value) => {
        const element = document.querySelector(selector);
        if (element) element.textContent = value;
    };

    if (page === 'StudyHub') {
        const exploreButton = document.querySelector('.hero-buttons button');
        exploreButton?.addEventListener('click', () => {
            document.querySelector('.quick-access')?.scrollIntoView({ behavior: 'smooth' });
        });
    }

    if (page.includes('All Subjects')) {
        const search = document.querySelector('.search-box input');
        const cards = [...document.querySelectorAll('.subject-card')];

        search?.addEventListener('input', () => {
            const query = search.value.toLowerCase().trim();
            cards.forEach(card => {
                card.hidden = !card.querySelector('h2').textContent.toLowerCase().includes(query);
            });
        });

        document.querySelectorAll('.notes-btn').forEach(button => {
            button.addEventListener('click', event => {
                const subject = event.currentTarget.closest('.subject-card').querySelector('h2').textContent;
                window.location.href = `notes.html?subject=${encodeURIComponent(subject)}`;
            });
        });
    }

    if (page.includes('Notes')) {
        const search = document.querySelector('.search-box input');
        const subjectSelect = document.querySelector('.subject-select');
        const cards = [...document.querySelectorAll('.note-card')];
        const tabs = [...document.querySelectorAll('.tab')];
        let selectedType = 'All Notes';

        const filterNotes = () => {
            const query = search.value.toLowerCase().trim();
            const subject = subjectSelect.value;
            cards.forEach(card => {
                const text = card.textContent.toLowerCase();
                const type = card.querySelector('.note-info')?.textContent || '';
                const matchesSearch = text.includes(query);
                const matchesSubject = subject === 'All Subjects' || text.includes(subject.toLowerCase());
                const matchesType = selectedType === 'All Notes' || type.toLowerCase().includes(selectedType === 'PDF Notes' ? 'pdf' : '') || (selectedType === 'Important' && card.querySelector('.badge')) || (selectedType === 'Handwritten' && type.toLowerCase().includes('handwritten'));
                card.hidden = !(matchesSearch && matchesSubject && matchesType);
            });
        };

        search?.addEventListener('input', filterNotes);
        subjectSelect?.addEventListener('change', filterNotes);
        tabs.forEach(tab => tab.addEventListener('click', () => {
            tabs.forEach(item => item.classList.remove('active'));
            tab.classList.add('active');
            selectedType = tab.textContent.trim();
            filterNotes();
        }));

        const requestedSubject = new URLSearchParams(window.location.search).get('subject');
        if (requestedSubject && subjectSelect) {
            const option = [...subjectSelect.options].find(item => item.textContent === requestedSubject);
            if (option) {
                subjectSelect.value = requestedSubject;
                filterNotes();
            }
        }

        document.querySelectorAll('.view-btn').forEach(button => {
            button.addEventListener('click', event => {
                const title = event.currentTarget.closest('.note-card').querySelector('h2').textContent.trim();
                alert(`${title}\n\nOnline note preview is ready to be connected to your PDF file.`);
            });
        });

        document.querySelectorAll('.download-btn').forEach(button => {
            button.addEventListener('click', event => {
                const title = event.currentTarget.closest('.note-card').querySelector('h2').textContent.trim();
                const file = new Blob([`${title}\nStudyHub notes`], { type: 'text/plain' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(file);
                link.download = `${title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.txt`;
                link.click();
                URL.revokeObjectURL(link.href);
            });
        });
    }

    if (page.includes('Quiz')) {
        const search = document.querySelector('.search-box');
        const filter = document.querySelector('.filter-box');
        const cards = [...document.querySelectorAll('.quiz-card')];
        const attempted = document.querySelectorAll('.stat-card')[1]?.querySelector('.stat-number');
        const pending = document.querySelectorAll('.stat-card')[2]?.querySelector('.stat-number');

        const filterQuizzes = () => {
            const query = search.value.toLowerCase().trim();
            const subject = filter.value;
            cards.forEach(card => {
                const text = card.textContent.toLowerCase();
                card.hidden = !(text.includes(query) && (subject === 'All Subjects' || text.includes(subject.toLowerCase().split(' ')[0])));
            });
        };
        search?.addEventListener('input', filterQuizzes);
        filter?.addEventListener('change', filterQuizzes);
        document.querySelectorAll('.start-btn').forEach(button => {
            button.addEventListener('click', event => {
                const card = event.currentTarget.closest('.quiz-card');
                const title = card.querySelector('h3').textContent;
                event.currentTarget.textContent = 'Completed ✓';
                event.currentTarget.disabled = true;
                const attemptedCount = Number(attempted.textContent) + 1;
                attempted.textContent = attemptedCount;
                pending.textContent = Math.max(0, Number(pending.textContent) - 1);
                alert(`${title}\n\nQuiz started! Good luck.`);
            });
        });
    }

    if (page.includes('To-Do')) {
        const taskBox = document.querySelector('.task-box');
        const titleInput = document.querySelector('.quick-add .input-box');
        const subjectInput = document.querySelector('.quick-add select');
        const addButton = document.querySelector('.quick-button');
        const storageKey = 'studyhub-tasks';
        let tasks = JSON.parse(localStorage.getItem(storageKey) || 'null');

        const readTasks = () => tasks || [...document.querySelectorAll('.task')].map(task => ({
            title: task.querySelector('.task-name').textContent.trim(),
            subject: task.querySelector('.subject').textContent.trim(),
            time: task.querySelector('.time').textContent.trim(),
            completed: task.querySelector('.checkbox').classList.contains('checked')
        }));

        const renderTasks = () => {
            taskBox.innerHTML = '';
            tasks.forEach((task, index) => {
                const row = document.createElement('div');
                row.className = 'task';
                row.innerHTML = `<div class="checkbox ${task.completed ? 'checked' : ''}">${task.completed ? '✓' : ''}</div><div class="task-name ${task.completed ? 'done' : ''}">${task.title}</div><div class="subject computer">${task.subject}</div><div class="time">${task.time || 'Any time'}</div><div class="delete" role="button" tabindex="0">×</div>`;
                row.querySelector('.checkbox').addEventListener('click', () => {
                    tasks[index].completed = !tasks[index].completed;
                    saveTasks();
                });
                row.querySelector('.delete').addEventListener('click', () => {
                    tasks.splice(index, 1);
                    saveTasks();
                });
                taskBox.appendChild(row);
            });
            const completedCount = tasks.filter(task => task.completed).length;
            const total = tasks.length;
            setText('.total .stat-number', total);
            setText('.completed .stat-number', completedCount);
            setText('.pending .stat-number', total - completedCount);
            const percentage = total ? Math.round((completedCount / total) * 100) : 0;
            setText('.percentage', `${percentage}%`);
            const fill = document.querySelector('.progress-fill');
            if (fill) fill.style.width = `${percentage}%`;
        };

        const saveTasks = () => {
            localStorage.setItem(storageKey, JSON.stringify(tasks));
            renderTasks();
        };

        tasks = readTasks();
        renderTasks();
        addButton?.addEventListener('click', () => {
            const title = titleInput.value.trim();
            if (!title) {
                titleInput.focus();
                return;
            }
            tasks.push({ title, subject: subjectInput.value === 'Select Subject' ? 'Personal' : subjectInput.value, time: 'Any time', completed: false });
            titleInput.value = '';
            saveTasks();
        });
        document.querySelector('.add-task-btn')?.addEventListener('click', () => titleInput.focus());
    }

    if (page.includes('Timetable')) {
        const dateLabel = document.querySelector('.date-box span:nth-child(2)');
        const dateBox = document.querySelector('.date-box');
        const viewButtons = [...document.querySelectorAll('.view-buttons button')];
        const timetable = document.querySelector('.timetable');
        const dates = ['8 Sep - 14 Sep 2025', '15 Sep - 21 Sep 2025', '22 Sep - 28 Sep 2025'];
        let dateIndex = 0;
        dateBox?.querySelector('.arrow:first-child')?.addEventListener('click', () => {
            dateIndex = Math.max(0, dateIndex - 1);
            dateLabel.textContent = dates[dateIndex];
        });
        dateBox?.querySelector('.arrow:last-child')?.addEventListener('click', () => {
            dateIndex = Math.min(dates.length - 1, dateIndex + 1);
            dateLabel.textContent = dates[dateIndex];
        });
        viewButtons.forEach(button => button.addEventListener('click', () => {
            viewButtons.forEach(item => item.classList.remove('active'));
            button.classList.add('active');
            timetable.style.opacity = button.textContent.trim() === 'Day' ? '0.55' : '1';
        }));
    }
});
=======
document.addEventListener('DOMContentLoaded', () => {
    const page = document.title;

    const setText = (selector, value) => {
        const element = document.querySelector(selector);
        if (element) element.textContent = value;
    };

    if (page === 'StudyHub') {
        const exploreButton = document.querySelector('.hero-buttons button');
        exploreButton?.addEventListener('click', () => {
            document.querySelector('.quick-access')?.scrollIntoView({ behavior: 'smooth' });
        });
    }

    if (page.includes('All Subjects')) {
        const search = document.querySelector('.search-box input');
        const cards = [...document.querySelectorAll('.subject-card')];

        search?.addEventListener('input', () => {
            const query = search.value.toLowerCase().trim();
            cards.forEach(card => {
                card.hidden = !card.querySelector('h2').textContent.toLowerCase().includes(query);
            });
        });

        document.querySelectorAll('.notes-btn').forEach(button => {
            button.addEventListener('click', event => {
                const subject = event.currentTarget.closest('.subject-card').querySelector('h2').textContent;
                window.location.href = `notes.html?subject=${encodeURIComponent(subject)}`;
            });
        });
    }

    if (page.includes('Notes')) {
        const search = document.querySelector('.search-box input');
        const subjectSelect = document.querySelector('.subject-select');
        const cards = [...document.querySelectorAll('.note-card')];
        const tabs = [...document.querySelectorAll('.tab')];
        let selectedType = 'All Notes';

        const filterNotes = () => {
            const query = search.value.toLowerCase().trim();
            const subject = subjectSelect.value;
            cards.forEach(card => {
                const text = card.textContent.toLowerCase();
                const type = card.querySelector('.note-info')?.textContent || '';
                const matchesSearch = text.includes(query);
                const matchesSubject = subject === 'All Subjects' || text.includes(subject.toLowerCase());
                const matchesType = selectedType === 'All Notes' || type.toLowerCase().includes(selectedType === 'PDF Notes' ? 'pdf' : '') || (selectedType === 'Important' && card.querySelector('.badge')) || (selectedType === 'Handwritten' && type.toLowerCase().includes('handwritten'));
                card.hidden = !(matchesSearch && matchesSubject && matchesType);
            });
        };

        search?.addEventListener('input', filterNotes);
        subjectSelect?.addEventListener('change', filterNotes);
        tabs.forEach(tab => tab.addEventListener('click', () => {
            tabs.forEach(item => item.classList.remove('active'));
            tab.classList.add('active');
            selectedType = tab.textContent.trim();
            filterNotes();
        }));

        const requestedSubject = new URLSearchParams(window.location.search).get('subject');
        if (requestedSubject && subjectSelect) {
            const option = [...subjectSelect.options].find(item => item.textContent === requestedSubject);
            if (option) {
                subjectSelect.value = requestedSubject;
                filterNotes();
            }
        }

        document.querySelectorAll('.view-btn').forEach(button => {
            button.addEventListener('click', event => {
                const title = event.currentTarget.closest('.note-card').querySelector('h2').textContent.trim();
                alert(`${title}\n\nOnline note preview is ready to be connected to your PDF file.`);
            });
        });

        document.querySelectorAll('.download-btn').forEach(button => {
            button.addEventListener('click', event => {
                const title = event.currentTarget.closest('.note-card').querySelector('h2').textContent.trim();
                const file = new Blob([`${title}\nStudyHub notes`], { type: 'text/plain' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(file);
                link.download = `${title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.txt`;
                link.click();
                URL.revokeObjectURL(link.href);
            });
        });
    }

    if (page.includes('Quiz')) {
        const search = document.querySelector('.search-box');
        const filter = document.querySelector('.filter-box');
        const cards = [...document.querySelectorAll('.quiz-card')];
        const attempted = document.querySelectorAll('.stat-card')[1]?.querySelector('.stat-number');
        const pending = document.querySelectorAll('.stat-card')[2]?.querySelector('.stat-number');

        const filterQuizzes = () => {
            const query = search.value.toLowerCase().trim();
            const subject = filter.value;
            cards.forEach(card => {
                const text = card.textContent.toLowerCase();
                card.hidden = !(text.includes(query) && (subject === 'All Subjects' || text.includes(subject.toLowerCase().split(' ')[0])));
            });
        };
        search?.addEventListener('input', filterQuizzes);
        filter?.addEventListener('change', filterQuizzes);
        document.querySelectorAll('.start-btn').forEach(button => {
            button.addEventListener('click', event => {
                const card = event.currentTarget.closest('.quiz-card');
                const title = card.querySelector('h3').textContent;
                event.currentTarget.textContent = 'Completed ✓';
                event.currentTarget.disabled = true;
                const attemptedCount = Number(attempted.textContent) + 1;
                attempted.textContent = attemptedCount;
                pending.textContent = Math.max(0, Number(pending.textContent) - 1);
                alert(`${title}\n\nQuiz started! Good luck.`);
            });
        });
    }

    if (page.includes('To-Do')) {
        const taskBox = document.querySelector('.task-box');
        const titleInput = document.querySelector('.quick-add .input-box');
        const subjectInput = document.querySelector('.quick-add select');
        const addButton = document.querySelector('.quick-button');
        const storageKey = 'studyhub-tasks';
        let tasks = JSON.parse(localStorage.getItem(storageKey) || 'null');

        const readTasks = () => tasks || [...document.querySelectorAll('.task')].map(task => ({
            title: task.querySelector('.task-name').textContent.trim(),
            subject: task.querySelector('.subject').textContent.trim(),
            time: task.querySelector('.time').textContent.trim(),
            completed: task.querySelector('.checkbox').classList.contains('checked')
        }));

        const renderTasks = () => {
            taskBox.innerHTML = '';
            tasks.forEach((task, index) => {
                const row = document.createElement('div');
                row.className = 'task';
                row.innerHTML = `<div class="checkbox ${task.completed ? 'checked' : ''}">${task.completed ? '✓' : ''}</div><div class="task-name ${task.completed ? 'done' : ''}">${task.title}</div><div class="subject computer">${task.subject}</div><div class="time">${task.time || 'Any time'}</div><div class="delete" role="button" tabindex="0">×</div>`;
                row.querySelector('.checkbox').addEventListener('click', () => {
                    tasks[index].completed = !tasks[index].completed;
                    saveTasks();
                });
                row.querySelector('.delete').addEventListener('click', () => {
                    tasks.splice(index, 1);
                    saveTasks();
                });
                taskBox.appendChild(row);
            });
            const completedCount = tasks.filter(task => task.completed).length;
            const total = tasks.length;
            setText('.total .stat-number', total);
            setText('.completed .stat-number', completedCount);
            setText('.pending .stat-number', total - completedCount);
            const percentage = total ? Math.round((completedCount / total) * 100) : 0;
            setText('.percentage', `${percentage}%`);
            const fill = document.querySelector('.progress-fill');
            if (fill) fill.style.width = `${percentage}%`;
        };

        const saveTasks = () => {
            localStorage.setItem(storageKey, JSON.stringify(tasks));
            renderTasks();
        };

        tasks = readTasks();
        renderTasks();
        addButton?.addEventListener('click', () => {
            const title = titleInput.value.trim();
            if (!title) {
                titleInput.focus();
                return;
            }
            tasks.push({ title, subject: subjectInput.value === 'Select Subject' ? 'Personal' : subjectInput.value, time: 'Any time', completed: false });
            titleInput.value = '';
            saveTasks();
        });
        document.querySelector('.add-task-btn')?.addEventListener('click', () => titleInput.focus());
    }

    if (page.includes('Timetable')) {
        const dateLabel = document.querySelector('.date-box span:nth-child(2)');
        const dateBox = document.querySelector('.date-box');
        const viewButtons = [...document.querySelectorAll('.view-buttons button')];
        const timetable = document.querySelector('.timetable');
        const dates = ['8 Sep - 14 Sep 2025', '15 Sep - 21 Sep 2025', '22 Sep - 28 Sep 2025'];
        let dateIndex = 0;
        dateBox?.querySelector('.arrow:first-child')?.addEventListener('click', () => {
            dateIndex = Math.max(0, dateIndex - 1);
            dateLabel.textContent = dates[dateIndex];
        });
        dateBox?.querySelector('.arrow:last-child')?.addEventListener('click', () => {
            dateIndex = Math.min(dates.length - 1, dateIndex + 1);
            dateLabel.textContent = dates[dateIndex];
        });
        viewButtons.forEach(button => button.addEventListener('click', () => {
            viewButtons.forEach(item => item.classList.remove('active'));
            button.classList.add('active');
            timetable.style.opacity = button.textContent.trim() === 'Day' ? '0.55' : '1';
        }));
    }
});
>>>>>>> 25fc915 (Update StudyHub pages)
