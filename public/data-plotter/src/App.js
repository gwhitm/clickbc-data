import React, { useState, useEffect } from 'react';
import { Container, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import { Line } from 'react-chartjs-2';

function App() {
  const [csvFiles, setCsvFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [columns, setColumns] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState('');
  const [chartData, setChartData] = useState(null);

  // Fetch available CSV files
  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/csv-files')
      .then(response => response.json())
      .then(data => setCsvFiles(data))
      .catch(error => console.error('Error:', error));
  }, []);

  // Fetch available columns when a CSV file is selected
  useEffect(() => {
    if (selectedFile) {
      fetch(`http://127.0.0.1:5000/api/csv-columns?filename=${selectedFile}`)
        .then(response => response.json())
        .then(data => setColumns(data))
        .catch(error => console.error('Error:', error));
    }
  }, [selectedFile]);

  // Fetch data for the selected column
  const handlePlot = () => {
    fetch(`http://127.0.0.1:5000/api/csv-data?filename=${selectedFile}&column=${selectedColumn}`)
      .then(response => response.json())
      .then(data => {
        setChartData({
          labels: data.map((_, index) => index + 1),
          datasets: [
            {
              label: `${selectedColumn} of ${selectedFile}`,
              data: data,
              borderColor: 'rgba(75,192,192,1)',
              borderWidth: 2,
              fill: false,
            },
          ],
        });
      })
      .catch(error => console.error('Error:', error));
  };

  return (
    <Container>
      <h1>CLICK A Data Plotter</h1>
      <FormControl fullWidth margin="normal">
        <InputLabel>Select Flyover File (or All)</InputLabel>
        <Select value={selectedFile} onChange={(e) => setSelectedFile(e.target.value)}>
          {csvFiles.map((file) => (
            <MenuItem key={file} value={file}>{file}</MenuItem>
          ))}
        </Select>
      </FormControl>
      {selectedFile && (
        <FormControl fullWidth margin="normal">
          <InputLabel>Select Column</InputLabel>
          <Select value={selectedColumn} onChange={(e) => setSelectedColumn(e.target.value)}>
            {columns.map((column) => (
              <MenuItem key={column} value={column}>{column}</MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      {selectedColumn && (
        <Button variant="contained" color="primary" onClick={handlePlot}>
          Plot Data
        </Button>
      )}
      {chartData && (
        <Line data={chartData} />
      )}
    </Container>
  );
}

export default App;
