import { Theme, ThemeProvider, createTheme } from '@mui/material/styles';
import _ from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';





interface MUIThemeProviderProps {
  children: React.ReactNode;
}
export const MUIThemeProvider = (props: MUIThemeProviderProps) => {
  const body = useMemo(() => {
    const body = document.querySelector("body");
    if(!body) throw new Error("Cannot find body element");
    return body;
  }, []);

  const extractMUIThemeFromBodyEl = useCallback(() => {
    const computedStyle = getComputedStyle(body);
    return createTheme({
      palette: {
        primary: {
          main: computedStyle.getPropertyValue('--color-accent-1').trim(),
        },
        // secondary: {},
      },
    });
  }, [body]);

  const [ theme, setTheme ] = useState<Theme>(extractMUIThemeFromBodyEl());
  
  useEffect(() => {
    const updateThemeColor = _.debounce(() => {
      setTheme(extractMUIThemeFromBodyEl())
    }, 100);

    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          updateThemeColor();
        }
      }
    });
    observer.observe(body, { attributes: true, attributeFilter: ['style'] });
  }, [body, extractMUIThemeFromBodyEl, theme]);


  return (
    <ThemeProvider theme={theme}>
      {props.children}
    </ThemeProvider>
  )
}