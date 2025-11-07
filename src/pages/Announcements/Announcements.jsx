import SimpleHeader from '../../components/layout/SimpleHeader';
import AnnouncementList from '../../components/announcements/AnnouncementList';
import './Announcements.css';

const Announcements = () => {
  return (
    <div className="announcements-page">
      <SimpleHeader />
      <div className="announcements-content">
        <AnnouncementList />
      </div>
    </div>
  );
};

export default Announcements;
