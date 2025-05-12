import { Button, ButtonOwnProps, ButtonProps, ButtonPropsColorOverrides, CircularProgress } from '@mui/material';
import React, { useState } from 'react';

interface LoadingButtonProps {
  onClick: () => Promise<void>;
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  variant?: 'text' | 'outlined' | 'contained';
  color?:  'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  [x: string]: any; // To allow other Button props like className, style, etc.
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  onClick,
  children,
  disabled = false,
  loading = false,
  startIcon,
  endIcon,
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  fullWidth = false,
  ...rest
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(loading);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      await onClick();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || isLoading}
      variant={variant}
      color={color}
      size={size}
      fullWidth={fullWidth}
      startIcon={isLoading ? <CircularProgress size={20} /> : startIcon}
      endIcon={!isLoading ? endIcon : null}
      {...rest}
    >
      {isLoading ? 'Loading...' : children}
    </Button>
  );
};

export default LoadingButton;
