import { Visibility, VisibilityOff } from '@mui/icons-material';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import { useState } from 'react';

type PasswordFieldProps = React.ComponentProps<typeof TextField>;

export default function PasswordField({
  name,
  label,
  error,
  helperText,
  ...props
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  const handleClickDown = () => setShowPassword(true);
  const handleClickUp = () => setShowPassword(false);

  return (
    <TextField
      {...props}
      name={name}
      type={showPassword ? 'text' : 'password'}
      label={label}
      error={error}
      helperText={helperText}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                size="small"
                aria-label="toggle password visibility"
                onPointerDown={handleClickDown}   
                onPointerUp={handleClickUp}       
                onPointerLeave={handleClickUp}    
                onPointerCancel={handleClickUp}   
                edge="end"
              >
                {showPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}