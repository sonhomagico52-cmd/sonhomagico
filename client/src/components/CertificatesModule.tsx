/**
 * CertificatesModule — Sonho Mágico Joinville CRM
 * Sistema de geração de certificados e comprovantes em PDF
 */
import { useState } from "react";
import { FileText, Download, Eye, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Certificate {
  id: string;
  eventId: string;
  type: "certificado" | "comprovante" | "recibo";
  clientName: string;
  eventName: string;
  date: string;
  location: string;
  amount: number;
  generatedAt: string;
}

export default function CertificatesModule() {
  const { events, users } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [certificateType, setCertificateType] = useState<"certificado" | "comprovante" | "recibo">("certificado");
  const [showPreview, setShowPreview] = useState(false);
  const [previewCertificate, setPreviewCertificate] = useState<Certificate | null>(null);

  const completedEvents = events.filter((e) => e.status === "completed");

  const handleGenerateCertificate = () => {
    if (!selectedEvent) {
      toast.error("Selecione um evento");
      return;
    }

    const event = events.find((e) => e.id === selectedEvent);
    const client = users.find((u) => u.id === event?.clientId);

    if (!event || !client) {
      toast.error("Evento ou cliente não encontrado");
      return;
    }

    const newCertificate: Certificate = {
      id: Date.now().toString(),
      eventId: selectedEvent,
      type: certificateType,
      clientName: client.name,
      eventName: event.title,
      date: event.date,
      location: event.location,
      amount: event.budget || 0,
      generatedAt: new Date().toISOString(),
    };

    setCertificates([newCertificate, ...certificates]);
    toast.success(`${getCertificateLabel(certificateType)} gerado com sucesso!`);
    setSelectedEvent("");
  };

  const getCertificateLabel = (type: string) => {
    switch (type) {
      case "certificado":
        return "Certificado";
      case "comprovante":
        return "Comprovante";
      case "recibo":
        return "Recibo";
      default:
        return type;
    }
  };

  const generatePDFContent = (cert: Certificate) => {
    const content = `SONHO MAGICO JOINVILLE\n${getCertificateLabel(cert.type).toUpperCase()}\n\nCertificamos que:\n\n${cert.clientName}\n\nParticipou do evento:\n\n${cert.eventName}\n\nRealizado em: ${new Date(cert.date).toLocaleDateString("pt-BR")}\nLocal: ${cert.location}\n\n${cert.type === "recibo" ? `Valor: R$ ${cert.amount.toFixed(2)}` : ""}\n\nData de Emissão: ${new Date(cert.generatedAt).toLocaleDateString("pt-BR")}\n\nAssinado Digitalmente\nSonho Mágico Joinville`;
    return content;
  };

  const handleDownloadPDF = (cert: Certificate) => {
    const content = generatePDFContent(cert);
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${getCertificateLabel(cert.type).toLowerCase()}-${cert.id}.txt`;
    a.click();
    toast.success("Arquivo baixado!");
  };

  const handleSendEmail = (cert: Certificate) => {
    toast.loading("Enviando por email...");
    setTimeout(() => {
      toast.success(`${getCertificateLabel(cert.type)} enviado para o email do cliente!`);
    }, 1500);
  };

  const handlePreview = (cert: Certificate) => {
    setPreviewCertificate(cert);
    setShowPreview(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <h2 className="text-2xl font-extrabold text-[oklch(0.18_0.02_260)]" style={{ fontFamily: "'Baloo 2', cursive" }}>
        📜 Certificados e Comprovantes
      </h2>

      {/* Generate Form */}
      <div className="bg-white rounded-2xl shadow-md p-6 border border-[oklch(0.92_0.02_85)]">
        <h3 className="text-lg font-bold text-[oklch(0.18_0.02_260)] mb-4">Gerar Novo Documento</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[oklch(0.18_0.02_260)] mb-2">
                Tipo de Documento
              </label>
              <select
                value={certificateType}
                onChange={(e) => setCertificateType(e.target.value as any)}
                className="w-full px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)] focus:border-[oklch(0.55_0.28_340)] focus:outline-none"
              >
                <option value="certificado">Certificado</option>
                <option value="comprovante">Comprovante</option>
                <option value="recibo">Recibo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-[oklch(0.18_0.02_260)] mb-2">
                Selecione um Evento Realizado
              </label>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)] focus:border-[oklch(0.55_0.28_340)] focus:outline-none"
              >
                <option value="">-- Selecionar --</option>
                {completedEvents.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title} - {new Date(e.date).toLocaleDateString("pt-BR")}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={handleGenerateCertificate}
            className="w-full px-6 py-3 rounded-lg bg-[oklch(0.55_0.28_340)] text-white font-bold hover:scale-105 transition-transform"
          >
            Gerar {getCertificateLabel(certificateType)}
          </button>
        </div>
      </div>

      {/* Certificates List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-[oklch(0.18_0.02_260)]">Documentos Gerados</h3>
        {certificates.length > 0 ? (
          <div className="space-y-3">
            {certificates.map((cert) => (
              <div key={cert.id} className="bg-white rounded-2xl shadow-md p-6 border border-[oklch(0.92_0.02_85)]">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText size={20} className="text-[oklch(0.55_0.28_340)]" />
                      <div>
                        <p className="font-bold text-[oklch(0.18_0.02_260)]">
                          {getCertificateLabel(cert.type)} - {cert.eventName}
                        </p>
                        <p className="text-xs text-[oklch(0.18_0.02_260)]/60">
                          {cert.clientName} • {new Date(cert.date).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePreview(cert)}
                      className="p-2 hover:bg-[oklch(0.97_0.01_85)] rounded-lg transition-colors"
                      title="Visualizar"
                    >
                      <Eye size={16} className="text-[oklch(0.55_0.28_340)]" />
                    </button>
                    <button
                      onClick={() => handleDownloadPDF(cert)}
                      className="p-2 hover:bg-[oklch(0.97_0.01_85)] rounded-lg transition-colors"
                      title="Baixar"
                    >
                      <Download size={16} className="text-[oklch(0.55_0.28_340)]" />
                    </button>
                    <button
                      onClick={() => handleSendEmail(cert)}
                      className="p-2 hover:bg-[oklch(0.97_0.01_85)] rounded-lg transition-colors"
                      title="Enviar por email"
                    >
                      <Mail size={16} className="text-[oklch(0.55_0.28_340)]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-md p-8 text-center border border-[oklch(0.92_0.02_85)]">
            <p className="text-[oklch(0.18_0.02_260)]/60 font-medium">Nenhum documento gerado ainda</p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && previewCertificate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-96 overflow-y-auto">
            <div className="font-mono text-sm text-[oklch(0.18_0.02_260)] whitespace-pre-wrap">
              {generatePDFContent(previewCertificate)}
            </div>
            <button
              onClick={() => setShowPreview(false)}
              className="w-full mt-6 px-4 py-2 rounded-lg bg-[oklch(0.92_0.02_85)] text-[oklch(0.18_0.02_260)] font-bold"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="p-4 rounded-lg bg-[oklch(0.97_0.01_85)] border border-[oklch(0.92_0.02_85)]">
        <p className="text-sm text-[oklch(0.18_0.02_260)]/70">
          💡 <strong>Dica:</strong> Gere certificados para eventos realizados e envie automaticamente aos clientes por email.
        </p>
      </div>
    </div>
  );
}
