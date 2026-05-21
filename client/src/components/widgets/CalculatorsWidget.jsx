import React from 'react';
import { Calculator, Car, Fuel, CreditCard, PiggyBank, MoreHorizontal } from 'lucide-react';
import './CalculatorsWidget.css';

const calcItems = [
  { id: 1, name: 'FD', icon: <PiggyBank size={24} color="#16a34a" />, bg: '#dcfce7' },
  { id: 2, name: 'Car Loan', icon: <Car size={24} color="#2563eb" />, bg: '#dbeafe' },
  { id: 3, name: 'Fuel', icon: <Fuel size={24} color="#ea580c" />, bg: '#ffedd5' },
  { id: 4, name: 'Personal Loan', icon: <CreditCard size={24} color="#ca8a04" />, bg: '#fef08a' },
  { id: 5, name: 'NPS', icon: <Calculator size={24} color="#0891b2" />, bg: '#cffafe' },
  { id: 6, name: 'More', icon: <MoreHorizontal size={24} color="#4b5563" />, bg: '#f3f4f6' },
];

const CalculatorsWidget = () => {
  return (
    <div className="calculators-widget">
      <h3 className="calculators-widget__title">Calculators</h3>
      <div className="calculators-widget__grid">
        {calcItems.map(item => (
          <div key={item.id} className="calc-item">
            <div className="calc-icon" style={{ backgroundColor: item.bg }}>
              {item.icon}
            </div>
            <span className="calc-name">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalculatorsWidget;
