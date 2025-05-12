import { Button, FormControl, InputLabel, Select } from '@mui/material'
import React from 'react'
import { ExportData } from '../app/utils'

interface ExtractDataProps {
    rows: any,
}

const ExportDataComponent: React.FC<ExtractDataProps> = ({rows}) => {
  return (
    <FormControl variant="filled" sx={{ m: 1, minWidth: 120 }}>
        <InputLabel>Export</InputLabel>
    <Select id="export" labelId={"Export"}>
        <Button onClick={() => ExportData.toJson(rows)}>Json</Button>
        <Button onClick={() => ExportData.toCsv(rows)}>CSV</Button>
        <Button onClick={() => ExportData.toExcel(rows)}>Excel</Button>
        <Button onClick={() => ExportData.toPDF(rows)}>PDF</Button>
    </Select>
    </FormControl>
  )
}

export default ExportDataComponent