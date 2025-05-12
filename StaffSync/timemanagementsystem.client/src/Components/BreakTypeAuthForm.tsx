import { Button, Grid, IconButton, InputAdornment, TextField } from "@mui/material";
import { BreakTime } from "../interfaces/BreakTime";
import { useState } from "react";
import { VisibilityOff, Visibility } from "@mui/icons-material";


export const BreakTypeAuthForm:React.FC<{
    breakType: BreakTime, 
    onClose: (event:any)=>void, 
    onSubmit: (formData: any)=>void, 
}> = (props) =>{
    const [password , setPassword] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);


    return (
        <>
        <form className="max-h-[60vh] overflow-auto p-4 bg-white shadow-md rounded-lg">
            <Grid>
                <Grid>
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">Enter Break Password</h1>
                    <p className="text-sm mb-2">
                        <span className="font-semibold">Break Type: </span>
                        <span>{props.breakType.name}</span>
                    </p>
                    <p className="mb-6 text-sm">
                        Enter password for the break in order to punch in for that break type
                    </p>
                </Grid>
                <Grid item xs={6}>
                    <TextField
                    fullWidth
                    type={ showPassword ? "text" :"password"}
                    label="Password"
                    name="password"
                    InputLabelProps={{ shrink: true, }}
                    value={password}
                    onChange={(event)=> setPassword(event.target.value)}
                    InputProps={{ endAdornment : (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )}}
                    />
                </Grid>
                <Grid className="mt-4 flex justify-end gap-2">
                    <Button 
                    className="uppercase" 
                    sx={{
                            backgroundColor: 'error.main', // You can use theme colors
                            '&:hover': {
                            backgroundColor: 'error.dark', // Change color on hover
                            },
                            color: '#FFF'
                        }} 
                    onClick={props.onClose}   
                        >Cancel</Button>
                    <Button 
                    className="uppercase" 
                    sx={{
                        backgroundColor: 'success.main', // You can use theme colors
                        '&:hover': {
                          backgroundColor: 'success.dark', // Change color on hover
                          

                        },
                        color: '#FFF'
                      }}
                    onClick={() =>props.onSubmit({password})}
                    >Submit</Button>
                </Grid>
            </Grid>
        </form>
        </>
    );
}