import { useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
}

/**
 * CurrencyInput - Input com máscara de moeda brasileira em tempo real
 * 
 * Formata automaticamente enquanto o usuário digita:
 * - Ponto como separador de milhares
 * - Vírgula como separador decimal
 * - Duas casas decimais
 * 
 * Exemplo: digita "1000" → exibe "1.000,00"
 */
const CurrencyInput = ({
  value,
  onChange,
  className,
  placeholder = "0,00",
  disabled = false,
  min,
  max,
}: CurrencyInputProps) => {
  // Formatar número para exibição brasileira
  const formatToBRL = useCallback((num: number): string => {
    return num.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, []);

  // Estado para o valor exibido (formatado)
  const [displayValue, setDisplayValue] = useState(() => formatToBRL(value));
  const inputRef = useRef<HTMLInputElement>(null);
  const cursorPositionRef = useRef<number>(0);

  // Atualizar display quando value externo muda
  useEffect(() => {
    setDisplayValue(formatToBRL(value));
  }, [value, formatToBRL]);

  // Converter string formatada para centavos (inteiro)
  const parseToCents = (str: string): number => {
    // Remove tudo exceto números
    const digits = str.replace(/\D/g, '');
    return parseInt(digits, 10) || 0;
  };

  // Converter centavos para valor decimal
  const centsToDecimal = (cents: number): number => {
    return cents / 100;
  };

  // Handler principal - formata em tempo real
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const rawValue = input.value;
    
    // Pegar posição do cursor antes da formatação
    const cursorPos = input.selectionStart || 0;
    const oldLength = displayValue.length;
    
    // Converter para centavos e depois para decimal
    const cents = parseToCents(rawValue);
    let decimalValue = centsToDecimal(cents);
    
    // Aplicar limites se definidos
    if (min !== undefined && decimalValue < min) {
      decimalValue = min;
    }
    if (max !== undefined && decimalValue > max) {
      decimalValue = max;
    }
    
    // Formatar para exibição
    const formatted = formatToBRL(decimalValue);
    
    // Calcular nova posição do cursor
    const newLength = formatted.length;
    const lengthDiff = newLength - oldLength;
    cursorPositionRef.current = Math.max(0, cursorPos + lengthDiff);
    
    // Atualizar estados
    setDisplayValue(formatted);
    onChange(decimalValue);
  };

  // Restaurar posição do cursor após renderização
  useEffect(() => {
    if (inputRef.current && document.activeElement === inputRef.current) {
      const pos = cursorPositionRef.current;
      inputRef.current.setSelectionRange(pos, pos);
    }
  }, [displayValue]);

  // Handler para teclas especiais
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Permitir: backspace, delete, tab, escape, enter
    if ([8, 46, 9, 27, 13].includes(e.keyCode)) {
      return;
    }
    
    // Permitir: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    if ((e.ctrlKey || e.metaKey) && [65, 67, 86, 88].includes(e.keyCode)) {
      return;
    }
    
    // Permitir: home, end, setas
    if (e.keyCode >= 35 && e.keyCode <= 40) {
      return;
    }
    
    // Bloquear se não for número
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && 
        (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }
  };

  // Handler para paste - limpar e formatar
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const cents = parseToCents(pastedText);
    const decimalValue = centsToDecimal(cents);
    const formatted = formatToBRL(decimalValue);
    setDisplayValue(formatted);
    onChange(decimalValue);
  };

  // Selecionar tudo ao focar
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setTimeout(() => {
      e.target.select();
    }, 0);
  };

  return (
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium pointer-events-none">
        R$
      </span>
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onFocus={handleFocus}
        disabled={disabled}
        placeholder={placeholder}
        className={cn(
          "w-full h-14 pl-12 pr-4 rounded-xl bg-muted border border-border text-foreground text-lg font-medium focus:outline-none focus:ring-2 focus:ring-rook-pingado focus:border-transparent transition-all",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      />
    </div>
  );
};

export default CurrencyInput;
