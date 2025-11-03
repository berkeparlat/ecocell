import { useNavigate } from 'react-router-dom';
import SimpleHeader from '../../components/layout/SimpleHeader';
import './ComingSoon.css';

const MonthlyCalendar = () => {
  const navigate = useNavigate();

  return (
    <div className="coming-soon-page">
      <SimpleHeader />
      <div className="coming-soon-container">
        <div className="coming-soon-content">
          <div className="coming-soon-icon">📅</div>
          <h1>Aylık Takvim</h1>
          <p>Bu sayfa yakında eklenecek...</p>
          <button className="back-button" onClick={() => navigate('/main-menu')}>
            Ana Menüye Dön
          </button>
        </div>
      </div>
    </div>
  );
};

export default MonthlyCalendar;
