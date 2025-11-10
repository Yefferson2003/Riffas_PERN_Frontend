import { Box, Button, Modal } from "@mui/material";
import { QueryObserverResult, RefetchOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from "dayjs";
import { useEffect } from "react";
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from "react-router-dom";
import { toast } from 'react-toastify';
import { getAwardById, updateAward } from '../../../../api/awardsApi';
import { AwardFormType, AwardsResponseType } from '../../../../types';
import ButtonCloseModal from '../../../ButtonCloseModal';
import AwardForm from "./AwardForm";

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

type UpdateAwadModalProps = {
    refecht: (options?: RefetchOptions) => Promise<QueryObserverResult<AwardsResponseType | undefined, Error>>
    raffleDate: string | undefined
    raffleColor?: string
}

function UpdateAwadModal( { refecht, raffleDate, raffleColor = '#1976d2' } : UpdateAwadModalProps) {

    const { raffleId } = useParams<{ raffleId: string }>();
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    const queryParams = new URLSearchParams(location.search)
    const modalUpdateAward = queryParams.get('updateAward')
    const show = modalUpdateAward ? true : false
    const awardId = modalUpdateAward!

    const { data } = useQuery({
        queryKey: ['award', awardId],
        queryFn: () => getAwardById({raffleId: raffleId!, awardId}),
        enabled: show
    })


    //Form

    const initialValues: AwardFormType = {
        name: data?.name || '',
        playDate: dayjs(raffleDate) || dayjs().startOf('day')
    };

    const { handleSubmit, register, reset, formState: {errors}, watch, setValue} = useForm({
        defaultValues: initialValues
    })

    const { mutate, isPending } = useMutation({
        mutationFn: updateAward,
        onError: (error) => {
            toast.error(error.message)
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({queryKey: ['award', awardId]})
            toast.success(data)
            reset()
            refecht()
            navigate(location.pathname, {replace: true})
        }
    })

    const handleUpdateAward = (formData: AwardFormType) => {
        if (raffleDate && dayjs(formData.playDate).isAfter(dayjs(raffleDate))) {
            toast.error("La fecha del premio no puede ser posterior a la fecha de la rifa.");
            return;
        }

        const data = {
            raffleId: raffleId!,
            awardData: formData,
            awardId
        };
        mutate(data);
    };

    useEffect(() => {
        if (data) {
            reset({
                name: data?.name || '',
                playDate: dayjs(raffleDate) || dayjs().startOf('day')
            });
        }
    }, [show, raffleDate, reset, data]);

    if (data) return (
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

            <h2 
                className='mb-5 text-xl font-semibold text-center'
                style={{ color: raffleColor }}
            >
                Actualiza el premio
            </h2>

            <form 
                className='flex flex-col gap-4'
                onSubmit={handleSubmit(handleUpdateAward)}
            >
                <AwardForm
                    register={register}
                    errors={errors}
                    watch={watch}
                    setValue={setValue}
                    raffleColor={raffleColor}
                />

                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={isPending}
                    sx={{
                        backgroundColor: raffleColor,
                        '&:hover': {
                            backgroundColor: raffleColor,
                            opacity: 0.9,
                        },
                    }}
                >
                    Actualizar Premio
                </Button>
            </form>
            
            </Box>
        </Modal>
    )
}

export default UpdateAwadModal
