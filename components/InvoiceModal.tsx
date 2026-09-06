
import React from 'react';
import { MembershipDue } from '../types';
import Modal from './common/Modal';
import { PrinterIcon, DownloadIcon, WaterDropIcon } from './Icons';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  dues: MembershipDue[];
}

const WaterBill: React.FC<{ due: MembershipDue }> = ({ due }) => {
    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    const formatCurrency = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const details = due.readingDetails;
    const invoiceNum = due.invoiceNumber ? String(due.invoiceNumber).padStart(6, '0') : due.id.slice(-6).toUpperCase();

    // Cálculo do Rateio de Energia (se disponível)
    const energyBill = details?.totalEnergyBill || 0;
    const totalSystemConsumption = details?.totalSystemConsumption || 0;
    const energyRate = totalSystemConsumption > 0 ? energyBill / totalSystemConsumption : 0;

    return (
        <div className="bg-white p-4 max-w-[210mm] mx-auto text-black border-2 border-black mb-12 font-sans leading-tight print:shadow-none print:border-black break-inside-avoid shadow-lg relative">
            {/* Header Simplificado */}
            <div className="flex justify-between items-start border-b-2 border-black pb-2 mb-2">
                <div className="flex items-center gap-3">
                    <div className="border-2 border-black p-1">
                        <WaterDropIcon className="w-8 h-8 text-black" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black uppercase leading-none">COMUNIDADE DE VARGINHA</h1>
                        <p className="text-[10px] font-bold">Gestão Comunitária de Água</p>
                        <p className="text-[8px] italic">Comunidade de Varginha</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[8px] font-bold uppercase">Nº Fatura</p>
                    <p className="text-lg font-black leading-none">{invoiceNum}</p>
                    <p className="text-[8px] font-bold uppercase mt-0.5">Ref: {due.month}/{due.year}</p>
                </div>
            </div>

            {/* Consumidor e Vencimento */}
            <div className="grid grid-cols-2 gap-4 mb-2">
                <div className="border border-black p-2 bg-gray-50">
                    <span className="text-[8px] font-bold uppercase block text-gray-500 mb-0.5">Consumidor:</span>
                    <h2 className="text-base font-black uppercase leading-tight">{due.memberName}</h2>
                    <p className="text-[10px]">{due.memberAddress || 'Comunidade Rural'}</p>
                </div>
                <div className="border border-black p-2 flex flex-col items-center justify-center bg-gray-50">
                    <span className="text-[8px] font-bold uppercase text-gray-500">Total a Pagar</span>
                    <p className="text-2xl font-black leading-none">{formatCurrency(due.amount)}</p>
                    <p className="text-[10px] font-bold mt-0.5">Vence em: {formatDate(due.dueDate)}</p>
                </div>
            </div>

            {/* Tabela de Consumo Individual */}
            <div className="mb-2">
                <p className="text-[8px] font-black uppercase mb-0.5">Leitura Individual</p>
                <table className="w-full border-collapse border border-black text-center text-[11px]">
                    <thead className="bg-gray-100 uppercase text-[9px] font-bold">
                        <tr>
                            <th className="border border-black p-1">Leitura Ant.</th>
                            <th className="border border-black p-1">Leitura Atual</th>
                            <th className="border border-black p-1">Consumo (m³)</th>
                            <th className="border border-black p-1">Preço m³ (Rateio)</th>
                        </tr>
                    </thead>
                    <tbody className="font-mono font-bold">
                        <tr>
                            <td className="border border-black p-1">{details?.previousReading || 0}</td>
                            <td className="border border-black p-1">{details?.currentReading || 0}</td>
                            <td className="border border-black p-1 bg-yellow-50">{details?.consumption || 0}</td>
                            <td className="border border-black p-1">R$ {(details?.pricePerCubicMeter || 0).toFixed(4)}</td>
                        </tr>
                        {details?.serviceFee && details.serviceFee > 0 ? (
                            <tr className="bg-gray-50">
                                <td colSpan={3} className="border border-black p-1 text-right uppercase text-[9px]">Taxa de Serviço (Manutenção)</td>
                                <td className="border border-black p-1">{formatCurrency(details.serviceFee)}</td>
                            </tr>
                        ) : null}
                    </tbody>
                </table>
            </div>

            {/* Informações de Rateio e Sistema */}
            <div className="mb-2">
                <p className="text-[8px] font-black uppercase mb-0.5">Detalhamento do Sistema (Rateio)</p>
                <div className="grid grid-cols-3 border border-black divide-x divide-black text-center text-[10px]">
                    <div className="p-1">
                        <p className="text-[7px] font-bold uppercase text-gray-500">Energia Comunidade</p>
                        <p className="font-bold">{formatCurrency(energyBill)}</p>
                    </div>
                    <div className="p-1">
                        <p className="text-[7px] font-bold uppercase text-gray-500">Consumo Total Sistema</p>
                        <p className="font-bold">{totalSystemConsumption} m³</p>
                    </div>
                    <div className="p-1 bg-yellow-400">
                        <p className="text-[7px] font-bold uppercase text-black">Preço Rateio m³</p>
                        <p className="text-[12px] font-black text-black">R$ {(energyRate || 0).toFixed(4)}</p>
                    </div>
                </div>
            </div>

            <div className="mb-2">
                <p className="text-[8px] text-gray-600 italic">
                    * O preço do rateio é calculado dividindo o valor total da energia pelo consumo total de água medido no sistema.
                </p>
            </div>

            {/* Canhoto Destacável */}
            <div className="border-t border-dashed border-black pt-2 mt-2">
                <div className="flex justify-between items-center text-[8px] font-bold uppercase mb-1">
                    <span>Corte Aqui - Via da Administração</span>
                    <span>Recibo de Pagamento</span>
                </div>
                <div className="border border-black p-2 flex justify-between items-center bg-gray-50">
                    <div>
                        <p className="text-[9px] font-black uppercase leading-none">COMUNIDADE DE VARGINHA</p>
                        <p className="text-[9px] font-bold leading-none mt-0.5">{due.memberName}</p>
                        <p className="text-[7px] mt-0.5">Ref: {due.month}/{due.year} | Fatura: {invoiceNum}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-base font-black leading-none">{formatCurrency(due.amount)}</p>
                        <p className="text-[7px] font-bold mt-0.5">Vencimento: {formatDate(due.dueDate)}</p>
                    </div>
                </div>
            </div>
            
            {/* Linha de corte visual na tela (não sai no print se o mb resolver) */}
            <div className="absolute -bottom-6 left-0 right-0 border-t border-dashed border-gray-400 print:hidden"></div>
        </div>
    );
};

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, dues }) => {
  if (!isOpen || dues.length === 0) return null;

  const sortedDues = [...dues].sort((a, b) => 
    a.memberName.localeCompare(b.memberName, 'pt-BR', { sensitivity: 'base' })
  );

  const handlePrint = () => {
      const content = document.getElementById('printable-area');
      if (!content) return;
      const win = window.open('', '_blank');
      win?.document.write(`
        <html>
          <head>
            <title>Faturas - COMUNIDADE DE VARGINHA</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
                @page { size: A4; margin: 10mm; }
                body { background-color: white; margin: 0; padding: 0; }
                @media print {
                    .no-print { display: none !important; }
                    .break-inside-avoid { page-break-inside: avoid; }
                    .mb-12 { margin-bottom: 2rem !important; } /* Ajuste para caber duas em folha A4 */
                }
            </style>
          </head>
          <body>
            <div style="padding: 10px;">
                ${content.innerHTML}
            </div>
            <script>setTimeout(() => { window.print(); window.close(); }, 800);</script>
          </body>
        </html>
      `);
      win?.document.close();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={dues.length > 1 ? `Faturas (${dues.length})` : "Fatura Individual"}>
      <div className="flex justify-between mb-4 gap-2 no-print">
         <button onClick={handlePrint} className="flex-1 px-6 py-4 bg-emerald-900 text-white font-black uppercase rounded-xl hover:bg-emerald-950 flex items-center justify-center gap-2 shadow-xl transition-all">
            <PrinterIcon className="w-5 h-5" /> Imprimir Faturas
         </button>
      </div>

      <div id="printable-area" className="bg-gray-200 p-2 rounded-xl max-h-[70vh] overflow-y-auto border border-gray-300">
        {sortedDues.map(due => <WaterBill key={due.id} due={due} />)}
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">COMUNIDADE DE VARGINHA - Gestão 2025</p>
      </div>
    </Modal>
  );
};
