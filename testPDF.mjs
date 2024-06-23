
import axios from 'axios';
import cheerio from 'cheerio';
const fs = require('fs');
const pdf = require('pdf-parse');
const axios = require('axios');


async function getServerSideProps() {
  const url = 'https://www.europarl.europa.eu/topics/es/article/20200827STO85804/que-es-la-inteligencia-artificial-y-como-se-usa'; // Reemplaza con la URL que deseas obtener
  let textContent = '';

  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(dataBuffer);
    console.log(data.text);
  } catch (error) {
    console.error('Error fetching the page:', error);
  }

}
getServerSideProps();