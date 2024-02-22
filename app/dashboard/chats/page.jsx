"use client"
import React, { useState, useEffect } from 'react';
import{OpenAI} from "openai";

const chatPage = () => {
  const [dashboardData, setDashboardData] = useState({
    selectAI: '',
    token: '',
    name: '',
    role: '',
    files: [],
  });

  useEffect(() => {
    // Recuperar los datos guardados del localStorage al cargar el componente
    const storedData = localStorage.getItem('dashboardData');
    if (storedData) {
      setDashboardData(JSON.parse(storedData));
    }
  }, []);

  const openai = new OpenAI({
    apiKey : dashboardData.token
  });

  async function main (){
    const assistant = openai.beta.assistants.create({
      name: dashboardData.name,
      instructions: dashboardData.role,
      model: dashboardData.selectAI,
      tool: []

    })
  }

  return (
    <div>
      <h1>Información del Dashboard</h1>
      <p><strong>AI Seleccionada:</strong> {dashboardData.selectAI}</p>
      <p><strong>Token:</strong> {dashboardData.token}</p>
      <p><strong>Nombre:</strong> {dashboardData.name}</p>
      <p><strong>Rol:</strong> {dashboardData.role}</p>
      <div>
        <strong>Archivos:</strong>
        <ul>
          {dashboardData.files.map((file, index) => (
            <li key={index}>{file.name} - {file.size} bytes</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default chatPage;
