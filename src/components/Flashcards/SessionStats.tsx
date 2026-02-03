import { SessionStats as SessionStatsType } from './ReviewSession';
import './SessionStats.css';

interface SessionStatsProps {
  stats: SessionStatsType;
  onContinue: () => void;
  onFinish: () => void;
}

const SessionStatsComponent: React.FC<SessionStatsProps> = ({ stats, onContinue, onFinish }) => {
  const correctPercentage = stats.cardsReviewed > 0 
    ? Math.round((stats.correctCount / stats.cardsReviewed) * 100)
    : 0;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="session-stats">
      <div className="stats-header">
        <h2>Session Complete! 🎉</h2>
      </div>

      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-label">Cards Reviewed</div>
          <div className="stat-value">{stats.cardsReviewed}</div>
        </div>

        <div className="stat-item">
          <div className="stat-label">Correct Rate</div>
          <div className="stat-value">{correctPercentage}%</div>
        </div>

        <div className="stat-item">
          <div className="stat-label">Time Spent</div>
          <div className="stat-value">{formatTime(stats.timeSpent)}</div>
        </div>
      </div>

      <div className="stats-breakdown">
        <h3>Rating Breakdown</h3>
        <div className="breakdown-grid">
          <div className="breakdown-item again">
            <span className="breakdown-label">Again</span>
            <span className="breakdown-value">{stats.againCount}</span>
          </div>
          <div className="breakdown-item hard">
            <span className="breakdown-label">Hard</span>
            <span className="breakdown-value">{stats.hardCount}</span>
          </div>
          <div className="breakdown-item good">
            <span className="breakdown-label">Good</span>
            <span className="breakdown-value">{stats.goodCount}</span>
          </div>
          <div className="breakdown-item easy">
            <span className="breakdown-label">Easy</span>
            <span className="breakdown-value">{stats.easyCount}</span>
          </div>
        </div>
      </div>

      <div className="stats-next-review">
        <h3>Next Review Dates</h3>
        <p className="help-text">
          Your cards have been scheduled based on the FSRS algorithm.
          Come back tomorrow to review more cards!
        </p>
      </div>

      <div className="stats-actions">
        <button className="btn btn-secondary" onClick={onFinish}>
          Finish
        </button>
        <button className="btn btn-primary" onClick={onContinue}>
          Continue Studying
        </button>
      </div>
    </div>
  );
};

export default SessionStatsComponent;
