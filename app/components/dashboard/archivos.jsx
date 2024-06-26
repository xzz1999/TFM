  import { useState } from 'react';

  const Files = ({ onFilesChange }) => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    
    const handleFileChange = (event) => {
      const newFiles = Array.from(event.target.files);
      // Combina los archivos anteriores con los nuevos y actualiza el estado
      setSelectedFiles(prevFiles => {
        const updatedFiles = [...prevFiles, ...newFiles];
        // Retorna los archivos actualizados al componente padre
        onFilesChange(updatedFiles);
        return updatedFiles;
      });
    };

    const removeFile = (fileName) => {
      setSelectedFiles(prevFiles => {
        const updatedFiles = prevFiles.filter(file => file.name !== fileName);
        onFilesChange(updatedFiles);
        return updatedFiles;
      });
    };


    return (
      <div>
        <input
          type="file"
          multiple
          onChange={handleFileChange}
        />
        {selectedFiles.length > 0 && (
          <ul>
            {selectedFiles.map((file, index) => (
              <li key={index}>
                {file.name} <button type="button" onClick={() => removeFile(file.name)}>Eliminar</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  export default Files;
