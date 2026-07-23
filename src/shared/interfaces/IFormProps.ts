import type { FieldErrors, FieldValues } from 'react-hook-form';

export interface IFormProps<T extends FieldValues> {
    control: any;
    errors: FieldErrors<T>;
}