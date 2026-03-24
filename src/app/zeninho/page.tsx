import type { Metadata } from 'next';
import ZeninhoChat from '@/components/ZeninhoChat';

export const metadata: Metadata = {
    title: 'Zeninho - Assistente IA | TECHSUS',
    description: 'Assistente de inteligência artificial da TECHSUS para construção industrializada.',
};

export default function ZeninhoPage() {
    return <ZeninhoChat />;
}
