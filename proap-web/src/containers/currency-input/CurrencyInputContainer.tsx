import React, { useEffect, useState } from 'react';
import { CurrencyInputMask } from '../input-masks/CurrencyInputMask';
import { StyledTextField } from './CurrencyInputContainer.style';
import { CurrencyCustomFormikFieldInterface } from './CurrencyInputContainterSchema';

const CurrencyCustomFormikField = ({
  values,
  setFieldValue,
  label,
  name,
  required,
}: CurrencyCustomFormikFieldInterface) => {
  const [valorWithoutMask, setValorWithoutMask] = useState(values[name]);

  const handleInputChange = (event: any) => {
    let valorWithoutMask: number | undefined = parseFloat(
      event.target.value.replace(/[\R\$' ']/g, '').replace(',', '.'),
    );

    valorWithoutMask = isNaN(valorWithoutMask) ? undefined : valorWithoutMask;

    setValorWithoutMask(valorWithoutMask);
    setFieldValue(name, valorWithoutMask);
  };

  

  return (
    <StyledTextField
      label={label}
      name={name}
      required={required}
      onChange={handleInputChange}
      value={valorWithoutMask}
      InputProps={{
        inputComponent: CurrencyInputMask as any,
      }}
      variant="standard"
    />
  );
};

export { CurrencyCustomFormikField };
