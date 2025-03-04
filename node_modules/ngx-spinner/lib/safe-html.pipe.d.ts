import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { PipeTransform } from "@angular/core";
import * as i0 from "@angular/core";
export declare class SafeHtmlPipe implements PipeTransform {
    private sanitizer;
    constructor(sanitizer: DomSanitizer);
    transform(value: string | null | undefined): SafeHtml;
    static ɵfac: i0.ɵɵFactoryDeclaration<SafeHtmlPipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<SafeHtmlPipe, "safeHtml", true>;
}
