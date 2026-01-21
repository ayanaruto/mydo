import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Circle, Trash2, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

const HedgehogTaskApp = () => {
const [tasks, setTasks] = useState([]);
const [newTask, setNewTask] = useState('');
const [view, setView] = useState('todo');
const [selectedDate, setSelectedDate] = useState(null);
const [currentMonth, setCurrentMonth] = useState(new Date());

useEffect(() => {
const loadTasks = async () => {
try {
const result = await window.storage.get('hedgehog-tasks');
if (result && result.value) {
setTasks(JSON.parse(result.value));
}
} catch (error) {
console.log('初回起動または読み込みエラー');
}
};
loadTasks();
}, []);

const saveTasks = async (updatedTasks) => {
try {
await window.storage.set('hedgehog-tasks', JSON.stringify(updatedTasks));
} catch (error) {
console.error('保存エラー:', error);
}
};

const addTask = () => {
if (newTask.trim()) {
const task = {
id: Date.now(),
text: newTask,
status: 'todo',
createdAt: new Date().toISOString(),
dueDate: selectedDate ? selectedDate.toISOString() : null
};
const updatedTasks = [...tasks, task];
setTasks(updatedTasks);
saveTasks(updatedTasks);
setNewTask('');
setSelectedDate(null);
}
};

const toggleStatus = (id) => {
const updatedTasks = tasks.map(task => {
if (task.id === id) {
let newStatus = task.status;
if (task.status === 'todo') newStatus = 'doing';
else if (task.status === 'doing') newStatus = 'done';
else newStatus = 'todo';
return { ...task, status: newStatus, completedAt: newStatus === 'done' ? new Date().toISOString() : null };
}
return task;
});
setTasks(updatedTasks);
saveTasks(updatedTasks);
};

const deleteTask = (id) => {
const updatedTasks = tasks.filter(task => task.id !== id);
setTasks(updatedTasks);
saveTasks(updatedTasks);
};

const filteredTasks = tasks.filter(task => task.status === view);

const getStatusColor = (status) => {
if (status === 'todo') return 'bg-pink-100 border-pink-300';
if (status === 'doing') return 'bg-purple-100 border-purple-300';
return 'bg-green-100 border-green-300';
};

const getDaysInMonth = (date) => {
const year = date.getFullYear();
const month = date.getMonth();
const firstDay = new Date(year, month, 1);
const lastDay = new Date(year, month + 1, 0);
const daysInMonth = lastDay.getDate();

let firstDayOfWeek = firstDay.getDay();
firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

const days = [];
for (let i = 0; i < firstDayOfWeek; i++) {
days.push(null);
}

for (let i = 1; i <= daysInMonth; i++) {
days.push(new Date(year, month, i));
}

return days;
};

const isSameDay = (date1, date2) => {
if (!date1 || !date2) return false;
return date1.getDate() === date2.getDate() &&
date1.getMonth() === date2.getMonth() &&
date1.getFullYear() === date2.getFullYear();
};

const isToday = (date) => {
return isSameDay(date, new Date());
};

const getTasksForDate = (date) => {
if (!date) return [];
return tasks.filter(task => {
if (!task.dueDate) return false;
const taskDate = new Date(task.dueDate);
return isSameDay(taskDate, date);
});
};

const previousMonth = () => {
setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
};

const nextMonth = () => {
setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
};

const days = getDaysInMonth(currentMonth);
const weekDays = ['月', '火', '水', '木', '金', '土', '日'];
const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

return (
<div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 p-4">
<div className="max-w-4xl mx-auto">
<div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
<div className="flex items-center justify-between">
<div className="flex items-center gap-3">
<div className="text-5xl">🦔</div>
<div>
<h1 className="text-2xl font-bold text-pink-600">Hedgehog Tasks</h1>
<p className="text-sm text-gray-500">頑張ってね！</p>
</div>
</div>
<Calendar className="text-purple-400" size={32} />
</div>
</div>

<div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
<div className="flex items-center justify-between mb-4">
<button onClick={previousMonth} className="p-2 hover:bg-blue-100 rounded-full transition">
<ChevronLeft className="text-blue-600" size={24} />
</button>
<h2 className="text-xl font-bold text-blue-600">
{currentMonth.getFullYear()}年 {monthNames[currentMonth.getMonth()]}
</h2>
<button onClick={nextMonth} className="p-2 hover:bg-blue-100 rounded-full transition">
<ChevronRight className="text-blue-600" size={24} />
</button>
</div>

<div className="grid grid-cols-7 gap-2">
{weekDays.map(day => (
<div key={day} className="text-center font-bold text-blue-600 py-2">
{day}
</div>
))}

{days.map((day, index) => {
const tasksForDay = day ? getTasksForDate(day) : [];
const isSelected = day && selectedDate && isSameDay(day, selectedDate);
const isTodayDate = day && isToday(day);

return (
<div
key={index}
onClick={() => day && setSelectedDate(day)}
className={`
min-h-16 p-2 rounded-xl cursor-pointer transition
${!day ? 'bg-transparent' : ''}
${day && !isSelected && !isTodayDate ? 'bg-blue-50 hover:bg-blue-100' : ''}
${isSelected ? 'bg-blue-500 text-white ring-4 ring-blue-300' : ''}
${isTodayDate && !isSelected ? 'bg-blue-200 font-bold' : ''}
`}
>
{day && (
<>
<div className={`text-sm ${isSelected ? 'text-white' : 'text-gray-700'}`}>
{day.getDate()}
</div>
{tasksForDay.length > 0 && (
<div className="flex gap-1 mt-1 flex-wrap">
{tasksForDay.slice(0, 3).map(task => (
<div
key={task.id}
className={`w-2 h-2 rounded-full ${
task.status === 'done' ? 'bg-green-400' :
task.status === 'doing' ? 'bg-purple-400' : 'bg-pink-400'
}`}
/>
))}
</div>
)}
</>
)}
</div>
);
})}
</div>

{selectedDate && (
<div className="mt-4 p-3 bg-blue-50 rounded-xl">
<p className="text-blue-800 font-bold">
📅 選択日: {selectedDate.getMonth() + 1}月{selectedDate.getDate()}日
</p>
</div>
)}
</div>

<div className="flex gap-2 mb-6">
<button
onClick={() => setView('todo')}
className={`flex-1 py-3 rounded-2xl font-bold transition ${
view === 'todo' ? 'bg-pink-400 text-white shadow-lg' : 'bg-white text-pink-400'
}`}
>
📋 やること ({tasks.filter(t => t.status === 'todo').length})
</button>
<button
onClick={() => setView('doing')}
className={`flex-1 py-3 rounded-2xl font-bold transition ${
view === 'doing' ? 'bg-purple-400 text-white shadow-lg' : 'bg-white text-purple-400'
}`}
>
⚡ やってる中 ({tasks.filter(t => t.status === 'doing').length})
</button>
<button
onClick={() => setView('done')}
className={`flex-1 py-3 rounded-2xl font-bold transition ${
view === 'done' ? 'bg-green-400 text-white shadow-lg' : 'bg-white text-green-400'
}`}
>
✨ 完了 ({tasks.filter(t => t.status === 'done').length})
</button>
</div>

<div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
<input
type="text"
value={newTask}
onChange={(e) => setNewTask(e.target.value)}
onKeyPress={(e) => e.key === 'Enter' && addTask()}
placeholder="新しいタスクを入力..."
className="w-full px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:outline-none mb-3"
/>
<div className="flex gap-2">
{selectedDate && (
<div className="flex-1 px-4 py-3 bg-blue-100 text-blue-800 rounded-xl font-bold">
📅 {selectedDate.getMonth() + 1}/{selectedDate.getDate()}
</div>
)}
<button
onClick={addTask}
className="bg-pink-400 text-white px-6 py-3 rounded-xl font-bold hover:bg-pink-500 transition flex items-center gap-2"
>
<Plus size={20} />
追加
</button>
</div>
</div>

<div className="space-y-3">
{filteredTasks.length === 0 ? (
<div className="bg-white rounded-2xl shadow-lg p-8 text-center">
<div className="text-6xl mb-3">🦔</div>
<p className="text-gray-400 text-lg">まだタスクがないよ！</p>
</div>
) : (
filteredTasks.map(task => (
<div
key={task.id}
className={`${getStatusColor(task.status)} border-2 rounded-2xl p-4 shadow-md transition hover:shadow-lg`}
>
<div className="flex items-center gap-3">
<button
onClick={() => toggleStatus(task.id)}
className="flex-shrink-0"
>
{task.status === 'done' ? (
<CheckCircle className="text-green-500" size={28} />
) : (
<Circle className="text-gray-400" size={28} />
)}
</button>
<div className="flex-1">
<p className={`text-lg ${task.status === 'done' ? 'line-through text-gray-500' : 'text-gray-800'}`}>
{task.text}
</p>
<div className="flex gap-3 mt-1">
{task.dueDate && (
<p className="text-xs text-blue-600 font-bold">
📅 {new Date(task.dueDate).getMonth() + 1}/{new Date(task.dueDate).getDate()}
</p>
)}
{task.completedAt && (
<p className="text-xs text-gray-500">
完了: {new Date(task.completedAt).toLocaleDateString('ja-JP')}
</p>
)}
</div>
</div>
<button
onClick={() => deleteTask(task.id)}
className="text-red-400 hover:text-red-600 transition flex-shrink-0"
>
<Trash2 size={20} />
</button>
</div>
</div>
))
)}
</div>

<div className="mt-8 text-center text-gray-500 text-sm">
<p>🦔 一緒に頑張ろうね！ 🦔</p>
</div>
</div>
</div>
);
};

export default HedgehogTaskApp;
