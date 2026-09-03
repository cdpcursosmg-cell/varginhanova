
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Member, MembershipDue, PaymentStatus, WaterReadingDetails } from '../types';
import { SearchIcon, WaterDropIcon, CogIcon, CalendarIcon, DownloadIcon, PlusIcon, DollarSignIcon, UploadIcon, PrinterIcon, SaveIcon } from './Icons';
import { InvoiceModal } from './InvoiceModal';
import Modal from './common/Modal';
import { importedData } from '../App';
import * as XLSX from 'xlsx';

interface WaterReadingsPageProps {
  members: Member[];
  dues: MembershipDue[];
  onAddDues: (newDues: MembershipDue[]) => void;
  onSyncDues: (month: string, year: number, newDues: MembershipDue[]) => void;
  onDeleteDue: (dueId: string) => void;
  onDeleteMultipleDues: (dueIds: string[]) => void;
  waterPrice: number;
  setWaterPrice: (price: number) => void;
  serviceFee: number;
  setServiceFee: (fee: number) => void;
}

const getMonthName = (monthIndex: number) => {
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return months[monthIndex];
};

interface ReadingHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    member: Member | null;
    dues: MembershipDue[];
    onDeleteDue: (dueId: string) => void;
}

const ReadingHistoryModal: React.FC<ReadingHistoryModalProps> = ({ isOpen, onClose, member, dues, onDeleteDue }) => {
    if (!isOpen || !member) return null;

    const history = dues
        .filter(d => d.memberId === member.id && d.readingDetails)
        .sort((a, b) => {
             if (a.year !== b.year) return b.year - a.year;
             const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
             return months.indexOf(b.month) - months.indexOf(a.month);
        });

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const formatNumber = (value: number) => {
        return new Intl.NumberFormat('pt-BR').format(value);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Histórico de Consumo: ${member.name}`}>
            <div className="max-h-[60vh] overflow-y-auto pr-2">
                {history.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
                            <WaterDropIcon className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-700 mb-1">Nenhum histórico encontrado</h3>
                        <p className="text-sm text-gray-400 max-w-xs mx-auto">As leituras aparecerão aqui assim que as primeiras faturas forem geradas para este sócio.</p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 border-b border-gray-100 sticky top-0">
                                <tr>
                                    <th className="px-4 py-4">Referência</th>
                                    <th className="px-4 py-4 text-center">Leitura Ant.</th>
                                    <th className="px-4 py-4 text-center">Leitura Atual</th>
                                    <th className="px-4 py-4 text-center">Consumo</th>
                                    <th className="px-4 py-4 text-right">Valor Total</th>
                                    <th className="px-4 py-4 text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {history.map((record) => (
                                    <tr key={record.id} className="bg-white hover:bg-emerald-50/50 transition-colors group">
                                        <td className="px-4 py-4 font-bold text-gray-800">
                                            {record.month} de {record.year}
                                        </td>
                                        <td className="px-4 py-4 text-center font-mono text-gray-500">
                                            {formatNumber(record.readingDetails?.previousReading || 0)}
                                        </td>
                                        <td className="px-4 py-4 text-center font-mono font-bold text-emerald-600">
                                            {formatNumber(record.readingDetails?.currentReading || 0)}
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
                                                {formatNumber(record.readingDetails?.consumption || 0)} m³
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-right font-black text-gray-900">
                                            {formatCurrency(record.amount)}
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <button 
                                                onClick={() => {
                                                    if(window.confirm(`Excluir a leitura de ${record.month}/${record.year}? Esta ação não pode ser desfeita.`)) {
                                                        onDeleteDue(record.id);
                                                    }
                                                }}
                                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Excluir esta leitura"
                                            >
                                                <PlusIcon className="w-4 h-4 rotate-45" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <div className="mt-6 flex justify-end">
                <button 
                    onClick={onClose}
                    className="px-6 py-2.5 bg-gray-900 text-white font-black uppercase text-xs tracking-widest rounded-xl hover:bg-gray-800 transition-all shadow-lg active:scale-95"
                >
                    Fechar Histórico
                </button>
            </div>
        </Modal>
    );
};

export const WaterReadingsPage: React.FC<WaterReadingsPageProps> = ({ 
    members, 
    dues, 
    onAddDues,
    onSyncDues,
    onDeleteDue,
    onDeleteMultipleDues,
    waterPrice,
    setWaterPrice,
    serviceFee,
    setServiceFee
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 2, 1)); 
  const [customDueDate, setCustomDueDate] = useState('2026-04-10');
  const [searchTerm, setSearchTerm] = useState('');
  const [readings, setReadings] = useState<Record<string, { current: string, previous: string }>>({});
  const [generatedDues, setGeneratedDues] = useState<MembershipDue[]>([]);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [energyBill, setEnergyBill] = useState<string>('');
  const [startInvoiceNumber, setStartInvoiceNumber] = useState<number>(1);
  const [selectedHistoryMember, setSelectedHistoryMember] = useState<Member | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as any[];

        const newR = { ...readings };
        let matchCount = 0;

        const normalize = (s: string) =>
          s.toUpperCase()
            .trim()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^A-Z0-9]/g, "");

        data.forEach((row: any) => {
          // Tenta encontrar colunas correspondentes (Sócio, Anterior, Atual)
          const nameKey = Object.keys(row).find(k => normalize(k).includes("SOCIO") || normalize(k).includes("NOME"));
          const prevKey = Object.keys(row).find(k => normalize(k).includes("ANTERIOR") || normalize(k).includes("ANT"));
          const currKey = Object.keys(row).find(k => normalize(k).includes("ATUAL") || normalize(k).includes("CURR"));

          if (nameKey) {
            const memberName = String(row[nameKey]);
            const m = members.find(mx => normalize(mx.name) === normalize(memberName));
            if (m) {
              const prevVal = prevKey ? String(row[prevKey]) : readings[m.id]?.previous || '0';
              const currVal = currKey ? String(row[currKey]) : readings[m.id]?.current || '';
              newR[m.id] = { previous: prevVal, current: currVal };
              matchCount++;
            }
          }
        });

        if (matchCount === 0) {
          alert("Nenhum sócio correspondente encontrado no arquivo Excel. Verifique se as colunas 'Sócio', 'Leitura Anterior' e 'Leitura Atual' existem.");
        } else {
          setReadings(newR);
          alert(`${matchCount} leituras foram importadas com sucesso do Excel.`);
        }
      } catch (error) {
        console.error("Erro ao importar Excel:", error);
        alert("Erro ao processar o arquivo Excel. Verifique o formato.");
      }
      // Limpa o input para permitir re-importar o mesmo arquivo
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  const monthStr = getMonthName(selectedDate.getMonth());
  const year = selectedDate.getFullYear();

  const existingBills = useMemo(() => 
      dues.filter(d => d.month === monthStr && d.year === year), 
      [dues, monthStr, year]
  );

  useEffect(() => {
    const initialReadings: Record<string, { current: string, previous: string }> = {};
    
    // Calcular mês anterior
    const prevDate = new Date(selectedDate);
    prevDate.setMonth(prevDate.getMonth() - 1);
    const prevMonthStr = getMonthName(prevDate.getMonth());
    const prevYear = prevDate.getFullYear();

    members.forEach(member => {
        const existingBill = dues.find(d => d.memberId === member.id && d.month === monthStr && d.year === year);
        const prevBill = dues.find(d => d.memberId === member.id && d.month === prevMonthStr && d.year === prevYear);
        
        if (existingBill?.readingDetails) {
            initialReadings[member.id] = {
                previous: existingBill.readingDetails.previousReading.toString(),
                current: existingBill.readingDetails.currentReading.toString()
            };
        } else {
            // Usa a leitura atual do mês anterior como anterior deste mês
            initialReadings[member.id] = {
                previous: prevBill?.readingDetails?.currentReading.toString() || member.initialReading?.toString() || '0',
                current: ''
            };
        }
    });
    setReadings(initialReadings);
  }, [members, dues, selectedDate, monthStr, year]);

  const totalConsumption = useMemo(() => {
    return Object.values(readings).reduce((acc: number, r: { current: string, previous: string }) => {
        const c = parseFloat(r.current) - parseFloat(r.previous);
        return acc + (c > 0 ? c : 0);
    }, 0);
  }, [readings]);

  // Cálculo automático do rateio
  useEffect(() => {
    const bill = parseFloat(energyBill);
    if (bill > 0 && totalConsumption > 0) {
      const rateio = bill / totalConsumption;
      setWaterPrice(parseFloat((rateio || 0).toFixed(4)));
    } else if (bill === 0) {
      setWaterPrice(0);
    }
  }, [energyBill, totalConsumption, setWaterPrice]);

  const handleCalculateRateio = () => {
    const bill = parseFloat(energyBill);
    if (!bill || totalConsumption <= 0) {
        alert("Informe o valor da energia e certifique-se de que há consumo de água registrado.");
        return;
    }
    const rateio = bill / totalConsumption;
    setWaterPrice(parseFloat((rateio || 0).toFixed(4)));
    alert(`Rateio calculado: R$ ${(rateio || 0).toFixed(4)} por m³`);
  };

  const handleGenerate = () => {
    const newBills: MembershipDue[] = [];
    let counter = startInvoiceNumber;

    members.forEach(member => {
        const r = readings[member.id];
        if (r && r.current) {
            const consumption = parseFloat(r.current) - parseFloat(r.previous);
            const waterAmount = consumption * waterPrice;
            const totalAmount = waterAmount + serviceFee;
            
            newBills.push({
                id: `bill_${Date.now()}_${member.id}`,
                memberId: member.id,
                memberName: member.name,
                memberAddress: member.address,
                month: monthStr,
                year: year,
                dueDate: customDueDate,
                amount: parseFloat((totalAmount || 0).toFixed(2)),
                status: PaymentStatus.Pendente,
                invoiceNumber: counter++,
                readingDetails: {
                    previousReading: parseFloat(r.previous),
                    currentReading: parseFloat(r.current),
                    consumption,
                    pricePerCubicMeter: waterPrice,
                    serviceFee: serviceFee,
                    referenceMonth: monthStr,
                    totalEnergyBill: parseFloat(energyBill) || 0,
                    totalSystemConsumption: totalConsumption
                }
            });
        }
    });

    if (newBills.length > 0) {
        onAddDues(newBills);
        setGeneratedDues(newBills);
        setIsInvoiceModalOpen(true);
    }
  };

  const exportReadingsToCSV = () => {
    const headers = ['Sócio', 'Referência', 'Leitura Anterior', 'Leitura Atual', 'Consumo (m³)', 'Preço por m³', 'Taxa Fixa', 'Valor Total'];
    const rows = members.map(member => {
      const r = readings[member.id] || { current: '', previous: '0' };
      const prevVal = parseFloat(r.previous) || 0;
      const currVal = parseFloat(r.current) || 0;
      const cons = Math.max(0, currVal - prevVal);
      const valTotal = (cons * waterPrice) + serviceFee;
      
      return [
        member.name,
        `${monthStr}/${year}`,
        prevVal,
        currVal,
        cons,
        waterPrice,
        serviceFee,
        (valTotal || 0).toFixed(2)
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `leituras_${monthStr}_${year}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportReadingsToExcel = () => {
    const data = members.map(member => {
      const r = readings[member.id] || { current: '', previous: '0' };
      const prevVal = parseFloat(r.previous) || 0;
      const currVal = parseFloat(r.current) || 0;
      const cons = Math.max(0, currVal - prevVal);
      const valTotal = (cons * waterPrice) + serviceFee;
      
      return {
        'Sócio': member.name,
        'Referência': `${monthStr}/${year}`,
        'Leitura Anterior': prevVal,
        'Leitura Atual': currVal,
        'Consumo (m³)': cons,
        'Preço por m³': waterPrice,
        'Taxa Fixa': serviceFee,
        'Valor Total': valTotal
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leituras");
    XLSX.writeFile(workbook, `leituras_${monthStr}_${year}.xlsx`);
  };

  const exportBillsToExcel = () => {
    const billsToExport = generatedDues.length > 0 ? generatedDues : existingBills;
    if (billsToExport.length === 0) return;
    
    const data = billsToExport.map(bill => ({
      'Nº Fatura': bill.invoiceNumber || '',
      'Sócio': bill.memberName,
      'Endereço': bill.memberAddress || '',
      'Referência': `${bill.month}/${bill.year}`,
      'Vencimento': new Date(bill.dueDate).toLocaleDateString('pt-BR'),
      'Leitura Ant.': bill.readingDetails?.previousReading || 0,
      'Leitura Atual': bill.readingDetails?.currentReading || 0,
      'Consumo m3': bill.readingDetails?.consumption || 0,
      'Valor R$': bill.amount,
      'Status': bill.status
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Faturas");
    XLSX.writeFile(workbook, `Faturas_Agua_${monthStr}_${year}.xlsx`);
  };

  const handleDeleteMonthBills = () => {
    if (existingBills.length === 0) return;
    if (window.confirm(`Tem certeza que deseja excluir TODAS as ${existingBills.length} faturas de ${monthStr}/${year}? Esta ação não pode ser desfeita.`)) {
      onDeleteMultipleDues(existingBills.map(b => b.id));
    }
  };

  return (
    <div className="p-8">
        <header className="mb-8 flex justify-between items-end">
            <div>
                <h1 className="text-3xl font-black text-gray-900 flex items-center gap-2">
                    <WaterDropIcon className="w-8 h-8 text-emerald-500" />
                    Hidrômetros - Comunidade de Varginha
                </h1>
                <p className="text-gray-500">Fazenda Mamonas - Gestão Hídrica</p>
            </div>
            <div className="flex gap-4">
                <button 
                    onClick={exportReadingsToCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl shadow-sm hover:bg-emerald-100 transition-colors h-fit self-center"
                >
                    <DownloadIcon className="w-5 h-5" />
                    CSV
                </button>
                <button 
                    onClick={exportReadingsToExcel}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl shadow-sm hover:bg-emerald-100 transition-colors h-fit self-center"
                >
                    <DownloadIcon className="w-5 h-5" />
                    Excel Leituras
                </button>
                {existingBills.length > 0 && (
                    <div className="flex gap-2 self-center">
                        <button 
                            onClick={exportBillsToExcel}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl shadow-sm hover:bg-emerald-700 transition-colors h-fit"
                        >
                            <DownloadIcon className="w-5 h-5" />
                            Excel Faturas
                        </button>
                        <button 
                            onClick={handleDeleteMonthBills}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-xl shadow-sm hover:bg-red-100 transition-colors h-fit"
                        >
                            <PlusIcon className="w-5 h-5 rotate-45" />
                            Excluir Faturas do Mês
                        </button>
                    </div>
                )}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Consumo Total</span>
                    <span className="text-xl font-black text-emerald-600 font-mono">{totalConsumption} m³</span>
                </div>
            </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <div className="lg:col-span-3 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Mês/Ano</label>
                    <input 
                        type="month" 
                        value={`${year}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`}
                        onChange={(e) => {
                            const [y, m] = e.target.value.split('-');
                            setSelectedDate(new Date(parseInt(y), parseInt(m)-1, 1));
                        }}
                        className="w-full bg-gray-50 border-none rounded-xl p-3 font-bold focus:ring-2 focus:ring-emerald-500" 
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Energia (R$)</label>
                    <div className="flex gap-2">
                        <input 
                            type="number" 
                            value={energyBill} 
                            onChange={(e) => setEnergyBill(e.target.value)} 
                            className="flex-1 bg-emerald-50 text-emerald-900 border-none rounded-xl p-3 font-bold focus:ring-2 focus:ring-emerald-500" 
                            placeholder="0,00"
                        />
                        <button 
                            onClick={handleCalculateRateio}
                            className="px-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
                            title="Calcular Rateio"
                        >
                            <CogIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Preço m³ (Rateio)</label>
                        <div className="w-full bg-emerald-50 text-emerald-900 rounded-xl p-3 font-black flex items-center justify-between border border-emerald-100">
                            <span>R$ {(waterPrice || 0).toFixed(4)}</span>
                            <span className="text-[8px] bg-emerald-200 px-1 rounded uppercase">Auto</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Taxa de Serviço (R$)</label>
                        <input 
                            type="number" 
                            value={serviceFee} 
                            onChange={(e) => setServiceFee(parseFloat(e.target.value) || 0)} 
                            className="w-full bg-emerald-50 text-emerald-900 border-none rounded-xl p-3 font-black focus:ring-2 focus:ring-emerald-500" 
                            placeholder="0,00"
                        />
                    </div>
                </div>
            </div>
            
            <button 
                onClick={handleGenerate}
                className="bg-emerald-800 text-white rounded-3xl font-black uppercase text-sm hover:bg-emerald-900 transition-all shadow-lg flex flex-col items-center justify-center p-6"
            >
                <PlusIcon className="w-8 h-8 mb-2" />
                Gerar Faturas
            </button>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                <div className="relative w-72">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Buscar sócio..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                </div>
                <div className="flex gap-2">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleExcelImport} 
                        accept=".xlsx, .xls" 
                        className="hidden" 
                    />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg hover:bg-emerald-100 flex items-center gap-1"
                        title="Importar leituras de um arquivo Excel (.xlsx ou .xls)"
                    >
                        <UploadIcon className="w-3 h-3" />
                        Importar Excel
                    </button>
                    <button 
                        onClick={() => {
                            const confirmed = window.confirm("Preencher com dados de exemplo da planilha?");
                            if(confirmed) {
                                const newR = {...readings};
                                let matchCount = 0;
                                
                                // Função de normalização para comparação robusta
                                const normalize = (s: string) => 
                                    s.toUpperCase()
                                     .trim()
                                     .normalize("NFD")
                                     .replace(/[\u0300-\u036f]/g, "") // Remove acentos
                                     .replace(/[^A-Z0-9]/g, "");     // Remove tudo que não é letra ou número

                                importedData.forEach(d => {
                                    const m = members.find(mx => normalize(mx.name) === normalize(d.name));
                                    if(m) {
                                        newR[m.id] = { previous: d.prev.toString(), current: d.curr.toString() };
                                        matchCount++;
                                    }
                                });
                                
                                if (matchCount === 0) {
                                    alert("Nenhum sócio correspondente encontrado. Verifique se os nomes dos sócios cadastrados coincidem com os da planilha.");
                                } else {
                                    setReadings(newR);
                                    alert(`${matchCount} leituras foram preenchidas com sucesso.`);
                                }
                            }
                        }}
                        className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg hover:bg-emerald-100"
                    >
                        Auto-Preencher
                    </button>
                    <button 
                        onClick={() => {
                            if(window.confirm("Limpar todas as leituras atuais da tabela?")) {
                                const resetR = {...readings};
                                members.forEach(m => {
                                    resetR[m.id] = { previous: m.initialReading?.toString() || '0', current: '' };
                                });
                                setReadings(resetR);
                            }
                        }}
                        className="text-[10px] font-black uppercase bg-red-50 text-red-700 px-3 py-1 rounded-lg hover:bg-red-100"
                    >
                        Limpar
                    </button>
                </div>
            </div>
            <table className="w-full text-sm">
                <thead>
                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 border-b border-gray-100">
                        <th className="px-6 py-4 text-left">Sócio / Nome</th>
                        <th className="px-4 py-4 text-center">Anterior</th>
                        <th className="px-4 py-4 text-center">Atual</th>
                        <th className="px-4 py-4 text-center">Consumo</th>
                        <th className="px-6 py-4 text-right">Final</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {members.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase())).map(member => {
                        const r = readings[member.id] || { current: '', previous: '0' };
                        const cons = parseFloat(r.current) - parseFloat(r.previous);
                        const final = ((cons > 0 ? cons : 0) * waterPrice) + serviceFee;
                        return (
                            <tr key={member.id} className="hover:bg-emerald-50/30 transition-colors group">
                                <td 
                                    className="px-6 py-4 font-bold text-gray-800 uppercase cursor-pointer hover:text-emerald-600 transition-colors"
                                    onClick={() => setSelectedHistoryMember(member)}
                                    title="Ver histórico de consumo"
                                >
                                    <div className="flex items-center gap-2">
                                        {member.name}
                                        <CalendarIcon className="w-4 h-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <input 
                                        type="number" 
                                        value={r.previous} 
                                        onChange={e => setReadings({...readings, [member.id]: {...r, previous: e.target.value}})}
                                        className="w-24 mx-auto block text-center bg-gray-100 border-none rounded-lg p-2 font-mono"
                                    />
                                </td>
                                <td className="px-4 py-4">
                                    <input 
                                        type="number" 
                                        value={r.current} 
                                        onChange={e => setReadings({...readings, [member.id]: {...r, current: e.target.value}})}
                                        className="w-24 mx-auto block text-center bg-emerald-50 text-emerald-900 border-2 border-emerald-200 rounded-lg p-2 font-black font-mono focus:border-emerald-500 focus:ring-0"
                                    />
                                </td>
                                <td className="px-4 py-4 text-center">
                                    <span className={`px-3 py-1 rounded-full font-black text-xs ${cons > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-400'}`}>
                                        {cons > 0 ? cons : 0} m³
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right font-black text-gray-900">
                                    R$ {(final || 0).toFixed(2)}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>

        <InvoiceModal isOpen={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} dues={generatedDues} />
        <ReadingHistoryModal 
            isOpen={!!selectedHistoryMember} 
            onClose={() => setSelectedHistoryMember(null)} 
            member={selectedHistoryMember} 
            dues={dues} 
            onDeleteDue={onDeleteDue}
        />
    </div>
  );
};
