import test from 'node:test';
import assert from 'node:assert/strict';
import { readSubmissionRecovery, saveSubmissionRecovery, clearSubmissionRecovery } from '../src/lib/submission-recovery.mjs';
import { memorySubmissionStorage } from './helpers/submission-storage.mjs';
const value={payload:{submissionId:'bb189bc0-1c1d-4cca-8400-44acb47fbda8',name:'Pessoa Teste'},form:{profile:{name:'Pessoa Teste'},answers:{revenue:'100.000'}}};
test('recuperação da mesma aba mantém UUID e payload congelado após recriar cliente',()=>{
 const storage=memorySubmissionStorage();assert.equal(saveSubmissionRecovery('financial-cmv',value,storage),true);
 assert.deepEqual(readSubmissionRecovery('financial-cmv',storage),{version:1,...value});
 assert.equal(readSubmissionRecovery('financial-breakeven',storage),null);
 clearSubmissionRecovery('financial-cmv',storage);assert.equal(readSubmissionRecovery('financial-cmv',storage),null);
});
test('corrupção, dados fora do limite e tokens antirrobô não entram na recuperação',()=>{
 const storage=memorySubmissionStorage();
 assert.equal(saveSubmissionRecovery('financial-cmv',{...value,payload:{...value.payload,antiBot:{token:'segredo'}}},storage),false);
 for(const raw of ['{',JSON.stringify({version:1,payload:value.payload,form:{profile:null}}),'x'.repeat(50001)]){
  storage.setItem('rook:submission:v1:financial-cmv',raw);assert.equal(readSubmissionRecovery('financial-cmv',storage),null);
 }
 assert.equal(saveSubmissionRecovery('financial-cmv',value,{setItem(){throw new Error('negado');}}),false);
});
