import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import useMediaQuery from '@mui/material/useMediaQuery';

declare module '@mui/material/styles' {
  interface Palette {
    custom: Palette['primary'];
  }

  // allow configuration using `createTheme`
  interface PaletteOptions {
    custom?: PaletteOptions['primary'];
  }
}

// Update the AppBar's color prop options
declare module '@mui/material/AppBar' {
  interface AppBarPropsColorOverrides {
    custom: true;
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    custom: true;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsColorOverrides {
    custom: true;
  }
}

declare module '@mui/material/MenuItem' {
  interface MenuItemPropsColorOverrides {
    custom: true;
  }
}

declare module '@mui/material/styles' {
  interface TypographyVariants {
    poster: React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    poster?: React.CSSProperties;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    poster: true;
  }
}

type ThemeProp = {
  children: JSX.Element
}

export default function ThemeConfig ({children}:ThemeProp) {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = createTheme({
    palette: {
      mode: prefersDarkMode ? 'dark' : 'light',
      custom: {
        light: '#FFFFFF',
        main: '#FFFFFF',
        dark: '#000000',
        contrastText: '#333333',
      },
    },
    typography: {
      poster: {
        color: 'red',
      },
    },
  });

  return (
        <ThemeProvider theme={theme}>
          <CssBaseline />
            {children}
        </ThemeProvider>
        )
}