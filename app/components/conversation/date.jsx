import React, { useState } from 'react';

const date= ({onDateChange }) => {

  const [selectedDate, setSelectedDate] = useState("");


  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
    onDateChange(event.target.value);  };
    return (
        <div>
          <label htmlFor="date-picker">Fecha de conversación:</label>
          <input
            type="date"
            id="date-picker"
            value={selectedDate}
            onChange={handleDateChange}
          />
        </div>
      );
    };
export default date;
