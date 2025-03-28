document.addEventListener('DOMContentLoaded', function() {
    // 获取页面元素
    const mainPage = document.getElementById('mainPage');
    const monthsPage = document.getElementById('monthsPage');
    const calendarPage = document.getElementById('calendarPage');
    const todoPage = document.getElementById('todoPage');
    
    const enterPlanBtn = document.getElementById('enterPlanBtn');
    const backToMainBtn = document.getElementById('backToMainBtn');
    const backToMonthsBtn = document.getElementById('backToMonthsBtn');
    const backToCalendarBtn = document.getElementById('backToCalendarBtn');
    
    const monthsContainer = document.getElementById('monthsContainer');
    const daysContainer = document.getElementById('daysContainer');
    const calendarTitle = document.getElementById('calendarTitle');
    const todoTitle = document.getElementById('todoTitle');
    const todoList = document.getElementById('todoList');
    const newTodoInput = document.getElementById('newTodoInput');
    const addTodoBtn = document.getElementById('addTodoBtn');
    const addRowBtn = document.getElementById('addRowBtn');
    const saveTableBtn = document.getElementById('saveTableBtn');
    const planTable = document.getElementById('planTable');
    
    // 当前选中的日期和月份
    let currentDate = new Date();
    let selectedYear = currentDate.getFullYear();
    let selectedMonth = currentDate.getMonth();
    let selectedDay = currentDate.getDate();
    
    // 存储所有待办事项的对象
    let todos = JSON.parse(localStorage.getItem('todos')) || {};
    
    // 存储Excel表格数据
    let planData = JSON.parse(localStorage.getItem('planData')) || [];
    
    // 初始化加载保存的表格数据
    function loadTableData() {
        if (planData.length > 0) {
            const tbody = planTable.querySelector('tbody');
            tbody.innerHTML = '';
            
            planData.forEach(row => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td contenteditable="true">${row.timeRange}</td>
                    <td contenteditable="true">${row.content}</td>
                `;
                tbody.appendChild(tr);
            });
        }
    }
    
    // 保存表格数据
    function saveTableData() {
        const rows = planTable.querySelectorAll('tbody tr');
        planData = [];
        
        rows.forEach(row => {
            const timeRange = row.cells[0].textContent.trim();
            const content = row.cells[1].textContent.trim();
            
            if (timeRange || content) {
                planData.push({
                    timeRange,
                    content
                });
            }
        });
        
        localStorage.setItem('planData', JSON.stringify(planData));
        alert('计划已保存！');
    }
    
    // 添加新行
    function addNewRow() {
        const tbody = planTable.querySelector('tbody');
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td contenteditable="true"></td>
            <td contenteditable="true"></td>
        `;
        tbody.appendChild(tr);
    }
    
    // 显示月份选择页面
    function showMonthsPage() {
        mainPage.classList.remove('active');
        monthsPage.classList.add('active');
        calendarPage.classList.remove('active');
        todoPage.classList.remove('active');
        
        renderMonths();
    }
    
    // 显示日历页面
    function showCalendarPage(year, month) {
        mainPage.classList.remove('active');
        monthsPage.classList.remove('active');
        calendarPage.classList.add('active');
        todoPage.classList.remove('active');
        
        selectedYear = year;
        selectedMonth = month;
        
        calendarTitle.textContent = `${year}年${month + 1}月`;
        renderCalendar(year, month);
    }
    
    // 显示待办事项页面
    function showTodoPage(year, month, day) {
        mainPage.classList.remove('active');
        monthsPage.classList.remove('active');
        calendarPage.classList.remove('active');
        todoPage.classList.add('active');
        
        selectedYear = year;
        selectedMonth = month;
        selectedDay = day;
        
        todoTitle.textContent = `${year}年${month + 1}月${day}日`;
        renderTodoList(year, month, day);
    }
    
    // 渲染月份选择页面
    function renderMonths() {
        monthsContainer.innerHTML = '';
        
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        // 显示当前月份和未来3个月
        for (let i = 0; i < 4; i++) {
            const monthIndex = (currentMonth + i) % 12;
            const year = currentYear + Math.floor((currentMonth + i) / 12);
            
            const monthCard = document.createElement('div');
            monthCard.className = 'month-card';
            monthCard.innerHTML = `
                <div class="month-name">${getMonthName(monthIndex)}</div>
                <div class="month-year">${year}年</div>
            `;
            
            monthCard.addEventListener('click', function() {
                showCalendarPage(year, monthIndex);
            });
            
            monthsContainer.appendChild(monthCard);
        }
    }
    
    // 获取月份名称
    function getMonthName(month) {
        const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
        return monthNames[month];
    }
    
    // 渲染日历
    function renderCalendar(year, month) {
        daysContainer.innerHTML = '';
        
        // 获取当月第一天是星期几
        const firstDay = new Date(year, month, 1).getDay();
        
        // 获取当月天数
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // 添加空白格子
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'day empty';
            daysContainer.appendChild(emptyDay);
        }
        
        // 添加日期格子
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'day';
            dayElement.textContent = day;
            
            // 检查是否为今天
            const today = new Date();
            if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
                dayElement.classList.add('today');
            }
            
            // 检查是否所有待办事项都已完成
            const dateKey = `${year}-${month}-${day}`;
            if (todos[dateKey] && todos[dateKey].length > 0) {
                const allCompleted = todos[dateKey].every(todo => todo.completed);
                if (allCompleted && todos[dateKey].length > 0) {
                    dayElement.classList.add('completed');
                    const flowerIcon = document.createElement('div');
                    flowerIcon.className = 'flower-icon';
                    dayElement.appendChild(flowerIcon);
                }
            }
            
            dayElement.addEventListener('click', function() {
                showTodoPage(year, month, day);
            });
            
            daysContainer.appendChild(dayElement);
        }
    }
    
    // 渲染待办事项列表
    function renderTodoList(year, month, day) {
        todoList.innerHTML = '';
        
        const dateKey = `${year}-${month}-${day}`;
        
        if (todos[dateKey] && todos[dateKey].length > 0) {
            todos[dateKey].forEach((todo, index) => {
                const todoItem = document.createElement('div');
                todoItem.className = `todo-item ${todo.completed ? 'completed' : ''}`;
                todoItem.innerHTML = `
                    <input type="checkbox" ${todo.completed ? 'checked' : ''}>
                    <div class="todo-text">${todo.text}</div>
                `;
                
                const checkbox = todoItem.querySelector('input[type="checkbox"]');
                checkbox.addEventListener('change', function() {
                    toggleTodoComplete(dateKey, index);
                });
                
                todoList.appendChild(todoItem);
            });
        }
    }
    
    // 添加新的待办事项
    function addNewTodo(text) {
        if (!text.trim()) return;
        
        const dateKey = `${selectedYear}-${selectedMonth}-${selectedDay}`;
        
        if (!todos[dateKey]) {
            todos[dateKey] = [];
        }
        
        todos[dateKey].push({
            text: text,
            completed: false
        });
        
        localStorage.setItem('todos', JSON.stringify(todos));
        renderTodoList(selectedYear, selectedMonth, selectedDay);
        newTodoInput.value = '';
    }
    
    // 切换待办事项完成状态
    function toggleTodoComplete(dateKey, index) {
        todos[dateKey][index].completed = !todos[dateKey][index].completed;
        localStorage.setItem('todos', JSON.stringify(todos));
        
        renderTodoList(selectedYear, selectedMonth, selectedDay);
        
        // 检查是否所有待办事项都已完成
        const allCompleted = todos[dateKey].every(todo => todo.completed);
        
        // 如果返回到日历页面，需要更新日历上的小红花
        if (allCompleted) {
            renderCalendar(selectedYear, selectedMonth);
        }
    }
    
    // 事件监听器
    enterPlanBtn.addEventListener('click', showMonthsPage);
    backToMainBtn.addEventListener('click', function() {
        mainPage.classList.add('active');
        monthsPage.classList.remove('active');
    });
    
    backToMonthsBtn.addEventListener('click', showMonthsPage);
    backToCalendarBtn.addEventListener('click', function() {
        showCalendarPage(selectedYear, selectedMonth);
    });
    
    addTodoBtn.addEventListener('click', function() {
        addNewTodo(newTodoInput.value);
    });
    
    newTodoInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addNewTodo(newTodoInput.value);
        }
    });
    
    addRowBtn.addEventListener('click', addNewRow);
    saveTableBtn.addEventListener('click', saveTableData);
    
    // 初始化
    loadTableData();
});