import React, { useRef, useState, useEffect, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

function App() {

    const gridRef = useRef()

    const [data, setData] = useState([{}])
    const [stock_code, setStockCode] = useState('00001')
    const [start_date, setStartDate] = useState(new Date())
    const [end_date, setEndDate] = useState(new Date())
    const [threshold, setThreshold] = useState(1)

    // Each Column Definition results in one Column.
    const [columnDefs, setColumnDefs] = useState([
        {field: 'rank', filter: true},
        {field: 'participantId', filter: true},
        {field: 'participantName', filter: true},
        {field: 'address', filter: true},
        {field: 'shareHolding'},
        {field: 'sharePct'}
    ]);

    const defaultColDef = useMemo( ()=> ({
        sortable: true
    }));

    useEffect(() => {
        fetch("/get_top_10_participants/00005/20220811").then(
            res => res.json()
        ).then(
            data => {
                setData(data)
                console.log(data)
            }
        )
    }, []);

    const handleStartDateChange = (newValue) => {
        setStartDate(newValue);
    };

    const handleEndDateChange = (newValue) => {
        setEndDate(newValue);
    };

    const handleThresholdChange = (newValue) => {
        setThreshold(newValue);
    }

    return (
        <Grid sx={{ flexGrow: 1 }} container spacing={2}>
            <Grid container direction="row">
                <Grid item xs={1}></Grid>                
                <Grid item xs={10}>
                    <h1>CCASS Plotter</h1>

                    <Grid container direction="row" alignItems="flex-start">
                        <Grid item xs={2}>
                            <TextField
                                id="stock_code"
                                type="text"
                                label="Stock Code"
                                value={stock_code}
                                onChange={(e) => setStockCode(e.target.value)}
                                variant="outlined"
                                margin="none" />
                        </Grid>
                        <Grid item xs={2}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DesktopDatePicker
                                    label="Date desktop"
                                    inputFormat="MM/dd/yyyy"
                                    value={start_date}
                                    onChange={handleStartDateChange}
                                    renderInput={(params) => <TextField {...params} />} />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={2}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DesktopDatePicker
                                    label="Date desktop"
                                    inputFormat="MM/dd/yyyy"
                                    value={end_date}
                                    onChange={handleEndDateChange}
                                    renderInput={(params) => <TextField {...params} />} />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={2}>
                            <FormControl sx={{ m: 0, minWidth: 150 }}>
                                <InputLabel>Threshold</InputLabel>
                                <Select
                                    id="threshold"
                                    value={threshold}
                                    label="Threshold"
                                    onChange={handleThresholdChange} >
                                    <MenuItem value={0.5}>0.5%</MenuItem>
                                    <MenuItem value={1.0}>1.0%</MenuItem>
                                    <MenuItem value={1.5}>1.5%</MenuItem>
                                    <MenuItem value={2.0}>2.0%</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={2}>
                            <Button variant="contained" size="large">GO</Button>
                        </Grid>
                    </Grid>
                    
                    <Grid container direction="column">
                        <h2>Top 10 Participants</h2>
                        <div className="ag-theme-alpine" style={{width: 1300, height: 500}}>
                            <AgGridReact
                                ref={gridRef} // Ref for accessing Grid's API

                                rowData={data.data} // Row Data for Rows

                                columnDefs={columnDefs} // Column Defs for Columns
                                defaultColDef={defaultColDef} // Default Column Properties

                                animateRows={false} // Optional - set to 'true' to have rows animate when sorted
                                rowSelection='multiple' // Options - allows click selection of rows
                            />
                        </div>

                        <h2>Threshold Breakers</h2>
                    </Grid>
                </Grid>              
                <Grid item xs={1}></Grid>
            </Grid>
        </Grid>
    )
}

export default App;
