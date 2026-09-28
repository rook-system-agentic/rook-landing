export interface SubmissionRecovery {version:1;payload:Record<string,unknown>;form:Record<string,unknown>}
export function readSubmissionRecovery(key:string,storage:Storage|undefined):SubmissionRecovery|null;
export function saveSubmissionRecovery(key:string,value:{payload:Record<string,unknown>;form:Record<string,unknown>},storage:Storage|undefined):boolean;
export function clearSubmissionRecovery(key:string,storage:Storage|undefined):void;
export function browserSubmissionStorage():Storage|undefined;
