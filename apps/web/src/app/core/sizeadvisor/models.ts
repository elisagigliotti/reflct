// Rispecchia com.reflct.api.sizeadvisor.SizeAdvisorResponse.
export interface SizeAdvisorResponse {
  consigliata: string;
  fitScore: number; // 0-100
  dettaglio: Record<string, string>; // es. { busto_cm: "PERFETTO", vita_cm: "+2.3cm" }
}
