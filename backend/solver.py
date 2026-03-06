from ortools.linear_solver import pywraplp

def solve_meal_plan(available_meals, constraints):
    """
    OR-Tools kullanarak kısıtlar dahilinde en uygun yemek kombinasyonunu seçer.
    """
    # 1. Çözücü Tanımlama (Integer Programming için SCIP)
    solver = pywraplp.Solver.CreateSolver('SCIP')
    if not solver:
        return {"error": "Solver (Çözücü) başlatılamadı."}

    # 2. Karar Değişkenleri: x[i] = 1 (seçildi), 0 (seçilmedi)
    x = {}
    for i in range(len(available_meals)):
        x[i] = solver.IntVar(0, 1, f'meal_{i}')

    # 3. Kısıt: Toplam Maliyet <= Maksimum Bütçe
    max_budget = constraints.get("max_budget", 1000)
    solver.Add(sum(x[i] * available_meals[i]["cost"] for i in range(len(available_meals))) <= max_budget)

    # 4. Kısıt: Toplam Kalori >= Minimum Kalori
    min_cal = constraints.get("min_calories", 500)
    solver.Add(sum(x[i] * available_meals[i]["calories"] for i in range(len(available_meals))) >= min_cal)

    # 5. Hedef Fonksiyonu (Objective)
    objective = solver.Objective()
    
    # Kullanıcı tercihine göre Optimizasyon yönünü belirle
    if constraints.get("priority") == "protein":
        for i in range(len(available_meals)):
            objective.SetCoefficient(x[i], available_meals[i]["protein"])
        objective.SetMaximization() # Proteini en yükseğe çıkar
    else:
        for i in range(len(available_meals)):
            objective.SetCoefficient(x[i], available_meals[i]["cost"])
        objective.SetMinimization() # Maliyeti en düşüğe çek

    # 6. Çözümleme
    status = solver.Solve()

    if status == pywraplp.Solver.OPTIMAL or status == pywraplp.Solver.FEASIBLE:
        selected_meals = [available_meals[i] for i in range(len(available_meals)) if x[i].solution_value() > 0.5]
        return {
            "meals": selected_meals,
            "total_cost": sum(m["cost"] for m in selected_meals),
            "total_protein": sum(m["protein"] for m in selected_meals),
            "total_calories": sum(m["calories"] for m in selected_meals)
        }
    
    return None