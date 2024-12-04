import styled from "@emotion/styled";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import { Box, CircularProgress, Collapse, IconButton, Modal, Paper, Table, TableBody, TableCell, tableCellClasses, TableContainer, TableHead, TableRow } from "@mui/material";
import React, { useState } from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { useUsersRaffle } from "../../hooks/useRaffle";
import { User, UserItemByRaffle } from "../../types";
import { formatDateTimeLarge } from "../../utils";
import ButtonCloseModal from "../ButtonCloseModal";
import ButtonDeleteAsingUser from "./ButtonDeleteAsingUser";
import SelectAsingUser from "./SelectAsingUser";

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 1000,
    maxWidth: '100vw',
    bgcolor: '#f1f5f9',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    maxHeight: '95vh', 
    overflowY: 'auto',
    
};

const StyledTableCell = styled(TableCell)(() => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: '#1446A0',
        color: 'white'
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

const StyledTableRow = styled(TableRow)(() => ({
    '&:nth-of-type(odd)': {
        
    },
    // hide last border
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

function Row (props: { row : UserItemByRaffle, raffleId: number}) {
    const { row, raffleId } = props;
    const [open, setOpen] = useState(false);


    return (
        <React.Fragment>
        <StyledTableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
            <StyledTableCell sx={{display: { xs: 'table-cell', md: 'none' }}}>
                <IconButton
                aria-label="expand row"
                size="small"
                onClick={() => setOpen(!open)}
                >
                {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                </IconButton>
            </StyledTableCell>
            <StyledTableCell component="th" scope="row">
                {row.user.firstName}
            </StyledTableCell>
            <StyledTableCell sx={{display: { xs: 'none', md: 'table-cell' }}}>
                <p className="capitalize">{row.user.lastName}</p>
            </StyledTableCell>
            <StyledTableCell sx={{display: { xs: 'none', md: 'table-cell' }}}>
                <p className="capitalize">{row.user.identificationType + ':'+ row.user.identificationNumber}</p>
            </StyledTableCell>
            <StyledTableCell sx={{display: { xs: 'none', md: 'table-cell' }}}>
                <p className="capitalize">{row.user.phone}</p>
            </StyledTableCell>
            <StyledTableCell sx={{display: { xs: 'none', md: 'table-cell' }}}>
                <p className="">{formatDateTimeLarge(row.assignedAt)}</p>
            </StyledTableCell>
            <StyledTableCell >
                <p className="capitalize">{row.role}</p>
            </StyledTableCell>
            <StyledTableCell align="center" sx={{display: { xs: 'none', md: 'table-cell' }}}>
                <ButtonDeleteAsingUser raffleId={raffleId} userId={row.user.id} />
            </StyledTableCell>
        </StyledTableRow>
            <StyledTableRow>
            <StyledTableCell style={{ paddingBottom: 0, paddingTop: 0 , background: '#f1f5f9'}} colSpan={3}>
                <Collapse in={open} timeout="auto" unmountOnExit>
                <div className="m-1 *:flex *:justify-between *:capitalize space-y-2">
                    <div>
                        <p>apellido</p> 
                        <p className="text-azul">{row.user.lastName}</p>
                    </div>
                    <div>
                        <p>identificacion</p>
                        <p className="text-azul">{row.user.identificationType + ':'+ row.user.identificationNumber}</p>
                    </div>
                    <div>
                        <p>teléfono</p> 
                        <p className="text-azul">{row.user.phone}</p>
                    </div>
                    <div>
                        <p>Fecha de Asignación</p> 
                        <p className="lowercase text-azul">{formatDateTimeLarge(row.assignedAt)}</p>
                    </div>
                    <div className="flex justify-between capitalize">
                        <p>acciones</p> 
                        <div>
                            <ButtonDeleteAsingUser raffleId={raffleId} userId={row.user.id} />
                        </div>
                    </div>
                    
                </div>
                </Collapse>
            </StyledTableCell>
            </StyledTableRow>
        </React.Fragment>
    );
}

type ViewUsersOfRaffleModalProps = {
    raffleId: number
}

function ViewUsersOfRaffleModal({raffleId} : ViewUsersOfRaffleModalProps) {
    const user : User = useOutletContext();
    // MODAL //
    const navigate = useNavigate(); 
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const modalViewUsers = queryParams.get('viewUsers')
    const show = modalViewUsers ? true : false;

    const {data, isLoading} = useUsersRaffle(raffleId, show)

    if (user.rol.name === 'admin') return (
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
            <h2 className="mb-5 text-2xl font-bold text-center text-azul">Usuarios de la Rifa</h2>
            <p className="mb-5 text-xl font-bold text-center">Podras visualizar, asignar y eliminar usuarios para esta rifa</p>

            <SelectAsingUser raffleId={raffleId}/>

            <div className="w-full text-center">
                {(isLoading && !data) && <CircularProgress/>}

                {data && data.length === 0 ? (
                    <p>No hay Usuarios</p>
                ) : (
                    <TableContainer component={Paper} sx={{ height: 300}} >
                        <Table 
                            aria-label="simple table" size="small" 
                            sx={{width: {sx: 'auto',md: '100%',}}}
                            stickyHeader
                        >
                            <TableHead>
                            <TableRow>
                                <StyledTableCell sx={{display: { xs: 'table-cell', md: 'none' }}}><TextSnippetIcon/></StyledTableCell>
                                <StyledTableCell>
                                    Nombre
                                </StyledTableCell>
                                <StyledTableCell sx={{display: { xs: 'none', md: 'table-cell' }}}>
                                    Apellido
                                </StyledTableCell>
                                <StyledTableCell sx={{display: { xs: 'none', md: 'table-cell' }}}>
                                    Identificación
                                </StyledTableCell>
                                <StyledTableCell sx={{display: { xs: 'none', md: 'table-cell' }}}>
                                    Teléfono
                                </StyledTableCell>
                                <StyledTableCell sx={{display: { xs: 'none', md: 'table-cell' }}}>
                                    Fecha de Asignación
                                </StyledTableCell>
                                <StyledTableCell sx={{MinWidth: {xs: 'auto', md: 300}}} >
                                    Rol
                                </StyledTableCell>
                                <StyledTableCell align="center" sx={{display: { xs: 'none', md: 'table-cell' }}}>
                                    Acciones
                                </StyledTableCell>
                            </TableRow>
                            </TableHead>
                            <TableBody>
                            
                            {data && data.map((row) => (
                                <Row key={row.id} row={row} raffleId={raffleId}/>
                            ))}
                            
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </div>
            </Box>
        </Modal>
    )
}

export default ViewUsersOfRaffleModal