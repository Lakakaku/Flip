import React, { forwardRef, createContext, useContext } from 'react';
import type { FieldError } from 'react-hook-form';
import { cn } from '@/lib/utils';

// Form item context for connecting label, input, and error message
interface FormItemContextValue {
  id: string;
}

const FormItemContext = createContext<FormItemContextValue>({} as FormItemContextValue);

const useFormItem = () => {
  const context = useContext(FormItemContext);
  if (!context) {
    throw new Error('useFormItem must be used within a FormItem');
  }
  return context;
};

// Form Item - wraps label, input, and error
interface FormItemProps extends React.HTMLAttributes<HTMLDivElement> {}

const FormItem = forwardRef<HTMLDivElement, FormItemProps>(
  ({ className, ...props }, ref) => {
    const id = React.useId();
    return (
      <FormItemContext.Provider value={{ id }}>
        <div ref={ref} className={cn('space-y-2', className)} {...props} />
      </FormItemContext.Provider>
    );
  }
);
FormItem.displayName = 'FormItem';

// Form Label
interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const FormLabel = forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ className, ...props }, ref) => {
    const { id } = useFormItem();
    return (
      <label
        ref={ref}
        className={cn(
          'text-sm font-medium leading-none text-gray-700 dark:text-gray-300',
          'peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
          className
        )}
        htmlFor={id}
        {...props}
      />
    );
  }
);
FormLabel.displayName = 'FormLabel';

// Form Control - wrapper for input components
interface FormControlProps extends React.HTMLAttributes<HTMLDivElement> {}

const FormControl = forwardRef<HTMLDivElement, FormControlProps>(
  ({ ...props }, ref) => {
    const { id } = useFormItem();
    return (
      <div ref={ref} {...props}>
        {React.Children.map(props.children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, { id } as any);
          }
          return child;
        })}
      </div>
    );
  }
);
FormControl.displayName = 'FormControl';

// Form Message - for error and description text
interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  error?: FieldError | undefined;
}

const FormMessage = forwardRef<HTMLParagraphElement, FormMessageProps>(
  ({ className, children, error, ...props }, ref) => {
    const body = error ? String(error.message) : children;

    if (!body) {
      return null;
    }

    return (
      <p
        ref={ref}
        className={cn(
          'text-sm',
          error ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400',
          className
        )}
        {...props}
      >
        {body}
      </p>
    );
  }
);
FormMessage.displayName = 'FormMessage';

export { FormItem, FormLabel, FormControl, FormMessage };