import React, { useState } from 'react';
import { Member, MembershipDue, Expense, Meeting } from '../types';
import { DownloadIcon, UploadIcon } from './Icons';

interface BackupPageProps {
  data: {
    members: Member[];
    dues: MembershipDue[];
    expenses: Expense[];
    meetings: Meeting[];
  };
  onRestore: (data: BackupPageProps['data']) => void;
}

export const BackupPage: React.FC<BackupPageProps> = ({ data, onRestore }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [restorableData, setRestorableData] = useState<BackupPageProps['data'] | null>(null);

  const handleExport = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    const link = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    link.href = jsonString;
    link.download = `backup_associacao_poções_${date}.json`;
    link.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result;
          if (typeof content === 'string') {
            const parsedData = JSON.parse(content);
            // Basic validation
            if (
              'members' in parsedData &&
              'dues' in parsedData &&
              'expenses' in parsedData &&
              'meetings' in parsedData
            ) {
              setRestorableData(parsedData);
            } else {
              alert('Arquivo de backup inválido. A estrutura dos dados está incorreta.');
              setFileName(null);
              setRestorableData(null);
            }
          }
        } catch (error) {
          alert('Erro ao ler o arquivo de backup. Certifique-se de que é um arquivo JSON válido.');
          setFileName(null);
          setRestorableData(null);
        }
      };
      reader.readAsText(file);
    }
    // Reset file input value to allow selecting the same file again
    event.target.value = '';
  };

  const handleRestore = () => {
    if (restorableData) {
      const isConfirmed = window.confirm(
        'ATENÇÃO!\n\nRestaurar este backup substituirá TODOS os dados atuais da aplicação.\n\nEsta ação não pode ser desfeita. Deseja continuar?'
      );
      if (isConfirmed) {
        onRestore(restorableData);
        alert('Backup restaurado com sucesso! A página será recarregada para aplicar as alterações.');
        window.location.reload();
      }
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Backup e Restauração</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Backup Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Cópia de Segurança</h2>
          <p className="text-gray-600 mb-6">
            Crie uma cópia de segurança de todos os dados da associação (sócios, finanças, reuniões). 
            O arquivo será salvo em seu computador no formato JSON. Guarde-o em um local seguro.
          </p>
          <button
            onClick={handleExport}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white font-semibold rounded-lg shadow-sm hover:bg-emerald-700 transition-colors"
          >
            <DownloadIcon className="w-5 h-5" />
            Exportar Dados
          </button>
        </div>

        {/* Restore Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Restaurar Backup</h2>
           <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-4 mb-6 rounded-r-lg" role="alert">
            <p className="font-bold">Atenção!</p>
            <p className="text-sm">Restaurar um backup substituirá TODOS os dados atuais. Esta ação não pode ser desfeita.</p>
          </div>
          <div className="space-y-4">
            <label
              htmlFor="backup-file"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-200 hover:border-gray-400 transition-colors"
            >
              <UploadIcon className="w-5 h-5" />
              <span>Selecionar Arquivo de Backup (.json)</span>
            </label>
            <input
              id="backup-file"
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileChange}
            />
            {fileName && (
              <p className="text-sm text-center text-gray-600">Arquivo selecionado: <span className="font-medium">{fileName}</span></p>
            )}
            <button
              onClick={handleRestore}
              disabled={!restorableData}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-sm hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Restaurar Dados
            </button>
          </div>
        </div>

        {/* Reset Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 lg:col-span-2">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Resetar Sistema</h2>
          <p className="text-gray-600 mb-6">
            Se você deseja apagar todos os dados atuais e começar do zero com a lista de sócios e leituras de Fevereiro fornecidas no documento, use o botão abaixo.
          </p>
          <button
            onClick={() => {
              if (window.confirm("ATENÇÃO: Isso apagará TODOS os sócios, faturas e despesas atuais para carregar a lista limpa de Fevereiro. Deseja continuar?")) {
                window.localStorage.clear();
                window.location.reload();
              }
            }}
            className="px-6 py-3 bg-orange-100 text-orange-700 font-bold rounded-lg hover:bg-orange-200 transition-colors"
          >
            Resetar e Carregar Dados de Fevereiro
          </button>
        </div>
      </div>
    </div>
  );
};