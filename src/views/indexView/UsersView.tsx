import styled from "@emotion/styled";
import EditIcon from '@mui/icons-material/Edit';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import { Button, CircularProgress, Collapse, FormControl, IconButton, MenuItem, Paper, Select, SelectChangeEvent, Table, TableBody, TableCell, tableCellClasses, TableContainer, TableHead, TablePagination, TableRow, Tooltip } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { Navigate, useNavigate, useOutletContext } from "react-router-dom";
import { getUsers } from "../../api/userApi";
import { User, UserItem } from "../../types";
import AddUserModal from "../../components/userView/AddUserModal";
import PasswordIcon from '@mui/icons-material/Password';
import { azul } from "../../utils";
import EditUserData from "../../components/userView/EditUserData";
import EditPasswordUserModal from "../../components/userView/EditPasswordUserModal";
import ButtonDeleteUser from "../../components/userView/ButtonDeleteUser";

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


function Row (props: { row: UserItem, filter: object, page: number, rowsPerPag: number }) {
    const { row, filter, page, rowsPerPag } = props;
    const [open, setOpen] = useState(false);
    const navigate = useNavigate()

    const handleNavigateEditUser = (id: number) => {
        navigate(`?editUser=${id}`)
    }
    const handleNavigateEditPasswordUser = (id: number) => {
        navigate(`?editPasswordUser=${id}`)
    }

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
                {row.firstName}
            </StyledTableCell>
            <StyledTableCell sx={{display: { xs: 'none', md: 'table-cell' }}}>
                <p className="capitalize">{row.lastName}</p>
            </StyledTableCell>
            <StyledTableCell sx={{display: { xs: 'none', md: 'table-cell' }}}>
                <p className="capitalize">{row.identificationType + ':'+ row.identificationNumber}</p>
            </StyledTableCell>
            <StyledTableCell sx={{display: { xs: 'none', md: 'table-cell' }}}>
                <p className="capitalize">{row.phone}</p>
            </StyledTableCell>
            <StyledTableCell sx={{display: { xs: 'none', md: 'table-cell' }}}>
                <p className="">{row.email}</p>
            </StyledTableCell>
            <StyledTableCell >
                <p className="capitalize">{row.rol.name}</p>
            </StyledTableCell>
            <StyledTableCell align="center" sx={{display: { xs: 'none', md: 'table-cell' }}}>
                <IconButton
                    onClick={() => handleNavigateEditUser(row.id)}
                >
                    <Tooltip title={'Editar usuario'}>
                        <EditIcon color="primary"/>
                    </Tooltip>
                </IconButton>
                <IconButton
                    onClick={() => handleNavigateEditPasswordUser(row.id)}
                >
                    <Tooltip title={'Cambiar Contraseña'}>
                        <PasswordIcon color="primary"/>
                    </Tooltip>
                </IconButton>
                <ButtonDeleteUser filter={filter} page={page} rowsPerPag={rowsPerPag}
                    userId={row.id}
                />
            </StyledTableCell>
        </StyledTableRow>
            <StyledTableRow>
            <StyledTableCell style={{ paddingBottom: 0, paddingTop: 0 , background: '#f1f5f9'}} colSpan={3}>
                <Collapse in={open} timeout="auto" unmountOnExit>
                <div className="m-1 *:flex *:justify-between *:capitalize space-y-2">
                    <div>
                        <p>apellido</p> 
                        <p className="text-azul">{row.lastName}</p>
                    </div>
                    <div>
                        <p>identificacion</p>
                        <p className="text-azul">{row.identificationType + ':'+ row.identificationNumber}</p>
                    </div>
                    <div>
                        <p>teléfono</p> 
                        <p className="text-azul">{row.phone}</p>
                    </div>
                    <div>
                        <p>correo</p> 
                        <p className="lowercase text-azul">{row.email}</p>
                    </div>
                    <div className="flex justify-between capitalize">
                        <p>acciones</p> 
                        <div>
                        <IconButton
                            onClick={() => handleNavigateEditUser(row.id)}
                        >
                            <Tooltip title={'Editar usuario'}>
                                <EditIcon color="primary"/>
                            </Tooltip>
                        </IconButton>
                        <IconButton
                            onClick={() => handleNavigateEditPasswordUser(row.id)}
                        >
                            <Tooltip title={'Cambiar Contraseña'}>
                                <PasswordIcon color="primary"/>
                            </Tooltip>
                        </IconButton>
                        <ButtonDeleteUser filter={filter} page={page} rowsPerPag={rowsPerPag} userId={row.id}/>
                        </div>
                    </div>
                    
                </div>
                </Collapse>
            </StyledTableCell>
            </StyledTableRow>
        </React.Fragment>
    );
}

