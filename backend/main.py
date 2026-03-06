import os
import json
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import google.generativeai as genai


from solver import solve_meal_plan

# .env dosyasını okur
load_dotenv()

app = FastAPI()

# CORS Ayarları (React ile iletişim)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gemini Yapılandırması
# API anahtarı .env dosyasından çekiliyor
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

def load_db():
    try:
        with open("meals.json", "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"Veritabanı yükleme hatası: {e}")
        return []

#LLM ile Kısıt Çıkarma Fonksiyonu
def get_constraints_from_llm(user_prompt):
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    system_instruction = """
    Sen bir diyetisyen yardımcısısın. Kullanıcı metnini analiz et ve SADECE JSON döndür.
    JSON dışında hiçbir açıklama yapma.
    Format:
    {
      "forbidden_ingredients": ["kelime1", "kelime2"],
      "max_budget": integer,
      "min_calories": integer,
      "priority": "protein" veya "cost"
    }
    Kullanıcı bütçe belirtmezse 1000, kalori belirtmezse 500 varsay.
    """
    
    response = model.generate_content(system_instruction + "\n\nKullanıcı İsteği: " + user_prompt)
    
    
    clean_json = response.text.replace('```json', '').replace('```', '').strip()
    return json.loads(clean_json)

@app.post("/generate-plan")
async def generate_plan(request_data: dict):
    user_text = request_data.get("prompt", "")
    meals_db = load_db()

    if not user_text:
        return {"error": "Lütfen bir istek belirtin."}

    try:
       
        constraints = get_constraints_from_llm(user_text)
        
        # Malzeme Filtreleme (Alerji Kontrolü)
        forbidden = [f.lower() for f in constraints.get("forbidden_ingredients", [])]
        available_meals = [
            m for m in meals_db 
            if not any(f in [i.lower() for i in m["ingredients"]] for f in forbidden)
        ]

        if not available_meals:
            return {"error": "Kısıtlarınıza uygun (alerjen içermeyen) yemek bulunamadı."}

        #solver.py içindeki OR-Tools fonksiyonunu çağır (Optimization)
        result = solve_meal_plan(available_meals, constraints)

        if result:
            return {
                "extracted_constraints": constraints, 
                **result
            }
        else:
            return {"error": "Belirttiğiniz bütçe ve kalori aralığında bir menü oluşturulamadı."}

    except Exception as e:
        return {"error": f"Bir hata oluştu: {str(e)}"}

if __name__ == "__main__":
   
    uvicorn.run(app, host="0.0.0.0", port=8000)