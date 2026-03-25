import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAlert } from '../context/AlertContext';
import { motion } from 'framer-motion';
import { Palette, Info } from 'lucide-react';

const Configuracion = () => {
  const { primaryColor, changePalette, colorPalettes } = useTheme();
  const { showAlert, showConfirm } = useAlert();

  const handlePaletteChange = (colorKey) => {
    showConfirm(
      `¿Deseas cambiar el tema principal de la aplicación a ${colorKey}?`,
      () => {
        changePalette(colorKey);
        showAlert('Tema actualizado exitosamente', 'success');
      }
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">Configuración del Sistema</h1>
        <p className="text-sm text-light-textMuted dark:text-dark-textMuted mt-1">
          Personaliza la apariencia y el comportamiento global.
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-light-surface dark:bg-dark-surface rounded-2xl p-6 shadow-soft border border-light-border dark:border-dark-border"
      >
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-light-border dark:border-dark-border">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Palette className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-semibold text-light-text dark:text-dark-text">Apariencia UI</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-medium text-light-text dark:text-dark-text mb-4">Paleta de Colores (Verdes)</h3>
            <div className="flex flex-wrap gap-4">
              {Object.keys(colorPalettes).map((key) => {
                const colors = colorPalettes[key];
                const isActive = primaryColor === key;
                return (
                  <button
                    key={key}
                    onClick={() => handlePaletteChange(key)}
                    className={`group relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
                      isActive ? 'ring-2 ring-offset-2 ring-primary scale-110 shadow-lg dark:ring-offset-dark-bg' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: colors.DEFAULT }}
                  >
                    {isActive && (
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-white text-primary rounded-full flex items-center justify-center shadow-md">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-light-textMuted dark:text-dark-textMuted mt-4 flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              Estos cambios se aplican automáticamente a botones, animaciones, sombras y resaltados en toda la aplicación.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Configuracion;
