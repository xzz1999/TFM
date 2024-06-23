
import axios from 'axios';
import cheerio from 'cheerio';


async function getServerSideProps() {
  const url = 'https://www.europarl.europa.eu/topics/es/article/20200827STO85804/que-es-la-inteligencia-artificial-y-como-se-usa'; // Reemplaza con la URL que deseas obtener
  let textContent = '';

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // Extraer el texto de un elemento específico, por ejemplo, el texto del cuerpo de la página
    textContent = $('.post-content').text(); // Puedes ajustar el selector según lo que necesites extraer
    console.log(textContent);
  } catch (error) {
    console.error('Error fetching the page:', error);
  }

}
getServerSideProps();