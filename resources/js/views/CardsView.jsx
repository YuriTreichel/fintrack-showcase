import React, { useState, useMemo, useEffect } from 'react';
import { CreditCard, Trash2, Settings, ArrowLeft, ChevronLeft, ChevronRight, ShoppingBag, Tag, Plus, CheckCircle, FastForward } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import CardModal from '../modals/CardModal';
import TransactionModal from '../modals/TransactionModal'; 
import CustomDatePicker from '../components/ui/CustomDatePicker';
import CustomSelect from '../components/ui/CustomSelect'; // IMPORTADO CORRETAMENTE!
import { useFinStore } from '../store/useFinStore';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import TransactionRecurrenceConfirmModal from '../modals/TransactionRecurrenceConfirmModal';
import { CATEGORY_ICONS } from '../constants/theme';

const renderCardBrandLogo = (brand) => {
  const brandLower = (brand || '').toLowerCase();
  
  // Base container styles
  const containerClass = "w-12 h-8 bg-zinc-200/50 dark:bg-black/40 rounded flex items-center justify-center border border-zinc-900/10 dark:border-white/10 backdrop-blur-md overflow-hidden relative";

  if (brandLower.includes('mastercard')) {
    return (
      <div className={containerClass}>
        <div className="w-4 h-4 bg-[#ff6b6b]/80 rounded-full -mr-1.5 mix-blend-screen"></div>
        <div className="w-4 h-4 bg-[#feca57]/80 rounded-full mix-blend-screen"></div>
      </div>
    );
  }

  if (brandLower.includes('visa')) {
    return (
      <div className={containerClass}>
        <span className="text-[11px] font-black italic text-[#1a1f71] dark:text-[#4d56f0] tracking-tighter">VISA</span>
      </div>
    );
  }

  if (brandLower.includes('american') || brandLower.includes('amex')) {
    return (
      <div className={containerClass}>
        <div className="bg-[#016fd0] w-full h-full flex items-center justify-center">
            <span className="text-[8px] font-black text-white uppercase tracking-tighter">AMEX</span>
        </div>
      </div>
    );
  }

  if (brandLower.includes('elo')) {
    return (
      <div className={containerClass}>
        <div className="flex -space-x-1 items-center">
          <div className="w-3 h-3 bg-[#fcc011] rounded-full border border-black/10"></div>
          <div className="w-3 h-3 bg-[#e61c24] rounded-full border border-black/10"></div>
          <div className="w-3 h-3 bg-[#00a1e3] rounded-full border border-black/10"></div>
        </div>
      </div>
    );
  }

  if (brandLower.includes('hiper')) {
    return (
      <div className={containerClass}>
        <div className="bg-[#e31a22] w-full h-full flex items-center justify-center">
          <span className="text-[7px] font-black text-white uppercase italic tracking-tighter">Hiper</span>
        </div>
      </div>
    );
  }

  // Default / Outros
  return (
    <div className={containerClass}>
      <CreditCard size={14} className="text-zinc-500" />
    </div>
  );
};

