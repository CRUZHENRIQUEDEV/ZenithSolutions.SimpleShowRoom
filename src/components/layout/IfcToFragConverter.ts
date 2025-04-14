import { Serializer } from "@thatopen/fragments";

export class IfcToFragService {
  private readonly serializer: Serializer;

  constructor() {
    this.serializer = new Serializer();
    // A configuração do WASM provavelmente é feita de outra forma ou interna à biblioteca
  }

  public async convert(ifcData: File | ArrayBuffer): Promise<ArrayBuffer> {
    try {
      console.log("Iniciando conversão de IFC para Fragments...");

      let ifcBytes: Uint8Array;

      if (ifcData instanceof File) {
        console.log(
          `Arquivo: ${ifcData.name}, Tamanho: ${(
            ifcData.size /
            1024 /
            1024
          ).toFixed(2)} MB`
        );
        const buffer = await ifcData.arrayBuffer();
        ifcBytes = new Uint8Array(buffer);
        console.log("Arquivo carregado em memória.");
      } else if (ifcData instanceof ArrayBuffer) {
        ifcBytes = new Uint8Array(ifcData);
        console.log("ArrayBuffer IFC recebido.");
      } else {
        throw new Error(
          "Tipo de dado IFC não suportado. Forneça um File ou ArrayBuffer."
        );
      }

      console.log("Iniciando processamento...");
      const fragmentsGroup = this.serializer.import(ifcBytes);
      const result = this.serializer.export(fragmentsGroup);
      console.log("Processamento concluído!");
      console.log(
        `Tamanho do arquivo convertido: ${(
          result.byteLength /
          1024 /
          1024
        ).toFixed(2)} MB`
      );

      return result.buffer as ArrayBuffer;
    } catch (error) {
      console.error("Erro na conversão IFC:", error);
      throw error;
    }
  }
}
