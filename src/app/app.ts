import {JsonPipe} from '@angular/common';
import {Component, Directive, afterNextRender, signal, viewChild} from '@angular/core';
import {
  AbstractControl,
  FormsModule,
  NG_VALIDATORS,
  NgForm,
  NgModel,
  ReactiveFormsModule,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import {createTree, forbiddenName, logStatusChanges, summary} from '../demo';

@Directive({
  selector: '[forbiddenName]',
  providers: [{provide: NG_VALIDATORS, useExisting: ForbiddenNameDirective, multi: true}],
})
export class ForbiddenNameDirective implements Validator {
  validate(c: AbstractControl): ValidationErrors | null {
    return forbiddenName(c);
  }
}

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule, FormsModule, ForbiddenNameDirective, JsonPipe],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly lines = signal<string[]>([]);

  private readonly tree = createTree();
  protected readonly form = this.tree.form;

  private readonly ngModel = viewChild(NgModel);
  private readonly ngForm = viewChild(NgForm);

  constructor() {
    logStatusChanges(this.tree.name, this.tree.form, 'reactive: ');
    this.tree.form.statusChanges.subscribe(() => this.print(summary(this.tree.name, this.tree.form)));

    afterNextRender(() => this.traceTemplateDriven());
  }
  protected onBeforeInput(kind: string): void {
    this.print(`\n(${kind})`);
  }

  private traceTemplateDriven(): void {
    const model = this.ngModel();
    const form = this.ngForm();
    if (!model || !form) return;

    const raw = (model as unknown as {_rawValidators?: Validator[]})._rawValidators ?? [];
    for (const v of raw) {
      if (typeof v?.validate !== 'function') continue;
      const label = v.constructor.name;
      const original = v.validate.bind(v);
      v.validate = (c: AbstractControl) => {
        const result = original(c);
        this.print(`      · ${label}.validate(${JSON.stringify(c.value)}) -> ${JSON.stringify(result)}`);
        return result;
      };
    }
    model.control.statusChanges.subscribe((s) => this.print(`   [statusChanges] template: name -> ${s}`));
    form.form.statusChanges.subscribe((s) => {
      this.print(`   [statusChanges] template: form -> ${s}`);
      this.print(summary(model.control, form.form));
    });
  }

  private print(s: string): void {
    console.log(s);
    queueMicrotask(() => this.lines.update((l) => [...l.slice(-300), s]));
  }
}
