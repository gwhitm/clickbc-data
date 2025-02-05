import React, { useState, useEffect } from 'react';
import { Container, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
  TimeScale, // Import time scale for datetime axis
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { Typography, Link } from '@mui/material';


ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  zoomPlugin
);

// Register the required components
ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const [dataTypes, setDataTypes] = useState([]);
  const [selectedDataType, setSelectedDataType] = useState('');
  const [csvFiles, setCsvFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [columns, setColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [chartData, setChartData] = useState(null);

  // Fetch available data types
  useEffect(() => {
    fetch('https://list-data-types-o67swpv46a-uc.a.run.app', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      .then(response => response.json())
      .then(data => setDataTypes(data))
      .catch(error => console.error('Error:', error));
  }, []);

  // Fetch available CSV files when a data type is selected
  useEffect(() => {
    if (selectedDataType) {
      fetch(`https://list-csv-files-o67swpv46a-uc.a.run.app?data_type=${selectedDataType}`)
        .then(response => response.json())
        .then(data => setCsvFiles(data))
        .catch(error => console.error('Error:', error));
    }
  }, [selectedDataType]);

  // Fetch available columns when a CSV file is selected
  useEffect(() => {
    if (selectedFile) {
      fetch(`https://list-csv-columns-o67swpv46a-uc.a.run.app?data_type=${selectedDataType}&filename=${selectedFile}`)
        .then(response => response.json())
        .then(data => {
          setColumns(data);
          setChartData(null); // Reset chart data when file changes
        })
        .catch(error => console.error('Error:', error));
    } else {
      setColumns([]); // Clear columns if no file is selected
      setChartData(null); // Reset chart data if no file is selected
    }
  }, [selectedFile, selectedDataType]);

  // Fetch data for the selected column
  const handlePlot = () => {
    fetch(`https://get-csv-data-o67swpv46a-uc.a.run.app?data_type=${selectedDataType}&filename=${selectedFile}&column=timestamp_`)
      .then(response => response.json())
      .then(timestamps => {
        // Fetch data for all selected columns
        const fetchDataPromises = selectedColumns.map((column) =>
          fetch(`https://get-csv-data-o67swpv46a-uc.a.run.app?data_type=${selectedDataType}&filename=${selectedFile}&column=${column}`)
            .then(response => response.json())
            .then(data => ({
              label: `${column} of ${selectedFile}`,
              data: data,
              borderColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1)`,
              borderWidth: 2,
              fill: false,
            }))
        );
  
        // Wait for all data to be fetched
        Promise.all(fetchDataPromises)
          .then(datasets => {
            setChartData({
              labels: timestamps,
              datasets: datasets,
            });
          })
          .catch(error => console.error('Error:', error));
      })
      .catch(error => console.error('Error:', error));
  };
  
    // Handle column selection change
  const handleColumnChange = (newColumns) => {
    setSelectedColumns(newColumns);
    setChartData(null); // Reset chart data when columns change
  };

    // Handle file selection change
    const handleFileChange = (newFile) => {
      setSelectedFile(newFile);
      setChartData(null); // Reset chart data when file changes
    };

  return (
    <Container>
      <h1>CLICK A Data Explorer</h1>
      <FormControl fullWidth margin="normal">
        <InputLabel>Select Data Type</InputLabel>
        <Select value={selectedDataType} onChange={(e) => setSelectedDataType(e.target.value)}>
          {dataTypes.map((type) => (
            <MenuItem key={type} value={type}>{type}</MenuItem>
          ))}
        </Select>
      </FormControl>
      {selectedDataType && (
        <FormControl fullWidth margin="normal">
          <InputLabel>Select CSV File</InputLabel>
          <Select value={selectedFile} onChange={(e) => handleFileChange(e.target.value)}>
            {Array.isArray(csvFiles) && csvFiles.map((file) => (
              <MenuItem key={file} value={file}>{file}</MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      {selectedFile && (
        <FormControl fullWidth>
        <InputLabel id="column-label">Select Columns</InputLabel>
        <Select
          labelId="column-label"
          id="column-select"
          multiple
          value={selectedColumns}
          onChange={(e) => handleColumnChange(e.target.value)}
        >
          {Array.isArray(columns) && columns.map((column) => (
            <MenuItem key={column} value={column}>
              {column}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      )}
      {selectedColumns && (
        <Button variant="contained" color="primary" onClick={handlePlot}>
          Plot Data
        </Button>
      )}
      {chartData && (
        <Line
          data={chartData}
          options={{
            responsive: true,
            scales: {
              x: {
                type: 'time',
                time: {
                  tooltipFormat: 'PPpp', // Display a readable format in tooltips
                  unit: 'second',
                },
                title: {
                  display: true,
                  text: 'Timestamp',
                },
              },
              y: {
                title: {
                  display: true,
                  text: 'Value',
                },
              },
            },
            plugins: {
              legend: {
                display: true,
                position: 'right',
              },
              zoom: {
                pan: {
                  enabled: true,
                  mode: 'x',
                },
                zoom: {
                  wheel: {
                    enabled: true,
                  },
                  pinch: {
                    enabled: true,
                  },
                  mode: 'x',
                },
              },
            },
          }}
        />
      )}

      <Typography
        variant="body1"
        style={{ marginTop: '20px', padding: '10px', textAlign: 'center', backgroundColor: '#f5f5f5', borderRadius: '4px' }}
      >
        Select either Telemetry or FPGA data, the date/time of the flyover, and the columns you'd like to display, and hit 'Plot'.<br />
        Then scroll on the plot to zoom in and out in time, and drag to move forward and backward in time.<br />
          <Link href="https://docs.google.com/spreadsheets/d/10HQj-jQuXDAqirAgxsoBC6mmN-kF2k9iYRCzr5RGavg/edit?gid=0#gid=0" target="_blank" rel="noopener" style={{ textDecoration: 'none', color: '#1976d2', fontWeight: 'bold' }}>
            Link to all flyovers
          </Link><br/>
          <Link href="https://github.com/gwhitm/clickbc-data/tree/master/public/clicka-data" target="_blank" rel="noopener" style={{ textDecoration: 'none', color: '#1976d2', fontWeight: 'bold' }}>
            Link to downloadable data
          </Link>
      </Typography>
    </Container>
  );
}

export default App;
