import * as recovery from '../../src/lib/submission-recovery.mjs';
export function memorySubmissionStorage() {
  const values=new Map();
  return {getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};
}
export function recoveryDependencies(storage=memorySubmissionStorage()) { return {...recovery,browserSubmissionStorage:()=>storage}; }
