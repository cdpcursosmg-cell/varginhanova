
import React from 'react';
import { Member } from '../types';
import Modal from './common/Modal';
import { UsersIcon } from './Icons';

interface MemberIdCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
}

export const MemberIdCardModal: React.FC<MemberIdCardModalProps> = ({ isOpen, onClose, member }) => {
  if (!isOpen || !member) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Carteirinha de Sócio">
      <div id="member-id-card-printable-area">
        <div id="printable-id-card" className="w-[3.375in] h-[2.125in] p-3 border-2 border-black rounded-lg bg-white font-sans flex flex-col text-[8px] leading-tight mx-auto shadow-md">
            {/* Header */}
            <div className="text-center border-b-2 border-black pb-1 mb-2">
                <h3 className="text-[9px] font-black text-emerald-900 uppercase">COMUNIDADE DE VARGINHA</h3>
                <p className="text-[7px] font-bold uppercase">COMUNIDADE DE VARGINHA</p>
                <p className="text-[7px] uppercase">Assoc. Comunitária de Pequenos Produtores</p>
            </div>
            
            {/* Body */}
            <div className="flex flex-grow space-x-2">
                <div className="w-1/4 flex flex-col items-center">
                    <div className="w-16 h-20 bg-gray-100 flex items-center justify-center overflow-hidden border border-black">
                        {member.photoUrl ? (
                            <img src={member.photoUrl} alt="Foto" className="w-full h-full object-cover" />
                        ) : (
                            <UsersIcon className="w-12 h-12 text-gray-400" />
                        )}
                    </div>
                </div>

                <div className="w-3/4 space-y-1">
                    <p><strong className="font-bold uppercase">SÓCIO:</strong> <span className="uppercase">{member.name}</span></p>
                    <div className="flex justify-between">
                        <p><strong className="font-bold uppercase">RG:</strong> {member.rg || 'N/A'}</p>
                        <p><strong className="font-bold uppercase">CPF:</strong> {member.cpf}</p>
                    </div>
                    <div className="flex justify-between">
                         <p><strong className="font-bold uppercase">FILIAÇÃO:</strong> {member.joinDate ? new Date(member.joinDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A'}</p>
                         <p><strong className="font-bold uppercase">CATEGORIA:</strong> {member.category}</p>
                    </div>
                    <div className="mt-1 border-t border-gray-200 pt-1">
                        <p><strong className="font-bold uppercase">MÃE:</strong> {member.motherName || '---'}</p>
                        <p><strong className="font-bold uppercase">PAI:</strong> {member.fatherName || '---'}</p>
                    </div>
                    <p className="text-[6px] italic">Validade Vitalícia enquanto Sócio Ativo</p>
                </div>
            </div>

            {/* Footer */}
            <div className="border-t border-black mt-1 pt-1 text-center">
                <p className="text-[6px] font-bold uppercase">Assinatura do Presidente</p>
            </div>
        </div>
      </div>
      
       <style>{`
        @media print {
            @page {
                size: 85.60mm 53.98mm;
                margin: 0;
            }
            body > *:not(#member-id-card-printable-area) {
                display: none !important;
            }
            #member-id-card-printable-area, #member-id-card-printable-area #printable-id-card {
                display: block;
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                box-shadow: none;
                border: 2px solid black;
            }
        }
      `}</style>

       <div className="flex justify-end p-4 border-t print:hidden mt-4">
        <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 mr-2">Fechar</button>
        <button onClick={() => window.print()} className="px-4 py-2 bg-emerald-900 text-white font-bold rounded-md hover:bg-emerald-950">Imprimir Carteirinha</button>
      </div>
    </Modal>
  );
};
