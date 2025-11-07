import SimpleHeader from '../../components/layout/SimpleHeader';
import WorkPermitTable from '../../components/workPermits/WorkPermitTable';
import './WorkPermits.css';

const WorkPermits = () => {
  return (
    <div className="work-permits-page">
      <SimpleHeader />
      <div className="work-permits-content">
        <WorkPermitTable />
      </div>
    </div>
  );
};

export default WorkPermits;
