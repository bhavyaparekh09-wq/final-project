import requests
from datetime import datetime
from rest_framework.decorators import api_view
from rest_framework.response import Response

API_KEY = "343e24ee73df7ce6b504d3fa56c30fba"   # your key

@api_view(["GET"])
def get_weather(request):
    city = request.GET.get("city")
    if not city:
        return Response({"error": "City name required"}, status=400)

    # Get current weather
    current_url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric"
    current = requests.get(current_url).json()

    if str(current.get("cod")) != "200":
        return Response({"error": current.get("message", "City not found")}, status=400)

    lat = current["coord"]["lat"]
    lon = current["coord"]["lon"]

    # 5-day / 3-hour forecast (free)
    forecast_url = (
        f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}"
        f"&units=metric&appid={API_KEY}"
    )
    forecast = requests.get(forecast_url).json()

    if "list" not in forecast:
        return Response({"error": "Forecast unavailable"}, status=400)

    # Format next 12 forecast entries (36 hours)
    hourly_list = []
    for entry in forecast["list"][:12]:
        hourly_list.append({
            "time": entry["dt_txt"],
            "hour": entry["dt_txt"][11:16],
            "temp": round(entry["main"]["temp"]),
            "icon": f"https://openweathermap.org/img/wn/{entry['weather'][0]['icon']}@2x.png"
        })

    # Format daily forecast (7 days)
    daily_list = []
    added_days = set()

    for entry in forecast["list"]:
        day = entry["dt_txt"].split(" ")[0]
        if day not in added_days:
            added_days.add(day)
            daily_list.append({
                "day": datetime.strptime(day, "%Y-%m-%d").strftime("%A"),
                "temp": round(entry["main"]["temp"]),
                "description": entry["weather"][0]["description"],
                "wind": entry["wind"]["speed"],
                "clouds": entry["clouds"]["all"],
                "humidity": entry["main"]["humidity"],
                "icon": f"https://openweathermap.org/img/wn/{entry['weather'][0]['icon']}@2x.png"
            })
        if len(daily_list) == 7:
            break

    # Response
    output = {
        "location": {
            "city": current["name"],
            "country": current["sys"]["country"],
            "date": datetime.utcfromtimestamp(current["dt"]).strftime("%Y-%m-%d"),
        },
        "current": {
            "temp": round(current["main"]["temp"]),
            "description": current["weather"][0]["description"],
            "real_feel": round(current["main"]["feels_like"]),
            "wind": current["wind"]["speed"],
            "clouds": current["clouds"]["all"],
            "humidity": current["main"]["humidity"],
            "icon": f"https://openweathermap.org/img/wn/{current['weather'][0]['icon']}@2x.png",

            # Sunrise & Sunset added
            "sunrise": datetime.fromtimestamp(current["sys"]["sunrise"]).strftime("%H:%M"),
            "sunset": datetime.fromtimestamp(current["sys"]["sunset"]).strftime("%H:%M"),
        },
        "hourly": hourly_list,
        "daily": daily_list,
    }

    return Response(output)
