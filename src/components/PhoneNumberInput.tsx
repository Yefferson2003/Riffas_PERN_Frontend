import React from 'react';
import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input'

type PhoneNumberInputProps = {
    value: string;
    onChange: (phone: string | undefined) => void;
    primaryColor?: string;
};

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({ value, onChange, primaryColor = '#1976d2' }) => {
    return (
        <PhoneInput
            international
            defaultCountry="CO"
            value={value}
            onChange={(phone) => onChange(phone || '')}
            countrySelectProps={{
                style: {
                    height: '40px',
                    borderRadius: '4px',
                    border: `1px solid ${primaryColor}40`,
                    marginRight: '8px',
                    background: '#fff',
                    fontSize: '16px',
                }
            }}
            inputStyle={{
                width: '100%',
                height: '40px',
                fontSize: '16px',
                borderRadius: '4px',
                border: `1px solid ${primaryColor}40`,
                background: '#fff',
                paddingLeft: '48px',
                boxSizing: 'border-box',
            }}
            containerStyle={{
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
            }}
            dropdownStyle={{
                borderColor: primaryColor,
                borderRadius: '4px',
                fontSize: '16px',
            }}
            inputProps={{
                onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                    e.target.style.borderColor = primaryColor;
                    e.target.style.boxShadow = `0 0 0 1px ${primaryColor}`;
                },
                onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
                    e.target.style.borderColor = `${primaryColor}40`;
                    e.target.style.boxShadow = 'none';
                }
            }}
        />
    );
};

export default PhoneNumberInput;
