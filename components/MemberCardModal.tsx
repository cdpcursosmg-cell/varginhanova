
import React from 'react';
import { Member } from '../types';
import Modal from './common/Modal';
import { UsersIcon } from './Icons';

interface MemberCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
}

export const MemberCardModal: React.FC<MemberCardModalProps> = ({ isOpen, onClose, member }) => {
  if (!isOpen || !member) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ficha de Sócio">
      <div id="member-card-printable-area">
        <div id="printable-card" className="border-2 border-gray-700 p-6 rounded-lg max-w-sm mx-auto bg-white font-sans shadow-lg">
          {/* Header */}
          <div className="text-center mb-4 border-b-2 border-gray-300 pb-3">
            <h3 className="text-base font-black text-emerald-900 uppercase">COMUNIDADE DE VARGINHA</h3>
            <p className="text-[10px] text-gray-600 font-bold">Assoc. Comunitária de Pequenos Produtores Rurais</p>
            <p className="text-[9px] text-gray-500 uppercase">Comunidade de Varginha - São João da Ponte - MG</p>
          </div>
          
          {/* Photo and Title */}
          <div className="flex flex-col items-center mb-6">
             <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden mb-3 border-2 border-gray-300">
                {member.photoUrl ? (
                    <img src={member.photoUrl} alt="Foto do Sócio" className="w-full h-full object-cover" />
                ) : (
                    <UsersIcon className="w-16 h-16 text-gray-400" />
                )}
             </div>
            <h4 className="text-xl font-bold text-gray-800 uppercase text-center">{member.name}</h4>
            <p className="text-sm text-emerald-600 font-black uppercase">{member.category}</p>
          </div>

          {/* Member Details */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between border-b border-gray-100 pb-1">
              <span className="font-bold text-gray-500 uppercase text-[10px]">CPF:</span>
              <span className="text-gray-900 font-mono font-bold">{member.cpf}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-1">
              <span className="font-bold text-gray-500 uppercase text-[10px]">Data Filiação:</span>
              <span className="text-gray-900 font-mono">{new Date(member.joinDate).toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-1">
              <span className="font-bold text-gray-500 uppercase text-[10px]">Naturalidade:</span>
              <span className="text-gray-900 truncate pl-2">{member.naturalness || 'São João da Ponte'}</span>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <div className="w-48 h-[1px] bg-black mx-auto mb-1"></div>
            <p className="text-[8px] font-bold uppercase text-gray-400">Assinatura Presidente</p>
          </div>
        </div>
      </div>
      
       <style>{`
        @media print {
          body > *:not(#member-card-printable-area) {
            display: none !important;
          }
          #member-card-printable-area, #member-card-printable-area #printable-card {
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
        <button onClick={() => window.print()} className="px-4 py-2 bg-emerald-900 text-white font-bold rounded-md hover:bg-emerald-950">Imprimir Ficha</button>
      </div>
    </Modal>
  );
};
