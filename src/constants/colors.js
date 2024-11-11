export const COLORS = {
  primary: {
    50: 'bg-primary-50',
    100: 'bg-primary-100',
    200: 'bg-primary-200',
    300: 'bg-primary-300',
    400: 'bg-primary-400',
    500: 'bg-primary-500',
    600: 'bg-primary-600',
    700: 'bg-primary-700',
    800: 'bg-primary-800',
    900: 'bg-primary-900'
  },
  text: {
    primary: 'text-primary-600 dark:text-primary-400',
    secondary: 'text-primary-700 dark:text-primary-300',
    accent: 'text-accent-600 dark:text-accent-400'
  },
  background: {
    light: 'bg-background-light',
    dark: 'bg-background-dark'
  },
  surface: {
    light: 'bg-surface-light',
    dark: 'bg-surface-dark'
  }
};

export const BUTTON_STYLES = {
  primary: `px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-500 
           hover:from-primary-700 hover:to-primary-600
           text-white rounded-lg shadow-sm hover:shadow-md
           dark:from-primary-700 dark:to-primary-500
           dark:hover:from-primary-600 dark:hover:to-primary-500
           disabled:opacity-50 disabled:cursor-not-allowed
           transform hover:-translate-y-0.5
           transition-all duration-200 ease-in-out`,
  secondary: `px-4 py-2 bg-white dark:bg-gray-800 
             text-gray-700 dark:text-gray-300 
             rounded-lg border border-gray-300 dark:border-gray-600
             hover:bg-gray-50 dark:hover:bg-gray-700
             shadow-sm hover:shadow-md
             transform hover:-translate-y-0.5
             transition-all duration-200 ease-in-out`,
  outline: `px-4 py-2 border-2 border-primary-500 dark:border-primary-400
           text-primary-600 dark:text-primary-400
           rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20
           transform hover:-translate-y-0.5
           transition-all duration-200 ease-in-out`
};

export const INPUT_STYLES = {
  base: `w-full px-4 py-2 rounded-lg
         border border-gray-300 dark:border-gray-600
         bg-white dark:bg-gray-800
         text-gray-900 dark:text-gray-100
         placeholder-gray-400 dark:placeholder-gray-500
         focus:ring-2 focus:ring-primary-500 focus:border-transparent
         dark:focus:ring-primary-400
         transition-colors duration-200`
};

export const CARD_STYLES = {
  base: `bg-surface-light dark:bg-surface-dark
         rounded-xl shadow-soft hover:shadow-soft-xl
         transition-all duration-300 ease-in-out`
}; 