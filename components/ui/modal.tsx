import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { X } from './icons';

interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
interface ModalContentProps extends React.HTMLAttributes<HTMLDivElement> {}
interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ className, open, onClose, size = 'md', children, ...props }, ref) => {
    const sizes = {
      sm: 'max-w-md',
      md: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl'
    };

    if (!open) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
          aria-hidden="true"
        />
        
        {/* Modal */}
        <div
          ref={ref}
          className={cn(
            'relative w-full mx-4 bg-white dark:bg-gray-900 rounded-lg shadow-xl',
            sizes[size],
            className
          )}
          {...props}
        >
          <button
            className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
          {children}
        </div>
      </div>
    );
  }
);
Modal.displayName = 'Modal';

const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    />
  )
);
ModalHeader.displayName = 'ModalHeader';

const ModalContent = forwardRef<HTMLDivElement, ModalContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
);
ModalContent.displayName = 'ModalContent';

const ModalFooter = forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center justify-end gap-2 p-6 pt-0', className)}
      {...props}
    />
  )
);
ModalFooter.displayName = 'ModalFooter';

export default Modal;
export { Modal, ModalHeader, ModalContent, ModalFooter };