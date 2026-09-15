import type {Metadata} from 'next';
import {siteUrl} from '@/lib/site-origin';
import ConsultativeExperience from '@/components/acquisition/ConsultativeExperience';
export const metadata:Metadata={alternates: {canonical: siteUrl("/assistente/")},title:'Assistente Rook — entenda seus números',description:'Analise seu CMV, estime o ponto de equilíbrio e converse sobre a sua operação.'};
export default function Page({searchParams}:{searchParams:{intencao?:string;preview?:string}}){
 const intent=searchParams.intencao==='cmv'?'cmv':searchParams.intencao==='breakeven'?'breakeven':'demo';
 return <ConsultativeExperience initialIntent={intent} preview={process.env.NEXT_PUBLIC_ENV==='homolog'&&searchParams.preview==='1'}/>;
}
