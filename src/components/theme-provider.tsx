
import { useEffect } from "react";
import { useThemeStore } from "@/store/theme-store";
import { useColorStore } from "@/store/color-store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();
  const { primaryColor, secondaryColor } = useColorStore();

  useEffect(() => {
    const root = window.document.documentElement;
    
    root.classList.remove("light", "dark");
    root.classList.add(theme);

    // Update the CSS variables for dynamic colors
    const primaryHsl = hexToHsl(primaryColor);
    const secondaryHsl = hexToHsl(secondaryColor);

    if (primaryHsl && secondaryHsl) {
      root.style.setProperty('--primary-h', primaryHsl.h.toString());
      root.style.setProperty('--primary-s', primaryHsl.s + '%');
      root.style.setProperty('--primary-l', primaryHsl.l + '%');
      
      root.style.setProperty('--secondary-h', secondaryHsl.h.toString());
      root.style.setProperty('--secondary-s', secondaryHsl.s + '%');
      root.style.setProperty('--secondary-l', secondaryHsl.l + '%');
    }
  }, [theme, primaryColor, secondaryColor]);

  return <>{children}</>;
}

// Helper function to convert hex to HSL
function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  // Remove the # if present
  hex = hex.replace(/^#/, '');

  // Parse the hex values
  let r, g, b;
  if (hex.length === 3) {
    r = parseInt(hex.charAt(0) + hex.charAt(0), 16) / 255;
    g = parseInt(hex.charAt(1) + hex.charAt(1), 16) / 255;
    b = parseInt(hex.charAt(2) + hex.charAt(2), 16) / 255;
  } else if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16) / 255;
    g = parseInt(hex.substring(2, 4), 16) / 255;
    b = parseInt(hex.substring(4, 6), 16) / 255;
  } else {
    return null; // Invalid hex
  }

  // Calculate HSL
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
      default: h = 0;
    }
  }

  return { 
    h: Math.round(h * 360), 
    s: Math.round(s * 100), 
    l: Math.round(l * 100) 
  };
}
