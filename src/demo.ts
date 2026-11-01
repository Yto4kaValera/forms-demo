import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

export type Log = (line: string) => void;
let out: Log = (s) => console.log(s);
export function traced(label: string, fn: ValidatorFn): ValidatorFn {
  return (c: AbstractControl): ValidationErrors | null => {
    const result = fn(c);
    out(`${label}(${JSON.stringify(c.value)}) -> ${JSON.stringify(result)}`);
    return result;
  };
}

export const noSpaces: ValidatorFn = (c) => (/\s/.test(c.value ?? '') ? {noSpaces: true} : null);

export const forbiddenName: ValidatorFn = (c) =>
  c.value === 'admin' ? {forbiddenName: true} : null;

export function createTree() {
  out('создаём дерево');

  const name = new FormControl('', [
    traced('required', Validators.required),
    traced('minLength(3)', Validators.minLength(3)),
    traced('noSpaces', noSpaces),
  ]);

  const form = new FormGroup(
    {name},
    {
      validators: traced('groupValidator', (g) =>
        g.get('name')!.value === 'admin' ? {reserved: true} : null,
      ),
    },
  );
  return {name, form};
}

export function logStatusChanges(name: AbstractControl, form: AbstractControl, prefix = ''): void {
  name.statusChanges.subscribe((s) => out(`[statusChanges] ${prefix}name -> ${s}`));
  form.statusChanges.subscribe((s) => out(`[statusChanges] ${prefix}form -> ${s}`));
}

export function summary(name: AbstractControl, form: AbstractControl): string {
  return (
    `ИТОГ  name: ${name.status} ${JSON.stringify(name.errors)}` +
    `form: ${form.status} ${JSON.stringify(form.errors)}  value=${JSON.stringify(form.value)}`
  );
}
