def get_congestion_level(traffic_color):
    if traffic_color == "green":
        return 0  
    elif traffic_color == "yellow":
        return 1  
    elif traffic_color == "red":
        return 2  
    return -1
