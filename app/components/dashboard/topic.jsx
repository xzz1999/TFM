import { useState } from 'react';
import { Button } from '@/app/components/button';

const RestrictTopics = ({ onConfirm }) => {
  const [showBars, setShowBars] = useState(false);
  const [validTopics, setValidTopics] = useState([]);
  const [invalidTopics, setInvalidTopics] = useState([]);
  const [newValidTopic, setNewValidTopic] = useState('');
  const [newInvalidTopic, setNewInvalidTopic] = useState('');

  const handleAddValidTopic = () => {
    if (newValidTopic.trim() !== '') {
      setValidTopics([...validTopics, newValidTopic.trim()]);
      setNewValidTopic('');
    }
  };

  const handleAddInvalidTopic = () => {
    if (newInvalidTopic.trim() !== '') {
      setInvalidTopics([...invalidTopics, newInvalidTopic.trim()]);
      setNewInvalidTopic('');
    }
  };

  const handleRemoveValidTopic = (index) => {
    const newValidTopics = validTopics.filter((_, i) => i !== index);
    setValidTopics(newValidTopics);
  };

  const handleRemoveInvalidTopic = (index) => {
    const newInvalidTopics = invalidTopics.filter((_, i) => i !== index);
    setInvalidTopics(newInvalidTopics);
  };

  const handleConfirm = () => {
    if(validTopics.length == 0 || invalidTopics == 0){
      window.alert("debes de introducir topics válidos e invalidos para ser aceptado")
    }else{
    onConfirm(validTopics, invalidTopics);
    setShowBars(false);
    setValidTopics([]);
    setInvalidTopics([]);
    setNewValidTopic('');
    setNewInvalidTopic('');
    }
  };
  const handleCancel = () => {
    setShowBars(false);
    setValidTopics([]);
    setInvalidTopics([]);
    setNewValidTopic('');
    setNewInvalidTopic('');
  };

  return (
    <div>
      <Button onClick={() => setShowBars(!showBars)}>Restringir Topics</Button>
      {showBars && (
        <div>
          <div>
            <h3>Topic Válido</h3>
            <input
              type="text"
              value={newValidTopic}
              onChange={(e) => setNewValidTopic(e.target.value)}
              placeholder="Añadir topic válido"
            />
            <button onClick={handleAddValidTopic}>Añadir</button>
            <ul>
              {validTopics.map((topic, index) => (
                <li key={index}>
                  {topic}
                  <button 
                    onClick={() => handleRemoveValidTopic(index)} 
                    style={{
                      marginLeft: '10px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'red',
                      fontSize: '16px'
                    }}
                  >
                    &#10005;
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Topic No Válido</h3>
            <input
              type="text"
              value={newInvalidTopic}
              onChange={(e) => setNewInvalidTopic(e.target.value)}
              placeholder="Añadir topic no válido"
            />
            <button onClick={handleAddInvalidTopic}>Añadir</button>
            <ul>
              {invalidTopics.map((topic, index) => (
                <li key={index}>
                  {topic}
                  <button 
                    onClick={() => handleRemoveInvalidTopic(index)} 
                    style={{
                      marginLeft: '10px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'red',
                      fontSize: '16px'
                    }}
                  >
                    &#10005;
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
          <button onClick={handleConfirm}style={{ color: 'blue', marginLeft: '10px' }}>Confirmar &#10004;</button>
          <button onClick={handleCancel} style={{ color: 'red', marginLeft: '10px' }}>
              Cancelar &#10005;
            </button>
        </div>
        </div>
      )}
    </div>
  );
};

export default RestrictTopics;
