import { Button } from '@mui/material';
import React from 'react';

interface ConfirmationFormProps {
  handleConfirm: () => void;
  handleCancel: () => void;
}

const ConfirmationForm: React.FC<ConfirmationFormProps> = ({ handleConfirm, handleCancel }) => {

  return (
    <div className='max-h-[50vh] overflow-auto p-4 bg-white shadow-md rounded-lg'>
      <h2>Confirmation</h2>
      <p>Are you sure you want to continue?</p>
      <Button
        onClick={handleCancel}
        variant="contained"
        color="error"
      >
        Cancel
      </Button>
      <Button
        onClick={handleConfirm}
        variant="contained"
        color="primary"
      >
        Ok
      </Button>
    </div>
  );
}

export default ConfirmationForm;
