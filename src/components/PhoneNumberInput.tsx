import React from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

type PhoneNumberInputProps = {
    value: string;
    onChange: (phone: string) => void;
    primaryColor?: string;
};

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({ value, onChange, primaryColor = '#1976d2' }) => {
    return (
        <PhoneInput
            country={'co'} // País predeterminado (Colombia)
            value={value}
            onChange={onChange}
            inputStyle={{
                width: '100%',
                height: '40px',
                fontSize: '16px',
                borderColor: '#d1d5db',
            }}
            buttonStyle={{
                borderColor: '#d1d5db',
            }}
            dropdownStyle={{
                borderColor: primaryColor,
            }}
            containerStyle={{
                marginBottom: '16px',
            }}
            inputProps={{
                onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                    e.target.style.borderColor = primaryColor;
                    e.target.style.boxShadow = `0 0 0 1px ${primaryColor}`;
                },
                onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                }
            }}
        />
    );
};

export default PhoneNumberInput;
