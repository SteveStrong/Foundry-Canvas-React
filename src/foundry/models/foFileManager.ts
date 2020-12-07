import { Tools } from './foTools';
import { PubSub } from './foPubSub';
import { foInstance } from './foInstance.model';

import { saveAs } from 'file-saver';

// Feature detect + local reference
export let clientStorage = (function() {
    const uid = (new Date()).toISOString();
    try {
        localStorage.setItem(uid, uid);
        const result = localStorage.getItem(uid) === uid;
        localStorage.removeItem(uid);
        return result && localStorage;
    } catch (exception) { }
}());

export class fileSpec {
    payload: string;
    name: string;
    ext: string;

    constructor(payload: any, name: string, ext: string) {
        this.payload = payload;
        this.name = name;
        this.ext = ext;
    }

    get filename() {
        return `${this.name}${this.ext}`;
    }

    static setFilenameExt(filenameExt: string, defaultExt?: string) {
        const list = filenameExt.split('.');
        let name: string;
        let ext: string;

        if ( list.length === 1) {
            name = filenameExt;
            ext = defaultExt;
        } else {
            ext = list[list.length - 1];
            name = filenameExt.replace(ext, '');
        }
        return new fileSpec('', name, ext);
    }
}

export class foFileManager {
    isTesting = false;
    files: any = {};

    constructor(test: boolean = false) {
        this.isTesting = test;
    }

    private writeBlobFile(blob, filenameExt: string, onSuccess?, onFail?) {
      try {
        saveAs(blob, filenameExt);
        onSuccess && onSuccess();
      } catch (ex) {
        onFail && onFail(ex.error);
      }
    }

    private readBlobFile(file, onComplete: (item: any) => void) {
        const reader = new FileReader();
        reader.onload = (evt) => {
            const payload = evt.target.result as any;
            if (onComplete) {
                onComplete(payload);
            }
        };
        reader.readAsText(file);
    }

    private writeBlobLocal(blob, filenameExt: string, onSuccess?, onFail?) {
        this.files[filenameExt] = blob;
        onSuccess && onSuccess();
    }

    private readBlobLocal(filenameExt: string, onSuccess?: (item: any) => void, onFail?) {
        const reader = new FileReader();
        const blob = this.files[filenameExt];

        if (blob) {
            reader.readAsText(blob);
            reader.onload = (evt) => {
                const result = evt.target.result;
                onSuccess && onSuccess(result);
            };
        } else {
            onFail && onFail();
        }
    }

    writeTextAsBlob(payload, name: string, ext: string = '.json', onSuccess?: (item: string) => void) {
        const filenameExt = `${name}${ext}`;
        const data = Tools.isString(payload) ? payload : JSON.stringify(payload, undefined, 3);
        const blob = new Blob([data], { type: 'text/plain;charset=utf-8' });
        if (this.isTesting) {
            this.writeBlobLocal(blob, filenameExt, onSuccess);
        } else {
            this.writeBlobFile(blob, filenameExt, onSuccess);
        }
    }

    readTextAsBlob(name: string | File, ext: string = '.json', onSuccess?) {
        const filenameExt = `${name}${ext}`;
        if (this.isTesting) {
            this.readBlobLocal(filenameExt, onSuccess);
        } else {
            this.readBlobFile(name, onSuccess);
        }
    }

    rehydrationTest(instance: foInstance, deep: boolean = true, done: (obj: any) => void) {
        const source = instance.createdFrom();
        const body = instance.deHydrate();

        const data = JSON.stringify(body);
        const json = JSON.parse(data);
        const result = source.makeComponent(undefined, json);
        done(result);

        return instance.isEqualTo(result, deep);
    }

    integretyTest(instance: foInstance, deep: boolean = true, done: (obj: any) => void) {
        this.isTesting = true;
        const ext = '.json';
        const fileName = instance.myGuid;

        const source = instance.createdFrom();
        const body = instance.deHydrate();
        const data = JSON.stringify(body);

        this.writeTextAsBlob(data, fileName, ext, () => {
            this.readTextAsBlob(fileName, ext, item => {
                const json = JSON.parse(item);
                const result = source.makeComponent(undefined, json);
                done(result);
            });
        });
    }

    writeTextFileAsync(payload, name, ext, onComplete: (item: fileSpec) => void) {
        this.writeTextAsBlob(payload, name, ext);
        const result = new fileSpec(payload, name, ext);
        onComplete && onComplete(result);

        PubSub.Pub('textFileSaved', [result]);
    }

    readTextFileAsync(file, ext, onComplete: (item: fileSpec) => void) {
        this.readTextAsBlob(file, ext, (payload) => {

            const filename = file.name;
            const name = filename.replace(ext, '');

            const result = new fileSpec(payload, name, ext);

            onComplete && onComplete(result);
            PubSub.Pub('textFileDropped', [result]);
        });
    }

    readImageFileAsync(file, ext, onComplete: (item: fileSpec) => void) {
        const reader = new FileReader();
        reader.onload = (evt) => {
            const filename = file.name;
            const name = filename.replace(ext, '');
            const payload = evt.target.result as any;
            const result = new fileSpec(payload, name, ext);
            onComplete && onComplete(result);
            PubSub.Pub('imageFileDropped', [result]);
        };
        reader.readAsDataURL(file);
    }


    userOpenFileDialog(onComplete: (item: fileSpec) => void, defaultExt: string, defaultValue: string) {

        // http://stackoverflow.com/questions/181214/file-input-accept-attribute-is-it-useful
        // accept='image/*|audio/*|video/*'
        const accept = defaultExt || '.knt,.csv';

        const fileSelector = document.createElement('input');
        fileSelector.setAttribute('type', 'file');
        fileSelector.setAttribute('accept', accept);
        fileSelector.setAttribute('value', defaultValue);
        fileSelector.setAttribute('style', 'visibility: hidden; width: 0px; height: 0px');
        // fileSelector.setAttribute('multiple', 'multiple');
        document.body.appendChild(fileSelector);

        fileSelector.onchange = (event) => {
            const extensionExtract = /\.[0-9a-z]+$/i;

            const files = fileSelector.files;
            const count = files.length;
            const file = count > 0 && files[0];
            const extension = file ? file.name.match(extensionExtract) : [''];
            const ext = extension[0];
            document.body.removeChild(fileSelector);
            if (!file) {

            } else if (file.type.startsWith('image')) {
                this.readImageFileAsync(file, ext, onComplete);
            } else if (
                Tools.matches(ext, '.knt') ||
                Tools.matches(ext, '.csv') ||
                Tools.matches(ext, '.json') ||
                Tools.matches(ext, '.txt')) {
                this.readTextFileAsync(file, ext, onComplete);
            }
        };

        fileSelector.click && fileSelector.click();
    }
}

