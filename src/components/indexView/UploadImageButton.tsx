import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

type UploadImageButtonProps = {
    setSelectedFile: React.Dispatch<React.SetStateAction<File | null>>
    label: string
}

export default function UploadImageButton({setSelectedFile, label} : UploadImageButtonProps) {

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            console.log('imagen selecionada', file);
        }
    };

    return (
        <Button
            component="label"
            role={undefined}
            variant="contained"
            tabIndex={-1}
            startIcon={<CloudUploadIcon />}
            // onClick={handleUpload}
        >
            {label}
            <VisuallyHiddenInput
                type="file"
                accept="image/*"
                onChange={handleFileChange}
            />
        </Button>
    );
}
