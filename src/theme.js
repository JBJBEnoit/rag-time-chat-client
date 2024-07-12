import themeJSON from './theme.json'
import {createTheme} from '@mui/material/styles';

export const theme = createTheme(JSON.stringify(themeJSON));
