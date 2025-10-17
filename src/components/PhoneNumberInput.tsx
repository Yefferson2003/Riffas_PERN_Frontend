import React from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

type PhoneNumberInputProps = {
    value: string;
    onChange: (phone: string) => void;
};

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({ value, onChange }) => {
    
    const handlePhoneChange = (phone: string) => {
        // Normalizar números argentinos
        // Argentina: +54 9 11 xxxx-xxxx -> +54 11 xxxx-xxxx
        let normalizedPhone = phone;
        
        if (phone.startsWith('549')) {
            // Remover el "9" extra para números argentinos
            normalizedPhone = phone.replace(/^549/, '54');
        }
        
        // Llamar al onChange con el número normalizado
        onChange(normalizedPhone);
    };

    return (
        <PhoneInput
            country={'co'} // País predeterminado (Colombia)
            value={value}
            onChange={handlePhoneChange}
            inputStyle={{
                width: '100%',
                height: '40px',
                fontSize: '16px',
            }}
            containerStyle={{
                marginBottom: '16px',
            }}
            // Configuraciones adicionales para Argentina
            specialLabel=""
            countryCodeEditable={false}
            enableSearch={true}
            searchPlaceholder="Buscar país..."
        />
    );
};

export default PhoneNumberInput;
