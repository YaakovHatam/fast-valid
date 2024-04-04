import { FormGroup, ValidationErrors } from "@angular/forms";
import { IIndex } from "./rules-engine-types";

//@ts-ignore
export function resolveFormPathFollow(strings, ...vals) {
    return vals[0].replace('[]', vals[1]);
}

export function resolveEventPathParam(formJsonPath: string | undefined, formPath: string | string[] | undefined, filterErrorValue: boolean, errorAtIndex: IIndex | undefined): string[] {

    let controlPaths: string[];
    if (formJsonPath) {
        if (errorAtIndex === undefined) { errorAtIndex = [] }
        controlPaths = extractTemplatePath(formJsonPath, filterErrorValue, errorAtIndex)
    }
    else {
        if (formPath && !Array.isArray(formPath)) {
            controlPaths = [formPath]
        } else {
            controlPaths = Array.isArray(formPath) ? formPath : [];
        }
    }
    return controlPaths;
}


export function removeErrorFromControllers(controlPaths: string[], f: FormGroup, eventType: string) {
    controlPaths.forEach(controlPath => {
        const control = f.get(controlPath);
        if (!control?.errors) return;

        const errors: ValidationErrors = filterOutErrorsByType(control.errors, eventType)

        // console.log('errors', errors);

        control.setErrors(Object.keys(errors).length == 0 ? null : errors);

    });



}

export function filterOutErrorsByType(errors: ValidationErrors, eventType: string): ValidationErrors {
    return Object.assign({}, ...Object.entries(errors)
        .filter(([k, v]) => k !== eventType).map(([k, v]) => ({ [k]: v })));
}

export function extractTemplatePath(formJsonPath: string, filterErrorValue: boolean, errorAtIndex: IIndex | undefined): string[] {
    if (errorAtIndex === undefined) { return [] }
    return Object.entries(errorAtIndex)
        .filter(([key, val]) => val === filterErrorValue)
        .map(([key, val]) => resolveFormPathFollow`${formJsonPath} ${key}`);

}