// src/api.ts
export interface CalculationInput {
    btc_mined: number;
    total_power: number;
    my_power: number;
    btc_price: number;
    boost_green: number;
    boost_red: number;
    boost_violet: number;
  }
  
  export interface CalculationResponse {
    net_reward: number;
  }
  
  export async function calculateReward(payload: CalculationInput): Promise<CalculationResponse> {
    const response = await fetch("http://localhost:8000/calculate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      throw new Error("Erreur lors de la requête");
    }
    return response.json();
  }

  // src/api.ts
export async function performOcr(file: File): Promise<{ extracted_text: string }> {
    const formData = new FormData();
    formData.append("file", file);
  
    const response = await fetch("http://localhost:8000/ocr", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      throw new Error("Erreur lors de l'OCR");
    }
    return response.json();
  }