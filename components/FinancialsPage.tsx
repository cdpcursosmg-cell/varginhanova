
import React, { useState, useMemo } from 'react';
import { MembershipDue, Expense, PaymentStatus } from '../types';
import { SearchIcon, PlusIcon, DownloadIcon } from './Icons';
import { PaymentCalendar } from './PaymentCalendar';
import { InvoiceModal } from './InvoiceModal';
import Modal from './common/Modal';
import * as XLSX from 'xlsx';

const PaymentStatusBadge: React.FC<{ status: PaymentStatus }> = ({ status }) => {
  const baseClasses = 'px-2 py-1 text-xs font-semibold rounded-full';
  const statusClasses = {
    [PaymentStatus.Pago]: 'bg-green-100 text-green-800',
    [PaymentStatus.Pendente]: 'bg-emerald-100 text-emerald-800',
    [PaymentStatus.Atrasado]: 'bg-red-100 text-red-800',
  };
  return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
};

const AccountsReceivable: React.FC<{ 
  dues: MembershipDue[], 
  onOpenInvoice: (due: MembershipDue) => void, 
  onUpdateDueStatus: (dueId: string, status: PaymentStatus) => void,
  onDeleteDue: (dueId: string) => void,
  onDeleteMultipleDues: (dueIds: string[]) => void
}> = ({ dues, onOpenInvoice, onUpdateDueStatus, onDeleteDue, onDeleteMultipleDues }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredDues = useMemo(() => {
    return dues.filter(due => {
      const matchesSearch = due.memberName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || due.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [dues, searchTerm, statusFilter]);

  const exportToCSV = () => {
    const headers = ['Sócio', 'Vencimento', 'Referência', 'Valor', 'Status', 'Consumo (m³)', 'Energia Rateio', 'Taxa Fixa'];
    const rows = filteredDues.map(d => [
        d.memberName,
        d.dueDate,
        `${d.month}/${d.year}`,
        d.amount,
        d.status,
        d.readingDetails?.consumption || 0,
        d.readingDetails?.totalEnergyBill || 0,
        d.readingDetails?.serviceFee || 0
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(r => r.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `faturas_comunidade_varginha_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = () => {
    const data = filteredDues.map(d => ({
      'Sócio': d.memberName,
      'Vencimento': d.dueDate,
      'Referência': `${d.month}/${d.year}`,
      'Valor': d.amount,
      'Status': d.status,
      'Consumo (m³)': d.readingDetails?.consumption || 0,
      'Energia Rateio': d.readingDetails?.totalEnergyBill || 0,
      'Taxa Fixa': d.readingDetails?.serviceFee || 0
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Faturas");
    XLSX.writeFile(workbook, `faturas_comunidade_varginha_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredDues.map(d => d.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Tem certeza que deseja excluir as ${selectedIds.length} faturas selecionadas?`)) {
      onDeleteMultipleDues(selectedIds);
      setSelectedIds([]);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Contas a Receber / Faturas</h2>
        <div className="flex gap-2">
            {selectedIds.length > 0 && (
              <button 
                onClick={handleDeleteSelected}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg shadow-sm hover:bg-red-100 transition-colors"
              >
                Excluir Selecionados ({selectedIds.length})
              </button>
            )}
            <button onClick={exportToCSV} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg shadow-sm hover:bg-emerald-100 transition-colors">
                <DownloadIcon className="w-5 h-5" />
                CSV
            </button>
            <button onClick={exportToExcel} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg shadow-sm hover:bg-emerald-100 transition-colors">
                <DownloadIcon className="w-5 h-5" />
                Excel
            </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="relative md:col-span-2">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Buscar por nome do sócio..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" />
          </div>
          <div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as PaymentStatus | 'all')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500">
              <option value="all">Todos os Status</option>
              {Object.values(PaymentStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  onChange={handleSelectAll}
                  checked={selectedIds.length === filteredDues.length && filteredDues.length > 0}
                />
              </th>
              <th scope="col" className="px-6 py-3">Sócio</th>
              <th scope="col" className="px-6 py-3">Vencimento</th>
              <th scope="col" className="px-6 py-3">Ref</th>
              <th scope="col" className="px-6 py-3">Valor</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredDues.map(due => (
              <tr key={due.id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    checked={selectedIds.includes(due.id)}
                    onChange={() => handleSelectOne(due.id)}
                  />
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">{due.memberName}</td>
                <td className="px-6 py-4">{new Date(due.dueDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                <td className="px-6 py-4">{due.month}/{due.year}</td>
                <td className="px-6 py-4">R$ {(due.amount || 0).toFixed(2)}</td>
                <td className="px-6 py-4"><PaymentStatusBadge status={due.status} /></td>
                <td className="px-6 py-4 flex items-center space-x-4">
                  <button onClick={() => onUpdateDueStatus(due.id, PaymentStatus.Pago)} className="font-medium text-emerald-600 hover:underline disabled:text-gray-400 disabled:no-underline" disabled={due.status === PaymentStatus.Pago}>Baixar</button>
                  <button onClick={() => onOpenInvoice(due)} className="font-medium text-emerald-600 hover:underline">Imprimir Fatura</button>
                  <button 
                    onClick={() => {
                      if(window.confirm("Tem certeza que deseja excluir esta fatura? Isso removerá o registro de leitura deste mês.")) {
                        onDeleteDue(due.id);
                      }
                    }} 
                    className="font-medium text-red-600 hover:underline"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const expenseCategories = ['Manutenção Bomba', 'Energia Elétrica', 'Encanamento', 'Material de Escritório', 'Análises de Água', 'Outros'];

const ExpenseForm: React.FC<{ onSave: (expense: Omit<Expense, 'id'>) => void, onClose: () => void }> = ({ onSave, onClose }) => {
    const [description, setDescription] = useState('');
    const [supplier, setSupplier] = useState('');
    const [category, setCategory] = useState(expenseCategories[0]);
    const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
    const [amount, setAmount] = useState('');
    const [isRecurring, setIsRecurring] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            description,
            supplier,
            category,
            dueDate,
            amount: parseFloat(amount),
            status: PaymentStatus.Pendente,
        });
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Descrição</label>
                    <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Fornecedor</label>
                    <input type="text" value={supplier} onChange={(e) => setSupplier(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Categoria</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm">
                        {expenseCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Valor (R$)</label>
                    <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Data de Vencimento</label>
                    <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm" />
                </div>
                 <div className="col-span-2 flex items-center pt-2">
                    <input
                        id="isRecurring"
                        name="isRecurring"
                        type="checkbox"
                        checked={isRecurring}
                        onChange={(e) => setIsRecurring(e.target.checked)}
                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isRecurring" className="ml-2 block text-sm text-gray-900">
                        Esta é uma despesa recorrente
                    </label>
                </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700">Salvar Despesa</button>
            </div>
        </form>
    );
};


interface AccountsPayableProps {
  expenses: Expense[];
  onUpdateExpenseStatus: (expenseId: string, status: PaymentStatus) => void;
  onOpenAddExpenseModal: () => void;
}

const AccountsPayable: React.FC<AccountsPayableProps> = ({ expenses, onUpdateExpenseStatus, onOpenAddExpenseModal }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all');

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || expense.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [expenses, searchTerm, statusFilter]);

  const exportExpensesToExcel = () => {
    const data = filteredExpenses.map(exp => ({
      'Descrição': exp.description,
      'Categoria': exp.category,
      'Fornecedor': exp.supplier,
      'Vencimento': new Date(exp.dueDate).toLocaleDateString('pt-BR'),
      'Valor': exp.amount,
      'Status': exp.status
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Despesas");
    XLSX.writeFile(workbook, `despesas_comunidade_varginha_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
       <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Contas a Pagar</h2>
         <div className="flex gap-2">
            <button onClick={exportExpensesToExcel} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg shadow-sm hover:bg-emerald-100 transition-colors">
                <DownloadIcon className="w-5 h-5" />
                Excel
            </button>
            <button onClick={onOpenAddExpenseModal} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg shadow-sm hover:bg-emerald-700 transition-colors">
                <PlusIcon className="w-5 h-5" />
                Nova Despesa
            </button>
         </div>
      </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="relative md:col-span-2">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar por descrição..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                />
            </div>
            <div>
                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value as PaymentStatus | 'all')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                >
                    <option value="all">Todos os Status</option>
                    {Object.values(PaymentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
        </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">Descrição</th>
              <th scope="col" className="px-6 py-3">Categoria</th>
              <th scope="col" className="px-6 py-3">Fornecedor</th>
              <th scope="col" className="px-6 py-3">Vencimento</th>
              <th scope="col" className="px-6 py-3">Valor</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.map(exp => (
              <tr key={exp.id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{exp.description}</td>
                <td className="px-6 py-4">{exp.category}</td>
                <td className="px-6 py-4">{exp.supplier}</td>
                <td className="px-6 py-4">{new Date(exp.dueDate).toLocaleDateString('pt-BR')}</td>
                <td className="px-6 py-4">R$ {(exp.amount || 0).toFixed(2)}</td>
                <td className="px-6 py-4"><PaymentStatusBadge status={exp.status} /></td>
                <td className="px-6 py-4">
                  {exp.status !== PaymentStatus.Pago && (
                    <button 
                      onClick={() => onUpdateExpenseStatus(exp.id, PaymentStatus.Pago)}
                      className="font-medium text-emerald-600 hover:underline"
                    >
                      Marcar como Pago
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
         {filteredExpenses.length === 0 && (
            <div className="text-center py-6">
                <p className="text-gray-500">Nenhuma despesa encontrada.</p>
            </div>
         )}
      </div>
    </div>
  );
};

interface FinancialsPageProps {
  dues: MembershipDue[];
  expenses: Expense[];
  onUpdateExpenseStatus: (expenseId: string, status: PaymentStatus) => void;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onUpdateDueStatus: (dueId: string, status: PaymentStatus) => void;
  onDeleteDue: (dueId: string) => void;
  onDeleteMultipleDues: (dueIds: string[]) => void;
}

export const FinancialsPage: React.FC<FinancialsPageProps> = ({ dues, expenses, onUpdateExpenseStatus, onAddExpense, onUpdateDueStatus, onDeleteDue, onDeleteMultipleDues }) => {
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedDues, setSelectedDues] = useState<MembershipDue[]>([]);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);

  const handleOpenInvoice = (due: MembershipDue) => {
    setSelectedDues([due]); // Wrap single due in array
    setIsInvoiceModalOpen(true);
  };
  
  const handleCloseInvoice = () => {
    setIsInvoiceModalOpen(false);
    setSelectedDues([]);
  };

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Financeiro</h1>
        <AccountsReceivable 
          dues={dues} 
          onOpenInvoice={handleOpenInvoice} 
          onUpdateDueStatus={onUpdateDueStatus} 
          onDeleteDue={onDeleteDue} 
          onDeleteMultipleDues={onDeleteMultipleDues}
        />
      </div>
      <PaymentCalendar dues={dues} />
      <AccountsPayable 
        expenses={expenses} 
        onUpdateExpenseStatus={onUpdateExpenseStatus} 
        onOpenAddExpenseModal={() => setIsAddExpenseModalOpen(true)}
      />
       <InvoiceModal 
        isOpen={isInvoiceModalOpen}
        onClose={handleCloseInvoice}
        dues={selectedDues}
      />
      <Modal isOpen={isAddExpenseModalOpen} onClose={() => setIsAddExpenseModalOpen(false)} title="Adicionar Nova Despesa">
        <ExpenseForm onSave={onAddExpense} onClose={() => setIsAddExpenseModalOpen(false)} />
      </Modal>
    </div>
  );
};