function UsersView() {
    const user : User = useOutletContext();
    const navigate = useNavigate()
    const [filter, setFilter] = useState({});
    const [page, setPage] = useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = useState<number>(5);

    const handleFilterChange = (e : SelectChangeEvent<object | string>) => {
        const value = e.target.value;

        if (value === 'all') {
            setFilter({});
        } else if (value === 'vendedor') {
            setFilter({ vendedor: true });
        } else if (value === 'responsable') {
            setFilter({ responsable: true });
        }
    };

    const {data, isLoading, isError} = useQuery({
        queryKey: ['userList', filter, page, rowsPerPage],
        queryFn: () => getUsers({...filter, page: page + 1, limit: rowsPerPage})
    })

    const handleNavigateCreateUser = () => {
        navigate('?newUser=true')
    }
    
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); 
    };

    const handlePageChange = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    if (user.rol.name !== 'admin' && isError) return <Navigate to={'/404'}/>
    if (user.rol.name === 'admin') return (
        <section className="w-full text-center">
            <div className="flex flex-col items-center justify-between mb-10 lg:flex-row gap-y-5 ">
                <h2 className="text-3xl font-bold text-center underline uppercase lg:text-4xl lg:text-start text-azul  w-full max-w-[400px]">usuarios</h2> 

                <FormControl size="small"
                    sx={{width: '100%', maxWidth: 300}}
                >
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        variant="outlined"
                        value={Object.keys(filter)[0] || 'all'}
                        onChange={handleFilterChange}
                    >
                        <MenuItem value={'all'}>Todos</MenuItem>
                        <MenuItem value={'vendedor'}>Vendedores</MenuItem>
                        <MenuItem value={'responsable'}>Responsables</MenuItem>
                    </Select>
                </FormControl>
                
                <Button variant="contained"
                    onClick={handleNavigateCreateUser}
                    sx={{width: '100%', maxWidth: 300}}
                >
                    Crear Usuario
                </Button>
            </div>

            {(isLoading && !data) && <CircularProgress/>}

            {data &&
                <div className="w-full md:w-[80%] mx-auto">
                <TableContainer component={Paper} >
                    <Table aria-label="simple table" size="small" sx={{width: {sx: 'auto',md: '100%',}}}>
                        <TableHead>
                        <TableRow>
                            <StyledTableCell sx={{display: { xs: 'table-cell', md: 'none' }}}><TextSnippetIcon/></StyledTableCell>
                            <StyledTableCell  >Nombre</StyledTableCell>
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
                                Correo
                            </StyledTableCell>
                            <StyledTableCell sx={{MinWidth: {xs: 'auto', md: 300}}} >Rol</StyledTableCell>
                            <StyledTableCell align="center" sx={{display: { xs: 'none', md: 'table-cell' }}}>
                                Acciones
                            </StyledTableCell>
                        </TableRow>
                        </TableHead>
                        <TableBody>
                        
                        {data.users.map((row) => (
                            <Row key={row.id} row={row} filter={filter} page={page} rowsPerPag={rowsPerPage} />
                        ))}
                        
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    sx={{background: azul, color: 'white', textAlign: 'center'}}
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={ data.total}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handlePageChange}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
                </div>
            }
        <AddUserModal filter={filter} page={page} rowsPerPag={rowsPerPage}/>
        <EditUserData filter={filter} page={page} rowsPerPag={rowsPerPage}/>
        <EditPasswordUserModal filter={filter} page={page} rowsPerPag={rowsPerPage}/>
        </section>
    )
}

export default UsersView