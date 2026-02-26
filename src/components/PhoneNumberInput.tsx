import React from 'react';
import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input'

type PhoneNumberInputProps = {
    value: string;
    onChange: (phone: string | undefined) => void;
    primaryColor?: string;
};

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({ value, onChange, primaryColor = '#1976d2' }) => {
    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData('text');
        // Limpiar espacios, guiones, paréntesis y caracteres especiales
        const cleanedPhone = pastedText.replace(/[\s\-\(\)\.]/g, '');
        // Verificar si es un número válido (al menos 7 dígitos)
        if (/^\d{7,}$/.test(cleanedPhone)) {
            // Si empieza con 0, agregamos +57 (Colombia)
            let formattedPhone = cleanedPhone.startsWith('0') 
                ? '+57' + cleanedPhone.slice(1)
                : cleanedPhone.startsWith('+') 
                    ? cleanedPhone 
                    : '+57' + cleanedPhone;
                onChange(formattedPhone);
        }
    };

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
                },
                onPaste: handlePaste,
            }}
        />
    );
};

export default PhoneNumberInput;