export default function CardsView({
  fetchData,
  showToast,
  showConfirm,
  isReadOnly,
  searchTerm,
}) {
  // PUXANDO AS CATEGORIAS TAMBÉM PARA PASSAR PARA O MODAL DE TRANSAÇÕES
  const { cards, setCards, accounts, categories, selectedProfile, user } = useFinStore();

  const profileCards = useMemo(
    () => (Array.isArray(cards) ? cards : []).filter((c) => c.user_id === selectedProfile?.id),
    [cards, selectedProfile],
  );

  // OPÇÕES DO BANCO PARA O CUSTOM SELECT
  const accountOptions = useMemo(() => {
    return (Array.isArray(accounts) ? accounts : []).map(acc => ({
      value: acc.id,
      label: acc.name
    }));
  }, [accounts]);

  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // ESTADOS DA VISÃO DE FATURA
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const [invoiceDate, setInvoiceDate] = useState(new Date());
  const [invoiceData, setInvoiceData] = useState({ 
    transactions: [], 
    total: 0, 
    usedLimit: 0, 
    currentAvailable: 0, 
    cardLimit: 0,
    status: 'Open',
    is_paid: false,
    is_closed: false
  });
  const [isLoadingInvoice, setIsLoadingInvoice] = useState(false);

  // ESTADOS DE PAGAMENTO E NOVA COMPRA
  const [payingCard, setPayingCard] = useState(null);
  const [isPaying, setIsPaying] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false); 
  
  // CORREÇÃO: ADICIONADO O ACCOUNT_ID AO FORMULÁRIO DE PAGAMENTO
  const [invoiceForm, setInvoiceForm] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    account_id: '' 
  });

  const [recurrenceConfig, setRecurrenceConfig] = useState({
    isOpen: false,
    transaction: null,
    type: "delete",
  });

  const handleEdit = (card) => {
    setEditingCard(card);
    setIsCardModalOpen(true);
  };

  const handleClose = () => {
    setEditingCard(null);
    setIsCardModalOpen(false);
  };

  const handleDelete = (id) => {
    showConfirm(
      "Excluir Cartão",
      "Tem certeza que deseja excluir este cartão?",
      async () => {
        const previousState = [...cards];
        setCards((Array.isArray(cards) ? cards : []).filter((c) => c.id !== id));

        try {
          const res = await fetch(`/api/cards/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          if (res.ok) {
            showToast("Cartão excluído com sucesso!", "success");
            fetchData();
            if (viewingInvoice?.id === id) setViewingInvoice(null);
          } else {
            setCards(previousState);
            showToast("Erro ao excluir cartão.", "error");
          }
        } catch (e) {
          setCards(previousState);
          showToast("Erro de conexão.", "error");
        }
      },
    );
  };

  const fetchInvoice = async (card, date) => {
    setIsLoadingInvoice(true);
    try {
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      
      const res = await fetch(`/api/cards/${card.id}/invoice?month=${month}&year=${year}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setInvoiceData({
          transactions: data.transactions || [],
          total: parseFloat(data.invoiceTotal || 0),
          usedLimit: parseFloat(data.usedLimit || 0),
          currentAvailable: parseFloat(data.currentAvailable || 0),
          cardLimit: parseFloat(data.cardLimit || 0),
          status: data.status || 'Open',
          is_paid: data.is_paid || false,
          is_closed: data.is_closed || false
        });
      }
    } catch (e) {
      console.error("Erro ao buscar fatura:", e);
      showToast("Erro ao carregar fatura.", "error");
    } finally {
      setIsLoadingInvoice(false);
    }
  };

  const handleDeleteTransaction = (transaction) => {
    if (transaction.is_fixed || transaction.parent_id) {
      setRecurrenceConfig({
        isOpen: true,
        transaction,
        type: "delete",
      });
      return;
    }

    showConfirm(
      "Excluir Transação",
      "Tem certeza que deseja excluir esta transação? Se for uma compra parcelada, apenas esta parcela será excluída.",
      async () => {
        executeDeleteTransaction(transaction, "only");
      },
    );
  };

  const executeDeleteTransaction = async (transaction, mode) => {
    try {
      const res = await fetch(`/api/transactions/${transaction.id}?mode=${mode}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) {
        showToast("Transação excluída com sucesso!", "success");
        fetchData();
        if (viewingInvoice) fetchInvoice(viewingInvoice, invoiceDate);
      } else {
        showToast("Erro ao excluir transação.", "error");
      }
    } catch (e) {
      showToast("Erro de conexão.", "error");
    }
  };

  useEffect(() => {
    if (viewingInvoice) {
      fetchInvoice(viewingInvoice, invoiceDate);
    }
  }, [viewingInvoice, invoiceDate]);

  const handlePrevMonth = () => setInvoiceDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNextMonth = () => setInvoiceDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const handlePayInvoice = async (e) => {
    e.preventDefault();
    if (!invoiceForm.amount || invoiceForm.amount <= 0) {
      showToast("Insira um valor válido para a fatura.", "error");
      return;
    }
    if (!invoiceForm.account_id) {
      showToast("Selecione uma conta para debitar o pagamento.", "error");
      return;
    }

    setIsPaying(true);
    const [year, month] = invoiceForm.date.split('-');

    try {
      const res = await fetch(`/api/cards/${payingCard.id}/pay-invoice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          account_id: invoiceForm.account_id,
          amount: parseFloat(invoiceForm.amount),
          date: invoiceForm.date,
          month: parseInt(month),
          year: parseInt(year),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast("Pagamento registrado com sucesso!", "success");
        setPayingCard(null);
        fetchData(); 
      } else {
        showToast(data.error || "Erro ao pagar a fatura.", "error");
      }
    } catch (e) {
      showToast("Erro de conexão.", "error");
    } finally {
      setIsPaying(false);
    }
  };

  // ==========================================
  // RENDERIZAÇÃO: VISÃO DE FATURA DETALHADA
  // ==========================================
  if (viewingInvoice) {
    const limit = parseFloat(viewingInvoice.limit || 0);
    const usedLimit = invoiceData.usedLimit;
    const availableLimit = limit - usedLimit;
    const progressPercent = limit > 0 ? Math.min((usedLimit / limit) * 100, 100) : 0;

    return (
      <div className="space-y-6 animate-in slide-in-from-right-8 duration-500 pb-10">
        
        {/* Cabeçalho */}
        <PageHeader
          icon={CreditCard}
          title={viewingInvoice.name}
          subtitle={`Vencimento todo dia ${viewingInvoice.due_day}`}
          label={
            <>
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-fin-mint/10 text-fin-mint border-fin-mint/20">
                {viewingInvoice.brand || 'Cartão'}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border ${
                invoiceData.status === 'Paid' 
                  ? 'bg-fin-mint/10 text-fin-mint border-fin-mint/20' 
                  : invoiceData.status === 'Closed'
                    ? 'bg-[#ff7b7b]/10 text-[#ff7b7b] border-[#ff7b7b]/20'
                    : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
              }`}>
                {invoiceData.status === 'Paid' ? 'Paga' : invoiceData.status === 'Closed' ? 'Fechada' : 'Aberta'}
              </span>
            </>
          }
          actions={
            <Button 
              variant="secondary"
              size="icon"
              onClick={() => setViewingInvoice(null)}
              icon={ArrowLeft}
            />
          }
        />

        {/* Resumo da Fatura */}
        <div className="bg-fin-surface border border-zinc-900/10 dark:border-white/5 rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-fin-mint/5 blur-3xl rounded-full -mt-20 -mr-20 pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="flex items-center gap-4 bg-zinc-200/50 dark:bg-black/20 p-2 rounded-2xl border border-zinc-900/5 dark:border-white/5">
              <button onClick={handlePrevMonth} className="p-2 hover:bg-zinc-300/50 dark:hover:bg-white/10 rounded-xl transition-colors">
                <ChevronLeft size={20} className="text-zinc-600 dark:text-zinc-400" />
              </button>
              <div className="w-32 text-center">
                <p className="text-sm font-bold text-zinc-900 dark:text-white capitalize">
                  {format(invoiceDate, "MMMM", { locale: ptBR })}
                </p>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                  {format(invoiceDate, "yyyy")}
                </p>
              </div>
              <button onClick={handleNextMonth} className="p-2 hover:bg-zinc-300/50 dark:hover:bg-white/10 rounded-xl transition-colors">
                <ChevronRight size={20} className="text-zinc-600 dark:text-zinc-400" />
              </button>
            </div>

            <div className="flex-1 w-full flex flex-col items-center md:items-end">
              <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-1">Total da Fatura</p>
              <h3 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tighter">
                {formatCurrency(invoiceData.total)}
              </h3>
            </div>
          </div>

          <div className="mt-10 relative z-10">
            <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-3">
              <span className="text-zinc-500">Limite Utilizado</span>
              <span className="text-fin-mint">Projetado: {formatCurrency(availableLimit > 0 ? availableLimit : 0)}</span>
            </div>
            <div className="h-4 w-full bg-zinc-200 dark:bg-black/40 rounded-full overflow-hidden border border-zinc-900/10 dark:border-white/5 flex">
              <div className={`h-full transition-all duration-1000 ease-out ${progressPercent > 90 ? 'bg-[#ff7b7b]' : 'bg-fin-mint'}`} style={{ width: `${progressPercent}%` }}></div>
            </div>
            <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-2">
              <span>{progressPercent.toFixed(1)}% · Limite Total: {formatCurrency(limit)}</span>
              <span>Limite Disponível: {formatCurrency(invoiceData.currentAvailable)}</span>
            </div>
          </div>
        </div>

        {/* BOTÕES DE AÇÃO */}
        {!isReadOnly && (
          <div className="flex flex-wrap gap-4 mt-6">
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => setIsTransactionModalOpen(true)}
              icon={Plus}
            >
              Nova Compra
            </Button>

            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setPayingCard(viewingInvoice);
                setInvoiceForm({ 
                  amount: invoiceData.total > 0 ? invoiceData.total : '',
                  date: new Date().toISOString().split('T')[0],
                  account_id: accounts.length > 0 ? accounts[0].id : ''
                });
              }}
              icon={CheckCircle}
            >
              Pagar Fatura
            </Button>

            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setPayingCard(viewingInvoice);
                setInvoiceForm({ 
                  amount: '',
                  date: new Date().toISOString().split('T')[0],
                  account_id: accounts.length > 0 ? accounts[0].id : ''
                });
              }}
              icon={FastForward}
            >
              Adiantar
            </Button>
          </div>
        )}

        {/* Lista de Transações */}
        <div className="mt-8">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4 ml-2">Compras deste mês</h3>
          
          {isLoadingInvoice ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-fin-mint/30 border-t-fin-mint rounded-full animate-spin mb-4"></div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest animate-pulse">Carregando compras...</p>
            </div>
          ) : invoiceData.transactions.length === 0 ? (
            <div className="bg-fin-surface border border-zinc-900/10 dark:border-white/5 rounded-[24px] py-16 text-center shadow-lg">
              <ShoppingBag className="mx-auto text-zinc-400 mb-4 opacity-50" size={40} />
              <p className="text-zinc-500 font-medium">Nenhuma compra registrada nesta fatura.</p>
            </div>
          ) : (
            <div className="bg-fin-surface border border-zinc-900/10 dark:border-white/5 rounded-[24px] shadow-lg overflow-hidden">
              {invoiceData.transactions.map((tx, idx) => (
                <div 
                  key={tx.id} 
                  className={`flex items-center justify-between p-5 hover:bg-zinc-100/50 dark:hover:bg-white/5 transition-colors ${idx !== invoiceData.transactions.length - 1 ? 'border-b border-zinc-900/5 dark:border-white/5' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-zinc-900/10 dark:border-white/5 ${invoiceData.status === 'Paid' ? 'bg-fin-mint/10 text-fin-mint' : 'bg-zinc-200/50 dark:bg-black/20 text-zinc-500'}`}>
                      {tx.category_icon && CATEGORY_ICONS[tx.category_icon] ? (
                        React.cloneElement(CATEGORY_ICONS[tx.category_icon], { size: 16 })
                      ) : (
                        <Tag size={16} />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-zinc-900 dark:text-white text-sm">
                        {tx.description}
                        {(tx.is_fixed === 1 || tx.is_fixed === '1' || tx.is_fixed === true) ? (
                          <span className="ml-2 text-[10px] bg-fin-mint/10 text-fin-mint px-1.5 py-0.5 rounded border border-fin-mint/20 font-bold uppercase">
                            Fixo
                          </span>
                        ) : tx.total_installments > 1 && (
                          <span className="ml-2 text-[10px] text-zinc-500 font-bold">
                            ({tx.installment_number}/{tx.total_installments})
                          </span>
                        )}
                        {invoiceData.status === 'Paid' && (
                          <span className="ml-2 text-[9px] bg-fin-mint text-fin-bg px-1 rounded font-black uppercase tracking-tighter">Paga</span>
                        )}
                      </p>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">
                        {format(parseISO(tx.date), "dd 'de' MMM", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-bold text-zinc-900 dark:text-white">
                      {formatCurrency(tx.amount)}
                    </p>
                    {!isReadOnly && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTransaction(tx);
                        }}
                        className="p-2 text-zinc-400 hover:text-[#ff7b7b] transition-colors"
                        title="Excluir Transação"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CORREÇÃO: MODAL DE TRANSAÇÃO RECEBENDO AS PROPS NECESSÁRIAS */}
        {isTransactionModalOpen && (
          <TransactionModal
            onClose={() => setIsTransactionModalOpen(false)}
            onSuccess={() => {
              fetchData(); 
              fetchInvoice(viewingInvoice, invoiceDate); 
            }}
            initialType="Expense"
            initialData={{
              card_id: viewingInvoice.id, 
              date: new Date().toISOString().split('T')[0]
            }}
            lockCard={true}
            categories={categories}
            accounts={accounts}
            cards={cards}
          />
        )}

        {/* MODAL DE PAGAR/ADIANTAR FATURA COM CUSTOM SELECT */}
        {payingCard && (
          <div className="fixed inset-0 z-[200] overflow-y-auto bg-zinc-200/50 dark:bg-black/60 backdrop-blur-sm">
            <div className="flex min-h-full items-center justify-center p-4 animate-in fade-in duration-300 ease-out">
              <div className="bg-fin-surface w-full max-w-sm rounded-[24px] shadow-2xl border border-zinc-900/10 dark:border-white/5 relative">
                <div className="p-6 border-b border-zinc-900/10 dark:border-white/5 flex items-center justify-between bg-zinc-200/50 dark:bg-black/20 rounded-t-[24px]">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Pagar / Adiantar Fatura</h3>
                    <p className="text-xs text-zinc-500 mt-1">{payingCard.name}</p>
                  </div>
                </div>
                <form onSubmit={handlePayInvoice} className="p-6 space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-wider">
                      Valor do Pagamento (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      className="w-full bg-zinc-200/50 dark:bg-black/20 border border-zinc-900/10 dark:border-white/5 rounded-2xl px-4 py-3 outline-none text-zinc-900 dark:text-white transition-all focus:ring-1 focus:ring-white/10"
                      placeholder="Ex: 1250.00"
                      value={invoiceForm.amount}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-wider">
                      Data do Pagamento
                    </label>
                    <CustomDatePicker
                      value={invoiceForm.date}
                      onChange={(val) => setInvoiceForm({ ...invoiceForm, date: val })}
                      triggerClassName="w-full bg-zinc-200/50 dark:bg-black/20 border border-zinc-900/10 dark:border-white/5 rounded-2xl px-4 py-3 outline-none text-zinc-900 dark:text-white hover:bg-zinc-200/80 dark:hover:bg-white/5 transition-all focus:ring-1 focus:ring-white/10"
                    />
                  </div>

                  {/* CORREÇÃO: CUSTOM SELECT DE CONTA */}
                  <div className="space-y-1 pt-2">
                    <label className="text-xs font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-wider">
                      Debitar de qual conta?
                    </label>
                    <CustomSelect
                      value={invoiceForm.account_id}
                      onChange={(val) => setInvoiceForm({ ...invoiceForm, account_id: val })}
                      options={accountOptions}
                      placeholder="Selecione uma conta..."
                      triggerClassName="w-full bg-zinc-200/50 dark:bg-black/20 border border-zinc-900/10 dark:border-white/5 rounded-2xl px-4 py-3 outline-none text-zinc-900 dark:text-white hover:bg-zinc-200/80 dark:hover:bg-white/5 transition-all focus:ring-1 focus:ring-white/10 z-50"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setPayingCard(null)}
                      className="flex-1 py-3 rounded-xl font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-900/10 dark:hover:bg-white/5 transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isPaying}
                      className="flex-1 bg-fin-mint text-fin-bg py-3 rounded-xl font-bold hover:brightness-110 transition-all shadow-lg shadow-fin-mint/20 disabled:opacity-50"
                    >
                      {isPaying ? 'Processando...' : 'Confirmar'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <TransactionRecurrenceConfirmModal
          isOpen={recurrenceConfig.isOpen}
          onClose={() => setRecurrenceConfig({ ...recurrenceConfig, isOpen: false })}
          onConfirm={(mode) => {
            executeDeleteTransaction(recurrenceConfig.transaction, mode);
            setRecurrenceConfig({ ...recurrenceConfig, isOpen: false });
          }}
          type="delete"
          transaction={recurrenceConfig.transaction}
        />
      </div>
    );
  }

  // ==========================================
  // RENDERIZAÇÃO: MODO GRID DE CARTÕES (PADRÃO)
  // ==========================================
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <PageHeader
        icon={CreditCard}
        title="Cartões de Crédito"
        subtitle="Gerencie limites, faturas e acompanhe seus gastos."
        label="Crédito"
        actions={
          !isReadOnly && (
            <Button 
              onClick={() => {
                setEditingCard(null);
                setIsCreating(true);
                setIsCardModalOpen(true);
              }}
              icon={Plus}
            >
              Novo Cartão
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isRefreshing ? (
          <>
            {Array.from({ length: Math.max(1, profileCards.length + (isCreating ? 1 : 0)) }).map((_, index) => (
              <div key={index} className="col-span-1 flex flex-col animate-pulse">
                <div className="bg-zinc-200/50 dark:bg-white/5 p-7 rounded-[24px] h-56 flex flex-col justify-between border border-zinc-900/5 dark:border-white/5">
                  <div className="flex justify-between w-full">
                    <div className="w-12 h-8 bg-zinc-300/50 dark:bg-white/10 rounded"></div>
                    <div className="w-16 h-7 bg-zinc-300/50 dark:bg-white/10 rounded-lg"></div>
                  </div>
                  <div>
                    <div className="h-6 w-2/3 bg-zinc-300/50 dark:bg-white/10 rounded-md mb-2"></div>
                    <div className="h-3 w-1/3 bg-zinc-300/50 dark:bg-white/10 rounded-md"></div>
                  </div>
                </div>
                <div className="flex justify-between mt-4 px-2">
                  <div className="h-8 w-24 bg-zinc-200/50 dark:bg-white/5 rounded-md"></div>
                  <div className="h-8 w-24 bg-zinc-200/50 dark:bg-white/5 rounded-md"></div>
                </div>
              </div>
            ))}
          </>
        ) : profileCards.length === 0 ? (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-zinc-900/10 dark:border-white/10 rounded-[24px]">
            <CreditCard className="mx-auto text-zinc-600 mb-4 opacity-50" size={48} />
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">
              Nenhum cartão adicionado
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
              Centralize seus gastos e limites num só lugar.
            </p>
            <button
              onClick={() => {
                setIsCreating(true);
                setIsCardModalOpen(true);
              }}
              className="bg-fin-surface border border-zinc-900/10 dark:border-white/10 hover:bg-zinc-900/10 dark:hover:bg-white/10 dark:bg-white/5 transition-colors px-6 py-3 rounded-xl font-bold text-zinc-900 dark:text-white text-sm shadow-sm"
            >
              + Adicionar Cartão
            </button>
          </div>
        ) : (
          <>
            {profileCards
              .filter((c) => {
                if (searchTerm) return c.name.toLowerCase().includes(searchTerm.toLowerCase());
                return true;
              })
              .map((card) => {
                return (
                  <div 
                    key={card.id} 
                    className="col-span-1 flex flex-col group cursor-pointer"
                    onClick={() => setViewingInvoice(card)} 
                  >
                    <div className="bg-gradient-to-tr from-white to-zinc-50 dark:from-zinc-900/60 dark:to-zinc-900/40 backdrop-blur-md p-5 md:p-6 rounded-[24px] shadow-lg text-zinc-900 dark:text-white relative overflow-hidden border border-zinc-200 dark:border-white/5 group-hover:border-fin-mint/30 group-hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-48 md:h-56 flex flex-col justify-between">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-fin-mint/5 dark:bg-fin-mint/[0.02] blur-3xl -mt-20 -mr-20"></div>

                      <div className="absolute -bottom-6 -right-6 text-zinc-300/10 dark:text-white/[0.02] group-hover:scale-110 transition-transform duration-300 pointer-events-none">
                        <CreditCard size={120} />
                      </div>

                      <div className="flex items-center justify-between relative z-10 w-full">
                        <div className="flex items-center gap-3">
                          {renderCardBrandLogo(card.brand)}
                          <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border ${
                            card.invoice_status === 'Paid' 
                              ? 'bg-fin-mint/10 text-fin-mint border-fin-mint/20' 
                              : card.invoice_status === 'Closed'
                                ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                          }`}>
                            {card.invoice_status === 'Paid' ? 'Paga' : card.invoice_status === 'Closed' ? 'Fechada' : 'Aberta'}
                          </span>
                        </div>
                        <div className="hidden md:flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 relative z-20">
                          {!isReadOnly && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(card);
                                  setIsCreating(false);
                                }}
                                className="p-2 border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-800 rounded-xl text-zinc-500 hover:text-fin-mint hover:bg-fin-mint/10 transition-all cursor-pointer shadow-sm pointer-events-auto"
                                title="Configurar"
                              >
                                <Settings size={14} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(card.id);
                                }}
                                className="p-2 border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-800 rounded-xl text-zinc-500 hover:text-red-555 hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer shadow-sm pointer-events-auto"
                                title="Excluir"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                        <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest absolute right-0 group-hover:opacity-0 transition-opacity pointer-events-none">
                          {card.brand || 'FinTrack'}
                        </p>
                      </div>

                      <div className="relative z-10">
                        <h4 className="text-lg md:text-xl font-black mb-1 tracking-tight truncate">
                          {card.name}
                        </h4>
                        <p className="text-[9px] text-zinc-500 dark:text-zinc-400 uppercase font-black tracking-widest truncate">
                          Limite: {formatCurrency(card.limit || 0)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 px-2">
                      <div className="bg-zinc-50 dark:bg-black/10 px-4 py-2.5 rounded-2xl flex-1 flex flex-col border border-zinc-200 dark:border-white/5">
                        <p className="mb-0.5 font-black text-[8px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Fechamento</p>
                        <p className="text-zinc-700 dark:text-zinc-300 text-xs font-black font-mono">
                          DIA {card.closing_day}
                        </p>
                      </div>
                      <div className="w-3"></div>
                      <div className="bg-red-500/5 dark:bg-red-500/10 px-4 py-2.5 rounded-2xl flex-1 flex flex-col border border-red-500/10 dark:border-red-500/20 text-right">
                        <p className="mb-0.5 font-black text-[8px] text-red-500 dark:text-red-400 uppercase tracking-widest">
                          Vencimento
                        </p>
                        <p className="text-red-500 dark:text-red-400 text-xs font-black font-mono">
                          DIA {card.due_day}
                        </p>
                      </div>
                    </div>

                    {/* Ações Mobile */}
                    {!isReadOnly && (
                      <div className="mt-4 pt-4 border-t border-zinc-900/5 dark:border-white/5 flex gap-2 md:hidden px-2 relative z-20">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(card);
                            setIsCreating(false);
                          }}
                          className="flex-1 flex items-center justify-center gap-2 py-2 bg-zinc-900/5 dark:bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400"
                        >
                          <Settings size={12} /> Configurar
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(card.id);
                          }}
                          className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#ff7b7b]/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#ff7b7b]"
                        >
                          <Trash2 size={12} /> Excluir
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
          </>
        )}
      </div>

      {isCardModalOpen && (
        <CardModal
          onClose={handleClose}
          accounts={accounts}
          initialData={editingCard}
          onSuccess={async () => {
            setIsRefreshing(true);
            await fetchData(); 
            setIsRefreshing(false);
          }}
        />
      )}
    </div>
  );
}