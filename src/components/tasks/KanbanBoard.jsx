import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import TaskCard from './TaskCard';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import TaskForm from './TaskForm';
import { Plus } from 'lucide-react';
import './KanbanBoard.css';

const KanbanBoard = () => {
  const { tasks, currentProject, moveTask, user } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('todo');

  const columns = [
    { id: 'todo', title: 'Beklemede', color: '#81c784' },
    { id: 'in-progress', title: 'Devam Ediyor', color: '#ffb74d' },
    { id: 'review', title: 'İncelemede', color: '#64b5f6' },
    { id: 'done', title: 'Tamamlandı', color: '#4caf50' },
  ];

  // Kullanıcı kendi birimindeki işleri görsün (admin hariç)
  const projectTasks = user?.email === 'berke.parlat27@gmail.com'
    ? tasks
    : tasks.filter(t => t.department === user?.department);

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, status) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    moveTask(taskId, status);
  };

  const openModal = (status) => {
    setSelectedStatus(status);
    setIsModalOpen(true);
  };

  return (
    <div className="kanban-board">
      <div className="kanban-columns">
        {columns.map((column) => (
          <div
            key={column.id}
            className="kanban-column"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="kanban-column-header">
              <div className="kanban-column-title">
                <span 
                  className="kanban-column-dot" 
                  style={{ backgroundColor: column.color }}
                />
                <h3>{column.title}</h3>
                <span className="kanban-column-count">
                  {projectTasks.filter(t => t.status === column.id).length}
                </span>
              </div>
              <button 
                className="kanban-add-btn"
                onClick={() => openModal(column.id)}
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="kanban-tasks">
              {projectTasks
                .filter(task => task.status === column.id)
                .map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                  >
                    <TaskCard task={task} />
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Yeni İş Oluştur"
        size="large"
      >
        <TaskForm 
          initialStatus={selectedStatus}
          onClose={() => setIsModalOpen(false)} 
        />
      </Modal>
    </div>
  );
};

export default KanbanBoard;
