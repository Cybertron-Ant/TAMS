import React, { ReactNode } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  content: ReactNode;
  confirmButtonColor?: "primary" | "inherit" | "secondary" | "success" | "error" | "info" | "warning",
  cancelButtonColor?: "primary" | "inherit" | "secondary" | "success" | "error" | "info" | "warning",
  confirmButtonText?: string,
  cancelButtonText?: string,
  confirmButtonVariant?: "text" | "outlined" | "contained",
  cancelButtonVariant?: "text" | "outlined" | "contained",
  noActions?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  content,
  confirmButtonColor,
  cancelButtonColor,
  confirmButtonText,
  cancelButtonText,
  confirmButtonVariant,
  cancelButtonVariant,
  noActions
}) => {
  let openState = open;

  const handleClose = () => {
    openState = false;
    onClose();
  };

  return (
    <Dialog open={openState} onClose={handleClose}>
      <DialogTitle sx={{ fontWeight: "500", color: "black" }}>{title}</DialogTitle>
      <DialogContent>
        {content}
      </DialogContent>
      <DialogActions style={{'display': noActions ? 'none' : 'inherit'}}>
        <Button onClick={onClose} color={cancelButtonColor} variant={cancelButtonVariant ?? "outlined"}>
         {cancelButtonText ?? "Cancel"} 
        </Button>
        <Button onClick={onConfirm} color={confirmButtonColor} variant={confirmButtonVariant ?? "contained"}>
        {confirmButtonText ?? "Confirm"} 
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationModal;
