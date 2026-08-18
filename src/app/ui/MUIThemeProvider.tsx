import { Theme, ThemeProvider, createTheme } from '@mui/material/styles';
import { debounce } from 'es-toolkit/compat';
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

  const resolveAccentColor = useCallback(() => {
    // --color-accent-1 같은 토큰은 calc()가 남아있을 수 있으므로, probe 엘리먼트로 실제 색상값을 얻는다.
    const probe = createDiv();
    probe.setCssProps({
      display: "none",
      color: "var(--interactive-accent)",
    });
    body.appendChild(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  }, [body]);

  const extractMUIThemeFromBodyEl = useCallback(() => {
    return createTheme({
      palette: {
        mode: body.classList.contains('theme-dark') ? 'dark' : 'light',
        primary: {
          main: resolveAccentColor(),
        },
        // secondary: {},
      },
      components: {
        MuiPaper: {
          styleOverrides: {
            root: {
              color: "var(--text-normal)",
            },
          },
        },
      },
    });
  }, [body, resolveAccentColor]);

  const [ theme, setTheme ] = useState<Theme>(() => extractMUIThemeFromBodyEl());

  useEffect(() => {
    const updateThemeColor = debounce(() => {
      setTheme(extractMUIThemeFromBodyEl())
    }, 100);

    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'attributes' && (mutation.attributeName === 'class' || mutation.attributeName === 'style')) {
          updateThemeColor();
        }
      }
    });
    observer.observe(body, { attributes: true, attributeFilter: ['class', 'style'] });
    return () => {
      updateThemeColor.cancel();
      observer.disconnect();
    };
  }, [body, extractMUIThemeFromBodyEl]);


  return (
    <ThemeProvider theme={theme}>
      {props.children}
    </ThemeProvider>
  )
}