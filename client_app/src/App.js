import React, { useRef, useState, useEffect, useMemo } from 'react'
import { AgGridReact } from 'ag-grid-react';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

function App() {

    const gridRef = useRef()

    const [data, setData] = useState([{}])

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

    return (
        <div>
            <div className="ag-theme-alpine" style={{width: 1500, height: 700}}>
                <AgGridReact
                    ref={gridRef} // Ref for accessing Grid's API

                    rowData={data.data} // Row Data for Rows

                    columnDefs={columnDefs} // Column Defs for Columns
                    defaultColDef={defaultColDef} // Default Column Properties

                    animateRows={false} // Optional - set to 'true' to have rows animate when sorted
                    rowSelection='multiple' // Options - allows click selection of rows
                />
            </div>
        </div>
    )
}

export default App;
