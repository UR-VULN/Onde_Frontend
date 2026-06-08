import React, { useState } from 'react';
import './InventoryCalendar.css';

interface InventoryData {
  date: string;
  availableQuantity: number;
  price: number;
}

interface InventoryCalendarProps {
  initialData: InventoryData[];
  onUpdate: (data: InventoryData[]) => void;
}

const InventoryCalendar: React.FC<InventoryCalendarProps> = ({ initialData, onUpdate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [inventory, setInventory] = useState<Record<string, InventoryData>>(
    initialData.reduce((acc, item) => ({ ...acc, [item.date]: item }), {})
  );

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const renderHeader = () => {
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return (
      <div className="calendar-header">
        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}>&lt;</button>
        <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}>&gt;</button>
      </div>
    );
  };

  const handleInputChange = (dateStr: string, field: keyof InventoryData, value: string) => {
    const numValue = parseInt(value) || 0;
    const updated = {
      ...inventory,
      [dateStr]: {
        ...(inventory[dateStr] || { date: dateStr, availableQuantity: 0, price: 0 }),
        [field]: numValue
      }
    };
    setInventory(updated);
    onUpdate([updated[dateStr]]);
  };

  const renderDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = [];
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);

    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const data = inventory[dateStr] || { availableQuantity: 0, price: 0 };
      
      days.push(
        <div key={d} className="calendar-day">
          <span className="day-number">{d}</span>
          <div className="day-inputs">
            <div className="input-group">
              <label>Stock</label>
              <input 
                type="number" 
                value={data.availableQuantity} 
                onChange={(e) => handleInputChange(dateStr, 'availableQuantity', e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>Price</label>
              <input 
                type="number" 
                value={data.price} 
                onChange={(e) => handleInputChange(dateStr, 'price', e.target.value)}
              />
            </div>
          </div>
        </div>
      );
    }

    return <div className="calendar-grid">{days}</div>;
  };

  return (
    <div className="inventory-calendar">
      {renderHeader()}
      <div className="day-names">
        <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
      </div>
      {renderDays()}
    </div>
  );
};

export default InventoryCalendar;
