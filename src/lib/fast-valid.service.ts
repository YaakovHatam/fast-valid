import { Injectable } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { RuleProperties, Engine, Rule, Almanac, RuleResult, Event } from 'json-rules-engine';
import { extractTemplatePath, filterOutErrorsByType, removeErrorFromControllers, resolveEventPathParam } from './engine/rules-engine-form-helpers';
import { EventWithIndex } from './engine/rules-engine-types';
import { falsyValuesOperator } from './engine/custom-operators';
import { EngineOperators } from './engine-operators';
import { RuleDefinition } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class FastValidService {

  private DEBUG_MODE = false;

  constructor() { }

  /**
   * 
   * @param mode set true/false for debug mode
   */
  DebugMode(mode: boolean) {
    this.DEBUG_MODE = mode;

  }

  private getEngine() {
    /*const engine = new Engine(undefined, {
      allowUndefinedFacts: false
    });*/
    const engine = new Engine();
    engine.addOperator(EngineOperators.notEmpty, falsyValuesOperator);
    return engine;
  }

  private handleErrorForRoot(event: EventWithIndex, f: FormGroup, hasError: boolean) {
    const controlsObject: any[] = [];
    if (event.params?.registerErrorOn) {
      controlsObject.push(...this.resolveControls(f, event.params.registerErrorOn));
    } else {
      controlsObject.push(f);
    }

    controlsObject.forEach(c => this.setErrorsForControl(c, hasError, event.type))
  }

  private setErrorsForControl(f: FormControl, hasError: boolean, eventType: string) {
    let errors = {
      ...f.errors,
      [eventType]: hasError
    };

    if (!hasError) delete errors[eventType];
    if (Object.keys(errors).length == 0)
      f.setErrors(null);
    else
      f.setErrors(errors);
  }

  private resolveControls(f: FormGroup, controlsPath: string[]) {
    const paths = controlsPath.flat(Infinity) as string[];

    return paths.map(controlPath => {
      const control = f.get(controlPath.replace('$.', ''));
      if (control === null) {
        console.error('not found control', controlPath);
      };
      return control;
    });
  }

  public rulesEngineRun(f: FormGroup, rules: RuleDefinition[]) {
    const that = this;
    const engine = this.getEngine();
    rules.map(rule => engine.addRule(rule));

    engine.on('failure', function (event: Event, almanac: Almanac, ruleResult: RuleResult) {
      console.log('failure', event, almanac, ruleResult);
      that.handleErrorForRoot(event as EventWithIndex, f, true)

    });

    engine.on('success', function (event: Event, almanac: any, ruleResult: any) {
      console.log('success', event, almanac, ruleResult);
      that.handleErrorForRoot(event as EventWithIndex, f, false)
    });

    console.log('form raw data', f.value);
    const data = f.value;
    // 'main' will be the key inside the rule engine for the form  root
    return engine.run({ 'main': data }).then(() => engine.stop())
  }
}