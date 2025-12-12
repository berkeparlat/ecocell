import SimpleHeader from '../../components/layout/SimpleHeader';
import ReminderTable from '../../components/reminders/ReminderTable';
import './Reminders.css';

const Reminders = () => {
  return (
    <div className="reminders-page">
      <SimpleHeader />
      <div className="reminders-content">
        <ReminderTable />
      </div>
    </div>
  );
};

export default Reminders;
