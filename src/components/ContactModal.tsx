import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Send, CheckCircle, Loader2, MessageCircle } from "lucide-react";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FormStatus = "idle" | "loading" | "success" | "error";

const ContactModal = ({ isOpen, onClose }: ContactModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    restaurant: "",
    message: "",
  });
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Erro ao enviar mensagem");
      }

      setStatus("success");
      setFormData({ name: "", email: "", restaurant: "", message: "" });
    } catch (error) {
      setStatus("error");
      setErrorMessage("Não foi possível enviar sua mensagem. Tente novamente.");
    }
  };

  const handleClose = () => {
    setStatus("idle");
    setErrorMessage("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-background rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-rook-pingado to-rook-marrom p-6 text-primary-foreground">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-primary-foreground/80 hover:text-primary-foreground transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Falar com Especialista</h2>
              <p className="text-sm text-primary-foreground/80">
                Resposta personalizada em até 24h
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {status === "success" ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-rook-verde/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-rook-verde" />
              </div>
              <h3 className="text-xl font-bold text-rook-cafe mb-2">
                Mensagem Enviada!
              </h3>
              <p className="text-muted-foreground mb-6">
                Obrigado! Um especialista entrará em contato em até 24h para
                ajudar com seu CMV.
              </p>
              <Button variant="rook" onClick={handleClose}>
                Continuar Explorando
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nome */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  Seu nome <span className="text-rook-terracota">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Como podemos te chamar?"
                  className="w-full h-11 px-4 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rook-pingado focus:border-transparent transition-all"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  Email <span className="text-rook-terracota">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="seu@email.com"
                  className="w-full h-11 px-4 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rook-pingado focus:border-transparent transition-all"
                />
              </div>

              {/* Restaurante */}
              <div>
                <label
                  htmlFor="restaurant"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  Nome do restaurante{" "}
                  <span className="text-muted-foreground">(opcional)</span>
                </label>
                <input
                  type="text"
                  id="restaurant"
                  name="restaurant"
                  value={formData.restaurant}
                  onChange={handleChange}
                  placeholder="Ex: Restaurante Sabor & Arte"
                  className="w-full h-11 px-4 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rook-pingado focus:border-transparent transition-all"
                />
              </div>

              {/* Mensagem */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  Qual seu maior desafio com CMV?{" "}
                  <span className="text-muted-foreground">(opcional)</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Conte um pouco sobre sua situação..."
                  className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rook-pingado focus:border-transparent transition-all resize-none"
                />
              </div>

              {/* Error Message */}
              {status === "error" && (
                <div className="bg-rook-terracota/10 text-rook-terracota text-sm p-3 rounded-lg">
                  {errorMessage}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant="rook"
                size="lg"
                className="w-full"
                disabled={status === "loading"}
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Enviar Mensagem
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Seus dados estão seguros. Não enviamos spam.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactModal;
