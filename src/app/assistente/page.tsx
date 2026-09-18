import type {Metadata} from 'next';
import {siteUrl} from '@/lib/site-origin';
export const metadata:Metadata={alternates: {canonical: siteUrl("/assistente/")},title:'Rook AI — entenda seus números',description:'Converse com o Rook AI sobre seu CMV, ponto de equilíbrio e os números da sua operação.'};
export default function Page(){
 return <section className="max-w-4xl mx-auto px-6 py-20 text-center">
  <p className="section-label mb-5">Rook AI · Assistente virtual</p>
  <h1 className="heading-hero mb-6">Uma conversa sobre a <em>sua operação.</em></h1>
  <p className="text-body max-w-2xl mx-auto mb-8">Tire dúvidas, entenda os números da sua casa e descubra o próximo passo. O chat acompanha você enquanto navega pelo site.</p>
  <a href="#data-asaflow-chat-open" data-asaflow-chat-open className="btn-primary">Conversar com o Rook AI</a>
 </section>;
}
