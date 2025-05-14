import { Box, Button, Modal } from "@mui/material";
import { QueryObserverResult, RefetchOptions, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from "react-router-dom";
import { toast } from 'react-toastify';
import { createAward } from '../../../../api/awardsApi';
import { AwardFormType, AwardsResponseType } from '../../../../types';
import ButtonCloseModal from '../../../ButtonCloseModal';
import AwardForm from "./AwardForm";
import dayjs from "dayjs";
import { useEffect } from "react";

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 550,
    maxWidth: '100vw',
    bgcolor: '#f1f5f9',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    maxHeight: '95vh', 
    overflowY: 'auto',
};

type AddAwadModalProps = {
    refecht: (options?: RefetchOptions) => Promise<QueryObserverResult<AwardsResponseType | undefined, Error>>
    raffleDate: string | undefined
}

function AddAwadModal( { refecht, raffleDate } : AddAwadModalProps) {

    const { raffleId } = useParams<{ raffleId: string }>();
    
    const navigate = useNavigate()

    const queryParams = new URLSearchParams(location.search)
    const modalAddAward = queryParams.get('newAward')
    const show = modalAddAward === 'true'

    //Form

    const initialValues: AwardFormType = {
        name: '',
        playDate: dayjs(raffleDate) || dayjs().startOf('day')
    };

    const { handleSubmit, register, reset, formState: {errors}, watch, setValue} = useForm({
        defaultValues: initialValues
    })

    const { mutate, isPending } = useMutation({
        mutationFn: createAward,
        onError: (error) => {
            toast.error(error.message)
        },
        onSuccess: (data) => {
            toast.success(data)
            reset()
            refecht()
            navigate(location.pathname, {replace: true})
        }
    })

    const handleAddAward = (formData: AwardFormType) => {
        if (raffleDate && dayjs(formData.playDate).isAfter(dayjs(raffleDate))) {
            toast.error("La fecha del premio no puede ser posterior a la fecha de la rifa.");
            return;
        }

        const data = {
            raffleId: raffleId!,
            awardData: formData
        };
        mutate(data);
    };

    useEffect(() => {
        if (show) {
            reset({
                name: '',
                playDate: dayjs(raffleDate) || dayjs().startOf('day')
            });
        }
    }, [show, raffleDate, reset]);

    return (
        <Modal
            open={show}
            onClose={() => {
                navigate(location.pathname, {replace: true})
            }}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
            <ButtonCloseModal/>

            <h2 className='mb-5 text-xl font-semibold text-center'>Agrega un premio nuevo</h2>

            <form 
                className='flex flex-col gap-4'
                onSubmit={handleSubmit(handleAddAward)}
            >
                <AwardForm
                    register={register}
                    errors={errors}
                    watch={watch}
                    setValue={setValue}
                />

                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={isPending}
                >
                    Crear Premio
                </Button>
            </form>
            
            </Box>
        </Modal>
    )
}

export default AddAwadModal
