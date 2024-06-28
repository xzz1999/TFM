'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { getCoversation, botData } from '@/app/lib/actions';
import { BsRobot } from 'react-icons/bs';
import { PiStudent } from 'react-icons/pi';
import { Suspense } from 'react';
import { Button } from '@/app/components/button';
import './visualizer.css';

const VisualizerComponent = () => {
  const searchParams = useSearchParams();
  const [bot, setBot] = useState('');
  const [user, setUser] = useState('');
  const [date, setDate] = useState('');
  const [messages, setMessages] = useState([]);
  const endOfMessagesRef = useRef(null);
  const [botName, setBotName] = useState('');
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [totalAnswers, setTotalAnswers] = useState(0);
  const [totalResponseTime, setTotalResponseTime] = useState(0);
  const [averageResponseTime, setAverageResponseTime] = useState(0);
  const [interactedStudents, setInteractedStudents] = useState(new Set());
  const [selectedStudent, setSelectedStudent] = useState("");
  const [showStudent, setShowStudent] = useState(false);
  const [summary, setSummary] = useState("");
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [adviceModalOpen, setAdviceModalOpen] = useState(false); 
  const [advice, setAdvice] = useState("");

  useEffect(() => {
    const a = searchParams.get('bot');
    const b = searchParams.get('user');
    const c = searchParams.get('date');
    setBot(a);
    setUser(b);
    setDate(c);
  }, []);

  useEffect(() => {
    findBotName();
    findConversation();
  }, [bot, user, date]);

  const findConversation = async () => {
    const data = { bot, user, Time: date };
    try {
      const mensajes = await getCoversation(data);
      if (mensajes) {
        const adaptedMessages = mensajes.map((mensaje) => [
          {
            text: mensaje.question,
            sender: 'user',
            student: mensaje.student,
            date: mensaje.Time,
          },
          {
            text: mensaje.answer,
            sender: 'bot',
            date: mensaje.Time,
            responseTime: mensaje.responseTime,
          },
        ]).flat();
        setMessages(adaptedMessages);
        const questions = adaptedMessages.filter((msg) => msg.sender === 'user').length;
        const answers = adaptedMessages.filter((msg) => msg.sender === 'bot').length;
        setTotalQuestions(questions);
        setTotalAnswers(answers);
        const responseTimes = adaptedMessages.filter((msg) => msg.sender === 'bot').map((msg) => msg.responseTime);
        const totalResponseTime = responseTimes.reduce((acc, curr) => acc + curr, 0);
        setTotalResponseTime(totalResponseTime);
        const averageResponseTime = totalResponseTime / responseTimes.length;
        setAverageResponseTime(averageResponseTime);
        const students = new Set(adaptedMessages.map((msg) => msg.student).filter(student => student !== undefined));
        setInteractedStudents(students);
      }
    } catch (error) {
      console.error('Error al enviar correo a la API:', error);
    }
  };

  const findBotName = async () => {
    try {
      const name = await botData(bot);
      if (name) {
        setBotName(name.name);
      }
    } catch (e) {
      console.log('Error en búsqueda de nombre de bot:', e);
    }
  };

  const handleSummaryButtonClick = () => {
    setShowStudent(true);
    setSelectedStudent(interactedStudents.values().next().value);
  };

  const handleAdviceButtonClick = async () => {
    const data = { bot, user:"Todo"};
    const conversation = await getCoversation(data);
    let question;
    if (conversation) {
      const mensajes = conversation.map((mensaje) => [
        {
          text: mensaje.question,
          student: mensaje.student,
        }
      ]).flat();
      question = "Soy un profesor y estos son las preguntas realizadas por los mis alumnos:\n" + JSON.stringify(mensajes) + "\n " + "dime que conocimientos debo reforzar en mis alumnos";
      const advise = await getSummary(question);
      setAdvice(advise);
      setAdviceModalOpen(true); // Mostrar la ventana emergente de consejo
    }
  };

  const getSummary = async (message) => {
    try {
      const response = await fetch('/api/openAI/getSummary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: message })
      });
      const data = await response.json();
      if (data) {
        return data.response;
      }
    } catch (error) {
      console.error('Error en empezar el chat:', error);
    }
  };

  const handleClose = () => {
    setShowStudent(false);
  };

  const handleStudentSelectionClose = async () => {
    setShowStudent(false);
    try {
      let data = {};
      if (selectedStudent !== "todos los alumnos") {
        const user = selectedStudent;
        data = { bot, user, Time: date };
      } else {
        data = { bot, user, Time: date };
      }
      const iteraciones = await getCoversation(data);
      let question;
      if (iteraciones) {
        const mensajes = iteraciones.map((mensaje) => [
          {
            text: mensaje.question,
            student: mensaje.student,
          }
        ]).flat();
        question = "Dado que estas son preguntas realizadas por los alumnos:\n" + JSON.stringify(mensajes) + "\n dime el tema principal de las preguntas de los alumnos ";
        const summary = await getSummary(question);
        setSummary(summary);
        setSummaryModalOpen(true);
      } else {
        window.alert("No hay mensajes para este usuario");
      }

    } catch (e) {
      console.log("Error en realizar un resumen:", e);
    }
  };

  const handleDownloadButtonClick = () => {
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(messages, null, 2)], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `conversation_${bot}_${user}_${date}.txt`;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

  return (
    <div className="chat-bar">
      <div className="message-stats">
        <p>Total de preguntas realizadas: <span className="stat-value">{totalQuestions}</span></p>
        <p>Total de respuestas recibidas: <span className="stat-value">{totalAnswers}</span></p>
        <p>Tiempo medio de respuesta: <span className="stat-value">{(averageResponseTime / 1000).toFixed(2)} s</span></p>
        <p>Número de alumnos interactuados: <span className="stat-value">{interactedStudents.size}</span></p>
        <div className="buttons-container">
          <Button onClick={handleSummaryButtonClick} className="summary-button">Resumen</Button>
          <Button onClick={handleAdviceButtonClick} className="advice-button">Consejo</Button>
          <Button onClick={handleDownloadButtonClick} className="download-button">Descargar</Button>
        </div>
      </div>
      {showStudent && (
        <div className="summary-modal">
          <div className="summary-content">
            <span className="close" onClick={handleClose}>&times;</span>
            <p>Seleccionar el alumno:</p>
            <select
              size={1}
              value={selectedStudent}
              onChange={(e) => {
                setSelectedStudent(e.target.value);
              }}
            >
              <option value="todos los alumnos">todos los alumnos</option>
              {[...interactedStudents].map((student) => (
                <option key={student} value={student}>
                  {student}
                </option>
              ))}
            </select>
            <Button onClick={() => { console.log('Alumnos seleccionados:', selectedStudent); handleStudentSelectionClose(); }}>Seleccionar</Button>
          </div>
        </div>
      )}
      {summaryModalOpen && (
        <div className="summary-modal-container">
          <div className="summary-modal">
            <span className="close" onClick={() => setSummaryModalOpen(false)}>&times;</span>
            <h2 className="summary-title">Resumen:</h2>
            <p className="summary-content">{summary}</p>
          </div>
        </div>
      )}
      {adviceModalOpen && (
        <div className="summary-modal-container">
          <div className="summary-modal">
            <span className="close" onClick={() => setAdviceModalOpen(false)}>&times;</span>
            <h2 className="summary-title">Consejo:</h2>
            <p className="summary-content">{advice}</p>
          </div>
        </div>
      )}
      <div className="messages">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <div key={index} className={`message ${message.sender === 'user' ? 'left' : 'right'}`}>
              <div className="message-header">
                {message.sender === 'user' ? (
                  <>
                    <PiStudent className="icon" />
                    <p className="sender-info"><strong>{message.student || user}</strong></p>
                  </>
                ) : (
                  <>
                    <BsRobot className="icon" />
                    <p className="sender-info"><strong>{botName}</strong></p>
                  </>
                )}
                <p className="date-info">{new Date(message.date).toLocaleString()}</p>
              </div>
              <p>{message.text}</p>
            </div>
          ))
        ) : (
          <div className="no-messages">No hay mensajes para mostrar.</div>
        )}
        <div ref={endOfMessagesRef} />
      </div>
    </div>
  );
};

const VisualizerPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VisualizerComponent />
    </Suspense>
  );
};

export default VisualizerPage;
