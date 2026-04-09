// Calendar UI for choosing dates and showing assignment dots.
function renderCalendar(assignments, selectedDate, onDateSelect, viewMode = 'month', onDateDoubleClick) {
    const container = document.getElementById('calendarContainer');
    if (!container) return;
    container.innerHTML = '';

    const today = new Date();
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    // Build a list of assignments for each day.
    const dots = {};
    assignments.forEach((a, index) => {
        if (!a.due) return;
        let d = new Date(a.due);
        if (!isNaN(d) && d.getFullYear() === year && d.getMonth() === month) {
            const day = d.getDate();
            if (!dots[day]) dots[day] = [];
            dots[day].push({ assignment: a, index });
        }
        // If assignment has start/end, mark each day in that range.
        if (a.start && a.end) {
            let start = new Date(a.start), end = new Date(a.end);
            if (!isNaN(start) && !isNaN(end)) {
                for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
                    if (dt.getFullYear() === year && dt.getMonth() === month) {
                        const day = dt.getDate();
                        if (!dots[day]) dots[day] = [];
                        dots[day].push({ assignment: a, index });
                    }
                }
            }
        }
    });

    // Header with month name and view toggle.
    const header = document.createElement('div');
    header.className = 'calendar-header';
    header.innerHTML = `
        <button class="calendar-nav" id="prevMonth" aria-label="Previous month">&#8592;</button>
        <span class="calendar-title">${selectedDate.toLocaleString('default', { month: 'long' })} ${year}</span>
        <button class="calendar-nav" id="nextMonth" aria-label="Next month">&#8594;</button>
        <button class="calendar-toggle" id="toggleView" aria-label="Toggle week/month view">${viewMode === 'month' ? 'Week' : 'Month'} view</button>
    `;
    container.appendChild(header);

    // Weekday labels.
    const daysRow = document.createElement('div');
    daysRow.className = 'calendar-days-row';
    ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(d => {
        const el = document.createElement('div');
        el.className = 'calendar-day-label';
        el.textContent = d;
        daysRow.appendChild(el);
    });
    container.appendChild(daysRow);

    // Main date grid.
    const grid = document.createElement('div');
    grid.className = 'calendar-grid';
    let start = 1, end = daysInMonth;
    let weekStart = 1, weekEnd = daysInMonth;
    if (viewMode === 'week') {
        // Week view shows only the selected week.
        const weekDay = selectedDate.getDay();
        weekStart = selectedDate.getDate() - weekDay;
        weekEnd = weekStart + 6;
        start = Math.max(1, weekStart);
        end = Math.min(daysInMonth, weekEnd);
    }
    // Add blank cells before the first day in month view.
    if (viewMode === 'month') {
        for (let i = 0; i < startDay; i++) {
            const empty = document.createElement('div');
            empty.className = 'calendar-cell empty';
            grid.appendChild(empty);
        }
    }
    for (let day = start; day <= end; day++) {
        const cell = document.createElement('div');
        let clickTimer = null;
        cell.className = 'calendar-cell';
        cell.setAttribute('tabindex', '0');
        cell.setAttribute('role', 'button');
        cell.setAttribute('aria-label', `Select ${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`);
        if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            cell.classList.add('today');
        }
        if (day === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear()) {
            cell.classList.add('selected');
        }
        cell.textContent = day;
        if (dots[day]) {
            // Dot color is based on assignment status.
            let status = 'active';
            for (const item of dots[day]) {
                const a = item.assignment;
                if (a.status === 'Overdue') status = 'overdue';
                else if (a.status === 'Due soon' && status !== 'overdue') status = 'due';
                else if (a.status === 'Completed' && status !== 'overdue' && status !== 'due') status = 'done';
            }
            // Create a container for dot indicators
            const dotsContainer = document.createElement('div');
            dotsContainer.className = 'calendar-dots-container';
            dotsContainer.style.cursor = 'pointer';
            
            // If only one assignment, create a single large dot
            if (dots[day].length === 1) {
                const item = dots[day][0];
                const a = item.assignment;
                let itemStatus = 'active';
                if (a.status === 'Overdue') itemStatus = 'overdue';
                else if (a.status === 'Due soon') itemStatus = 'due';
                else if (a.status === 'Completed') itemStatus = 'done';
                
                const dot = document.createElement('span');
                dot.className = 'calendar-dot calendar-dot-single calendar-dot-' + itemStatus;
                dotsContainer.appendChild(dot);
            } else {
                // Multiple assignments: create smaller dots side by side
                const count = Math.min(dots[day].length, 3);
                for (let i = 0; i < count; i++) {
                    const item = dots[day][i];
                    const a = item.assignment;
                    let itemStatus = 'active';
                    if (a.status === 'Overdue') itemStatus = 'overdue';
                    else if (a.status === 'Due soon') itemStatus = 'due';
                    else if (a.status === 'Completed') itemStatus = 'done';
                    
                    const dot = document.createElement('span');
                    dot.className = 'calendar-dot calendar-dot-' + itemStatus;
                    dotsContainer.appendChild(dot);
                }
                
                // If more than 3 assignments, add an overflow indicator
                if (dots[day].length > 3) {
                    const overflow = document.createElement('span');
                    overflow.className = 'calendar-overflow';
                    overflow.textContent = '+';
                    dotsContainer.appendChild(overflow);
                }
            }
            
            // Tooltip shows assignment names for that day.
            const tooltip = dots[day].map(item => {
                const a = item.assignment;
                return a.name || a.Assignment_name || a.title || 'Assignment';
            }).join(', ');
            dotsContainer.title = tooltip;
            cell.appendChild(dotsContainer);
            // Put same tooltip on the date cell.
            cell.title = tooltip;
        }
        cell.addEventListener('click', () => {
            const chosenDate = new Date(year, month, day);
            clickTimer = setTimeout(() => {
                onDateSelect(chosenDate);
                renderCalendar(assignments, chosenDate, onDateSelect, viewMode, onDateDoubleClick);
            }, 220);
        });
        cell.addEventListener('dblclick', () => {
            if (clickTimer) {
                clearTimeout(clickTimer);
                clickTimer = null;
            }
            const chosenDate = new Date(year, month, day);
            if (typeof onDateDoubleClick === 'function') {
                onDateDoubleClick(chosenDate, dots[day] || []);
            }
            onDateSelect(chosenDate);
            renderCalendar(assignments, chosenDate, onDateSelect, viewMode, onDateDoubleClick);
        });
        cell.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                onDateSelect(new Date(year, month, day));
                renderCalendar(assignments, new Date(year, month, day), onDateSelect, viewMode, onDateDoubleClick);
            }
        });
        grid.appendChild(cell);
    }
    container.appendChild(grid);

    // Month/week navigation buttons.
    document.getElementById('prevMonth').onclick = () => {
        const prev = viewMode === 'month' ? new Date(year, month - 1, 1) : new Date(year, month, Math.max(1, selectedDate.getDate() - 7));
        renderCalendar(assignments, prev, onDateSelect, viewMode, onDateDoubleClick);
    };
    document.getElementById('nextMonth').onclick = () => {
        const next = viewMode === 'month' ? new Date(year, month + 1, 1) : new Date(year, month, Math.min(daysInMonth, selectedDate.getDate() + 7));
        renderCalendar(assignments, next, onDateSelect, viewMode, onDateDoubleClick);
    };
    document.getElementById('toggleView').onclick = () => {
        renderCalendar(assignments, selectedDate, onDateSelect, viewMode === 'month' ? 'week' : 'month', onDateDoubleClick);
    };
}

