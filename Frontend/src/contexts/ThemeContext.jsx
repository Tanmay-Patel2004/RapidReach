import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
} from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

// Create context
export const ThemeContext = createContext();

// Custom hook to use theme context
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  // Check if dark mode was previously set
  const savedThemeMode = localStorage.getItem("themeMode");
  const [mode, setMode] = useState(savedThemeMode || "light");

  // Toggle theme function
  const toggleTheme = () => {
    const newMode = mode === "light" ? "dark" : "light";
    setMode(newMode);
    localStorage.setItem("themeMode", newMode);
  };

  // Define theme object
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: mode === "light" ? "#1976d2" : "#90caf9",
            light: mode === "light" ? "#42a5f5" : "#bbdefb",
            dark: mode === "light" ? "#1565c0" : "#64b5f6",
            contrastText: mode === "light" ? "#fff" : "#000",
          },
          secondary: {
            main: mode === "light" ? "#f50057" : "#f48fb1",
          },
          background: {
            default: mode === "light" ? "#f5f5f5" : "#121212",
            paper: mode === "light" ? "#ffffff" : "#1e1e1e",
            alternate: mode === "light" ? "#f0f7ff" : "#1a2027",
            gradient:
              mode === "light"
                ? "linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)"
                : "linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)",
          },
          text: {
            primary:
              mode === "light"
                ? "rgba(0, 0, 0, 0.87)"
                : "rgba(255, 255, 255, 0.87)",
            secondary:
              mode === "light"
                ? "rgba(0, 0, 0, 0.6)"
                : "rgba(255, 255, 255, 0.6)",
            disabled:
              mode === "light"
                ? "rgba(0, 0, 0, 0.38)"
                : "rgba(255, 255, 255, 0.38)",
          },
          divider:
            mode === "light"
              ? "rgba(0, 0, 0, 0.12)"
              : "rgba(255, 255, 255, 0.12)",
          alert: {
            infoLight: mode === "light" ? "#e3f2fd" : "#0d47a1",
            warningLight: mode === "light" ? "#fff8e1" : "#b71c1c",
            successLight: mode === "light" ? "#e8f5e9" : "#1b5e20",
            errorLight: mode === "light" ? "#ffebee" : "#b71c1c",
          },
        },
        shape: {
          borderRadius: 8,
        },
        typography: {
          fontFamily: [
            "Inter",
            "-apple-system",
            "BlinkMacSystemFont",
            '"Segoe UI"',
            "Roboto",
            "Arial",
            "sans-serif",
          ].join(","),
          h1: {
            fontWeight: 700,
          },
          h2: {
            fontWeight: 700,
          },
          h3: {
            fontWeight: 600,
          },
          h4: {
            fontWeight: 600,
          },
          h5: {
            fontWeight: 500,
          },
          h6: {
            fontWeight: 500,
          },
          subtitle1: {
            fontWeight: 400,
            lineHeight: 1.5,
          },
          body1: {
            fontWeight: 400,
          },
          button: {
            fontWeight: 500,
            textTransform: "none",
          },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                textTransform: "none",
                padding: "8px 16px",
                boxShadow:
                  mode === "light" ? "0 1px 2px rgba(0,0,0,0.1)" : "none",
                "&:hover": {
                  boxShadow:
                    mode === "light" ? "0 2px 4px rgba(0,0,0,0.15)" : "none",
                },
              },
              contained: {
                "&:hover": {
                  boxShadow:
                    mode === "light"
                      ? "0 3px 6px rgba(0,0,0,0.15)"
                      : "0 2px 4px rgba(0,0,0,0.3)",
                },
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: "none",
                boxShadow:
                  mode === "light"
                    ? "0 1px 3px rgba(0,0,0,0.12)"
                    : "0 1px 3px rgba(0,0,0,0.3)",
              },
              elevation1: {
                boxShadow:
                  mode === "light"
                    ? "0 1px 3px rgba(0,0,0,0.12)"
                    : "0 1px 3px rgba(0,0,0,0.3)",
              },
            },
          },
          MuiDataGrid: {
            styleOverrides: {
              root: {
                border: "none",
                "& .MuiDataGrid-cell": {
                  borderBottom:
                    mode === "light"
                      ? "1px solid rgba(0,0,0,0.1)"
                      : "1px solid rgba(255,255,255,0.1)",
                },
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: mode === "light" ? "#f5f5f5" : "#2c2c2c",
                  borderBottom: "none",
                },
                "& .MuiDataGrid-virtualScroller": {
                  backgroundColor: mode === "light" ? "#fff" : "#1e1e1e",
                },
              },
            },
          },
          MuiTextField: {
            styleOverrides: {
              root: {
                "& .MuiOutlinedInput-root": {
                  borderRadius: 8,
                },
              },
            },
          },
          MuiDialog: {
            styleOverrides: {
              paper: {
                borderRadius: 16,
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 16,
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
