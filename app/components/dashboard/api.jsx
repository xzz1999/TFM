import React from 'react';
import Dropdown from './dropdown'; 

const IA = ({ onOptionSelected }) => {
  const options = [
    { label: 'CHATGPT-3.5 turbot', value: 'gpt-3.5-turbo' },
    { label: 'CHATGPT-4', value: 'gpt-4-1106-preview' },
    { label: "GEMINI-PRO", value: 'gemini-1.0-pro'},
    { label: "LLAMA3", value: 'llama3'},
    { label: "MISTRAL", value: 'Mistral-7B'}
  ];

  return (
    <div>
      <Dropdown options={options} onSelectionChange={onOptionSelected} />
    </div>
  );
};

export default IA;
