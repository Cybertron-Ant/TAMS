import React, { useState } from 'react';
import { Button, Grid, IconButton, InputAdornment, MenuItem, TextField } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

export interface FieldDefinition {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  maxLength?: number;
  multiline?: boolean;
  hidden?:boolean;
  select?:boolean;
  options?: {[x:string]:string }[];
}

interface ResourceFormProps {
  formTitle: string;
  fields: FieldDefinition[];
  formMode: "EDIT" | "CREATE"
  initialValues: { [key: string]: any };
  handleCreate: (data: { [key: string]: any }) => void;
  handleUpdate: (data: { [key: string]: any }) => void;
  handleCancel: () => void;
}

const ResourceForm: React.FC<ResourceFormProps> = ({formMode, formTitle, fields, initialValues, handleUpdate, handleCreate, handleCancel }) => {
  const [formData, setFormData] = React.useState(initialValues);
  const [showPassword, setShowPassword] = useState({});

  const handleTogglePassword = (name) => {
    setShowPassword((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if(formMode == "CREATE"){
      handleCreate(formData);
    }else{
      handleUpdate(formData);

    }
  };
  return (
    <div className='max-h-[60vh] overflow-auto p-4 bg-white shadow-md rounded-lg'>
       <h2 className="text-3xl font-bold text-gray-800 mb-6">{formTitle}</h2>

      <Grid container spacing={2}>
        {fields.map((field) => (
          <Grid item xs={12} key={field.name} className={field.hidden ? 'hidden' : ''}>
            <TextField
              label={field.label}
              select={field.select}
              variant="outlined"
              fullWidth
              type={showPassword[field.name] ? 'text' : field.type}
              name={field.name}              
              placeholder={field.placeholder}
              value={formData[field.name]}
              onChange={handleChange}
              InputProps={{ endAdornment : field.type === 'password' && (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => handleTogglePassword(field.name)}
                    edge="end"
                  >
                    {showPassword[field.name] ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )}}
              
              multiline={field.multiline}
              
            >
              {field.options?.map((option) => (
                          <MenuItem
                            key={option.id?.toString()}
                            value={option.id?.toString()}
                          >
                            {option.type}
                          </MenuItem>
                        ))}
            </TextField>
            
          </Grid>
        ))}
      </Grid>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
        <Button
          onClick={handleCancel}
          variant="contained"
          color="error"
          style={{ marginRight: '8px' }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
        >
          {formMode === "CREATE" ? 'Create' : 'Update'}
        </Button>
      </div>
    </div>
  );
};

export default ResourceForm;
