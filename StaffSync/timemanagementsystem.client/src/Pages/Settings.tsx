import { Button, FormControl, Grid, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { fetchWithAuth } from '../app/fetchWrapper';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import PermissionManager from '../app/PermissionManager ';
import Roles from '../enums/Roles';
import { hasRoles } from '../app/roleManager';

const API_URL = import.meta.env.VITE_TMS_PROD;

const Settings = () => {
    const [holidaysTimezones, setHolidaysTimezones] = useState([]);
    const [selectedTimezone, setSelectedTimezone] = useState(''); // Ensure this is initialized to a string
    const EmployeeObj = PermissionManager.EmployeeObj();

    const handleChange = async (event) => {
        const newTimezone = event.target.value;
        setSelectedTimezone(newTimezone);
        console.log(newTimezone); // Log the new value
        try {
            const response = await fetchWithAuth(`${API_URL}/Holiday/current`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    timezoneLink: newTimezone // Use newTimezone which is the latest value
                })
            });
            if (response.ok) {
                const data = await response.text();
                console.log('Success:', data);
                // Handle success "Timezone Changed Successfully!"
                toast.success(data)
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    useEffect(() => {
        fetchWithAuth(`${API_URL}/Holiday/HolidayList`)
            .then((response) => response.json())
            .then((data) => {
                setHolidaysTimezones(data);
                if (data.length > 0) {
                    setSelectedTimezone(data[0].timezoneLink); // Set an initial value if possible
                }
            })
            .catch((error) => console.error("Error fetching data: ", error));
    }, []);

    return (
        <div>
            <form className=' bg-slate-100 p-8'>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant="h3" >Settings</Typography>
                        <Typography>This page contains settings that affect the system globally.</Typography>
                    </Grid>

                    {hasRoles([Roles.SuperAdmin, Roles.HRMSAdmin, Roles.SrOperationsManager]) ? <div className='flex gap-4 max-w-sm m-4 bg-white p-8 shadow-lg items-center'>
                        <h2 className=' text-xl'>Timezone</h2>
                        
                        <FormControl fullWidth>
                            <Select
                                value={selectedTimezone}
                                onChange={handleChange}
                            >
                                {holidaysTimezones.map((holiday, index) => (
                                    <MenuItem key={index} value={holiday.timezoneLink}>{holiday.timezoneName}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>: ""}

                    
                </Grid>
            </form>
        </div>
    );
}

export default Settings;
