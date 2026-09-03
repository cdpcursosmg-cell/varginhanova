
import React from 'react';
import { Member } from '../types';
import Modal from './common/Modal';

interface MembershipBookletModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
}

const DUES_CONFIG = {
    'Produtor': 50.00,
    'Apoiador': 25.00,
    'Honorário': 0.00,
    'default': 50.00
};

const MONTHS = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const PaymentSlip: React.FC<{ memberName: string; month: string; year: number; amount: number; dueDate: string; }> = ({ memberName, month, year, amount, dueDate }) => (
    <div className="border-2 border-black p-3 flex flex-col h-full text-[10px] break-inside-avoid bg-white">
        <div className="text-center border-b-2 border-dashed border-black pb-2 mb-2">
            <p className="font-black uppercase text-[10px]">ASSOCIAÇÃO COMUNITARIA UNIÃO DE SANTOS REIS</p>
            <p className="text-[8px] font-bold italic">Fazenda Mamonas - São João da Ponte - MG</p>
        </div>
        <div className="flex-grow space-y-1">
            <div className="flex justify-between">
                <span className="font-bold">Sócio:</span>
                <span className="truncate uppercase pl-2">{memberName}</span>
            </div>
            <div className="flex justify-between">
                <span className="font-bold">Mês/Ano:</span>
                <span>{month}/{year}</span>
            </div>
            <div className="flex justify-between">
                <span className="font-bold">Vencimento:</span>
                <span>{dueDate}</span>
            </div>
            <div className="flex justify-between items-baseline mt-2 border-t border-gray-100 pt-1">
                <span className="font-bold">Valor:</span>
                <span className="font-black text-sm">R$ {(amount || 0).toFixed(2)}</span>
            </div>
        </div>
        <div className="border-t-2 border-dashed border-black pt-2 mt-2 text-center">
            <p className="font-bold uppercase text-[7px]">Carimbo Quitação da Diretoria</p>
        </div>
    </div>
);

export const MembershipBookletModal: React.FC<MembershipBookletModalProps> = ({ isOpen, onClose, member }) => {
    if (!isOpen || !member) return null;

    const currentYear = new Date().getFullYear();
    const memberDuesAmount = DUES_CONFIG[member.category as keyof typeof DUES_CONFIG] ?? DUES_CONFIG.default;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Carnê Anual - ${member.name}`}>
            <div id="booklet-printable-area">
                <div id="printable-booklet" className="p-4 bg-white text-black">
                    <div className="grid grid-cols-2 gap-4">
                        {MONTHS.map((month, index) => {
                             const dueDate = new Date(currentYear, index, 10);
                             return (
                                <PaymentSlip
                                    key={month}
                                    memberName={member.name}
                                    month={month}
                                    year={currentYear}
                                    amount={memberDuesAmount}
                                    dueDate={dueDate.toLocaleDateString('pt-BR')}
                                />
                             )
                        })}
                    </div>
                </div>
            </div>
            <style>{`
                @media print {
                  body > *:not(#booklet-printable-area) {
                    visibility: hidden !important;
                  }
                  .break-inside-avoid {
                    page-break-inside: avoid;
                  }
                  #booklet-printable-area, #booklet-printable-area #printable-booklet {
                    visibility: visible;
                    display: block;
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                  }
                }
            `}</style>
            <div className="flex justify-end p-4 border-t print:hidden mt-4">
                <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 mr-2">Fechar</button>
                <button onClick={() => window.print()} className="px-4 py-2 bg-slate-900 text-white font-bold rounded-md hover:bg-black">Imprimir Carnê</button>
            </div>
        </Modal>
    );
};
