import { Component, Input } from "@angular/core";

@Component({
    selector: 'awscognito-mfa',
    templateUrl: './mfa.html'
})
export class MFAComponent {
    @Input() destination: string;
    @Input() onSubmit: (code: string) => void;

    constructor() {
        console.log("MFAComponent constructor");
    }
}
