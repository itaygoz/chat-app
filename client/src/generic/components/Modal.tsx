import { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';

const Modal = ({ closeFunc, children }: { closeFunc: () => void; children: ReactNode }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeFunc();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [closeFunc]);

  const handleOverlayClick = (e: any) => {
    if (e.target === e.currentTarget) {
      closeFunc();
    }
  };

  return (
    <div className="modal-container" onClick={handleOverlayClick}>
      {createPortal(<div className="modal">{children}</div>, document.body)}
    </div>
  );
};

export default Modal;
