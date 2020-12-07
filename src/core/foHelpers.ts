
import { FunctionComponent, ReactElement } from 'react';
import { RuntimeTypes, API_LIST_SEPARATOR, API_REFERENCE_KEY } from './runtime-type';




export class foHelpers {
    static prefix(obj: string): string {
        return obj && foHelpers.firstOf(obj.split('_'));
    }
    static isValidPrefix(obj: string): boolean {
        const prefix = foHelpers.prefix(obj);
        return RuntimeTypes.isRegisteredPrefix(prefix);
    }
    static isReference(obj: any): boolean {
        return typeof obj === 'string' && obj.startsWith(API_REFERENCE_KEY);
    }
    static textTruncate(str: string, length: number = 15, ending: string = '...') {
        if (str.length > length) {
            return str.substring(0, length - ending.length) + ending;
        } else {
            return str;
        }
    }

    static firstOf(list: any[]): string {
        if (list && list.length > 0) {
            return list[0];
        }
        return '';
    }
    static toJoin(list: any[]): string {
        if (list && list.length > 0) {
            return list.join(API_LIST_SEPARATOR);
        }
        return '';
    }
    static firstName(name: string): string {
        return foHelpers.firstOf(name.split(API_LIST_SEPARATOR));
    }
    static isEmpty(list: any[]): boolean {
        if (list && list.length > 0) {
            return false;
        }
        return true;
    }
    static isNotEmpty(list: any[]): boolean {
        return !foHelpers.isEmpty(list);
    }
    static isExpectedDocument(expected: string, documentName: string): boolean {
        return expected === foHelpers.prefix(documentName);
    }
    static computeViewPage(documentName: string, defaultPath: string = '#') {
        const prefix = foHelpers.prefix(documentName);
        return RuntimeTypes.computeDefaultRoute(prefix, documentName, defaultPath);
    }
}
