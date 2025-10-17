import React from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

type PhoneNumberInputProps = {
    value: string;
    onChange: (phone: string) => void;
};

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({ value, onChange }) => {
    return (
        <PhoneInput
            country={'co'} // País predeterminado (Colombia)
            value={value}
            onChange={onChange}
            inputStyle={{
                width: '100%',
                height: '40px',
                fontSize: '16px',
            }}
            containerStyle={{
                marginBottom: '16px',
            }}
        />
    );
};

export default PhoneNumberInput;
