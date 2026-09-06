
import React, { useState, useMemo, useEffect } from 'react';
import { Member, MemberStatus } from '../types';
import { SearchIcon, PlusIcon, UsersIcon, DownloadIcon, CogIcon } from './Icons';
import Modal from './common/Modal';
import * as XLSX from 'xlsx';
import { importedData } from '../App';

interface MembersPageProps {
  members: Member[];
  onAddMember: (member: Omit<Member, 'id'>) => void;
  onUpdateMember: (member: Member) => void;
}

const MemberStatusBadge: React.FC<{ status: MemberStatus }> = ({ status }) => {
  const baseClasses = 'px-2 py-1 text-xs font-semibold rounded-full';
  const statusClasses = {
    [MemberStatus.Ativo]: 'bg-green-100 text-green-800',
    [MemberStatus.Inadimplente]: 'bg-yellow-100 text-yellow-800',
    [MemberStatus.Suspenso]: 'bg-orange-100 text-orange-800',
    [MemberStatus.Cancelado]: 'bg-red-100 text-red-800',
  };
  return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
};

const MemberForm: React.FC<{ initialData?: Member | null, onSave: (member: any) => void, onClose: () => void }> = ({ initialData, onSave, onClose }) => {
    const [name, setName] = useState('');
    const [cpf, setCpf] = useState('');
    const [rg, setRg] = useState('');
    const [address, setAddress] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [joinDate, setJoinDate] = useState(new Date().toISOString().split('T')[0]);
    const [category, setCategory] = useState('Produtor');
    const [status, setStatus] = useState(MemberStatus.Ativo);
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [documents, setDocuments] = useState<{ name: string; url: string }[]>([]);
    const [birthDate, setBirthDate] = useState('');
    const [motherName, setMotherName] = useState('');
    const [fatherName, setFatherName] = useState('');
    const [naturalness, setNaturalness] = useState('São João da Ponte – MG');

    // Populate form if initialData exists (Edit Mode)
    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setCpf(initialData.cpf);
            setRg(initialData.rg || '');
            setAddress(initialData.address);
            setEmail(initialData.email);
            setPhone(initialData.phone);
            setJoinDate(initialData.joinDate);
            setCategory(initialData.category);
            setStatus(initialData.status);
            setPhotoUrl(initialData.photoUrl || null);
            setBirthDate(initialData.birthDate || '');
            setMotherName(initialData.motherName || '');
            setFatherName(initialData.fatherName || '');
            setNaturalness(initialData.naturalness || 'São João da Ponte – MG');
        }
    }, [initialData]);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const memberData = { name, cpf, rg, address, email, phone, joinDate, category, status, photoUrl, documents, birthDate, motherName, fatherName, naturalness };
        
        if (initialData) {
            // Include ID for updates
            onSave({ ...memberData, id: initialData.id });
        } else {
            onSave(memberData);
        }
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6 pb-4 border-b border-gray-200">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-300 flex-shrink-0">
                    {photoUrl ? (
                        <img src={photoUrl} alt="Foto do Sócio" className="w-full h-full object-cover" />
                    ) : (
                        <UsersIcon className="w-16 h-16 text-gray-400" />
                    )}
                </div>
                <div className="text-center sm:text-left">
                    <label htmlFor="photo-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                        <span>Carregar Foto</span>
                    </label>
                    <input id="photo-upload" name="photo-upload" type="file" className="sr-only" accept="image/*" onChange={handlePhotoChange} />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">CPF</label>
                    <input type="text" value={cpf} onChange={(e) => setCpf(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm" />
                </div>
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Endereço (Importante para Fatura)</label>
                    <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm" placeholder="Ex: COMUNIDADE DE VARGINHA" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">RG (Opcional)</label>
                    <input type="text" value={rg} onChange={(e) => setRg(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Telefone</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                     <select value={status} onChange={(e) => setStatus(e.target.value as MemberStatus)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm">
                        {Object.values(MemberStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700">{initialData ? 'Atualizar' : 'Salvar'}</button>
            </div>
        </form>
    );
};

export const MembersPage: React.FC<MembersPageProps> = ({ members, onAddMember, onUpdateMember }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<MemberStatus | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  const filteredMembers = useMemo(() => {
    return members
      .filter(member => {
        const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              member.cpf.includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }));
  }, [members, searchTerm, statusFilter]);
  
  const handleEdit = (member: Member) => {
      setEditingMember(member);
      setIsModalOpen(true);
  };

  const handleAddNew = () => {
      setEditingMember(null);
      setIsModalOpen(true);
  };

  const handleSave = (memberData: any) => {
      if (editingMember) {
          onUpdateMember(memberData);
      } else {
          onAddMember(memberData);
      }
      setIsModalOpen(false);
      setEditingMember(null);
  };

  const exportToCSV = () => {
    const headers = ['Nome', 'CPF', 'RG', 'Endereço', 'Telefone', 'Categoria', 'Status', 'Data Filiação'];
    const rows = filteredMembers.map(m => [
        m.name,
        m.cpf,
        m.rg || '',
        m.address,
        m.phone,
        m.category,
        m.status,
        m.joinDate
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(r => r.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `socios_comunidade_varginha_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = () => {
    const data = filteredMembers.map(m => ({
      'Nome': m.name,
      'CPF': m.cpf,
      'RG': m.rg || '',
      'Endereço': m.address,
      'Telefone': m.phone,
      'Categoria': m.category,
      'Status': m.status,
      'Data Filiação': m.joinDate
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sócios");
    XLSX.writeFile(workbook, `socios_comunidade_varginha_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const syncWithImported = () => {
    const normalize = (s: string) => s.toUpperCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Z0-9]/g, "");
    const missing = importedData.filter(d => !members.some(m => normalize(m.name) === normalize(d.name)));
    
    if (missing.length === 0) {
      alert("Todos os sócios da lista de Fevereiro já estão cadastrados.");
      return;
    }
    
    if (window.confirm(`Encontrados ${missing.length} sócios na lista de Fevereiro que não estão cadastrados. Deseja adicioná-los para que o Auto-Preencher funcione corretamente?`)) {
      missing.forEach((data) => {
        onAddMember({
          name: data.name,
          initialReading: data.prev,
          cpf: `000.000.000-00`,
          address: 'Comunidade de Varginha',
          email: '',
          phone: '',
          joinDate: '2026-02-01',
          category: 'Produtor',
          status: MemberStatus.Ativo,
          naturalness: 'São João da Ponte – MG'
        });
      });
      alert(`${missing.length} sócios adicionados. Agora você pode usar o Auto-Preencher na aba de Leituras.`);
    }
  };

  return (
    <div className="p-6">
       <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingMember ? "Editar Sócio" : "Novo Sócio"}>
        <MemberForm initialData={editingMember} onSave={handleSave} onClose={() => setIsModalOpen(false)} />
       </Modal>
       
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Sócios Cadastrados</h1>
        <div className="flex gap-2">
            <button onClick={exportToCSV} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg shadow-sm hover:bg-emerald-100 transition-colors">
                <DownloadIcon className="w-5 h-5" />
                CSV
            </button>
            <button onClick={exportToExcel} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg shadow-sm hover:bg-emerald-100 transition-colors">
                <DownloadIcon className="w-5 h-5" />
                Excel
            </button>
            <button onClick={syncWithImported} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg shadow-sm hover:bg-emerald-700 transition-colors">
                <CogIcon className="w-5 h-5" />
                Sincronizar Fevereiro
            </button>
            <button onClick={handleAddNew} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg shadow-sm hover:bg-emerald-700 transition-colors">
                <PlusIcon className="w-5 h-5" />
                Novo Sócio
            </button>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou CPF..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as MemberStatus | 'all')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">Todos os Status</option>
              {Object.values(MemberStatus).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">Nome</th>
              <th scope="col" className="px-6 py-3">CPF</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map(member => (
              <tr key={member.id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{member.name}</td>
                <td className="px-6 py-4">{member.cpf}</td>
                <td className="px-6 py-4">
                  <MemberStatusBadge status={member.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleEdit(member)} className="font-medium text-emerald-600 hover:text-emerald-800 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-100">
                    Editar Dados
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
       {filteredMembers.length === 0 && (
          <div className="text-center py-10 bg-white rounded-b-lg">
              <p className="text-gray-500">Nenhum sócio encontrado.</p>
          </div>
        )}
    </div>
  );
};