// Inject calendar styles once.
(function injectCalendarStyles() {
    if (document.getElementById('calendarStyles')) return;
    const style = document.createElement('style');
    style.id = 'calendarStyles';
        style.textContent = `
#calendarContainer { margin: 24px 0; max-width: 420px; }
.calendar-header { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
.calendar-title { font-weight: bold; font-size: 1.1rem; }
.calendar-nav, .calendar-toggle { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #38b6ff; padding: 4px 8px; border-radius: 6px; }
.calendar-nav:focus, .calendar-toggle:focus { outline: 2px solid #b411cf; }
.calendar-toggle { font-size: 0.95rem; color: #b411cf; border: 1px solid #b411cf; margin-left: 8px; }
.calendar-days-row { display: grid; grid-template-columns: repeat(7, 1fr); margin-bottom: 2px; }
.calendar-day-label { text-align: center; font-size: 0.95rem; color: #aaa; padding: 2px 0; }
.calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); }
.calendar-cell { text-align: center; padding: 8px 0; min-width: 32px; min-height: 32px; cursor: pointer; position: relative; border-radius: 6px; transition: background 0.2s; font-size: 1rem; background: none; }
.calendar-cell.selected { background: #38b6ff; color: #fff; }
.calendar-cell.today { border: 2px solid #b411cf; }
.calendar-cell:hover, .calendar-cell:focus { background: #e0e7ff; }
.calendar-cell.empty { background: none; cursor: default; }
.calendar-dots-container { display: flex; flex-direction: row; gap: 2px; align-items: center; justify-content: center; position: absolute; left: 50%; bottom: 4px; transform: translateX(-50%); cursor: pointer; }
.calendar-dot { display: block; width: 6px; height: 6px; background: #b411cf; border-radius: 50%; }
.calendar-dot-single { width: 13px; height: 13px; }
.calendar-dot-overdue { background: #dc3545; }
.calendar-dot-due { background: #fd7e14; }
.calendar-dot-done { background: #28a745; }
.calendar-dot-active { background: #38b6ff; }
.calendar-overflow { font-size: 0.7rem; font-weight: bold; color: #999; }
@media (max-width: 600px) {
    #calendarContainer { max-width: 100vw; margin: 8px 0; }
    .calendar-header { flex-direction: column; gap: 4px; }
    .calendar-title { font-size: 1rem; }
    .calendar-cell { min-width: 24px; min-height: 24px; font-size: 0.95rem; }
}
`;
    document.head.appendChild(style);
})();
