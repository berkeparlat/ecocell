import SimpleHeader from '../../components/layout/SimpleHeader';
import TaskTable from '../../components/tasks/TaskTable';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="simple-dashboard">
      <SimpleHeader />
      <div className="dashboard-content">
        <TaskTable />
      </div>
    </div>
  );
};

export default Dashboard;
