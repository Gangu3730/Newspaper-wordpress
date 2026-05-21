import React, { useState } from 'react';
import { BarChart2 } from 'lucide-react';
import './PollWidget.css';

const PollWidget = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);

  const options = [
    'रोजमर्रा के खर्च में बढ़ोत्तरी होगी',
    'सफर और ट्रांसपोर्ट महंगा पड़ेगा',
    'महंगाई और बढ़ेगी',
    'कोई खास असर नहीं पड़ेगा'
  ];

  const handleVote = (index) => {
    setSelectedOption(index);
    // Simulate API call delay
    setTimeout(() => {
      setHasVoted(true);
    }, 500);
  };

  return (
    <div className="poll-widget">
      <div className="poll-widget__header">
        <BarChart2 size={18} />
        <span>पेट्रोल-डीजल की कीमत बढ़ी</span>
      </div>
      <div className="poll-widget__body">
        <h4 className="poll-widget__question">पेट्रोल-डीजल के दाम बढ़ने का आप पर क्या असर पड़ेगा?</h4>
        
        <div className="poll-widget__options">
          {!hasVoted ? (
            options.map((option, index) => (
              <div 
                key={index} 
                className={`poll-option ${selectedOption === index ? 'selected' : ''}`}
                onClick={() => handleVote(index)}
              >
                <div className="radio-circle">
                  {selectedOption === index && <div className="radio-inner" />}
                </div>
                <span>{option}</span>
              </div>
            ))
          ) : (
            <div className="poll-results">
              <div className="poll-result-bar">
                <div className="bar-fill" style={{ width: '45%' }}></div>
                <span className="bar-label">रोजमर्रा के खर्च...</span>
                <span className="bar-percent">45%</span>
              </div>
              <div className="poll-result-bar">
                <div className="bar-fill" style={{ width: '30%' }}></div>
                <span className="bar-label">सफर और...</span>
                <span className="bar-percent">30%</span>
              </div>
              <div className="poll-result-bar">
                <div className="bar-fill" style={{ width: '20%' }}></div>
                <span className="bar-label">महंगाई...</span>
                <span className="bar-percent">20%</span>
              </div>
              <div className="poll-result-bar">
                <div className="bar-fill" style={{ width: '5%' }}></div>
                <span className="bar-label">कोई असर नहीं...</span>
                <span className="bar-percent">5%</span>
              </div>
              <p className="thanks-message">वोट करने के लिए धन्यवाद!</p>
            </div>
          )}
        </div>
      </div>
      <div className="poll-widget__footer">
        <span className="total-votes">Total votes: {hasVoted ? '625' : '624'}</span>
        <button className="view-result-btn">View result</button>
      </div>
    </div>
  );
};

export default PollWidget;
