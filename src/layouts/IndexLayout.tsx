import MenuIcon from '@mui/icons-material/Menu';
import { Slide } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../hooks/useAuth';
import { azul } from '../utils';
import LoaderView from '../views/LoaderView';

interface Props {
    /**
     * Injected by the documentation to work in an iframe.
     * You won't need it on your project.
     */
    window?: () => Window;
    children?: React.ReactElement<unknown>;
}

const drawerWidth = 240;
const navConfig = {
    base: [
        { key: 'index', name: 'Inicio', url: '/' },
        { key: 'logout', name: 'Cerrar Sesión', url: '/' }
    ],
    responsable: [
        { key: 'index', name: 'Inicio', url: '/' },
        { key: 'users', name: 'Usuarios', url: '/users' },
        { key: 'clients', name: 'Clientes', url: '/clients' },
        { key: 'logout', name: 'Cerrar Sesión', url: '/' },
    ],
    admin: [
        { key: 'index', name: 'Inicio', url: '/' },
        { key: 'users', name: 'Usuarios', url: '/users' },
        { key: 'clients', name: 'Clientes', url: '/clients' },
        { key: 'payMethods', name: 'Métodos de Pago', url: '/pay-methods' },
        { key: 'logout', name: 'Cerrar Sesión', url: '/' },
    ]
};

function HideOnScroll(props: Props) {
    const { children, window } = props;
    // Note that you normally won't need to set the window ref as useScrollTrigger
    // will default to window.
    // This is only being set here because the demo is in an iframe.
    const trigger = useScrollTrigger({
        target: window ? window() : undefined,
    });

    return (
        <Slide appear={false} direction="down" in={!trigger}>
            {children ?? <div />}
        </Slide>
    );
}

export default function IndexLayout(props: Props) {
    const { window } = props;
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate()
    const { user, isError, isLoading} = useAuth()
    const token = localStorage.getItem('AUTH_TOKEN');

    const queryClient = useQueryClient()
    const logout = () => {
        localStorage.removeItem('AUTH_TOKEN');
        queryClient.removeQueries(); 
        navigate('/auth-login', { replace: true });
    };


    const handleNavigation = (item: { key: string, url: string }) => {
        if (item.key === 'logout') {
            logout();
            return;
        }
        navigate(item.url);
    };

    const handleDrawerToggle = () => {
        setMobileOpen((prevState) => !prevState);
    };

    const getNavItems = () => {
        if (user?.rol.name === 'admin') return navConfig.admin;
        if (user?.rol.name === 'responsable') return navConfig.responsable;
        return navConfig.base;
    };

    const drawer = (
        <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ my: 2 }}>
                RIFFAS
            </Typography>
            <Divider />
            <List>
                {getNavItems().map((item) => (
                    <ListItem key={item.key} disablePadding>
                        <ListItemButton sx={{ textAlign: 'center' }}
                            onClick={() => handleNavigation(item)}
                        >
                            <ListItemText primary={item.name} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );
    
    useEffect(() => {
        if (isError || (!user && !token)) {
            navigate('/auth-login', { replace: true });
        }
    }, [isError, navigate, user, token]);

    const container = window !== undefined ? () => window().document.body : undefined;
    
    if (isLoading) return <LoaderView/>

    if (user) return (
        <main>
        <Box sx={{ display: 'flex', width: '100%',}}>
        <CssBaseline />
        <HideOnScroll {...props}>
            <AppBar component="nav" sx={{bgcolor: azul}}>
                <Toolbar>
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={handleDrawerToggle}
                    sx={{ mr: 2, display: { sm: 'none' } }}
                >
                    <MenuIcon />
                </IconButton>
                <Typography
                    variant="h6"
                    component="div"
                    sx={{ flexGrow: 1, display: 'flex', gap: 1 }}
                    
                >
                    Bienvenido: <p className='capitalize'>{user.firstName}</p>
                </Typography>
                <Typography
                    variant="h5"
                    component="div"
                    sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
                >
                    RIFFAS
                </Typography>
                <Box sx={{ display: { xs: 'none', sm: 'block' }, }}>
                    {getNavItems().map((item) => (
                        <Button key={item.key} sx={{ color: '#fff' }}
                            onClick={() => handleNavigation(item)}
                        >
                            {item.name}
                        </Button>
                    ))}
                </Box>
                </Toolbar>
            </AppBar>
        </HideOnScroll>
        <nav>
            <Drawer
            container={container}
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
                keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
                display: { xs: 'block', sm: 'none' },
                '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
            >
            {drawer}
            </Drawer>
        </nav>
            <Box component="main" sx={{ p: 3, width: '100%' }}>
                <Toolbar />
                <Outlet context={user}/>   
            </Box>
            <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover={false}
                    theme="colored"
                />
        </Box>
        </main>
    );
}
