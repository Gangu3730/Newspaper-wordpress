import React, { useState } from 'react';
import { BarChart2 } from 'lucide-react';
import './PollWidget.css';

const PollWidget = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const options = [
    'रोजमर्रा के खर्च में बढ़ोत्तरी होगी',
    'सफर और ट्रांसपोर्ट महंगा पड़ेगा',
    'महंगाई और बढ़ेगी',
    'कोई खास असर नहीं पड़ेगा'
  ];

  // Simulated vote percentages for each option
  const votePercentages = [45, 30, 20, 5];

  const handleVote = (index) => {
    setSelectedOption(index);
    // Simulate vote submittal
    setTimeout(() => {
      setHasVoted(true);
    }, 400);
  };

  const totalVotes = hasVoted ? 625 : 624;
  const displayResults = hasVoted || showResults;

  return (
    <div className="poll-widget">
      <div className="poll-widget__header">
        <BarChart2 size={18} />
        <span>पेट्रोल-डीजल की कीमत बढ़ी</span>
      </div>
      
      <div className="poll-widget__body">
        <h4 className="poll-widget__question">पेट्रोल-डीजल के दाम बढ़ने का आप पर क्या असर पड़ेगा?</h4>
        
        <div className="poll-widget__options">
          {!displayResults ? (
            options.map((option, index) => (
              <div 
                key={index} 
                className={`poll-option ${selectedOption === index ? 'selected' : ''}`}
                onClick={() => handleVote(index)}
                style={{ cursor: 'pointer' }}
              >
                <div className="radio-circle">
                  {selectedOption === index && <div className="radio-inner" />}
                </div>
                <span>{option}</span>
              </div>
            ))
          ) : (
            <div className="poll-results">
              {options.map((option, index) => {
                // If voted, adjust the percentage slightly to reflect the user's vote
                let percentage = votePercentages[index];
                if (hasVoted && selectedOption === index) {
                  // visually increment
                  percentage = Math.min(100, percentage + 1);
                }
                return (
                  <div key={index} className="poll-result-bar">
                    <div className="bar-fill" style={{ width: `${percentage}%` }}></div>
                    <span className="bar-label">{option}</span>
                    <span className="bar-percent">{percentage}%</span>
                  </div>
                );
              })}
              {hasVoted ? (
                <p className="thanks-message">वोट करने के लिए धन्यवाद!</p>
              ) : (
                <button 
                  className="back-to-vote-btn"
                  onClick={() => setShowResults(false)}
                  style={{
                    display: 'block',
                    margin: '12px auto 0',
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary-color)',
                    fontSize: '0.875rem',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  &lt; वापस वोट करें
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="poll-widget__footer">
        <span className="total-votes">Total votes: {totalVotes}</span>
        {!displayResults && (
          <button 
            className="view-result-btn"
            onClick={() => setShowResults(true)}
            style={{ cursor: 'pointer' }}
          >
            View result
          </button>
        )}
      </div>
    </div>
  );
};

export default PollWidget;
