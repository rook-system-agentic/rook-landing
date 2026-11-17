export type Bf1FormField = "name" | "phone" | "email" | "restaurant";
export declare const BF1_FORM_CLARITY_EVENTS: Readonly<{
  open: "bf1_form_aberto";
  attempt: "bf1_form_tentativa";
  fieldError: Readonly<Record<Bf1FormField, string>>;
  verificationError: "bf1_form_erro_verificacao";
  sent: "bf1_form_enviado";
  failure: "bf1_form_falha_gravacao";
}>;
export declare function isAllowedClarityEvent(name: string): boolean;
export declare function pushClarityEvent(
  name: string,
  options?: { enabled?: boolean; target?: { clarity?: (...args: unknown[]) => void } },
): boolean;
