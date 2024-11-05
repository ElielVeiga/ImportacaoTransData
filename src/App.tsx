import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import '../src/styles/app_Style.css';
import { FileDown, TableProperties, FolderDown, X } from 'lucide-react';

const TabelaPedidos: React.FC = () => {
  const [dados, setDados] = useState<any[]>([]);
  const [colunasSelecionadas, setColunasSelecionadas] = useState<string[]>([]);
  const [linhasSelecionadas, setLinhasSelecionadas] = useState<number[]>([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalImportacaoConcluida, setMostrarModalImportacaoConcluida] = useState(false);
  const inputFileRef = useRef<HTMLInputElement | null>(null);

  const importarJSON = (evento: React.ChangeEvent<HTMLInputElement>) => {
    const arquivos = evento.target.files;
    if (arquivos) {
      const leitores = Array.from(arquivos).map((arquivo) => {
        return new Promise<void>((resolve) => {
          const leitor = new FileReader();
          leitor.onload = (e) => {
            const resultado = e.target?.result;
            if (typeof resultado === 'string') {
              try {
                const dadosImportados = JSON.parse(resultado);
                setDados((prevDados) => [...prevDados, ...dadosImportados]);
                const novasColunas = Array.from(
                  new Set([
                    ...colunasSelecionadas,
                    ...Object.keys(dadosImportados[0] || {})
                  ])
                );
                setColunasSelecionadas(novasColunas);
              } catch (error) {
                console.error("Erro ao analisar o JSON:", error);
              }
            }
            resolve();
          };
          leitor.readAsText(arquivo);
        });
      });
      Promise.all(leitores).then(() => {
        setMostrarModalImportacaoConcluida(true);
      });
    }
  };

  const cancelarSelecao = () => {
    setDados([]);
    setColunasSelecionadas([]);
    setLinhasSelecionadas([]);
    if (inputFileRef.current) {
      inputFileRef.current.value = "";
    }
  };

  const toggleColuna = (coluna: string) => {
    setColunasSelecionadas((prev) =>
      prev.includes(coluna)
        ? prev.filter((c) => c !== coluna)
        : [...prev, coluna]
    );
  };

  const toggleLinha = (index: number) => {
    setLinhasSelecionadas((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const excluirSelecionados = () => {
    const novasLinhas = dados.filter((_, index) => !linhasSelecionadas.includes(index));
    setDados(novasLinhas);
    setLinhasSelecionadas([]);
  };

  const abrirModal = () => setMostrarModal(true);
  const fecharModal = () => setMostrarModal(false);
  const fecharModalImportacaoConcluida = () => setMostrarModalImportacaoConcluida(false);

  const exportarParaExcel = () => {
    const dadosExportacao = dados.map(item => {
      const linha: any = {};
      colunasSelecionadas.forEach(coluna => {
        linha[coluna] = item[coluna];
      });
      return linha;
    });
    const worksheet = XLSX.utils.json_to_sheet(dadosExportacao);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dados");
    XLSX.writeFile(workbook, "Vimsa_Tabela.xlsx");
  };

  return (
    <div>
      <div className='Title'>
        <h1>Importação Trasdata</h1>
      </div>
      <div className='Menu'>
        <form className="form-upload">
          <label className="input-personalizado">
            <span className="botao-selecionar"><FileDown size={24} /></span>
            <span className="botao-selecionar">Importar</span>
            <input className='input-file' type="file" accept=".json" multiple onChange={importarJSON} ref={inputFileRef} />
          </label>
        </form>
        <div className='Exibir-Colunas' onClick={abrirModal}>
          <TableProperties size={24} />
          <p>Exibir Colunas</p>
        </div>
        <div className='Exportar' onClick={exportarParaExcel}>
          <FolderDown size={24} />
          <p>Exportar</p>
        </div>
        <div className='Cancelar' onClick={cancelarSelecao}>
          <X size={24} />
          <p>Cancelar</p>
        </div>
      </div>
      <div>
          <button className="Excluir" onClick={excluirSelecionados} style={{ marginLeft: '10px' }}>Excluir Selecionados</button>
        </div>
      {mostrarModal && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          padding: '20px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
          borderRadius: '20px',
          zIndex: 1000,
          width: '300px',
          textAlign: 'start'
        }}>
          <h2>EXIBIR COLUNAS</h2>
          {dados.length > 0 && Object.keys(dados[0]).map((chave, index) => (
            <div key={index}>
              <input
                type="checkbox"
                id={`coluna-${index}`}
                onChange={() => toggleColuna(chave)}
                checked={colunasSelecionadas.includes(chave)}
              />
              <label htmlFor={`coluna-${index}`}>{chave}</label>
            </div>
          ))}
          <X onClick={fecharModal} style={{ marginTop: '10px', cursor: 'pointer' }} />
        </div>
      )}
      {mostrarModalImportacaoConcluida && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          padding: '20px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
          borderRadius: '20px',
          zIndex: 1000,
          width: '400px',
          textAlign: 'center'
        }}>
          <h2>Importação Concluída</h2>
          <p>Os arquivos foram importados com sucesso!</p>
          <p style={{ fontWeight: '600' }}>Clique no botão Exibir para ver as colunas!</p>
          <X onClick={fecharModalImportacaoConcluida} style={{ marginTop: '10px', cursor: 'pointer' }} size={24} />
        </div>
      )}
      <table border={1} cellPadding="1" cellSpacing="0" style={{ marginTop: '20px', marginLeft: '10px' }}>
        <tbody>
          <tr>
            <th></th>
            {colunasSelecionadas.map((coluna, index) => (
              <th key={index}>{coluna}</th>
            ))}
          </tr>
          {dados.map((item, index) => (
            <tr key={index}>
              <td>
                <input
                  type="checkbox"
                  onChange={() => toggleLinha(index)}
                  checked={linhasSelecionadas.includes(index)}
                />
              </td>
              {colunasSelecionadas.map((coluna, i) => (
                <td key={i}>{item[coluna]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TabelaPedidos;
