import React, { useRef, useState, useCallback, useMemo } from 'react';
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

    var initStartDate = new Date();
    var initEndDate = new Date();
    initStartDate.setDate(initStartDate.getDate() - 8);
    initEndDate.setDate(initEndDate.getDate() - 1);

    const gridRef1 = useRef()
    const gridRef2 = useRef()

    const [dataTable1, setTableData1] = useState({data:[]})
    const [dataTable2, setTableData2] = useState({data:[]})
    const [stock_code, setStockCode] = useState('00001')
    const [start_date, setStartDate] = useState(initStartDate)
    const [end_date, setEndDate] = useState(initEndDate)
    const [threshold, setThreshold] = useState(0.1)

    // Each Column Definition results in one Column.
    const [columnDefs, setColumnDefs] = useState([        
        {field: 'date', filter: true},
        {field: 'rank', filter: true},
        {field: 'participantId', filter: true},
        {field: 'participantName', filter: true},
        {field: 'address', filter: true},
        {field: 'shareHolding'},
        {field: 'sharePct'}
    ]);

    const defaultColDef = useMemo( ()=> ({
        sortable: true,
        resizable: true
    }));

    const handleStartDateChange = (newValue) => {
        setStartDate(newValue);
    };

    const handleEndDateChange = (newValue) => {
        setEndDate(newValue);
    };

    const handleButtonClick = () => {
        gridRef1.current.api.showLoadingOverlay();
        gridRef2.current.api.showLoadingOverlay();

        var startDtStr = start_date.toISOString().slice(0,10).split("-").join("");
        var endDtStr = end_date.toISOString().slice(0,10).split("-").join("");
        fetch("/get_top_10_participants/" + stock_code + "/" + endDtStr).then(
            res => res.json()
        ).then(
            data => {
                setTableData1(data);
                gridRef1.current.api.hideOverlay();
            }
        );
        fetch("/get_threshold_breakers/" + stock_code + "/" + startDtStr + "/" + endDtStr + "/" + threshold.toString()).then(
            res => res.json()
        ).then(
            data => {
                setTableData2(data);
                gridRef2.current.api.hideOverlay();
            }
        );
    };

    const onGridReady1 = useCallback((params) => {
        gridRef1.current.api.sizeColumnsToFit()
    }, []);

    const onGridReady2 = useCallback((params) => {
        gridRef2.current.api.sizeColumnsToFit();

        var defaultSortModel = [
            { colId: 'participantId', sort: 'asc', sortIndex: 0 }
        ];
        params.columnApi.applyColumnState({ state: defaultSortModel });
        
    }, []);

    
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
                                    label="Start Date"
                                    inputFormat="MM/dd/yyyy"
                                    value={start_date}
                                    onChange={handleStartDateChange}
                                    renderInput={(params) => <TextField {...params} />} />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={2}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DesktopDatePicker
                                    label="End Date"
                                    inputFormat="MM/dd/yyyy"
                                    value={end_date}
                                    onChange={handleEndDateChange}
                                    renderInput={(params) => <TextField {...params} />} />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={1}>
                            <FormControl sx={{ m: 0, minWidth: 150 }}>
                                <InputLabel>Threshold</InputLabel>
                                <Select
                                    id="threshold"
                                    value={threshold}
                                    label="Threshold"
                                    onChange={(e) => setThreshold(e.target.value)} >
                                    <MenuItem value={0.1}>0.1%</MenuItem>
                                    <MenuItem value={0.5}>0.5%</MenuItem>
                                    <MenuItem value={1.0}>1.0%</MenuItem>
                                    <MenuItem value={1.5}>1.5%</MenuItem>
                                    <MenuItem value={2.0}>2.0%</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={1}>
                            <Button variant="contained" size="large" onClick={handleButtonClick}>GO</Button>
                        </Grid>
                    </Grid>
                    
                    <Grid container direction="column">
                        <h2>Top 10 Participants</h2>
                        <div className="ag-theme-alpine" style={{width: 1300, height: 500}}>
                            <AgGridReact
                                ref={gridRef1}

                                rowData={dataTable1.data}

                                columnDefs={columnDefs}
                                defaultColDef={defaultColDef}

                                animateRows={false}
                                rowSelection='multiple'

                                onGridReady={onGridReady1}
                                overlayLoadingTemplate={
                                    '<span class="ag-overlay-loading-center">Please wait while your rows are loading</span>'
                                }
                            />
                        </div>

                        <h2>Threshold Breakers</h2>
                        <div className="ag-theme-alpine" style={{width: 1300, height: 500}}>
                            <AgGridReact
                                ref={gridRef2}

                                rowData={dataTable2.data}

                                columnDefs={columnDefs}
                                defaultColDef={defaultColDef}

                                animateRows={false}
                                rowSelection='multiple'

                                onGridReady={onGridReady2}
                                overlayLoadingTemplate={
                                    '<span class="ag-overlay-loading-center">Please wait while your rows are loading</span>'
                                }
                            />
                        </div>
                    </Grid>
                </Grid>              
                <Grid item xs={1}></Grid>
            </Grid>
        </Grid>
    )
}

export default App;
