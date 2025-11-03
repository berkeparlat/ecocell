import { useApp } from '../../context/AppContext';
import TaskCard from './TaskCard';
import './TaskList.css';

const TaskList = () => {
  const { tasks } = useApp();

  const projectTasks = tasks; // Tüm görevler

  const groupedTasks = {
    todo: projectTasks.filter(t => t.status === 'todo'),
    'in-progress': projectTasks.filter(t => t.status === 'in-progress'),
    review: projectTasks.filter(t => t.status === 'review'),
    done: projectTasks.filter(t => t.status === 'done'),
  };

  return (
    <div className="task-list">
      <div className="task-list-container">
        {Object.entries(groupedTasks).map(([status, tasks]) => (
          <div key={status} className="task-list-section">
            <h3 className="task-list-section-title">
              {status === 'todo' && 'Beklemede'}
              {status === 'in-progress' && 'Devam Ediyor'}
              {status === 'review' && 'İncelemede'}
              {status === 'done' && 'Tamamlandı'}
              <span className="task-list-count">({tasks.length})</span>
            </h3>
            <div className="task-list-items">
              {tasks.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskList;
