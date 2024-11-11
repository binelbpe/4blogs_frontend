import React, { useEffect } from 'react';
import { COLORS, BUTTON_STYLES, CARD_STYLES } from '../constants/colors';

const Modal = ({ isOpen, onClose, onConfirm, title, message, type = 'danger' }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className={`${CARD_STYLES.base} p-6 max-w-sm w-full animate-fade-in-up`}>
        <h2 className={`text-xl font-semibold ${COLORS.text.primary} mb-4`}>
          {title}
        </h2>
        <p className={COLORS.text.secondary}>
          {message}
        </p>
        <div className="flex justify-end space-x-4 mt-6">
          <button onClick={onClose} className={BUTTON_STYLES.secondary}>
            Cancel
          </button>
          <button onClick={onConfirm} className={BUTTON_STYLES.primary}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal; 