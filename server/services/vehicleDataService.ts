// Service pour récupérer les données véhicule via API d'immatriculation
export interface VehicleData {
  brand: string;
  model: string;
  year: number;
  fuelType: string;
  power: number;
  co2Emission: number;
  displacement: number;
  transmission: string;
  doors: number;
  color: string;
  vehicleType: string;
  emissionClass: string;
  firstRegistrationDate: string;
  critAir: string;
  // Données supplémentaires disponibles selon l'API
  vin?: string;
  weight?: number;
  maxSpeed?: number;
  engineCode?: string;
}

export interface VehicleDataResponse {
  success: boolean;
  data?: VehicleData;
  error?: string;
  source: 'api' | 'cache' | 'manual';
}

class VehicleDataService {
  private apiKey: string;
  private apiUrl: string;
  private cache: Map<string, { data: VehicleData; timestamp: number }> = new Map();
  private cacheExpiry = 24 * 60 * 60 * 1000; // 24 heures

  constructor() {
    this.apiKey = process.env.VEHICLE_API_KEY || '';
    this.apiUrl = process.env.VEHICLE_API_URL || 'https://api-plaque-immatriculation.com/v1';
  }

  /**
   * Récupère les données d'un véhicule par son numéro d'immatriculation
   */
  async getVehicleData(registrationNumber: string): Promise<VehicleDataResponse> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'Clé API non configurée',
        source: 'manual'
      };
    }

    // Nettoyer le numéro d'immatriculation
    const cleanedRegNumber = this.cleanRegistrationNumber(registrationNumber);
    
    // Vérifier le cache d'abord
    const cached = this.getFromCache(cleanedRegNumber);
    if (cached) {
      return {
        success: true,
        data: cached,
        source: 'cache'
      };
    }

    try {
      // Appel à l'API externe
      const response = await fetch(`${this.apiUrl}/vehicle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          registration: cleanedRegNumber
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const apiData = await response.json();
      
      if (!apiData.success) {
        return {
          success: false,
          error: apiData.message || 'Véhicule non trouvé',
          source: 'api'
        };
      }

      // Transformer les données API vers notre format
      const vehicleData = this.transformApiData(apiData.data);
      
      // Mettre en cache
      this.saveToCache(cleanedRegNumber, vehicleData);

      return {
        success: true,
        data: vehicleData,
        source: 'api'
      };

    } catch (error) {
      console.error('Erreur API véhicule:', error);
      return {
        success: false,
        error: 'Service temporairement indisponible',
        source: 'manual'
      };
    }
  }

  /**
   * Nettoie le numéro d'immatriculation
   */
  private cleanRegistrationNumber(regNumber: string): string {
    return regNumber.replace(/[\s-]/g, '').toUpperCase();
  }

  /**
   * Récupère depuis le cache si disponible et valide
   */
  private getFromCache(regNumber: string): VehicleData | null {
    const cached = this.cache.get(regNumber);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }
    if (cached) {
      this.cache.delete(regNumber);
    }
    return null;
  }

  /**
   * Sauvegarde en cache
   */
  private saveToCache(regNumber: string, data: VehicleData): void {
    this.cache.set(regNumber, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Transforme les données de l'API vers notre format
   */
  private transformApiData(apiData: any): VehicleData {
    return {
      brand: apiData.marque || '',
      model: apiData.modele || '',
      year: parseInt(apiData.annee) || new Date().getFullYear(),
      fuelType: this.mapFuelType(apiData.energie),
      power: parseInt(apiData.puissance_fiscale) || 0,
      co2Emission: parseInt(apiData.emission_co2) || 0,
      displacement: parseInt(apiData.cylindree) || 0,
      transmission: this.mapTransmission(apiData.boite_vitesse),
      doors: parseInt(apiData.nombre_portes) || 5,
      color: apiData.couleur || '',
      vehicleType: this.mapVehicleType(apiData.genre),
      emissionClass: apiData.norme_euro || '',
      firstRegistrationDate: apiData.date_premiere_immatriculation || '',
      critAir: apiData.vignette_crit_air || '',
      vin: apiData.numero_vin,
      weight: parseInt(apiData.poids_vide) || undefined,
      maxSpeed: parseInt(apiData.vitesse_max) || undefined,
      engineCode: apiData.code_moteur
    };
  }

  /**
   * Mapping des types de carburant
   */
  private mapFuelType(apiEnergy: string): string {
    const mapping: { [key: string]: string } = {
      'ESSENCE': 'gasoline',
      'DIESEL': 'diesel',
      'ELECTRIQUE': 'electric',
      'HYBRIDE': 'hybrid',
      'GAZ': 'gasoline', // GPL/GNV -> gasoline pour simplifier
    };
    return mapping[apiEnergy?.toUpperCase()] || 'gasoline';
  }

  /**
   * Mapping des transmissions
   */
  private mapTransmission(apiTransmission: string): string {
    const mapping: { [key: string]: string } = {
      'MANUELLE': 'manual',
      'AUTOMATIQUE': 'automatic',
      'SEMI-AUTOMATIQUE': 'semi-automatic',
    };
    return mapping[apiTransmission?.toUpperCase()] || 'manual';
  }

  /**
   * Mapping des types de véhicule
   */
  private mapVehicleType(apiGenre: string): string {
    const mapping: { [key: string]: string } = {
      'BERLINE': 'berline',
      'BREAK': 'break',
      'COUPE': 'coupe',
      'CABRIOLET': 'cabriolet',
      'MONOSPACE': 'monospace',
      'SUV': 'suv',
      'CITADINE': 'citadine',
    };
    return mapping[apiGenre?.toUpperCase()] || 'berline';
  }
}

export const vehicleDataService = new VehicleDataService();